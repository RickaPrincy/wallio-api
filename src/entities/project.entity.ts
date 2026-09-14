import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from "typeorm";
import { User } from "./user.entity";
import { ProjectItem } from "./project-item.entity";

@Entity({ name: "projects" })
export class Project {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column({
    name: "planned_amount",
    type: "decimal",
    precision: 12,
    scale: 2,
    nullable: true,
  })
  plannedAmount?: string;

  @ManyToOne(() => User, {
    eager: true,
    nullable: false,
    onDelete: "CASCADE",
  })
  user: User;

  @OneToMany(() => ProjectItem, (item) => item.project)
  items: ProjectItem[];

  @CreateDateColumn({ name: "created_at" })
  createdAt: string;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: string;

  @DeleteDateColumn({ name: "deleted_at" })
  deletedAt?: string;
}
