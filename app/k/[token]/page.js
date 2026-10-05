"use client";
import "../../globals.css";
import { useEffect, useState } from "react";
export default function Note({ params }) {
  const [state, setState] = useState(null);
  useEffect(() => {
    let cancelled = false;
    let timer;
    const refresh = async () => {
      clearTimeout(timer);
      try {
        const response = await fetch("/api/open", { method: "POST", cache: "no-store", headers: { "content-type": "application/json" }, body: JSON.stringify({ token: params.token }) });
        const next = await response.json();
        if (cancelled) return;
        setState(next);
        if (next.locked) timer = setTimeout(refresh, Math.min(Math.max(next.openAt - Date.now() + 100, 1000), 2147483647));
      } catch {
        if (!cancelled) setState({ error: "Could not open this note. Try again." });
      }
    };
    const onVisible = () => { if (document.visibilityState === "visible") refresh(); };
    refresh();
    document.addEventListener("visibilitychange", onVisible);
    return () => { cancelled = true; clearTimeout(timer); document.removeEventListener("visibilitychange", onVisible); };
  }, [params.token]);
  if (!state) return <main><p className="meta">Opening.</p></main>;
  if (state.error) return <main><h1>This note does not open.</h1><p>{state.error}</p><button onClick={() => location.reload()}>Try again</button><a className="btn" href="/">Keep one</a></main>;
  const when = new Date(state.openAt).toUTCString();
  return (
    <main>
      <div className="kicker">KEPT</div>
      <div className="card">
        {state.locked ? <p className="line">Still shut.</p> : <p className="line">“{state.text}”</p>}
        <p className="meta">{state.locked ? `Opens ${when}` : `Opened ${when}`}</p>
      </div>
      <a className="btn" href="/">Keep one back · €1</a>
    </main>
  );
}
