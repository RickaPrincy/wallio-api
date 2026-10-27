import { BadRequestException, Injectable } from "@nestjs/common";

import {
  OccurrenceStatus,
  RecurringTransactionOccurrence as DomainOccurrence,
} from "@wallio/entities";
import { RecurringTransactionOccurrence as RestOccurrence } from "@wallio/rest/model";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

@Injectable()
export class RecurringTransactionOccurrenceMapper {
  toRest(occurrence: DomainOccurrence): RestOccurrence {
    const {
      recurringTransaction: _recurringTransaction,
      transaction: _transaction,
      ...rest
    } = occurrence;
    return {
      ...rest,
      transactionId: rest.transactionId ?? undefined,
      plannedAmount: rest.plannedAmount ?? undefined,
    };
  }

  toRestList(occurrences: DomainOccurrence[]): RestOccurrence[] {
    return occurrences.map((o) => this.toRest(o));
  }

  // Array bodies skip the ValidationPipe: everything is checked here.
  toDomain(restItem: RestOccurrence): DomainOccurrence {
    if (!restItem.id || restItem.id.length > 100) {
      throw new BadRequestException("An occurrence id has 1 to 100 characters");
    }
    if (!UUID_REGEX.test(restItem.recurringTransactionId ?? "")) {
      throw new BadRequestException(
        "An occurrence needs a valid recurringTransactionId"
      );
    }
    if (restItem.transactionId && !UUID_REGEX.test(restItem.transactionId)) {
      throw new BadRequestException("Invalid transactionId");
    }
    if (!Object.values(OccurrenceStatus).includes(restItem.status)) {
      throw new BadRequestException(
        "Only an EXECUTED or DISMISSED occurrence is stored"
      );
    }
    if (isNaN(Date.parse(restItem.occurrenceAt))) {
      throw new BadRequestException("Invalid occurrenceAt");
    }
    if (
      restItem.plannedAmount !== undefined &&
      restItem.plannedAmount !== null &&
      isNaN(Number(restItem.plannedAmount))
    ) {
      throw new BadRequestException("Invalid plannedAmount");
    }

    const occurrence = new DomainOccurrence();
    occurrence.id = restItem.id;
    occurrence.recurringTransactionId = restItem.recurringTransactionId;
    occurrence.occurrenceAt = restItem.occurrenceAt;
    occurrence.status = restItem.status;
    occurrence.transactionId = restItem.transactionId ?? null;
    occurrence.plannedAmount = restItem.plannedAmount ?? null;
    if (restItem.createdAt) occurrence.createdAt = restItem.createdAt;
    return occurrence;
  }

  toDomainList(restItems: RestOccurrence[]): DomainOccurrence[] {
    return restItems.map((r) => this.toDomain(r));
  }
}
