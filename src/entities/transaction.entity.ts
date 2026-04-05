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
import { BigNumber } from "bignumber.js";


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

  @Index()
  @ManyToOne(() => Wallet, {
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
