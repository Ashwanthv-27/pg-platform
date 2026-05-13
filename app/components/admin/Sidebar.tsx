"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/authContext";
import {
  LayoutDashboard,
  Building2,
  DoorOpen,
  Users,
  MessageSquare,
  UserCog,
  LogOut,
  ChevronRight,
  Star,
} from "lucide-react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/properties", label: "Properties", icon: Building2 },
  { href: "/admin/rooms", label: "Rooms", icon: DoorOpen },
  { href: "/admin/tenants", label: "Tenants", icon: Users },
  { href: "/admin/leads", label: "Leads", icon: MessageSquare },
  { href: "/admin/testimonials", label: "Testimonials", icon: Star },
  { href: "/admin/team", label: "Team", icon: UserCog },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { profile, signOut } = useAuth();

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <aside className="admin-sidebar">
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">🏡</div>
        <div>
          <div className="sidebar-brand-name">Nakshathra</div>
          <div className="sidebar-brand-sub">Property Manager</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href, item.exact);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-nav-item ${active ? "active" : ""}`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
              {active && <ChevronRight size={14} className="sidebar-nav-chevron" />}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">
            {profile?.name?.charAt(0)?.toUpperCase() ?? "A"}
          </div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{profile?.name ?? "Admin"}</div>
            <div className="sidebar-user-role">Administrator</div>
          </div>
        </div>
        <button onClick={signOut} className="sidebar-signout" title="Sign out">
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  );
}
