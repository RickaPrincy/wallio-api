import { DataSource, Not, Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

import { PaginationParams } from "@wallio/rest/decorator";
import { Criteria } from "@wallio/services/common/criteria";
import { RecurringTransaction } from "@wallio/entities";
import { findByCriteria } from "@wallio/services/common/find-by-criteria";
import { assertNotOwnedByOthers } from "@wallio/services/common/assert-not-owned-by-others";
import { UPDATED_AT_CREATED_AT_ORDER_BY } from "./common/default-order-by";

@Injectable()
export class RecurringTransactionService {
  constructor(
    @InjectRepository(RecurringTransaction)
    private readonly repository: Repository<RecurringTransaction>,
    private readonly dataSource: DataSource
  ) {}

  async findAll(
    pagination: PaginationParams,
    criteria: Criteria<RecurringTransaction>
  ) {
    return await findByCriteria<RecurringTransaction>({
      repository: this.repository,
      criteria,
      pagination,
      order: UPDATED_AT_CREATED_AT_ORDER_BY,
      withDeleted: true,
    });
  }

  async saveAll(
    userId: string,
    recurringTransactions: RecurringTransaction[]
  ): Promise<RecurringTransaction[]> {
    return await this.dataSource.transaction(async (manager) => {
      await assertNotOwnedByOthers({
        manager,
        entity: RecurringTransaction,
        ids: recurringTransactions.map(
          (recurringTransaction) => recurringTransaction.id
        ),
        ownedByOthers: { wallet: { user: { id: Not(userId) } } },
        name: "recurring transactions",
      });

      return await manager.save(RecurringTransaction, recurringTransactions);
    });
  }

  async count(criteria?: Criteria<RecurringTransaction>): Promise<number> {
    return await this.repository.count({
      where: criteria as any,
      withDeleted: true,
    });
  }
}
