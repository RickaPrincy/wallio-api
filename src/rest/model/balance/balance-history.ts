import { ApiProperty } from "@nestjs/swagger";

export class BalanceHistory {
  @ApiProperty({ format: "uuid" })
  id: string;

  @ApiProperty({ type: Number, example: 1500.75 })
  amount: number;

  @ApiProperty({ type: Number, example: 1000.0 })
  balanceBefore: number;

  @ApiProperty({ format: "uuid" })
  walletId: string;

  @ApiProperty({ format: "date-time" })
  createdAt: string;
}
