import { ApiProperty } from "@nestjs/swagger";
import {
  IsDateString,
  IsEmail,
  IsOptional,
  IsString,
  IsUUID,
} from "class-validator";

export class CreateUser {
  @ApiProperty()
  @IsUUID()
  id: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty()
  @IsString()
  firstName: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty({ format: "date-time" })
  @IsDateString()
  createdAt: string;

  @ApiProperty({ format: "date-time" })
  @IsDateString()
  updatedAt: string;
}
