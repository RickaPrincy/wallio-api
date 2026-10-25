import { Repository } from "typeorm";
import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

import {
  RecurringTransaction as DomainRecurringTransaction,
  RecurrenceFrequency,
  TransactionType,
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
    return { ...rest, walletId: wallet.id, labelId: label?.id };
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

    const isMonthly = restItem.frequency === RecurrenceFrequency.MONTHLY;
    if (isMonthly) {
      if (
        restItem.dayOfMonth === undefined ||
        restItem.dayOfMonth === null ||
        restItem.dayOfMonth < 1 ||
        restItem.dayOfMonth > 31
      ) {
        throw new BadRequestException(
          "dayOfMonth is required and must be between 1 and 31 for a MONTHLY recurrence"
        );
      }
    } else if (
      restItem.dayOfMonth !== undefined &&
      restItem.dayOfMonth !== null
    ) {
      throw new BadRequestException(
        "dayOfMonth can only be set for a MONTHLY recurrence"
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
      : undefined;

    return this.recurringTransactionRepository.create({
      ...restItem,
      notificationTimes,
      wallet,
      label,
    });
  }
}
