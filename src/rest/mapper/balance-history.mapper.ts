import { Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

import {
  BalanceHistory as DomainBalanceHistory,
  User,
  Wallet,
} from "@wallio/entities";
import {
  BalanceHistory as RestBalanceHistory,
  CreateBalanceHistory,
} from "@wallio/rest/model/balance";

@Injectable()
export class BalanceHistoryMapper {
  constructor(
    @InjectRepository(DomainBalanceHistory)
    private readonly balanceHistoryRepository: Repository<DomainBalanceHistory>
  ) {}

  async toRest(
    balanceHistory: DomainBalanceHistory
  ): Promise<RestBalanceHistory> {
    const { wallet, ...restBalanceHistory } = balanceHistory;
    return { ...restBalanceHistory, walletId: wallet.id };
  }

  async toRestList(
    balanceHistories: DomainBalanceHistory[]
  ): Promise<RestBalanceHistory[]> {
    return Promise.all(
      balanceHistories.map((balanceHistory) => this.toRest(balanceHistory))
    );
  }

  async createToDomains(
    createBalanceHistories: CreateBalanceHistory[],
    wallet: Wallet
  ): Promise<DomainBalanceHistory[]> {
    return Promise.all(
      createBalanceHistories.map((createBalanceHistory) =>
        this.createToDomain(createBalanceHistory, wallet)
      )
    );
  }

  async createToDomain(
    createBalanceHistory: CreateBalanceHistory,
    wallet: Wallet
  ): Promise<DomainBalanceHistory> {
    return this.balanceHistoryRepository.create({
      ...createBalanceHistory,
      wallet,
    });
  }
}
