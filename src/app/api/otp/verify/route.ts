import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import Otp from "@/models/Otp";

export async function POST(request) {
  const body = await request.json().catch(() => null);
  const { channel, destination, code } = body || {};
  if (channel !== "email" || !destination || !code) {
    return NextResponse.json(
      { error: "channel must be 'email', destination and code are required" },
      { status: 400 }
    );
  }
  const key = `${channel}:${String(destination).trim().toLowerCase()}`;

  await connectDb();
  const entry = await Otp.findOne({ key });
  if (!entry) return NextResponse.json({ result: "not_found" });
  if (Date.now() > entry.expiresAt.getTime()) {
    await Otp.deleteOne({ key });
    return NextResponse.json({ result: "expired" });
  }
  if (entry.code !== String(code).trim()) {
    return NextResponse.json({ result: "mismatch" });
  }
  await Otp.deleteOne({ key });
  return NextResponse.json({ result: "ok" });
}
