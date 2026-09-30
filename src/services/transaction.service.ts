import { DataSource, Not, Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

import { PaginationParams } from "@wallio/rest/decorator";
import { Criteria } from "@wallio/services/common/criteria";
import { Transaction } from "@wallio/entities";
import { findByCriteria } from "@wallio/services/common/find-by-criteria";
import { assertNotOwnedByOthers } from "@wallio/services/common/assert-not-owned-by-others";
import { UPDATED_AT_CREATED_AT_ORDER_BY } from "./common/default-order-by";

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private readonly repository: Repository<Transaction>,
    private readonly dataSource: DataSource
  ) {}

  async findAll(pagination: PaginationParams, criteria: Criteria<Transaction>) {
    return await findByCriteria<Transaction>({
      repository: this.repository,
      criteria,
      pagination,
      order: UPDATED_AT_CREATED_AT_ORDER_BY,
      withDeleted: true,
    });
  }

  async saveAll(
    userId: string,
    transactions: Transaction[]
  ): Promise<Transaction[]> {
    return await this.dataSource.transaction(async (manager) => {
      await assertNotOwnedByOthers({
        manager,
        entity: Transaction,
        ids: transactions.map((transaction) => transaction.id),
        ownedByOthers: { wallet: { user: { id: Not(userId) } } },
        name: "transactions",
      });

      return await manager.save(Transaction, transactions);
    });
  }

  async count(criteria?: Criteria<Transaction>): Promise<number> {
    return await this.repository.count({
      where: criteria as any,
      withDeleted: true,
    });
  }
}
