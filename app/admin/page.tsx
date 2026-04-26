"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/lib/authContext";

type PG = {
  id: string;
  title: string;
  location: string;
  price: number;
  contact_number: string;
  owner_id: string;
};

export default function AdminDashboardPage() {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();
  const [pgs, setPgs] = useState<PG[]>([]);
  const [fetching, setFetching] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Admin guard
  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.replace("/");
    }
  }, [user, isAdmin, loading, router]);

  useEffect(() => {
    if (isAdmin) fetchAllListings();
  }, [isAdmin]);

  async function fetchAllListings() {
    setFetching(true);
    const { data, error } = await supabase
      .from("pg_listings")
      .select("*")
      .order("id", { ascending: false });

    if (!error && data) setPgs(data as PG[]);
    setFetching(false);
  }

  async function deleteListing(id: string) {
    if (!confirm("Are you sure you want to delete this listing globally?")) return;
    setDeletingId(id);
    const { error } = await supabase.from("pg_listings").delete().eq("id", id);
    if (!error) {
      setPgs((prev) => prev.filter((p) => p.id !== id));
    } else {
      alert("Failed to delete: " + error.message);
    }
    setDeletingId(null);
  }

  if (loading || !isAdmin) {
    return (
      <div className="page-center">
        <div className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }} />
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: 48, paddingBottom: 80 }}>
      <div className="section-header" style={{ marginBottom: 36 }}>
        <div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.2)",
              color: "#f87171",
              padding: "5px 14px",
              borderRadius: 100,
              fontSize: 13,
              fontWeight: 600,
              marginBottom: 12,
            }}
          >
            🛡️ Admin Panel
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.5px" }}>
            Global Listings Management
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 14, marginTop: 4 }}>
            You have full access to view and delete any PG listing on the platform.
          </p>
        </div>
      </div>

      {fetching ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
          <div className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }} />
        </div>
      ) : pgs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📂</div>
          <p>No PG listings exist on the platform yet.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {pgs.map((pg) => (
            <div
              key={pg.id}
              className="card"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "20px 24px",
                gap: 16,
                flexWrap: "wrap",
                borderLeft: "4px solid #f87171"
              }}
            >
              {/* Left info */}
              <div style={{ display: "flex", alignItems: "center", gap: 16, flex: 1, minWidth: 0 }}>
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: 16,
                      color: "var(--text-primary)",
                      marginBottom: 3,
                    }}
                  >
                    {pg.title}
                  </div>
                  <div style={{ fontSize: 13, color: "var(--text-secondary)", display: "flex", gap: 12, flexWrap: "wrap" }}>
                    <span>📍 {pg.location}</span>
                    <span>•</span>
                    <span>👤 Owner ID: {pg.owner_id?.substring(0, 8)}...</span>
                  </div>
                </div>
              </div>

              {/* Right actions */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
                <Link
                  href={`/pg/${pg.id}`}
                  className="btn btn-ghost btn-sm"
                >
                  👁️ View Details
                </Link>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => deleteListing(pg.id)}
                  disabled={deletingId === pg.id}
                >
                  {deletingId === pg.id ? <div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> : "Global Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
