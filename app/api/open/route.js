import Stripe from "stripe";
import { seal, openNote } from "../../../lib/note";

export async function POST(req) {
  const { session_id, token } = await req.json().catch(() => ({}));
  if (!process.env.SEAL_SECRET) return Response.json({ error: "Missing seal secret." }, { status: 500 });
  if (session_id) {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.retrieve(session_id);
    if (session.payment_status !== "paid" || session.metadata?.app !== "kept") {
      return Response.json({ error: "Not a paid Kept note." }, { status: 402 });
    }
    const packed = seal({ text: session.metadata.text, openAt: Number(session.metadata.openAt), sid: session.id }, process.env.SEAL_SECRET);
    return Response.json({ token: packed });
  }
  try {
    const note = openNote(token, process.env.SEAL_SECRET);
    const locked = Date.now() < note.openAt;
    return Response.json({ locked, openAt: note.openAt, text: locked ? null : note.text });
  } catch {
    return Response.json({ error: "This note does not open." }, { status: 400 });
  }
}
