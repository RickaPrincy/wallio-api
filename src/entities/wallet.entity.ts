import {
  Column,
  Entity,
  ManyToOne,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { User } from "./user.entity";

export enum WalletType {
  CASH = "CASH",
  BANK = "BANK",
  MOBILE_MONEY = "MOBILE_MONEY",
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
    type: "enum",
    enum: WalletType,
    default: WalletType.CASH,
  })
  type: WalletType;

  @ManyToOne(() => User, (user) => user.wallets, {
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
}
