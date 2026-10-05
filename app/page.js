"use client";
import "./globals.css";
import { useState } from "react";

const LINES = [
  "Öppna det här när du saknar mig.",
  "Jag menade det. Läs det imorgon.",
  "Till mig, om ett år: du klarade det."
];

export default function Home() {
  const [text, setText] = useState(LINES[0]);
  const [when, setWhen] = useState("tomorrow");
  const [date, setDate] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const line = text.trim();
  async function pay(e) {
    e.preventDefault();
    setBusy(true);
    setErr("");
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text: line, when, date })
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.url) { setErr(data.error || "Kunde inte öppna kortbetalning"); setBusy(false); return; }
    window.location = data.url;
  }
  const openLabel = when === "now" ? "nu" : when === "tomorrow" ? "imorgon" : when === "week" ? "om 7 dagar" : date || "ett datum";
  return (
    <main>
      <div className="kicker">KEPT</div>
      <h1>Skriv den nu. De läser den sen.</h1>
      <p className="sub">En lapp till en vän, en crush, eller dig. €1. Den är stängd tills tiden du väljer. Inget konto.</p>
      <div className="chips">
        {LINES.map((item) => <button type="button" className="chip" key={item} onClick={() => setText(item)}>{item}</button>)}
      </div>
      <form onSubmit={pay}>
        <textarea maxLength={180} value={text} onChange={(e) => setText(e.target.value)} placeholder="Det du vill att de ska läsa." />
        <label>Oppnas</label>
        <select value={when} onChange={(e) => setWhen(e.target.value)}>
          <option value="now">Nu</option>
          <option value="tomorrow">Imorgon</option>
          <option value="week">Om 7 dagar</option>
          <option value="date">Ett datum</option>
        </select>
        {when === "date" ? <input style={{ marginTop: 10 }} type="date" value={date} onChange={(e) => setDate(e.target.value)} /> : null}
        <article className="card">
          <div className="kicker">STÄNGD TILLS {openLabel.toUpperCase()}</div>
          <p className="line">{line || "Skriv lappen först."}</p>
        </article>
        <div className="meta">{line.length}/180 · €1</div>
        <button disabled={busy || line.length < 4}>{busy ? "Öppnar kortbetalning" : "Håll den här · €1"}</button>
        {err ? <p className="err">{err}</p> : null}
      </form>
    </main>
  );
}
