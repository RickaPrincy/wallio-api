import { Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

import {
  Transaction as DomainTransaction,
  Wallet,
  Label,
} from "@wallio/entities";
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
    const { wallet, label, ...restTransaction } = transaction;
    return { ...restTransaction, walletId: wallet.id, labelId: label?.id };
  }

  async toDomainList(
    restTransactions: RestTransaction[],
    wallets: Wallet[],
    labels: Label[] = []
  ): Promise<DomainTransaction[]> {
    return Promise.all(
      restTransactions.map(async (restTransaction) => {
        const wallet = wallets.find(
          (wallet) => wallet.id === restTransaction.walletId
        )!;
        const label = restTransaction.labelId
          ? labels.find((label) => label.id === restTransaction.labelId)
          : undefined;
        return this.transactionRepository.create({
          ...restTransaction,
          wallet,
          label,
        });
      })
    );
  }
}
