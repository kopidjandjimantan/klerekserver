import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Klerek DB Viewer",
  description: "Buka dan periksa database SQLite dengan aman dari browser."
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="id"><body>{children}</body></html>;
}
