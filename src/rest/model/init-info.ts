import { ApiProperty } from "@nestjs/swagger";
import { Wallet } from "./wallet";
import { Transaction } from "./transaction";
import { Project } from "./project";
import { ProjectItem } from "./project-item";
import { Label } from "./label";
import { RecurringTransaction } from "./recurring-transaction";

export class InitInfo {
  @ApiProperty({ type: Wallet, isArray: true })
  wallets: Wallet[];

  @ApiProperty({ type: Transaction, isArray: true })
  transactions: Transaction[];

  @ApiProperty({ type: Project, isArray: true })
  projects: Project[];

  @ApiProperty({ type: ProjectItem, isArray: true })
  projectItems: ProjectItem[];

  @ApiProperty({ type: Label, isArray: true })
  labels: Label[];

  // Sixth and last stage of the pull-sync walk: appended after labels so
  // every existing offset computation for the first five stages is unchanged.
  @ApiProperty({ type: RecurringTransaction, isArray: true })
  recurringTransactions: RecurringTransaction[];
}
