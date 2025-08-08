import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from "typeorm";
import { User } from "./User";

@Entity()
export class RefreshToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "text", nullable: true })
  user_agent: string;

  @Column({ type: "boolean", nullable: true, default: false })
  is_revoked: boolean;

  @Column({ type: "timestamp", nullable: true })
  expires: Date;

  @Column({ type: "text", nullable: true })
  platform: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.refreshTokens, { onDelete: "CASCADE" })
  user: User;
}
