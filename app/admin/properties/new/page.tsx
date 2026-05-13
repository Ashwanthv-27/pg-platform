"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { ArrowLeft, Plus, X } from "lucide-react";

const AMENITY_OPTIONS = [
  "WiFi", "CCTV", "Parking", "Water 24/7", "Power Backup", "Security Guard",
  "Lift/Elevator", "Garden", "Common Area", "Laundry", "Mess/Canteen",
  "Gym", "Intercom", "Fire Safety", "Gated Community"
];

export default function NewPropertyPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    slug: "",
    type: "apartment",
    address: "",
    tagline: "",
    description: "",
    google_maps_url: "",
    google_maps_embed_url: "",
    whatsapp_number: "",
    is_published: false,
  });

  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [rules, setRules] = useState<string[]>([]);
  const [newRule, setNewRule] = useState("");

  const update = (key: string, val: string | boolean) => {
    setForm((prev) => ({
      ...prev,
      [key]: val,
      ...(key === "name" && !form.slug ? { slug: val.toString().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") } : {}),
    }));
  };

  const toggleAmenity = (a: string) => {
    setSelectedAmenities((prev) => prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]);
  };

  const addRule = () => {
    if (newRule.trim()) {
      setRules((prev) => [...prev, newRule.trim()]);
      setNewRule("");
    }
  };

  const removeRule = (i: number) => setRules((prev) => prev.filter((_, idx) => idx !== i));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim() || !form.slug.trim()) {
      setError("Name and slug are required.");
      return;
    }
    setSaving(true);

    const { error: err } = await supabase.from("properties").insert({
      ...form,
      amenities: selectedAmenities,
      rules,
    });

    setSaving(false);
    if (err) { setError(err.message); return; }
    router.push("/admin/properties");
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/admin/properties" className="btn btn-ghost btn-sm"><ArrowLeft size={16} /></Link>
          <div>
            <h1 className="admin-page-title">Add Property</h1>
            <p className="admin-page-subtitle">Create a new property listing</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="admin-form-grid">
        {error && <div className="alert alert-error" style={{ gridColumn: "1/-1" }}>⚠️ {error}</div>}

        {/* Basic Info */}
        <div className="form-section" style={{ gridColumn: "1/-1" }}>
          <h2 className="form-section-title">Basic Information</h2>
        </div>

        <div className="form-group">
          <label className="form-label">Property Name *</label>
          <input className="form-input" value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Nakshathra Apartments" required />
        </div>

        <div className="form-group">
          <label className="form-label">URL Slug *</label>
          <input className="form-input" value={form.slug} onChange={(e) => update("slug", e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""))} placeholder="nakshathra-apartments" required />
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>Public URL: /properties/{form.slug || "..."}</p>
        </div>

        <div className="form-group">
          <label className="form-label">Type</label>
          <select className="form-input" value={form.type} onChange={(e) => update("type", e.target.value)}>
            <option value="apartment">Apartment</option>
            <option value="house_pg">House PG</option>
            <option value="mixed">Mixed (PG + Flats)</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">WhatsApp Number</label>
          <input className="form-input" value={form.whatsapp_number} onChange={(e) => update("whatsapp_number", e.target.value)} placeholder="919876543210 (with country code)" />
        </div>

        <div className="form-group" style={{ gridColumn: "1/-1" }}>
          <label className="form-label">Address</label>
          <input className="form-input" value={form.address} onChange={(e) => update("address", e.target.value)} placeholder="Full address" />
        </div>

        <div className="form-group" style={{ gridColumn: "1/-1" }}>
          <label className="form-label">Tagline</label>
          <input className="form-input" value={form.tagline} onChange={(e) => update("tagline", e.target.value)} placeholder="Your home away from home" />
        </div>

        <div className="form-group" style={{ gridColumn: "1/-1" }}>
          <label className="form-label">Description</label>
          <textarea className="form-input" rows={4} value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="Describe your property..." style={{ resize: "vertical" }} />
        </div>

        {/* Maps */}
        <div className="form-section" style={{ gridColumn: "1/-1" }}>
          <h2 className="form-section-title">Location</h2>
        </div>

        <div className="form-group" style={{ gridColumn: "1/-1" }}>
          <label className="form-label">Google Maps URL</label>
          <input className="form-input" value={form.google_maps_url} onChange={(e) => update("google_maps_url", e.target.value)} placeholder="https://maps.google.com/..." />
        </div>

        <div className="form-group" style={{ gridColumn: "1/-1" }}>
          <label className="form-label">Google Maps Embed URL</label>
          <input className="form-input" value={form.google_maps_embed_url} onChange={(e) => update("google_maps_embed_url", e.target.value)} placeholder="https://www.google.com/maps/embed?..." />
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>In Google Maps → Share → Embed a map → copy the src URL from the iframe</p>
        </div>

        {/* Amenities */}
        <div className="form-section" style={{ gridColumn: "1/-1" }}>
          <h2 className="form-section-title">Property Amenities</h2>
        </div>

        <div style={{ gridColumn: "1/-1" }}>
          <div className="amenity-grid">
            {AMENITY_OPTIONS.map((a) => (
              <button
                key={a}
                type="button"
                className={`amenity-chip ${selectedAmenities.includes(a) ? "selected" : ""}`}
                onClick={() => toggleAmenity(a)}
              >
                {selectedAmenities.includes(a) ? "✓ " : ""}{a}
              </button>
            ))}
          </div>
        </div>

        {/* Rules */}
        <div className="form-section" style={{ gridColumn: "1/-1" }}>
          <h2 className="form-section-title">House Rules</h2>
        </div>

        <div style={{ gridColumn: "1/-1" }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <input className="form-input" value={newRule} onChange={(e) => setNewRule(e.target.value)} placeholder="e.g. No smoking inside" onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addRule())} style={{ flex: 1 }} />
            <button type="button" className="btn btn-ghost btn-sm" onClick={addRule}><Plus size={16} /></button>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {rules.map((rule, i) => (
              <div key={i} className="rule-tag">
                {rule}
                <button type="button" onClick={() => removeRule(i)} style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", padding: 0, display: "flex" }}>
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Publish */}
        <div style={{ gridColumn: "1/-1" }}>
          <label className="publish-checkbox-label">
            <input type="checkbox" checked={form.is_published} onChange={(e) => update("is_published", e.target.checked)} />
            <span>Publish immediately (visible on public page)</span>
          </label>
        </div>

        {/* Actions */}
        <div style={{ gridColumn: "1/-1", display: "flex", gap: 12, justifyContent: "flex-end", paddingTop: 8 }}>
          <Link href="/admin/properties" className="btn btn-ghost">Cancel</Link>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? <div className="spinner" /> : "Save Property"}
          </button>
        </div>
      </form>
    </div>
  );
}
