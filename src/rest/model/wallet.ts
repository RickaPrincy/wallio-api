import { ApiProperty } from "@nestjs/swagger";
import {
  IsDateString,
  IsEnum,
  IsNumberString,
  IsOptional,
  IsString,
  IsUUID,
} from "class-validator";

export enum WalletType {
  CASH = "CASH",
  BANK = "BANK",
  MOBILE_MONEY = "MOBILE_MONEY",
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
