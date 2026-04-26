"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

type PG = {
  id: string;
  title: string;
  location: string;
  price: number;
  contact_number: string;
};

const LOCATION_EMOJIS: Record<string, string> = {
  mumbai: "🌆", delhi: "🏛️", bangalore: "🌳", hyderabad: "🕌",
  pune: "🏙️", chennai: "⛵", kolkata: "🌺", default: "📍",
};

function getEmoji(location: string) {
  const key = location.toLowerCase();
  for (const city in LOCATION_EMOJIS) {
    if (key.includes(city)) return LOCATION_EMOJIS[city];
  }
  return LOCATION_EMOJIS.default;
}

function SkeletonCard() {
  return (
    <div className="card" style={{ padding: 0 }}>
      <div className="skeleton" style={{ height: 180 }} />
      <div style={{ padding: "18px 20px" }}>
        <div className="skeleton" style={{ height: 20, marginBottom: 10, borderRadius: 6 }} />
        <div className="skeleton" style={{ height: 14, width: "60%", marginBottom: 20, borderRadius: 6 }} />
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div className="skeleton" style={{ height: 28, width: 80, borderRadius: 100 }} />
          <div className="skeleton" style={{ height: 32, width: 110, borderRadius: 8 }} />
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [pgs, setPgs] = useState<PG[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPGs();
  }, []);

  async function fetchPGs() {
    setLoading(true);
    const { data, error } = await supabase
      .from("pg_listings")
      .select("*")
      .order("id", { ascending: false });

    if (!error && data) setPgs(data as PG[]);
    setLoading(false);
  }

  return (
    <>
      {/* Hero */}
      <section className="hero container">
        <div className="hero-eyebrow">
          <span>✨</span> Verified Listings, Zero Brokerage
        </div>
        <h1 className="hero-title">
          Find Your Perfect <br />
          <span className="gradient-text">PG &amp; Hostel</span>
        </h1>
        <p className="hero-subtitle">
          Browse hundreds of paying guest accommodations. Connect directly with
          owners via WhatsApp — no middlemen, no hidden fees.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <a href="#listings" className="btn btn-primary btn-lg">
            Browse Listings
          </a>
          <Link href="/login" className="btn btn-ghost btn-lg">
            List Your PG
          </Link>
        </div>
      </section>

      {/* Listings */}
      <section id="listings" style={{ paddingBottom: 80 }}>
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Available PGs</h2>
            {!loading && (
              <span className="section-count">{pgs.length} listings</span>
            )}
          </div>

          {loading ? (
            <div className="pg-grid">
              {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : pgs.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🏘️</div>
              <p>No PG listings yet. Be the first to add one!</p>
              <Link href="/add-pg" className="btn btn-primary">
                Add PG Listing
              </Link>
            </div>
          ) : (
            <div className="pg-grid">
              {pgs.map((pg) => (
                <div key={pg.id} className="card">
                  {/* Card image placeholder */}
                  <div
                    className="card-image"
                    style={{
                      background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
                      fontSize: 52,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    🏠
                  </div>
                  <div className="card-body">
                    <div className="card-title">{pg.title}</div>
                    <div className="card-location">
                      <span>{getEmoji(pg.location)}</span>
                      {pg.location}
                    </div>
                    <div className="card-footer">
                      <span className="price-badge">₹{pg.price.toLocaleString()}/mo</span>
                      <a
                        href={`https://wa.me/91${pg.contact_number}?text=Hi! I found your PG "${pg.title}" on PG Finder and I'm interested.`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-whatsapp btn-sm"
                      >
                        <span>💬</span> WhatsApp
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}