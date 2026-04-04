import { Repository } from "typeorm";
import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

import { BalanceHistory } from "@wallio/entities";
import { Criteria } from "@wallio/services/common/criteria";
import { PaginationParams } from "@wallio/rest/decorator";
import { findByCriteria } from "@wallio/services/common/find-by-criteria";

const MAX_HISTORY_PER_SAVE = 50;
@Injectable()
export class BalanceHistoryService {
  constructor(
    @InjectRepository(BalanceHistory)
    private readonly repository: Repository<BalanceHistory>
  ) {}

  async findAll(
    pagination: PaginationParams,
    criteria: Criteria<BalanceHistory>
  ) {
    return await findByCriteria<BalanceHistory>({
      repository: this.repository,
      criteria,
      pagination,
      order: {
        createdAt: "DESC",
      },
    });
  }

  async findLastHistoryByWalletId(walletId: string): Promise<BalanceHistory> {
    return this.repository.findOneBy({ wallet: { id: walletId } });
  }

  async saveAll(histories: BalanceHistory[]): Promise<BalanceHistory[]> {
    if (histories.length > MAX_HISTORY_PER_SAVE) {
      throw new BadRequestException(
        `Cannot save more than ${MAX_HISTORY_PER_SAVE} balance histories at once.`
      );
    }

    const walletId = histories[0]?.wallet?.id;
    if (!walletId) {
      throw new BadRequestException(
        `Wallet ID is required for balance histories.`
      );
    }

    if (histories.some((history) => history.wallet?.id !== walletId)) {
      throw new BadRequestException(
        `All balance histories must belong to the same wallet.`
      );
    }

    const toCreate = histories.map((history) =>
      this.repository.create(history)
    );
    return this.repository.save(toCreate);
  }
}
