import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/authContext";
import Navbar from "./components/Navbar";

const font = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Nakshathra Apartments & PG — Premium Accommodation",
    template: "%s — Nakshathra Properties",
  },
  description:
    "Premium PG rooms, studio apartments and flats for rent in Ernakulam, Kerala. Safe, comfortable and well-maintained. Contact us today.",
  keywords: ["PG rooms Ernakulam", "apartments for rent Kerala", "Nakshathra Apartments", "PG accommodation"],
  openGraph: {
    siteName: "Nakshathra Properties",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={font.variable} suppressHydrationWarning>
      <body className="font-sans text-slate-900 antialiased bg-slate-50 selection:bg-emerald-200 selection:text-emerald-900">
        <AuthProvider>
          <div className="page-wrapper">
            <Navbar />
            <main>{children}</main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
