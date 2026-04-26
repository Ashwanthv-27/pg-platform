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
};

export default function MyListingsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [pgs, setPgs] = useState<PG[]>([]);
  const [fetching, setFetching] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Auth guard
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) fetchMyListings();
  }, [user]);

  async function fetchMyListings() {
    setFetching(true);
    const { data, error } = await supabase
      .from("pg_listings")
      .select("*")
      .eq("owner_id", user!.id)
      .order("id", { ascending: false });

    if (!error && data) setPgs(data as PG[]);
    setFetching(false);
  }

  async function deleteListing(id: string) {
    if (!confirm("Are you sure you want to delete this listing?")) return;
    setDeletingId(id);
    const { error } = await supabase.from("pg_listings").delete().eq("id", id);
    if (!error) {
      setPgs((prev) => prev.filter((p) => p.id !== id));
    } else {
      alert("Failed to delete: " + error.message);
    }
    setDeletingId(null);
  }

  if (loading || (!user && !loading)) {
    return (
      <div className="page-center">
        <div className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }} />
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: 48, paddingBottom: 80 }}>
      {/* Header */}
      <div className="section-header" style={{ marginBottom: 36 }}>
        <div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(20,184,166,0.12)",
              border: "1px solid rgba(20,184,166,0.25)",
              color: "var(--brand-light)",
              padding: "5px 14px",
              borderRadius: 100,
              fontSize: 13,
              fontWeight: 600,
              marginBottom: 12,
            }}
          >
            📋 My Dashboard
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.5px" }}>
            My Listings
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 14, marginTop: 4 }}>
            Manage all PGs posted under your account
          </p>
        </div>
        <Link href="/add-pg" className="btn btn-primary">
          ＋ Add New PG
        </Link>
      </div>

      {fetching ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "60px 0" }}>
          <div className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }} />
        </div>
      ) : pgs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🏘️</div>
          <p>You haven&apos;t listed any PGs yet.</p>
          <Link href="/add-pg" className="btn btn-primary">
            List Your First PG
          </Link>
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
              }}
            >
              {/* Left info */}
              <div style={{ display: "flex", alignItems: "center", gap: 16, flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: 12,
                    background: "linear-gradient(135deg, #1e293b, #0f172a)",
                    border: "1px solid var(--border-default)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 24,
                    flexShrink: 0,
                  }}
                >
                  🏠
                </div>
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: 16,
                      color: "var(--text-primary)",
                      marginBottom: 3,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {pg.title}
                  </div>
                  <div style={{ fontSize: 13, color: "var(--text-secondary)", display: "flex", gap: 12 }}>
                    <span>📍 {pg.location}</span>
                    <span>•</span>
                    <span>📞 {pg.contact_number}</span>
                  </div>
                </div>
              </div>

              {/* Right actions */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
                <span className="price-badge" style={{ fontSize: 14 }}>
                  ₹{pg.price.toLocaleString()}/mo
                </span>
                <a
                  href={`https://wa.me/91${pg.contact_number}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-ghost btn-sm"
                >
                  💬 Preview
                </a>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => deleteListing(pg.id)}
                  disabled={deletingId === pg.id}
                  id={`delete-${pg.id}`}
                >
                  {deletingId === pg.id ? <div className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> : "🗑 Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
