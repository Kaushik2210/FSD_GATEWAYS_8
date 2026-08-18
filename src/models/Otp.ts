import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true }, // `${channel}:${destination}`
  code: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  lastSentAt: { type: Date, required: true },
});

// MongoDB TTL index — document is auto-deleted once expiresAt passes.
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const OtpModel: any = mongoose.models.Otp || mongoose.model("Otp", otpSchema);
export default OtpModel;
