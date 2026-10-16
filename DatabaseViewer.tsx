"use client";
import { useRef, useState } from "react";

type SqlDb = { exec: (sql: string) => { columns: string[]; values: unknown[][] }[]; close: () => void };
declare global { interface Window { initSqlJs?: (config: { locateFile: (file: string) => string }) => Promise<{ Database: new (data: Uint8Array) => SqlDb }> } }

export default function DatabaseViewer() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState("Pilih file database untuk memulai.");
  const [kind, setKind] = useState<"idle"|"good"|"warn">("idle");
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState("");
  const [tables, setTables] = useState<string[]>([]);
  const [selected, setSelected] = useState("");
  const [columns, setColumns] = useState<string[]>([]);
  const [rows, setRows] = useState<unknown[][]>([]);
  const [busy, setBusy] = useState(false);
  const dbRef = useRef<SqlDb|null>(null);

  function fmtSize(n: number) { return n < 1024 ? `${n} B` : n < 1048576 ? `${(n/1024).toFixed(1)} KB` : `${(n/1048576).toFixed(2)} MB`; }
  function showTable(db: SqlDb, name: string) {
    const escaped = name.replace(/"/g, '""');
    const result = db.exec(`SELECT * FROM "${escaped}" LIMIT 500`);
    setSelected(name);
    setColumns(result[0]?.columns || []);
    setRows(result[0]?.values || []);
  }
  async function openFile() {
    const file = inputRef.current?.files?.[0];
    if (!file) { setStatus("Pilih file terlebih dahulu."); setKind("warn"); return; }
    setBusy(true); setTables([]); setRows([]); setColumns([]); setSelected(""); setFileName(file.name); setFileSize(fmtSize(file.size));
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const signature = new TextDecoder().decode(bytes.slice(0, 16));
      if (!signature.startsWith("SQLite format 3")) {
        setStatus("Header file bukan SQLite standar. File mungkin terenkripsi atau memakai format khusus aplikasi; format/kunci yang benar diperlukan."); setKind("warn"); return;
      }
      if (!window.initSqlJs) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/sql-wasm.js";
          script.onload = () => resolve(); script.onerror = () => reject(new Error("Pustaka SQLite gagal dimuat. Periksa koneksi internet.")); document.head.appendChild(script);
        });
      }
      const init = window.initSqlJs;
      if (!init) throw new Error("Pustaka SQLite tidak tersedia.");
      const SQL = await init({ locateFile: f => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.3/${f}` });
      const db = new SQL.Database(bytes); dbRef.current?.close(); dbRef.current = db;
      const result = db.exec("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name");
      const names = (result[0]?.values || []).map(r => String(r[0]));
      setTables(names); setKind("good");
      if (!names.length) { setStatus("Database SQLite berhasil dibuka, tetapi tidak ada tabel pengguna."); return; }
      showTable(db, names[0]); setStatus(`Database berhasil dibuka. Ditemukan ${names.length} tabel.`);
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "File tidak dapat dibuka."); setKind("warn");
    } finally { setBusy(false); }
  }
  function escape(value: unknown) {
    return String(value ?? "NULL").replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c] as string));
  }
  function reset() {
    dbRef.current?.close(); dbRef.current = null;
    if (inputRef.current) inputRef.current.value = "";
    setFileName(""); setFileSize(""); setTables([]); setRows([]); setColumns([]); setSelected(""); setStatus("Pilih file database untuk memulai."); setKind("idle");
  }
  return <section className="viewer">
    <div className="upload-panel">
      <div className="upload-icon">↑</div><h2>Pilih file database</h2>
      <p>Format yang didukung: .db, .sqlite, .sqlite3</p>
      <input ref={inputRef} type="file" accept=".db,.sqlite,.sqlite3" aria-label="Pilih file database"/>
      <div className="actions"><button className="primary" onClick={openFile} disabled={busy}>{busy ? "Membuka…" : "Buka file"}</button><button className="secondary" onClick={reset}>Bersihkan</button></div>
    </div>
    <div className={`status ${kind}`} role="status">{status}</div>
    {fileName && <div className="file-info"><div><span>Nama file</span><strong>{fileName}</strong></div><div><span>Ukuran</span><strong>{fileSize}</strong></div><div><span>Jenis</span><strong>Database lokal</strong></div></div>}
    {tables.length > 0 && <div className="results">
      <div className="result-heading"><div><h2>Isi database</h2><p>{tables.length} tabel ditemukan · menampilkan maksimal 500 baris</p></div>
        <label className="table-picker">Tabel<select value={selected} onChange={e=>{if(dbRef.current)showTable(dbRef.current,e.target.value)}}>{tables.map(t=><option key={t} value={t}>{t}</option>)}</select></label>
      </div>
      <div className="table-scroll"><table><thead><tr>{columns.map(c=><th key={c}>{c}</th>)}</tr></thead><tbody>
      {rows.map((row,i)=><tr key={i}>{(row as unknown[]).map((v,j)=><td key={j} title={String(v ?? "NULL")}>{String(v ?? "NULL")}</td>)}</tr>)}
      </tbody></table>{rows.length===0 && <p className="empty">Tabel ini kosong.</p>}</div>
    </div>}
  </section>;
}
