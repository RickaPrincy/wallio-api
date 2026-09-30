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
import { TransactionType } from "@wallio/entities";

export class Transaction {
  @IsUUID()
  @ApiProperty({ format: "uuid" })
  id: string;

  @IsNumberString()
  @ApiProperty({ example: "150.50" })
  amount: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  description: string;

  @IsOptional()
  @IsEnum(TransactionType)
  @ApiProperty({ enum: TransactionType, required: false })
  type?: TransactionType;

  @IsOptional()
  @IsUUID()
  @ApiProperty({ format: "uuid", required: false })
  labelId?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    required: false,
    description: "Person, on debt and receivable accounts",
  })
  counterparty?: string;

  @IsOptional()
  @IsUUID()
  @ApiProperty({ format: "uuid", required: false })
  transferId?: string;

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
