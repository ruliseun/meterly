import mongoose, { Schema, Document } from "mongoose";
import { VerificationTypeEnum } from "../enums/user-type.enum";

// Interface for TypeScript typing
export interface IVerification extends Document {
  type: VerificationTypeEnum;
  email: string;
  code?: string;
  is_valid: boolean;
  createdAt: Date;
  expiresAt: Date;
}

const VerificationsSchema: Schema<IVerification> = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: Object.values(VerificationTypeEnum),
      default: VerificationTypeEnum.EMAIL,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    code: {
      type: String,
      required: false,
    },
    is_valid: {
      type: Boolean,
      default: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 5 * 60 * 1000),
      index: { expires: "5m" },
    },
  },
  { timestamps: false },
);

export const VerificationsModel = mongoose.model<IVerification>("verifications", VerificationsSchema);
