import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
} from "typeorm";
import { User } from "./User";

export enum MeterTypeEnum {
  PREPAID = "PREPAID",
  POSTPAID = "POSTPAID",
}

export enum DiscoEnum {
  EKEDC = "EKEDC",
  IKEDC = "IKEDC",
  AEDC = "AEDC",
  IBEDC = "IBEDC",
  PHEDC = "PHEDC",
  JEDC = "JEDC",
  KEDC = "KEDC",
  BEDC = "BEDC",
  EEDC = "EEDC",
  IE = "IKEDC",
}

@Entity()
export class ElectricityMeter {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "text" })
  meterNumber: string;

  @Column({ type: "text", nullable: true })
  meterName: string;

  @Column({ type: "text", nullable: true })
  meterAddress: string;

  @Column({
    type: "enum",
    enum: MeterTypeEnum,
  })
  meterType: MeterTypeEnum;

  @Column({
    type: "enum",
    enum: DiscoEnum,
  })
  disco: DiscoEnum;

  @Column({ type: "int", nullable: true })
  userId: number;

  @Column({ type: "decimal", precision: 12, scale: 2, default: 0 })
  meterBalance: number;

  @Column({ type: "date", nullable: true })
  lastRecharge: Date;

  @ManyToOne(() => User, (user) => user.electricityMeters, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
