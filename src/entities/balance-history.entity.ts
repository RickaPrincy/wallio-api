import {
  Column,
  Entity,
  ManyToOne,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  Index,
} from "typeorm";
import { Wallet } from "./wallet.entity";

@Entity({ name: "balance_history" })
export class BalanceHistory {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "decimal", precision: 12, scale: 2, default: 0 })
  amount: number;

  @Column({ name: "balance_before", type: "decimal", precision: 12, scale: 2 })
  balanceBefore: number;

  @Index()
  @ManyToOne(() => Wallet, { onDelete: "CASCADE", nullable: false })
  wallet: Wallet;

  @Index()
  @CreateDateColumn({ name: "created_at" })
  createdAt: string;
}
