"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/authContext";
import { ThemeToggle } from "./ThemeToggle";

export default function Navbar() {
  const { user, isAdmin, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  const isActive = (href: string) =>
    pathname === href ? "active" : "";

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        {/* Brand */}
        <Link href="/" className="navbar-brand">
          <span className="brand-dot" />
          PG Finder
        </Link>

        {/* Nav Links */}
        <ul className="navbar-links">
          <li>
            <Link href="/" className={isActive("/")}>
              🏠 Home
            </Link>
          </li>
          {user && (
            <>
              <li>
                <Link href="/add-pg" className={isActive("/add-pg")}>
                  ＋ List a PG
                </Link>
              </li>
              <li>
                <Link href="/my-listings" className={isActive("/my-listings")}>
                  📋 My Listings
                </Link>
              </li>
              {isAdmin && (
                <li>
                  <Link href="/admin" className={isActive("/admin")}>
                    🛡️ Admin Panel
                  </Link>
                </li>
              )}
            </>
          )}
        </ul>

        {/* Auth Actions */}
        <div className="navbar-actions">
          <ThemeToggle />
          {user ? (
            <>
              <div className="user-badge">
                <span>👤</span>
                <span style={{ maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {user.email}
                </span>
              </div>
              <button
                className="btn btn-ghost btn-sm"
                onClick={handleSignOut}
              >
                Logout
              </button>
            </>
          ) : (
            <Link href="/login" className="btn btn-primary btn-sm">
              Login / Sign Up
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
