import {
  Transaction,
  Wallet,
  Project,
  ProjectItem,
  Label,
  RecurringTransaction,
} from "@wallio/entities";

export class InitInfo {
  wallets: Wallet[];
  transactions: Transaction[];
  projects: Project[];
  projectItems: ProjectItem[];
  labels: Label[];
  recurringTransactions: RecurringTransaction[];
}
