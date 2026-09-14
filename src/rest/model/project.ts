import { ApiProperty } from "@nestjs/swagger";
import {
  IsDateString,
  IsNumberString,
  IsOptional,
  IsString,
  IsUUID,
  IsNotEmpty,
} from "class-validator";

export class Project {
  @IsUUID()
  @ApiProperty({ format: "uuid" })
  id: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  name: string;

  @IsOptional()
  @IsNumberString()
  @ApiProperty({ example: "1500.00", required: false })
  plannedAmount?: string;

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
