import mongoose from "mongoose";

const registrationSchema = new mongoose.Schema(
  {
    eventId: { type: String, required: true },
    name: { type: String, required: true },
    college: { type: String, required: true },
    course: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    ticket: { type: String, required: true, unique: true },
    txnId: { type: String, required: true },
    screenshotName: { type: String },
  },
  { timestamps: true }
);

const RegistrationModel: any = mongoose.models.Registration || mongoose.model("Registration", registrationSchema);
export default RegistrationModel;
