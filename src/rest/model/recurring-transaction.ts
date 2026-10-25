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

  // Optional for MONTHLY and the legacy YEARLY alike (a rule can be left
  // vague - "sometime in February", or "every month" with no fixed day),
  // absent otherwise. 1-31, clamped client-side to the last day of
  // shorter/non-leap months.
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(31)
  @ApiProperty({ required: false, minimum: 1, maximum: 31 })
  dayOfMonth?: number;

  // Legacy singular month, required iff frequency is the now-unused YEARLY
  // (kept only for backward compatibility); must be absent otherwise. New
  // rules use `months` instead.
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(12)
  @ApiProperty({ required: false, minimum: 1, maximum: 12 })
  month?: number;

  // Optional filter for MONTHLY: which month(s) of the year it applies to
  // (e.g. [2] = every year in February, [1,4,7,10] = quarterly, empty/unset
  // = every month). Must be absent for anything but MONTHLY.
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(12)
  @IsInt({ each: true })
  @Min(1, { each: true })
  @Max(12, { each: true })
  @ApiProperty({
    type: Number,
    isArray: true,
    required: false,
    description:
      "1-12, which month(s) a MONTHLY rule applies to; empty/absent = every month",
  })
  months?: number[];

  // Optional filter for DAILY (empty/absent = every day); required (at
  // least one) for the legacy WEEKLY; must be absent otherwise.
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
