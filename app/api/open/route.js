import Stripe from "stripe";
import { seal, openNote } from "../../../lib/note";

export async function POST(req) {
  const body = await req.json().catch(() => null);
  const session_id = body?.session_id;
  const token = body?.token;
  if (!process.env.SEAL_SECRET) return Response.json({ error: "Missing seal secret." }, { status: 500 });
  if (session_id) {
    if (typeof session_id !== "string" || !/^cs_(live|test)_[a-zA-Z0-9]+$/.test(session_id)) {
      return Response.json({ error: "No valid payment session." }, { status: 400 });
    }
    if (!process.env.STRIPE_SECRET_KEY) return Response.json({ error: "Payment checking is temporarily unavailable. Keep this link and try again." }, { status: 503 });
    try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.retrieve(session_id);
    if (session.payment_status !== "paid" || session.status !== "complete" || session.mode !== "payment" ||
        session.metadata?.app !== "kept" || session.currency !== "eur" || session.amount_total !== 100) {
      return Response.json({ error: "Not a paid Kept note." }, { status: 402 });
    }
    const openAt = Number(session.metadata.openAt);
    if (typeof session.metadata.text !== "string" || session.metadata.text.length < 4 ||
        session.metadata.text.length > 180 || !Number.isSafeInteger(openAt) || openAt <= 0) {
      return Response.json({ error: "The payment has no valid note. Contact support@nyttolabs.com." }, { status: 422 });
    }
    const packed = seal({ text: session.metadata.text, openAt, sid: session.id }, process.env.SEAL_SECRET);
    return Response.json({ token: packed }, { headers: { "Cache-Control": "no-store" } });
    } catch {
      return Response.json({ error: "Could not check this payment. Keep this link and try again." }, { status: 502 });
    }
  }
  try {
    const note = openNote(token, process.env.SEAL_SECRET);
    const locked = Date.now() < note.openAt;
    return Response.json({ locked, openAt: note.openAt, text: locked ? null : note.text }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "This note does not open." }, { status: 400 });
  }
}
