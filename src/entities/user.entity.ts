import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity()
export class User {
  @PrimaryColumn()
  id: string;

  @Column({ unique: true, nullable: false })
  firebaseId: string;

  @Column({ unique: true, nullable: false })
  username: string;

  @Column({ name: "first_name", nullable: true })
  firstName?: string;

  @Column({ name: "last_name", nullable: true })
  lastName?: string;

  @Column({ unique: true, nullable: false })
  email: string;

  @Column({ name: "avatar_url", nullable: true })
  avatarUrl?: string;

  @CreateDateColumn({
    name: "created_at",
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
    nullable: false,
  })
  createdAt: string;

  @UpdateDateColumn({
    name: "updated_at",
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP",
    nullable: false,
  })
  updatedAt: string;

  @DeleteDateColumn({ name: "deleted_at", nullable: true })
  deletedAt?: string;
}
