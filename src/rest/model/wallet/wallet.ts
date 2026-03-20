import { ApiProperty } from "@nestjs/swagger";
import { WalletType } from "./wallet_type";

export class Wallet {
  @ApiProperty({ format: "uuid" })
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ required: false })
  description?: string;

  @ApiProperty({ enum: WalletType, enumName: "WalletType" })
  type: WalletType;

  @ApiProperty({ format: "date-time" })
  createdAt: string;
}
