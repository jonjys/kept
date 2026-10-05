import Stripe from "stripe";

function openAt(when, date) {
  const now = Date.now();
  if (when === "tomorrow") return now + 86400000;
  if (when === "week") return now + 7 * 86400000;
  if (when === "date" && typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const t = new Date(date + "T00:00:00Z").getTime();
    if (!Number.isFinite(t) || new Date(t).toISOString().slice(0, 10) !== date || t < now || t > now + 366 * 86400000) return null;
    return t;
  }
  return when === "now" ? now : null;
}

export async function POST(req) {
  const body = await req.json().catch(() => null);
  const text = typeof body?.text === "string" ? body.text.trim().replace(/\s+/g, " ") : "";
  if (text.length < 4 || text.length > 180) return Response.json({ error: "Write 4 to 180 characters." }, { status: 400 });
  const at = openAt(body.when, body.date);
  if (!at) return Response.json({ error: "Pick a date within a year." }, { status: 400 });
  if (!process.env.STRIPE_SECRET_KEY) return Response.json({ error: "Card checkout is not connected yet." }, { status: 500 });
  try {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const origin = process.env.NEXT_PUBLIC_URL || new URL(req.url).origin;
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [{ price: process.env.STRIPE_PRICE_ID || "price_1UNHNkBEo0YzuylwkZ4JOoQz", quantity: 1 }],
    success_url: `${origin}/ready?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: origin,
    metadata: { app: "kept", text, openAt: String(at) }
  });
  return Response.json({ url: session.url }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "Could not start checkout. Please try again." }, { status: 502 });
  }
}
