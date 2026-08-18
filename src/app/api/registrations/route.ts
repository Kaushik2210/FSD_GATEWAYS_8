import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import Event from "@/models/Event";
import Registration from "@/models/Registration";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\d{10}$/;

function makeTicketCode(eventId) {
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `GATE-${eventId.slice(0, 3).toUpperCase()}-${rand}`;
}

// Lists everyone's registration details (name, email, phone, payment ref) —
// gated behind an admin key so this can't be scraped by anyone who finds
// the URL on a publicly deployed site.
export async function GET(request) {
  const adminKey = process.env.ADMIN_KEY;
  if (!adminKey) {
    return NextResponse.json({ error: "Admin access isn't configured on this deployment (set ADMIN_KEY)" }, { status: 503 });
  }
  if (request.headers.get("x-admin-key") !== adminKey) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const eventId = request.nextUrl.searchParams.get("eventId");
  await connectDb();
  const filter = eventId ? { eventId } : {};
  const registrations = await Registration.find(filter).sort({ createdAt: -1 }).lean();
  return NextResponse.json(registrations);
}

export async function POST(request) {
  const body = await request.json().catch(() => null);
  const { eventId, name, college, course, email, phone, txnId, screenshotName } = body || {};

  if (!eventId || !name || !college || !course || !email || !phone || !txnId) {
    return NextResponse.json(
      { error: "eventId, name, college, course, email, phone and txnId are required" },
      { status: 400 }
    );
  }
  if (!EMAIL_RE.test(String(email).trim())) return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  if (!PHONE_RE.test(String(phone).trim())) return NextResponse.json({ error: "Invalid phone" }, { status: 400 });

  await connectDb();
  const event = await Event.findOne({ id: eventId }).lean();
  if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });

  let ticket;
  for (let attempt = 0; attempt < 5; attempt++) {
    ticket = makeTicketCode(eventId);
    // eslint-disable-next-line no-await-in-loop
    if (!(await Registration.exists({ ticket }))) break;
  }

  const registration = await Registration.create({
    eventId,
    name: String(name).trim(),
    college: String(college).trim(),
    course: String(course).trim(),
    email: String(email).trim(),
    phone: String(phone).trim(),
    ticket,
    txnId: String(txnId).trim(),
    screenshotName,
  });

  return NextResponse.json(registration, { status: 201 });
}
