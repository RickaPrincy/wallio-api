import { DataSource, In, Not, Repository } from "typeorm";
import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

import { PaginationParams } from "@wallio/rest/decorator";
import { Criteria } from "@wallio/services/common/criteria";
import {
  RecurringTransaction,
  RecurringTransactionOccurrence,
  Transaction,
} from "@wallio/entities";
import { findByCriteria } from "@wallio/services/common/find-by-criteria";
import { assertNotOwnedByOthers } from "@wallio/services/common/assert-not-owned-by-others";
import { UPDATED_AT_CREATED_AT_ORDER_BY } from "./common/default-order-by";

@Injectable()
export class RecurringTransactionOccurrenceService {
  constructor(
    @InjectRepository(RecurringTransactionOccurrence)
    private readonly repository: Repository<RecurringTransactionOccurrence>,
    private readonly dataSource: DataSource
  ) {}

  async findAll(
    pagination: PaginationParams,
    criteria: Criteria<RecurringTransactionOccurrence>
  ) {
    return await findByCriteria<RecurringTransactionOccurrence>({
      repository: this.repository,
      criteria,
      pagination,
      order: UPDATED_AT_CREATED_AT_ORDER_BY,
    });
  }

  async count(
    criteria?: Criteria<RecurringTransactionOccurrence>
  ): Promise<number> {
    return await this.repository.count({ where: criteria as any });
  }

  async saveAll(
    userId: string,
    occurrences: RecurringTransactionOccurrence[]
  ): Promise<RecurringTransactionOccurrence[]> {
    return await this.dataSource.transaction(async (manager) => {
      const ids = occurrences.map((o) => o.id);
      await assertNotOwnedByOthers({
        manager,
        entity: RecurringTransactionOccurrence,
        ids,
        ownedByOthers: {
          recurringTransaction: { wallet: { user: { id: Not(userId) } } },
        },
        name: "recurring transaction occurrences",
      });

      const ruleIds = Array.from(
        new Set(occurrences.map((o) => o.recurringTransactionId))
      );
      const ownedRules = await manager.count(RecurringTransaction, {
        where: { id: In(ruleIds), wallet: { user: { id: userId } } },
        withDeleted: true,
      });
      if (ownedRules !== ruleIds.length) {
        throw new BadRequestException(
          "One or more recurring transactions are invalid or do not belong to you"
        );
      }

      const transactionIds = Array.from(
        new Set(
          occurrences
            .map((o) => o.transactionId)
            .filter((id): id is string => !!id)
        )
      );
      if (transactionIds.length > 0) {
        const ownedTransactions = await manager.count(Transaction, {
          where: { id: In(transactionIds), wallet: { user: { id: userId } } },
          withDeleted: true,
        });
        if (ownedTransactions !== transactionIds.length) {
          throw new BadRequestException(
            "One or more transactions are invalid or do not belong to you"
          );
        }
      }

      // Executed or ignored is final: an occurrence already stored is kept
      // as it is, only new ones are added.
      const existing = await manager.find(RecurringTransactionOccurrence, {
        where: { id: In(ids) },
      });
      const existingIds = new Set(existing.map((o) => o.id));
      const created = await manager.save(
        RecurringTransactionOccurrence,
        occurrences.filter((o) => !existingIds.has(o.id))
      );
      return [...existing, ...created];
    });
  }
}
