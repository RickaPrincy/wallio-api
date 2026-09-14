import {
  Transaction,
  Wallet,
  Project,
  ProjectItem,
  Label,
} from "@wallio/entities";

export class InitInfo {
  wallets: Wallet[];
  transactions: Transaction[];
  projects: Project[];
  projectItems: ProjectItem[];
  labels: Label[];
}
