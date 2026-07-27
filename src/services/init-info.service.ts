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
  ) { }

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

    const totalWallets = await this.walletService.count({ user: { id: userId } });
    const globalSkip = (pagination.page - 1) * pagination.pageSize;
    const transactionSkip = Math.max(0, globalSkip - totalWallets);
    const transactionPage = Math.floor(transactionSkip / pagination.pageSize) + 1;

    const adjustedPagination: PaginationParams = {
      page: transactionPage,
      pageSize: pagination.pageSize,
    };

    const transactions = await this.transactionService.findAll(adjustedPagination, {
      wallet: {
        user: { id: userId },
      },
    });

    return this.toInitInfo([], transactions);
  }

  toInitInfo(wallets: Wallet[], transactions: Transaction[]): InitInfo {
    const result = new InitInfo();
    result.wallets = wallets;
    result.transactions = transactions;
    return result;
  }
}
