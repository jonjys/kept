import Stripe from "stripe";

function openAt(when, date) {
  const now = Date.now();
  if (when === "tomorrow") return now + 86400000;
  if (when === "week") return now + 7 * 86400000;
  if (when === "date" && date) {
    const t = new Date(date + "T00:00:00Z").getTime();
    if (Number.isNaN(t) || t < now || t > now + 366 * 86400000) return null;
    return t;
  }
  return now;
}

export async function POST(req) {
  const body = await req.json().catch(() => ({}));
  const text = String(body.text || "").trim().replace(/\s+/g, " ");
  if (text.length < 4 || text.length > 180) return Response.json({ error: "Write 4 to 180 characters." }, { status: 400 });
  const at = openAt(body.when, body.date);
  if (!at) return Response.json({ error: "Pick a date within a year." }, { status: 400 });
  if (!process.env.STRIPE_SECRET_KEY) return Response.json({ error: "Card checkout is not connected yet." }, { status: 500 });
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_URL;
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [{ price: process.env.STRIPE_PRICE_ID, quantity: 1 }],
    success_url: `${origin}/ready?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: origin,
    metadata: { app: "kept", text, openAt: String(at) }
  });
  return Response.json({ url: session.url });
}
