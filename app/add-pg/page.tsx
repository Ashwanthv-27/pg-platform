"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/lib/authContext";

const GENDER_OPTIONS = ["Any", "Male Only", "Female Only"];
const FURNISHING_OPTIONS = ["Furnished", "Semi-Furnished", "Unfurnished"];
const AMENITY_OPTIONS = ["WiFi", "AC", "Meals Included", "Laundry", "Power Backup", "Parking", "Geyser"];

export default function AddPGPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    title: "",
    location: "",
    price: "",
    contact_number: "",
    gender: "Any",
    furnishing: "Furnished",
    description: "",
    map_url: "",
  });
  
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Auth guard
  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="page-center">
        <div className="spinner" style={{ width: 36, height: 36, borderWidth: 3 }} />
      </div>
    );
  }

  if (!user) return null;

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev => 
      prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const photoUrls: string[] = [];

      // Upload photos
      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('pg_photos')
          .upload(filePath, file);

        if (uploadError) {
          throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('pg_photos')
          .getPublicUrl(filePath);

        photoUrls.push(publicUrl);
      }

      const { error: insertError } = await supabase.from("pg_listings").insert([
        {
          title: form.title,
          location: form.location,
          price: Number(form.price),
          contact_number: form.contact_number,
          gender: form.gender,
          furnishing: form.furnishing,
          description: form.description,
          owner_id: user.id,
          map_url: form.map_url,
          amenities: selectedAmenities,
          photos: photoUrls,
        },
      ]);

      if (insertError) {
        throw insertError;
      }
      
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Failed to add listing");
    }

    setSubmitting(false);
  };

  if (success) {
    return (
      <div className="page-center">
        <div className="form-card" style={{ textAlign: "center", maxWidth: 420 }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
          <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 10 }}>PG Listed!</h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: 28 }}>
            Your PG has been added successfully and is now visible to everyone.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button
              className="btn btn-ghost"
              onClick={() => { setSuccess(false); setForm({ title: "", location: "", price: "", contact_number: "", gender: "Any", furnishing: "Furnished", description: "", map_url: "" }); setSelectedAmenities([]); setFiles([]); }}
            >
              Add Another
            </button>
            <Link href="/my-listings" className="btn btn-primary">
              View My Listings →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-center" style={{ alignItems: "flex-start", paddingTop: 48 }}>
      <div className="form-card" style={{ maxWidth: 560, width: "100%" }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
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
              marginBottom: 16,
            }}
          >
            ＋ New Listing
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.5px", marginBottom: 6 }}>
            List Your PG
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
            Fill in the details below. It&apos;s free and takes under a minute.
          </p>
        </div>

        {error && <div className="alert alert-error">⚠️ {error}</div>}

        <form onSubmit={handleSubmit} id="add-pg-form">
          {/* Title */}
          <div className="form-group">
            <label htmlFor="pg-title" className="form-label">PG Name / Title *</label>
            <input
              id="pg-title"
              className="form-input"
              placeholder="e.g. Sunrise PG for Gents"
              value={form.title}
              onChange={set("title")}
              required
            />
          </div>

          {/* Location */}
          <div className="form-group">
            <label htmlFor="pg-location" className="form-label">Location / Area *</label>
            <input
              id="pg-location"
              className="form-input"
              placeholder="e.g. Koramangala, Bangalore"
              value={form.location}
              onChange={set("location")}
              required
            />
          </div>

          {/* Price + Contact */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div className="form-group">
              <label htmlFor="pg-price" className="form-label">Monthly Rent (₹) *</label>
              <input
                id="pg-price"
                type="number"
                className="form-input"
                placeholder="e.g. 8000"
                value={form.price}
                onChange={set("price")}
                required
                min={0}
              />
            </div>
            <div className="form-group">
              <label htmlFor="pg-contact" className="form-label">WhatsApp Number *</label>
              <input
                id="pg-contact"
                type="tel"
                className="form-input"
                placeholder="10-digit mobile"
                value={form.contact_number}
                onChange={set("contact_number")}
                required
                pattern="[0-9]{10}"
                maxLength={10}
              />
            </div>
          </div>

          {/* Gender + Furnishing */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div className="form-group">
              <label htmlFor="pg-gender" className="form-label">Suitable For</label>
              <select
                id="pg-gender"
                className="form-input"
                value={form.gender}
                onChange={set("gender")}
                style={{ cursor: "pointer" }}
              >
                {GENDER_OPTIONS.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="pg-furnishing" className="form-label">Furnishing</label>
              <select
                id="pg-furnishing"
                className="form-input"
                value={form.furnishing}
                onChange={set("furnishing")}
                style={{ cursor: "pointer" }}
              >
                {FURNISHING_OPTIONS.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="form-group">
            <label htmlFor="pg-description" className="form-label">Description (optional)</label>
            <textarea
              id="pg-description"
              className="form-input"
              placeholder="Mention amenities, food, Wi-Fi, parking, etc."
              value={form.description}
              onChange={set("description")}
              rows={3}
              style={{ resize: "vertical", fontFamily: "inherit" }}
            />
          </div>

          {/* Map URL */}
          <div className="form-group">
            <label htmlFor="pg-map" className="form-label">Google Map Embed/Share URL (optional)</label>
            <input
              id="pg-map"
              className="form-input"
              placeholder="https://maps.app.goo.gl/..."
              value={form.map_url}
              onChange={set("map_url")}
            />
          </div>

          {/* Amenities */}
          <div className="form-group">
            <label className="form-label">Amenities</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {AMENITY_OPTIONS.map((amenity) => (
                <label key={amenity} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", color: "var(--text-primary)" }}>
                  <input
                    type="checkbox"
                    checked={selectedAmenities.includes(amenity)}
                    onChange={() => toggleAmenity(amenity)}
                    style={{ width: 16, height: 16, accentColor: "var(--brand-primary)" }}
                  />
                  {amenity}
                </label>
              ))}
            </div>
          </div>

          {/* Photos */}
          <div className="form-group">
            <label htmlFor="pg-photos" className="form-label">Upload Photos</label>
            <input
              id="pg-photos"
              type="file"
              className="form-input"
              multiple
              accept="image/*"
              onChange={handleFileChange}
            />
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>You can select multiple images.</p>
          </div>

          <button
            id="add-pg-submit"
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
            style={{ width: "100%", padding: "13px 0", fontSize: 15, marginTop: 4 }}
          >
            {submitting ? <div className="spinner" /> : "Publish Listing →"}
          </button>
        </form>
      </div>
    </div>
  );
}