import {
  Column,
  Entity,
  ManyToOne,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from "typeorm";
import { Project } from "./project.entity";
import { Transaction } from "./transaction.entity";
import { BigNumber } from "bignumber.js";

@Entity({ name: "project_items" })
export class ProjectItem {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  description: string;

  @Column({
    type: "decimal",
    precision: 12,
    scale: 2,
  })
  amount: string;

  @Column({
    name: "actual_amount",
    type: "decimal",
    precision: 12,
    scale: 2,
    nullable: true,
  })
  actualAmount?: string;

  @Column({ nullable: true })
  icon?: string;

  @ManyToOne(() => Project, {
    eager: false,
    nullable: false,
    onDelete: "CASCADE",
  })
  project: Project;

  @ManyToOne(() => Transaction, {
    eager: true,
    nullable: true,
    onDelete: "SET NULL",
  })
  transaction?: Transaction;

  @Column({ name: "executed_at", type: "timestamp", nullable: true })
  executedAt?: string;

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
