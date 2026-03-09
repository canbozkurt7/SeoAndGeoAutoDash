import { useLocation, Link } from "react-router-dom";
import {
  LayoutDashboard,
  Search,
  Share2,
  Globe2,
  Leaf,
  MapPin,
  FileText,
} from "lucide-react";

const navItems = [
  { label: "Overview", path: "/", icon: LayoutDashboard },
  { label: "Google Ads", path: "/google-ads", icon: Search },
  { label: "Meta Ads", path: "/meta-ads", icon: Share2 },
  { label: "Yandex Ads", path: "/yandex-ads", icon: Globe2 },
  { label: "Organic / GSC", path: "/organic", icon: Leaf },
  { label: "Geo Intelligence", path: "/geo", icon: MapPin },
  { label: "Reports", path: "/reports", icon: FileText },
];

export const AppSidebar = () => {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[220px] bg-surface-0 border-r border-border flex flex-col z-50">
      {/* Logo */}
      <div className="px-5 py-6">
        <h1 className="font-heading text-xl font-bold tracking-tight text-foreground">
          NorthStar <span className="text-primary">✦</span>
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-all duration-150 ${
                isActive
                  ? "nav-active text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-surface-hover"
              }`}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-4 py-4 border-t border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
            JM
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground truncate">John Miller</p>
            <p className="text-xs text-muted-foreground truncate">Performance Lead</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
