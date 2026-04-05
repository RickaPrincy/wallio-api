import { Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

import { Transaction as DomainTransaction, Wallet } from "@wallio/entities";
import { Transaction as RestTransaction } from "@wallio/rest/model";

@Injectable()
export class TransactionMapper {
  constructor(
    @InjectRepository(DomainTransaction)
    private readonly transactionRepository: Repository<DomainTransaction>
  ) {}

  async toRestList(
    transactions: DomainTransaction[]
  ): Promise<RestTransaction[]> {
    return Promise.all(
      transactions.map((transaction) => this.toRest(transaction))
    );
  }

  async toRest(transaction: DomainTransaction): Promise<RestTransaction> {
    const { wallet, ...restTransaction } = transaction;
    return { ...restTransaction, walletId: wallet.id };
  }

  async toDomainList(
    restTransactions: RestTransaction[],
    wallets: Wallet[]
  ): Promise<DomainTransaction[]> {
    return Promise.all(
      restTransactions.map(async (restTransaction) => {
        const wallet = wallets.find(
          (wallet) => wallet.id === restTransaction.walletId
        )!;
        return this.transactionRepository.create({
          ...restTransaction,
          wallet,
        });
      })
    );
  }
}
