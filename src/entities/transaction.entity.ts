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
// Type-only: RecurringTransaction's own file imports TransactionType from this
// one, so a normal (value) import here would create a runtime require cycle.
// The relation below references it by name instead, which TypeORM resolves
// against the class name at entity-metadata build time (see EntityMetadata's
// targetName), so this import never needs to exist at runtime.
import type { RecurringTransaction } from "./recurring-transaction.entity";
import { BigNumber } from "bignumber.js";

export enum TransactionType {
  EXPENSE = "EXPENSE",
  INCOME = "INCOME",
  TRANSFER = "TRANSFER",
}

@Entity({ name: "transaction" })
export class Transaction {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({
    type: "decimal",
    precision: 12,
    scale: 2,
  })
  amount: string;

  @Column({ nullable: false })
  description: string;

  // Who the money is owed to or by, on debt and receivable accounts.
  @Column({ nullable: true, length: 80 })
  counterparty?: string;

  @Column({ type: "enum", enum: TransactionType, nullable: true })
  type?: TransactionType;

  @ManyToOne(() => Label, {
    eager: true,
    nullable: true,
    onDelete: "SET NULL",
  })
  label?: Label;

  @Column({ name: "transfer_id", nullable: true })
  transferId?: string;

  // The recurring rule this transaction was generated from, if any. The FK
  // lives here (the "many" side): one rule produces many transactions over
  // time, so RecurringTransaction itself never points back at any of them.
  @ManyToOne("RecurringTransaction", {
    eager: false,
    nullable: true,
    onDelete: "SET NULL",
  })
  recurringTransaction?: RecurringTransaction;

  @Index()
  @ManyToOne(() => Wallet, {
    eager: true,
    nullable: false,
    onDelete: "CASCADE",
  })
  wallet: Wallet;

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
