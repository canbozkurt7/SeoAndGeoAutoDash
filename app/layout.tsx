import "./globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AppShell } from "@/components/dashboard/AppShell";

export const metadata: Metadata = {
  title: "SEO + GEO Dashboard",
  description: "Daily SEO and LLM citation visibility monitor"
};

export default function RootLayout({
  children
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
