import { Repository } from "typeorm";
import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

import {
  RecurringTransaction as DomainRecurringTransaction,
  RecurrenceFrequency,
  TransactionType,
  Weekday,
  Wallet,
  Label,
} from "@wallio/entities";
import { RecurringTransaction as RestRecurringTransaction } from "@wallio/rest/model";

const NOTIFICATION_TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

@Injectable()
export class RecurringTransactionMapper {
  constructor(
    @InjectRepository(DomainRecurringTransaction)
    private readonly recurringTransactionRepository: Repository<DomainRecurringTransaction>
  ) {}

  async toRestList(
    recurringTransactions: DomainRecurringTransaction[]
  ): Promise<RestRecurringTransaction[]> {
    return Promise.all(
      recurringTransactions.map((recurringTransaction) =>
        this.toRest(recurringTransaction)
      )
    );
  }

  async toRest(
    recurringTransaction: DomainRecurringTransaction
  ): Promise<RestRecurringTransaction> {
    const { wallet, label, ...rest } = recurringTransaction;
    return {
      ...rest,
      // TypeORM's "simple-array" column type always round-trips as
      // string[] under the hood regardless of the declared TS type -
      // coerce back to real numbers so the REST contract is genuinely
      // numeric, not just numeric-looking strings.
      months: (rest.months ?? []).map((m) => Number(m)),
      walletId: wallet.id,
      labelId: label?.id,
    };
  }

  async toDomainList(
    restItems: RestRecurringTransaction[],
    wallets: Wallet[],
    labels: Label[] = []
  ): Promise<DomainRecurringTransaction[]> {
    return Promise.all(
      restItems.map((restItem) => this.toDomain(restItem, wallets, labels))
    );
  }

  async toDomain(
    restItem: RestRecurringTransaction,
    wallets: Wallet[],
    labels: Label[] = []
  ): Promise<DomainRecurringTransaction> {
    // Array bodies skip the ValidationPipe, so none of the class-validator
    // rules on RestRecurringTransaction run in this path: re-check manually
    // everything that can't be enforced purely by the DB schema.
    if ((restItem.counterparty?.length ?? 0) > 80) {
      throw new BadRequestException("A person name has at most 80 characters");
    }

    if (
      restItem.type &&
      ![TransactionType.EXPENSE, TransactionType.INCOME].includes(restItem.type)
    ) {
      throw new BadRequestException(
        "A recurring transaction can only be an EXPENSE or an INCOME"
      );
    }

    if (!Object.values(RecurrenceFrequency).includes(restItem.frequency)) {
      throw new BadRequestException(
        `Invalid frequency "${restItem.frequency}"`
      );
    }

    // WEEKLY and YEARLY are kept in the enum/columns only for backward
    // compatibility with any row that already used them - new rules express
    // the same ideas via DAILY+weekDays and MONTHLY+months instead (see the
    // entity's doc comments), since nothing on the live DB should ever have
    // a column dropped or an enum value removed out from under it.
    const isMonthly = restItem.frequency === RecurrenceFrequency.MONTHLY;
    const isYearly = restItem.frequency === RecurrenceFrequency.YEARLY;
    const isDaily = restItem.frequency === RecurrenceFrequency.DAILY;
    const isWeekly = restItem.frequency === RecurrenceFrequency.WEEKLY;

    // Optional for MONTHLY and YEARLY alike (a rule can be as vague as
    // "sometime in February", or "every month" with no fixed day); absent
    // for everything else.
    const hasDayOfMonth =
      restItem.dayOfMonth !== undefined && restItem.dayOfMonth !== null;
    if (isMonthly || isYearly) {
      if (
        hasDayOfMonth &&
        (restItem.dayOfMonth! < 1 || restItem.dayOfMonth! > 31)
      ) {
        throw new BadRequestException("dayOfMonth must be between 1 and 31");
      }
    } else if (hasDayOfMonth) {
      throw new BadRequestException(
        "dayOfMonth can only be set for a MONTHLY or YEARLY recurrence"
      );
    }

    // Legacy, YEARLY-only, required there (unchanged) - new rules use
    // `months` below instead.
    const hasMonth = restItem.month !== undefined && restItem.month !== null;
    if (isYearly) {
      if (!hasMonth || restItem.month! < 1 || restItem.month! > 12) {
        throw new BadRequestException(
          "month is required and must be between 1 and 12 for a YEARLY recurrence"
        );
      }
    } else if (hasMonth) {
      throw new BadRequestException(
        "month can only be set for a YEARLY recurrence"
      );
    }

    // Optional filter for MONTHLY (empty/absent = every month); must be
    // absent otherwise.
    const months = restItem.months ?? [];
    if (isMonthly) {
      if (months.some((m) => !Number.isInteger(m) || m < 1 || m > 12)) {
        throw new BadRequestException(
          "Every month must be an integer between 1 and 12"
        );
      }
    } else if (months.length > 0) {
      throw new BadRequestException(
        "months can only be set for a MONTHLY recurrence"
      );
    }

    // Optional filter for DAILY (empty/absent = every day); required (at
    // least one) for the legacy WEEKLY; absent for everything else.
    const weekDays = restItem.weekDays ?? [];
    if (isWeekly) {
      if (
        weekDays.length === 0 ||
        weekDays.some((day) => !Object.values(Weekday).includes(day))
      ) {
        throw new BadRequestException(
          "weekDays must contain at least one valid day for a WEEKLY recurrence"
        );
      }
    } else if (isDaily) {
      if (weekDays.some((day) => !Object.values(Weekday).includes(day))) {
        throw new BadRequestException(`Invalid day of the week`);
      }
    } else if (weekDays.length > 0) {
      throw new BadRequestException(
        "weekDays can only be set for a DAILY or WEEKLY recurrence"
      );
    }

    const notificationTimes = restItem.notificationTimes ?? [];
    if (notificationTimes.some((time) => !NOTIFICATION_TIME_REGEX.test(time))) {
      throw new BadRequestException(
        'Every notification time must be an "HH:mm" string'
      );
    }

    const wallet = wallets.find((wallet) => wallet.id === restItem.walletId)!;
    const label = restItem.labelId
      ? labels.find((label) => label.id === restItem.labelId)
      : null;

    // The client always pushes whole rows and leaves a cleared field out:
    // null it here, or saving would keep the old value.
    return this.recurringTransactionRepository.create({
      ...restItem,
      counterparty: restItem.counterparty ?? null,
      dayOfMonth: restItem.dayOfMonth ?? null,
      month: restItem.month ?? null,
      endAt: restItem.endAt ?? null,
      notificationTimes,
      weekDays,
      months,
      wallet,
      label,
    });
  }
}
