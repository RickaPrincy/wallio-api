import {
  Column,
  Entity,
  ManyToOne,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  Index,
  DeleteDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { Wallet } from "./wallet.entity";
import { Label } from "./label.entity";
import { TransactionType } from "./transaction.entity";
import { BigNumber } from "bignumber.js";

export enum RecurrenceFrequency {
  HOURLY = "HOURLY",
  DAILY = "DAILY",
  WEEKLY = "WEEKLY",
  MONTHLY = "MONTHLY",
}

@Entity({ name: "recurring_transactions" })
export class RecurringTransaction {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({
    type: "decimal",
    precision: 12,
    scale: 2,
  })
  amount: string;

  // A free-text template (may contain client-only placeholders like
  // {{CURRENT_MONTH}}). This backend never parses it, only stores it verbatim.
  @Column({ nullable: false })
  description: string;

  // Who the money is owed to or by, on debt and receivable accounts.
  @Column({ nullable: true, length: 80 })
  counterparty?: string;

  @Column({ type: "enum", enum: TransactionType, nullable: true })
  type?: TransactionType;

  @Index()
  @ManyToOne(() => Wallet, {
    eager: true,
    nullable: false,
    onDelete: "CASCADE",
  })
  wallet: Wallet;

  @ManyToOne(() => Label, {
    eager: true,
    nullable: true,
    onDelete: "SET NULL",
  })
  label?: Label;

  @Column({ type: "enum", enum: RecurrenceFrequency, nullable: false })
  frequency: RecurrenceFrequency;

  // Required iff frequency is MONTHLY: the day of the month to run on,
  // clamped to the last day of shorter months. Purely a client-side
  // computation input, never validated against a calendar here.
  @Column({ name: "day_of_month", type: "smallint", nullable: true })
  dayOfMonth?: number;

  // "HH:mm" strings, stored as-is. Resolution/scheduling is entirely client-side.
  @Column({
    name: "notification_times",
    type: "simple-array",
    default: "",
  })
  notificationTimes: string[];

  // When the rule is allowed to start producing occurrences - may be in the
  // future (a rule doesn't fire the moment it's created unless startAt is
  // now/past). Purely a synced value, no server-side date logic on it.
  @Column({ name: "start_at", type: "timestamptz", nullable: false })
  startAt: string;

  // Purely a synced display value: whatever the client last computed and
  // pushed. Never recomputed or validated server-side beyond being a date.
  @Column({ name: "next_occurrence_at", type: "timestamptz", nullable: false })
  nextOccurrenceAt: string;

  @Column({ name: "last_executed_at", type: "timestamptz", nullable: true })
  lastExecutedAt?: string;

  // Null means the rule recurs forever. No server-side date logic beyond format.
  @Column({ name: "end_at", type: "timestamptz", nullable: true })
  endAt?: string;

  @Column({ default: true })
  active: boolean;

  @CreateDateColumn({ name: "created_at" })
  createdAt: string;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: string;

  @DeleteDateColumn({ name: "deleted_at" })
  deletedAt?: string;

  getAmount() {
    return new BigNumber(this.amount);
  }
}
