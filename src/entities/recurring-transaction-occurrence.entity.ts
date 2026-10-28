import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  CreateDateColumn,
  PrimaryColumn,
  UpdateDateColumn,
} from "typeorm";
import { RecurringTransaction } from "./recurring-transaction.entity";
import { Transaction } from "./transaction.entity";

// Only a handled occurrence is stored: one still waiting is recomputed by the
// client from the rule.
export enum OccurrenceStatus {
  EXECUTED = "EXECUTED",
  DISMISSED = "DISMISSED",
}

// One due date of a recurring rule the user executed or ignored. Final: once
// stored it never changes, so a restore keeps the history and statistics.
@Entity({ name: "recurring_transaction_occurrences" })
export class RecurringTransactionOccurrence {
  // Chosen by the client and deterministic (rule id + due date), so the same
  // occurrence recorded twice is the same row.
  @PrimaryColumn({ length: 100 })
  id: string;

  @Index()
  @Column({ name: "recurring_transaction_id" })
  recurringTransactionId: string;

  @ManyToOne(() => RecurringTransaction, {
    nullable: false,
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "recurring_transaction_id" })
  recurringTransaction?: RecurringTransaction;

  @Column({ name: "occurrence_at", type: "timestamptz" })
  occurrenceAt: string;

  @Column({ type: "enum", enum: OccurrenceStatus })
  status: OccurrenceStatus;

  @Index()
  @Column({ name: "transaction_id", nullable: true })
  transactionId?: string | null;

  @ManyToOne(() => Transaction, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "transaction_id" })
  transaction?: Transaction;

  // Frozen when the occurrence was recorded; null means the rule's own amount.
  @Column({
    name: "planned_amount",
    type: "decimal",
    precision: 12,
    scale: 2,
    nullable: true,
  })
  plannedAmount?: string | null;

  @CreateDateColumn({ name: "created_at" })
  createdAt: string;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: string;
}
