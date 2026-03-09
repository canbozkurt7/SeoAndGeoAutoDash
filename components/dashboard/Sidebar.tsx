"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/overview", label: "Overview" },
  { href: "/google-ads", label: "Google Ads" },
  { href: "/meta-ads", label: "Meta Ads" },
  { href: "/yandex-ads", label: "Yandex Ads" },
  { href: "/organic-gsc", label: "Organic / GSC" },
  { href: "/prompt-tracking", label: "Prompt Tracking" },
  { href: "/settings", label: "Settings" }
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <div className="brand">Kepler Club Performance Marketing</div>
      <nav className="nav">
        {links.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={pathname === item.href ? "active-link" : ""}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="sidebar-user">
        <div className="avatar">CB</div>
        <div>
          <div className="user-name">Can Bozkurt</div>
          <div className="user-role muted">Growth Lead</div>
        </div>
      </div>
    </aside>
  );
}
