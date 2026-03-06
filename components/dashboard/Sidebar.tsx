import Link from "next/link";

const links = [
  { href: "/overview", label: "Overview" },
  { href: "/performance-pulse", label: "Performance Pulse" },
  { href: "/prompt-tracking", label: "Prompt Tracking" },
  { href: "/alerts", label: "Alerts" },
  { href: "/settings", label: "Settings" }
];

export function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">SEO + GEO Control Center</div>
      <nav className="nav">
        {links.map((item) => (
          <Link key={item.href} href={item.href}>
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
