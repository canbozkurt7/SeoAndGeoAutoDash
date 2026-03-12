"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopBar } from "@/components/dashboard/TopBar";

function titleForPath(pathname: string) {
  if (pathname.startsWith("/google-ads")) return "Google Ads";
  if (pathname.startsWith("/meta-ads")) return "Meta Ads";
  if (pathname.startsWith("/yandex-ads")) return "Yandex Ads";
  if (pathname.startsWith("/organic-gsc")) return "Organic / GSC";
  if (pathname.startsWith("/geo-intelligence")) return "Geo Intelligence";
  if (pathname.startsWith("/reports")) return "Reports";
  return "Overview";
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === "/login";

  if (isLogin) {
    return <main className="content">{children}</main>;
  }

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-column">
        <TopBar title={titleForPath(pathname)} />
        <main className="content">{children}</main>
      </div>
    </div>
  );
}
