import { Injectable } from "@nestjs/common";
import { WalletMapper } from "./wallet.mapper";
import { TransactionMapper } from "./transaction.mapper";
import { ProjectMapper } from "./project.mapper";
import { ProjectItemMapper } from "./project-item.mapper";
import { LabelMapper } from "./label.mapper";
import { InitInfo as RestInitInfo } from "../model";
import { InitInfo } from "@wallio/services/model";

@Injectable()
export class InitInfoMapper {
  constructor(
    private readonly walletMapper: WalletMapper,
    private readonly transactionMapper: TransactionMapper,
    private readonly projectMapper: ProjectMapper,
    private readonly projectItemMapper: ProjectItemMapper,
    private readonly labelMapper: LabelMapper
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
    const projects = await Promise.all(
      initInfo.projects.map((project) => this.projectMapper.toRest(project))
    );
    const projectItems = await Promise.all(
      initInfo.projectItems.map((item) => this.projectItemMapper.toRest(item))
    );
    const labels = await Promise.all(
      initInfo.labels.map((label) => this.labelMapper.toRest(label))
    );
    return { wallets, transactions, projects, projectItems, labels };
  }
}
