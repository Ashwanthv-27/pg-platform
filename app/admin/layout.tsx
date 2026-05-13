"use client";

import { useAuth } from "@/lib/authContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Sidebar from "@/app/components/admin/Sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.replace("/login");
    }
  }, [isAdmin, loading, router]);

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="spinner" style={{ width: 36, height: 36, borderWidth: 3, borderTopColor: "var(--brand-primary)" }} />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="admin-shell">
      <Sidebar />
      <main className="admin-main">
        {children}
      </main>
    </div>
  );
}
