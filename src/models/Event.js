import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    tagline: { type: String, required: true },
    description: { type: String, required: true },
    biome: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    glow: { type: String, required: true },
    height: { type: String, enum: ["sm", "md", "lg"], required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Event || mongoose.model("Event", eventSchema);
