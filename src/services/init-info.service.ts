import { Injectable } from "@nestjs/common";
import { PaginationParams } from "@wallio/rest/decorator";
import { InitInfo } from "./model";
import { WalletService } from "./wallet.service";
import { TransactionService } from "./transaction.service";
import { Transaction, Wallet } from "@wallio/entities";

@Injectable()
export class InitInfoService {
  constructor(
    private readonly walletService: WalletService,
    private readonly transactionService: TransactionService
  ) {}

  async getByUserId(
    userId: string,
    pagination: PaginationParams
  ): Promise<InitInfo> {
    const wallets = await this.walletService.findAll(pagination, {
      user: {
        id: userId,
      },
    });

    if (wallets.length > 0) {
      return this.toInitInfo(wallets, []);
    }

    const transactions = await this.transactionService.findAll(pagination, {
      wallet: {
        user: {
          id: userId,
        },
      },
    });

    return this.toInitInfo([], transactions);
  }

  toInitInfo(wallets: Wallet[], transactions: Transaction[]): InitInfo {
    console.log("Transactions", transactions);
    const result = new InitInfo();
    result.wallets = wallets;
    result.transactions = transactions;
    return result;
  }
}
