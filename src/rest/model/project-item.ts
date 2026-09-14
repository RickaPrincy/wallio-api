import { ApiProperty } from "@nestjs/swagger";
import {
  IsDateString,
  IsNumberString,
  IsOptional,
  IsString,
  IsUUID,
  IsNotEmpty,
} from "class-validator";

export class ProjectItem {
  @IsUUID()
  @ApiProperty({ format: "uuid" })
  id: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  description: string;

  @IsNumberString()
  @ApiProperty({ example: "150.50" })
  amount: string;

  @IsOptional()
  @IsNumberString()
  @ApiProperty({ example: "150.50", required: false })
  actualAmount?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  icon?: string;

  @IsUUID()
  @ApiProperty({ format: "uuid" })
  projectId: string;

  @IsOptional()
  @IsUUID()
  @ApiProperty({ format: "uuid", required: false })
  transactionId?: string;

  @IsOptional()
  @IsDateString()
  @ApiProperty({ format: "date-time", required: false })
  executedAt?: string;

  @IsDateString()
  @ApiProperty({ format: "date-time" })
  createdAt: string;

  @IsDateString()
  @ApiProperty({ format: "date-time" })
  updatedAt: string;

  @IsOptional()
  @IsDateString()
  @ApiProperty({ format: "date-time", required: false })
  deletedAt?: string;
}
