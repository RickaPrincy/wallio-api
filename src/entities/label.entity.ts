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

@Entity({ name: "labels" })
export class Label {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column()
  icon: string;

  @Column()
  color: string;

  @ManyToOne(() => User, {
    eager: true,
    nullable: false,
    onDelete: "CASCADE",
  })
  user: User;

  @CreateDateColumn({ name: "created_at" })
  createdAt: string;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: string;

  @DeleteDateColumn({ name: "deleted_at" })
  deletedAt?: string;
}
