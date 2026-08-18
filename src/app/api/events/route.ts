import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import Event from "@/models/Event";

export async function GET() {
  await connectDb();
  const events = await Event.find().sort({ createdAt: 1 }).lean();
  return NextResponse.json(events);
}
