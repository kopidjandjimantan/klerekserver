import { isLoggedIn } from "@/lib/auth";
import LoginForm from "@/components/LoginForm";
import DatabaseViewer from "@/components/DatabaseViewer";
import LogoutButton from "@/components/LogoutButton";
import Link from "next/link";

export const dynamic = "force-dynamic";
export default async function Home() {
  const loggedIn = await isLoggedIn();
  if (!loggedIn) return <LoginForm />;
  return <main className="shell">
    <header className="topbar">
      <div className="brand-mark">K</div>
      <div className="brand-copy"><strong>Klerek DB Viewer</strong><span>Pusat pemeriksaan database</span></div>
      <nav><Link href="/admin">Admin</Link><LogoutButton /></nav>
    </header>
    <div className="content">
      <div className="eyebrow">DASHBOARD</div>
      <h1>Buka file database</h1>
      <p className="intro">Unggah file database SQLite untuk melihat daftar tabel dan datanya. File diproses di browser, bukan disimpan di server.</p>
      <DatabaseViewer />
      <p className="footnote">File yang terenkripsi atau menggunakan format aplikasi khusus tidak dapat dibaca tanpa format/kunci yang benar.</p>
    </div>
  </main>;
}
