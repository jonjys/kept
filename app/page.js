"use client";
import "./globals.css";
import { useState } from "react";

export default function Home() {
  const [text, setText] = useState("");
  const [when, setWhen] = useState("now");
  const [date, setDate] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  async function pay(e) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text, when, date })
    });
    const data = await res.json();
    if (!res.ok) { setErr(data.error || "Could not start"); setBusy(false); return; }
    window.location = data.url;
  }
  return (
    <main>
      <div className="kicker">KEPT</div>
      <h1>Write it now. They read it later.</h1>
      <p className="sub">A note for a friend, a crush, or you. €1. It stays shut until the time you pick. No account.</p>
      <form onSubmit={pay}>
        <textarea maxLength={180} value={text} onChange={(e) => setText(e.target.value)} placeholder="The thing you want them to read." />
        <label>Open</label>
        <select value={when} onChange={(e) => setWhen(e.target.value)}>
          <option value="now">Now</option>
          <option value="tomorrow">Tomorrow</option>
          <option value="week">In 7 days</option>
          <option value="date">On a date</option>
        </select>
        {when === "date" ? <input style={{ marginTop: 10 }} type="date" value={date} onChange={(e) => setDate(e.target.value)} /> : null}
        <div className="meta">{text.trim().length}/180 · €1</div>
        <button disabled={busy || text.trim().length < 4}>{busy ? "Opening checkout" : "Keep this · €1"}</button>
        {err ? <p className="meta">{err}</p> : null}
      </form>
    </main>
  );
}
