import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from "typeorm";
import { User } from "./User";

export enum TransactionType {
  CREDIT = "CREDIT",
  DEBIT = "DEBIT",
}

export enum TransactionStatus {
  PENDING = "PENDING",
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
}

@Entity({ name: "transactions" })
export class Transaction {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => User, (user) => user.transactions, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user: User;

  @Column({ type: "decimal", precision: 12, scale: 2 })
  amount: number;

  @Column({ type: "int", nullable: true })
  userId: number;

  @Column({ type: "decimal", precision: 12, scale: 2, nullable: true })
  units: string;

  @Column({ type: "text", nullable: true })
  tokenApplied: string;

  @Column({ type: "text", nullable: true })
  meterNumber: string;

  @Column({ type: "enum", enum: TransactionType })
  type: TransactionType;

  @Column({ type: "enum", enum: TransactionStatus, default: TransactionStatus.PENDING })
  status: TransactionStatus;

  @Column({ type: "varchar", length: 255, nullable: true })
  description: string;

  @Column({ type: "varchar", length: 255, unique: true })
  tx_ref: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;
}
