import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsNumber, IsUUID } from "class-validator";

export class CreateBalanceHistory {
  @IsUUID()
  @ApiProperty({ format: "uuid" })
  id: string;

  @IsNumber()
  @ApiProperty({ type: Number, example: 1500.75 })
  amount: number;

  @IsDateString()
  @ApiProperty({ format: "date-time" })
  createdAt: string;
}
