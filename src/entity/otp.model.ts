import mongoose, { Schema } from "mongoose";

const OTPVerificationSchema: Schema<any> = new mongoose.Schema({
  requestId: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: false,
  },
  otp: {
    type: String,
    required: true,
  },
  isValid: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 60 * 5,
  },
});

export const OTPVerificationModel = mongoose.model<any>("otp", OTPVerificationSchema);
