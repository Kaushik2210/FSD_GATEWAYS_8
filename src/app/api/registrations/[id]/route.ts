import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import Registration from "@/models/Registration";

export async function GET(_request, { params }) {
  const { id } = await params;
  await connectDb();
  const registration = await Registration.findById(id).lean();
  if (!registration) return NextResponse.json({ error: "Registration not found" }, { status: 404 });
  return NextResponse.json(registration);
}
