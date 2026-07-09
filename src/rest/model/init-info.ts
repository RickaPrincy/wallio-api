import { ApiProperty } from "@nestjs/swagger";
import { Wallet } from "./wallet";
import { Transaction } from "./transaction";

export class InitInfo {
  @ApiProperty({ type: Wallet, isArray: true })
  wallets: Wallet[];

  @ApiProperty({ type: Transaction, isArray: true })
  transactions: Transaction[];
}
