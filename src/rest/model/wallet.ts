import { ApiProperty } from "@nestjs/swagger";
import {
  IsDateString,
  IsEnum,
  IsNumberString,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
} from "class-validator";

export enum WalletType {
  CASH = "CASH",
  BANK = "BANK",
  MOBILE_MONEY = "MOBILE_MONEY",
  // Money others owe you. Its balance never goes below 0.
  RECEIVABLE = "RECEIVABLE",
  // Money you owe. Its balance is what is left to pay, never below 0.
  DEBT = "DEBT",
}

export class Wallet {
  @IsUUID()
  @ApiProperty({ format: "uuid" })
  id: string;

  @IsString()
  @ApiProperty()
  name: string;

  @IsNumberString()
  @ApiProperty()
  balance: string;

  @IsString()
  @ApiProperty({ required: false })
  description?: string;

  @IsOptional()
  @Matches(/^[A-Z]{3}$/)
  @ApiProperty({
    required: false,
    description: "ISO 4217 code, MGA when missing",
    example: "MGA",
  })
  currency?: string;

  @IsEnum(WalletType)
  @ApiProperty({ enum: WalletType, enumName: "WalletType" })
  type: WalletType;

  @IsDateString()
  @ApiProperty({ format: "date-time" })
  createdAt: string;

  @IsDateString()
  @ApiProperty({ format: "date-time" })
  updatedAt: string;

  @IsOptional()
  @IsDateString()
  @ApiProperty({ format: "date-time" })
  deletedAt?: string;
}
