"use client";
import "../globals.css";
import { useEffect, useState } from "react";
export default function Ready() {
  const [href, setHref] = useState("");
  const [err, setErr] = useState("");
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("session_id");
    if (!id) return setErr("No payment.");
    fetch("/api/open", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ session_id: id }) })
      .then(async (r) => ({ ok: r.ok, data: await r.json() }))
      .then(({ ok, data }) => ok ? setHref(`${location.origin}/k/${data.token}`) : setErr(data.error || "Could not keep it"));
  }, []);
  return <main><div className="kicker">KEPT</div><h1>Send this.</h1>{err ? <p>{err}</p> : href ? <a className="btn" href={href}>Open the note link</a> : <p className="meta">Checking the €1.</p>}<p className="meta">They get the words only when it is time. The page asks them to keep one back.</p></main>;
}
