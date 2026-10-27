import { ApiProperty } from "@nestjs/swagger";
import { OccurrenceStatus } from "@wallio/entities";

export class RecurringTransactionOccurrence {
  @ApiProperty({ maxLength: 100 })
  id: string;

  @ApiProperty({ format: "uuid" })
  recurringTransactionId: string;

  @ApiProperty({ type: Date })
  occurrenceAt: string;

  @ApiProperty({ enum: OccurrenceStatus, enumName: "OccurrenceStatus" })
  status: OccurrenceStatus;

  @ApiProperty({ format: "uuid", required: false, nullable: true })
  transactionId?: string | null;

  @ApiProperty({ example: "150.50", required: false, nullable: true })
  plannedAmount?: string | null;

  @ApiProperty({ type: Date, required: false })
  createdAt?: string;

  @ApiProperty({ type: Date, required: false })
  updatedAt?: string;
}
