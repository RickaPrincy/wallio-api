import { ApiProperty } from "@nestjs/swagger";
import {
  ArrayMaxSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumberString,
  IsOptional,
  IsString,
  IsUUID,
  IsNotEmpty,
  Matches,
  Max,
  Min,
} from "class-validator";
import {
  TransactionType,
  RecurrenceFrequency,
  Weekday,
} from "@wallio/entities";

export class RecurringTransaction {
  @IsUUID()
  @ApiProperty({ format: "uuid" })
  id: string;

  @IsUUID()
  @ApiProperty({ format: "uuid" })
  walletId: string;

  @IsOptional()
  @IsUUID()
  @ApiProperty({ format: "uuid", required: false })
  labelId?: string;

  @IsNumberString()
  @ApiProperty({ example: "150.50" })
  amount: string;

  // A template string, e.g. may contain client-only placeholders such as
  // {{CURRENT_MONTH}}. Stored and returned verbatim, never parsed here.
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  description: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    required: false,
    description: "Person, on debt and receivable accounts",
  })
  counterparty?: string;

  // Only EXPENSE or INCOME: a recurring TRANSFER would need two wallets.
  @IsOptional()
  @IsEnum(TransactionType)
  @ApiProperty({ enum: TransactionType, required: false })
  type?: TransactionType;

  @IsEnum(RecurrenceFrequency)
  @ApiProperty({ enum: RecurrenceFrequency, enumName: "RecurrenceFrequency" })
  frequency: RecurrenceFrequency;

  // Required iff frequency is MONTHLY (1-31, clamped client-side to the last
  // day of shorter months); must be absent otherwise.
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(31)
  @ApiProperty({ required: false, minimum: 1, maximum: 31 })
  dayOfMonth?: number;

  // Required iff frequency is WEEKLY (at least one day); must be empty
  // otherwise. Purely a client-side computation input, same as dayOfMonth.
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(7)
  @IsEnum(Weekday, { each: true })
  @ApiProperty({
    enum: Weekday,
    enumName: "Weekday",
    isArray: true,
    required: false,
  })
  weekDays?: Weekday[];

  @IsArray()
  @ArrayMaxSize(20)
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, { each: true })
  @ApiProperty({
    type: String,
    isArray: true,
    example: ["08:00", "20:30"],
    description: '"HH:mm" times to notify at, resolved client-side',
  })
  notificationTimes: string[];

  // When the rule is allowed to start producing occurrences; may be in the
  // future. Purely stored/synced, no server-side date logic beyond format.
  @IsDateString()
  @ApiProperty({ format: "date-time" })
  startAt: string;

  // Purely a synced display value: whatever the client last computed and
  // pushed. The server never computes or validates it beyond ISO date format.
  @IsDateString()
  @ApiProperty({ format: "date-time" })
  nextOccurrenceAt: string;

  @IsOptional()
  @IsDateString()
  @ApiProperty({ format: "date-time", required: false })
  lastExecutedAt?: string;

  // Null/absent means the rule recurs forever. Purely stored and synced, no
  // server-side date logic beyond being a valid ISO date string.
  @IsOptional()
  @IsDateString()
  @ApiProperty({ format: "date-time", required: false })
  endAt?: string;

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
