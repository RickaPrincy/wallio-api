import { Transaction, Wallet } from "@wallio/entities";

export class InitInfo {
  wallets: Wallet[];
  transactions: Transaction[];
}
