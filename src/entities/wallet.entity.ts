import {
  Column,
  Entity,
  ManyToOne,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from "typeorm";
import { User } from "./user.entity";
import { BigNumber } from "bignumber.js";

export enum WalletType {
  CASH = "CASH",
  BANK = "BANK",
  MOBILE_MONEY = "MOBILE_MONEY",
  // Money others owe you. Its balance never goes below 0.
  RECEIVABLE = "RECEIVABLE",
  // Money you owe. Its balance is what is left to pay, never below 0.
  DEBT = "DEBT",
}

@Entity({ name: "wallets" })
export class Wallet {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description?: string;

  @Column({
    type: "decimal",
    precision: 12,
    scale: 2,
  })
  balance: string;

  @Column({
    type: "enum",
    enum: WalletType,
    default: WalletType.CASH,
  })
  type: WalletType;

  // ISO 4217 code. Balances and transaction amounts are in this currency.
  @Column({ length: 3, default: "MGA" })
  currency: string;

  @ManyToOne(() => User, (user) => user.wallets, {
    eager: true,
    nullable: false,
    onDelete: "CASCADE",
  })
  user: User;

  @CreateDateColumn({ name: "created_at" })
  createdAt: string;

  @UpdateDateColumn({
    name: "updated_at",
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP",
    nullable: false,
  })
  updatedAt: string;

  @DeleteDateColumn({ name: "deleted_at" })
  deletedAt?: string;

  getBalance() {
    return new BigNumber(this.balance);
  }
}
