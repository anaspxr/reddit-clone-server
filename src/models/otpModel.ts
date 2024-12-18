import { model, Schema } from "mongoose";

interface IOtp {
  email: string;
  otp: string;
  verified: boolean;
  expiresAt: Date;
}

const otpSchema = new Schema<IOtp>({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  verified: { type: Boolean, default: false },
  expiresAt: { type: Date, required: true },
});

export const Otp = model<IOtp>("Otp", otpSchema);
