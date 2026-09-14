import { Injectable } from "@nestjs/common";
import { PaginationParams } from "@wallio/rest/decorator";
import { InitInfo } from "./model";
import { WalletService } from "./wallet.service";
import { TransactionService } from "./transaction.service";
import { ProjectService } from "./project.service";
import { ProjectItemService } from "./project-item.service";
import { LabelService } from "./label.service";
import {
  Transaction,
  Wallet,
  Project,
  ProjectItem,
  Label,
} from "@wallio/entities";

@Injectable()
export class InitInfoService {
  constructor(
    private readonly walletService: WalletService,
    private readonly transactionService: TransactionService,
    private readonly projectService: ProjectService,
    private readonly projectItemService: ProjectItemService,
    private readonly labelService: LabelService
  ) {}

  // Fetches exactly `take` items starting at offset `skip` within a single
  // entity type. `findAll` only accepts {page, pageSize} (offset = (page-1)*
  // pageSize), which can't express an arbitrary offset directly, so this
  // over-fetches from the start and slices locally — correct regardless of
  // whether `skip` lines up with a page boundary.
  private async fetchOffset<T>(
    finder: (pagination: PaginationParams) => Promise<T[]>,
    skip: number,
    take: number
  ): Promise<T[]> {
    if (take <= 0) return [];
    const overFetched = await finder({ page: 1, pageSize: skip + take });
    return overFetched.slice(skip, skip + take);
  }

  // Walks the virtual concatenation wallets++transactions++projects++
  // projectItems++labels and returns exactly one "page" worth of items
  // (pagination.pageSize), which may span more than one entity type when a
  // page boundary falls between two of them. This is required for
  // correctness: the client always advances `page` by exactly 1 regardless
  // of how many items a given page actually contained, so any response that
  // returns fewer than pageSize items *without it being the true end* would
  // cause the next page's offset to skip over un-synced data. Returning all
  // five arrays empty is the client's sole "sync complete" signal.
  async getByUserId(
    userId: string,
    pagination: PaginationParams
  ): Promise<InitInfo> {
    let cursor = (pagination.page - 1) * pagination.pageSize;
    let remaining = pagination.pageSize;

    const walletCriteria = { user: { id: userId } };
    const transactionCriteria = { wallet: { user: { id: userId } } };
    const projectCriteria = { user: { id: userId } };
    const projectItemCriteria = { project: { user: { id: userId } } };
    const labelCriteria = { user: { id: userId } };

    let wallets: Wallet[] = [];
    let transactions: Transaction[] = [];
    let projects: Project[] = [];
    let projectItems: ProjectItem[] = [];
    let labels: Label[] = [];

    if (remaining > 0) {
      const total = await this.walletService.count(walletCriteria);
      if (cursor >= total) {
        cursor -= total;
      } else {
        wallets = await this.fetchOffset(
          (p) => this.walletService.findAll(p, walletCriteria),
          cursor,
          remaining
        );
        remaining -= wallets.length;
        cursor = 0;
      }
    }

    if (remaining > 0) {
      const total = await this.transactionService.count(transactionCriteria);
      if (cursor >= total) {
        cursor -= total;
      } else {
        transactions = await this.fetchOffset(
          (p) => this.transactionService.findAll(p, transactionCriteria),
          cursor,
          remaining
        );
        remaining -= transactions.length;
        cursor = 0;
      }
    }

    if (remaining > 0) {
      const total = await this.projectService.count(projectCriteria);
      if (cursor >= total) {
        cursor -= total;
      } else {
        projects = await this.fetchOffset(
          (p) => this.projectService.findAll(p, projectCriteria),
          cursor,
          remaining
        );
        remaining -= projects.length;
        cursor = 0;
      }
    }

    if (remaining > 0) {
      const total = await this.projectItemService.count(projectItemCriteria);
      if (cursor >= total) {
        cursor -= total;
      } else {
        projectItems = await this.fetchOffset(
          (p) => this.projectItemService.findAll(p, projectItemCriteria),
          cursor,
          remaining
        );
        remaining -= projectItems.length;
        cursor = 0;
      }
    }

    if (remaining > 0) {
      const total = await this.labelService.count(labelCriteria);
      if (cursor < total) {
        labels = await this.fetchOffset(
          (p) => this.labelService.findAll(p, labelCriteria),
          cursor,
          remaining
        );
      }
    }

    return this.toInitInfo({
      wallets,
      transactions,
      projects,
      projectItems,
      labels,
    });
  }

  toInitInfo(partial: {
    wallets?: Wallet[];
    transactions?: Transaction[];
    projects?: Project[];
    projectItems?: ProjectItem[];
    labels?: Label[];
  }): InitInfo {
    const result = new InitInfo();
    result.wallets = partial.wallets ?? [];
    result.transactions = partial.transactions ?? [];
    result.projects = partial.projects ?? [];
    result.projectItems = partial.projectItems ?? [];
    result.labels = partial.labels ?? [];
    return result;
  }
}
