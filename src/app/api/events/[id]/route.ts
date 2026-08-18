import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import Event from "@/models/Event";

export async function GET(_request, { params }) {
  const { id } = await params;
  await connectDb();
  const event = await Event.findOne({ id }).lean();
  if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });
  return NextResponse.json(event);
}
