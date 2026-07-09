import { Injectable } from "@nestjs/common";
import { WalletMapper } from "./wallet.mapper";
import { TransactionMapper } from "./transaction.mapper";
import { InitInfo as RestInitInfo } from "../model";
import { InitInfo } from "@wallio/services/model";

@Injectable()
export class InitInfoMapper {
  constructor(
    private readonly walletMapper: WalletMapper,
    private readonly transactionMapper: TransactionMapper
  ) {}

  async toRest(initInfo: InitInfo): Promise<RestInitInfo> {
    const wallets = await Promise.all(
      initInfo.wallets.map((wallet) => this.walletMapper.toRest(wallet))
    );
    const transactions = await Promise.all(
      initInfo.transactions.map((transaction) =>
        this.transactionMapper.toRest(transaction)
      )
    );
    return { wallets, transactions };
  }
}
