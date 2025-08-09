import { Entity, PrimaryGeneratedColumn, Column, Unique, OneToMany, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { RefreshToken } from "./Token";
import { UserStatusEnum } from "../enums/user-type.enum";
import { ElectricityMeter } from "./Meter";

@Entity()
@Unique(["email"])
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "text", nullable: true })
  fullName: string;

  @Column({ type: "text", unique: true })
  email: string;

  @Column({ type: "text", nullable: true })
  phone: string;

  @Column({ type: "text", nullable: true })
  nin: string;

  @Column({ type: "boolean", nullable: true, default: false })
  isVerified: boolean;

  @Column({ type: "boolean", nullable: true, default: false })
  phoneNumberVerified: boolean;

  @Column({ type: "text", nullable: true, default: "Nigeria" })
  country: string;

  @Column({ type: "text", nullable: true })
  address: string;

  @Column({
    type: "text",
    enum: UserStatusEnum,
    default: UserStatusEnum.INACTIVE,
  })
  status: UserStatusEnum;

  @Column({ type: "text", nullable: true })
  password: string;

  @Column({ type: "text", nullable: true })
  userAgent: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: "jsonb", nullable: true })
  password_reset: {
    initiated: boolean;
    otp: string;
    date: Date;
  };

  @Column({ type: "timestamp", nullable: true })
  lastLogin: Date;

  // Relations
  @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.user)
  refreshTokens: RefreshToken[];

  @OneToMany(() => ElectricityMeter, (meter) => meter.user)
  electricityMeters: ElectricityMeter[];
}
