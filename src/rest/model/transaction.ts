import { ApiProperty } from "@nestjs/swagger";
import {
  IsDateString,
  IsEnum,
  IsNumberString,
  IsOptional,
  IsString,
  IsUUID,
  IsNotEmpty,
} from "class-validator";

export enum TransactionType {
  CREDIT = "CREDIT",
  DEBIT = "DEBIT",
}

export class Transaction {
  @IsUUID()
  @ApiProperty({ format: "uuid" })
  id: string;

  @IsNumberString()
  @ApiProperty({ example: "150.50" })
  amount: string;

  @IsEnum(TransactionType)
  @ApiProperty({ enum: TransactionType, enumName: "TransactionType" })
  type: TransactionType;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  description: string;

  @IsDateString()
  @ApiProperty({ format: "date-time" })
  createdAt: string;

  @IsUUID()
  @ApiProperty({ format: "uuid" })
  walletId: string;

  @IsDateString()
  @ApiProperty({ format: "date-time" })
  updatedAt: string;

  @IsOptional()
  @IsDateString()
  @ApiProperty({ format: "date-time", required: false })
  deletedAt?: string;
}
