"use client";
import { useState, FormEvent } from "react";
export default function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: FormEvent) {
    e.preventDefault(); setError(""); setBusy(true);
    try {
      const res = await fetch("/api/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username, password }) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Login gagal."); return; }
      window.location.href = "/";
    } catch { setError("Tidak dapat terhubung. Coba lagi."); }
    finally { setBusy(false); }
  }
  return <main className="login-shell">
    <div className="login-card">
      <div className="brand-mark large">K</div><div className="eyebrow centered">KLEREK DATABASE TOOLS</div>
      <h1>Selamat datang</h1><p className="intro centered">Masuk untuk membuka dan memeriksa file database.</p>
      <form onSubmit={submit} className="login-form">
        <label>Username<input autoComplete="username" value={username} onChange={e=>setUsername(e.target.value)} required placeholder="Masukkan username"/></label>
        <label>Password<input type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} required placeholder="Masukkan password"/></label>
        {error && <div className="error" role="alert">{error}</div>}
        <button className="primary full" disabled={busy}>{busy ? "Memeriksa…" : "Masuk"}</button>
      </form>
      <div className="login-note">Akses dibatasi untuk administrator.</div>
    </div>
  </main>;
}
