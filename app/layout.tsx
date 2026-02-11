import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MSME Schemes — Discover government schemes you're eligible for",
  description: "Eligibility discovery for government schemes and loans. Startups and MSMEs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
