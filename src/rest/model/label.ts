import { ApiProperty } from "@nestjs/swagger";
import {
  IsDateString,
  IsOptional,
  IsString,
  IsUUID,
  IsNotEmpty,
} from "class-validator";

export class Label {
  @IsUUID()
  @ApiProperty({ format: "uuid" })
  id: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  icon: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  color: string;

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
