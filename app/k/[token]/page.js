"use client";
import "../../globals.css";
import { useEffect, useState } from "react";
export default function Note({ params }) {
  const [state, setState] = useState(null);
  useEffect(() => {
    fetch("/api/open", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ token: params.token }) })
      .then((r) => r.json()).then(setState);
  }, [params.token]);
  if (!state) return <main><p className="meta">Opening.</p></main>;
  if (state.error) return <main><h1>This note does not open.</h1><a className="btn" href="/">Keep one</a></main>;
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
