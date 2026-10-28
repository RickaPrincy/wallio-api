import { Repository } from "typeorm";
import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

import {
  Transaction as DomainTransaction,
  Wallet,
  Label,
  RecurringTransaction,
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
    const { wallet, label, recurringTransaction, ...restTransaction } =
      transaction;
    return {
      ...restTransaction,
      walletId: wallet.id,
      labelId: label?.id,
      recurringTransactionId: recurringTransaction?.id,
    };
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
        if ((restTransaction.counterparty?.length ?? 0) > 80) {
          throw new BadRequestException(
            "A person name has at most 80 characters"
          );
        }
        const label = restTransaction.labelId
          ? labels.find((label) => label.id === restTransaction.labelId)
          : null;
        const recurringTransaction = restTransaction.recurringTransactionId
          ? ({
              id: restTransaction.recurringTransactionId,
            } as RecurringTransaction)
          : undefined;
        // The client always pushes whole rows and leaves a cleared field
        // out: null it here, or saving would keep the old value.
        return this.transactionRepository.create({
          ...restTransaction,
          counterparty: restTransaction.counterparty ?? null,
          wallet,
          label,
          recurringTransaction,
        });
      })
    );
  }
}
