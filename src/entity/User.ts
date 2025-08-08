import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Unique,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { RefreshToken } from "./Token";
import { GenderEnum, MaritalStatusEnum, ProfileTypeEnum, UserStatusEnum } from "../enums/user-type.enum";

@Entity()
@Unique(["email"])
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "text", nullable: true })
  firstName: string;

  @Column({ type: "text", nullable: true })
  middleName: string;

  @Column({ type: "text", nullable: true })
  lastName: string;

  @Column({ type: "text", unique: true })
  email: string;

  @Column({ type: "text", nullable: true })
  phone: string;

  @Column({ type: "text", nullable: true })
  country: string;

  @Column({ type: "text", nullable: true })
  state: string;

  @Column({ type: "text", nullable: true })
  city: string;

  @Column({ type: "text", nullable: true })
  address: string;

  @Column({ type: "text", nullable: true })
  dob: string;

  @Column({ type: "text", nullable: true })
  ageRange: string;

  @Column({ type: "text", enum: GenderEnum, nullable: true })
  gender: GenderEnum;

  @Column({ type: "text", enum: MaritalStatusEnum, nullable: true })
  maritalStatus: MaritalStatusEnum;

  @Column({
    type: "text",
    enum: ProfileTypeEnum,
    default: ProfileTypeEnum.MEMBER,
    nullable: true,
  })
  profileType: ProfileTypeEnum;

  @Column({
    type: "text",
    enum: ProfileTypeEnum,
    nullable: true,
  })
  departmentProfileType: ProfileTypeEnum;

  @Column({
    type: "text",
    enum: UserStatusEnum,
    default: UserStatusEnum.INACTIVE,
  })
  status: UserStatusEnum;

  @Column({ type: "text", nullable: true })
  password: string;

  @Column({ type: "text", nullable: true })
  photoUrl: string;

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
}
