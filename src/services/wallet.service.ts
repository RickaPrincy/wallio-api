import { DataSource, In, Repository } from "typeorm";
import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

import { Wallet } from "@wallio/entities";
import { Criteria } from "@wallio/services/common/criteria";
import { PaginationParams } from "@wallio/rest/decorator";
import { UPDATED_AT_CREATED_AT_ORDER_BY } from "@wallio/services/common/default-order-by";
import { findByCriteria } from "@wallio/services/common/find-by-criteria";

const MAX_WALLETS = 100;
@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet) private readonly repository: Repository<Wallet>,
    private readonly dataSource: DataSource
  ) {}

  async findAll(pagination: PaginationParams, criteria: Criteria<Wallet>) {
    return await findByCriteria<Wallet>({
      repository: this.repository,
      criteria,
      pagination,
      order: UPDATED_AT_CREATED_AT_ORDER_BY,
      withDeleted: true,
    });
  }

  async saveAll(wallets: Wallet[]): Promise<Wallet[]> {
    return await this.dataSource.transaction(async (manager) => {
      return await manager.save(Wallet, wallets);
    });
  }

  async findByIds(userId: string, walletIds: string[]) {
    const uniqueWalletIds = Array.from(new Set(walletIds));

    if (uniqueWalletIds.length > MAX_WALLETS) {
      throw new BadRequestException("Too many wallets requested");
    }

    const wallets = await this.findAll(
      { page: 1, pageSize: uniqueWalletIds.length },
      {
        id: In(uniqueWalletIds),
        user: {
          id: userId,
        },
      }
    );

    if (wallets.length !== uniqueWalletIds.length) {
      throw new BadRequestException(
        "One or more wallets are invalid or do not belong to you"
      );
    }

    return wallets;
  }
}
