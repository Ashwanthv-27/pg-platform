"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/lib/authContext";
import { MapPin, Phone, IndianRupee, Home, Wifi, Users, Snowflake, Coffee, CheckCircle2 } from "lucide-react";

type PG = {
  id: string;
  title: string;
  location: string;
  price: number;
  contact_number: string;
  gender: string;
  furnishing: string;
  description: string;
  photos: string[];
  amenities: string[];
  map_url: string;
};

type Review = {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  user_id: string;
};

export default function PGDetailsPage() {
  const { id } = useParams();
  const { user } = useAuth();
  
  const [pg, setPg] = useState<PG | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Review Form state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (id) {
      fetchPGDetails();
      fetchReviews();
    }
  }, [id]);

  async function fetchPGDetails() {
    const { data, error } = await supabase
      .from("pg_listings")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      setError(error.message);
    } else {
      setPg(data as PG);
    }
    setLoading(false);
  }

  async function fetchReviews() {
    const { data, error } = await supabase
      .from("pg_reviews")
      .select("*")
      .eq("pg_id", id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setReviews(data as Review[]);
    }
  }

  async function submitReview(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      alert("You must be logged in to leave a review.");
      return;
    }

    setSubmittingReview(true);
    const { data, error } = await supabase.from("pg_reviews").insert([
      { pg_id: id, user_id: user.id, rating, comment }
    ]).select();

    if (error) {
      alert("Failed to submit review: " + error.message);
    } else if (data) {
      setReviews([data[0] as Review, ...reviews]);
      setComment("");
      setRating(5);
    }
    setSubmittingReview(false);
  }

  if (loading) {
    return (
      <div className="page-center">
        <div className="spinner" style={{ width: 40, height: 40, borderWidth: 3 }} />
      </div>
    );
  }

  if (error || !pg) {
    return (
      <div className="page-center">
        <div className="alert alert-error">⚠️ {error || "PG not found"}</div>
      </div>
    );
  }

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : "No ratings";

  return (
    <div className="container" style={{ paddingTop: 40, paddingBottom: 80 }}>
      {/* Header Info */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 36, fontWeight: 800, marginBottom: 8, color: "var(--text-primary)" }}>{pg.title}</h1>
        <div style={{ display: "flex", gap: 16, color: "var(--text-secondary)", flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}><MapPin size={18} /> {pg.location}</span>
          <span style={{ display: "flex", alignItems: "center", gap: 6, color: "#eab308", fontWeight: 600 }}>⭐ {averageRating} ({reviews.length} reviews)</span>
        </div>
      </div>

      {/* Main Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 32, alignItems: "start" }}>
        
        {/* Left Column: Details */}
        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          
          {/* Photo Gallery (simple for now) */}
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            {pg.photos && pg.photos.length > 0 ? (
               <img src={pg.photos[0]} alt={pg.title} style={{ width: "100%", height: 400, objectFit: "cover" }} />
            ) : (
              <div style={{ width: "100%", height: 400, background: "var(--bg-input)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 64 }}>
                🏠
              </div>
            )}
            {pg.photos && pg.photos.length > 1 && (
              <div style={{ display: "flex", padding: 12, gap: 12, overflowX: "auto", borderTop: "1px solid var(--border-default)" }}>
                {pg.photos.map((url, idx) => (
                  <img key={idx} src={url} alt={`Photo ${idx}`} style={{ width: 100, height: 75, objectFit: "cover", borderRadius: 8, border: "1px solid var(--border-default)" }} />
                ))}
              </div>
            )}
          </div>

          {/* About */}
          <div className="card" style={{ padding: 32 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>About this PG</h2>
            <p style={{ color: "var(--text-secondary)", whiteSpace: "pre-line", lineHeight: 1.8 }}>
              {pg.description || "No description provided."}
            </p>
          </div>

          {/* Amenities */}
          <div className="card" style={{ padding: 32 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>Amenities</h2>
            {pg.amenities && pg.amenities.length > 0 ? (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {pg.amenities.map((item) => (
                  <div key={item} style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--text-primary)" }}>
                    <CheckCircle2 size={18} color="var(--brand-primary)" /> {item}
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: "var(--text-muted)" }}>Amenities not specified.</p>
            )}
          </div>

          {/* Location Map */}
          {pg.map_url && (
            <div className="card" style={{ padding: 32 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>Location</h2>
              <iframe
                src={pg.map_url}
                width="100%"
                height="300"
                style={{ border: 0, borderRadius: 12 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          )}

          {/* Reviews Section */}
          <div className="card" style={{ padding: 32 }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>Reviews</h2>
            
            {user ? (
              <form onSubmit={submitReview} style={{ marginBottom: 32, paddingBottom: 32, borderBottom: "1px solid var(--border-default)" }}>
                <h3 style={{ fontSize: 16, marginBottom: 12 }}>Leave a Review</h3>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", marginBottom: 8, fontSize: 14, color: "var(--text-secondary)" }}>Rating (1-5)</label>
                  <input type="number" min="1" max="5" value={rating} onChange={(e) => setRating(Number(e.target.value))} className="form-input" style={{ width: 100 }} required />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", marginBottom: 8, fontSize: 14, color: "var(--text-secondary)" }}>Comment</label>
                  <textarea value={comment} onChange={(e) => setComment(e.target.value)} className="form-input" rows={3} required placeholder="Share your experience..." />
                </div>
                <button type="submit" className="btn btn-primary" disabled={submittingReview}>
                  {submittingReview ? "Submitting..." : "Submit Review"}
                </button>
              </form>
            ) : (
              <div style={{ padding: 16, background: "var(--bg-input)", borderRadius: 8, marginBottom: 32, textAlign: "center" }}>
                <p style={{ color: "var(--text-secondary)", marginBottom: 12 }}>Please log in to leave a review.</p>
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {reviews.length === 0 ? (
                <p style={{ color: "var(--text-muted)" }}>No reviews yet. Be the first!</p>
              ) : (
                reviews.map(review => (
                  <div key={review.id} style={{ background: "rgba(0,0,0,0.02)", padding: 16, borderRadius: 12, border: "1px solid var(--border-default)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                      <span style={{ fontWeight: 600 }}>{'⭐'.repeat(review.rating)}</span>
                      <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{new Date(review.created_at).toLocaleDateString()}</span>
                    </div>
                    <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>{review.comment}</p>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Right Column: Sticky Pricing Card */}
        <div style={{ position: "sticky", top: 88 }}>
          <div className="card" style={{ padding: 32 }}>
            <div style={{ fontSize: 32, fontWeight: 800, color: "var(--brand-primary)", marginBottom: 8 }}>
              ₹{pg.price.toLocaleString()}<span style={{ fontSize: 16, color: "var(--text-muted)", fontWeight: 400 }}>/mo</span>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 16, margin: "24px 0", paddingTop: 24, borderTop: "1px solid var(--border-default)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, color: "var(--text-secondary)" }}>
                <Users size={20} /> <span>{pg.gender}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, color: "var(--text-secondary)" }}>
                <Home size={20} /> <span>{pg.furnishing}</span>
              </div>
            </div>

            <a
              href={`https://wa.me/91${pg.contact_number}?text=Hi! I found your PG "${pg.title}" on PG Finder and I'm interested.`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-whatsapp"
              style={{ width: "100%", padding: "16px 0", fontSize: 16 }}
            >
              <Phone size={20} /> Contact Owner on WhatsApp
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
