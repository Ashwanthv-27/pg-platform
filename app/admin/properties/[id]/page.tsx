"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { ArrowLeft, Plus, X, Trash2 } from "lucide-react";

const AMENITY_OPTIONS = [
  "WiFi", "CCTV", "Parking", "Water 24/7", "Power Backup", "Security Guard",
  "Lift/Elevator", "Garden", "Common Area", "Laundry", "Mess/Canteen",
  "Gym", "Intercom", "Fire Safety", "Gated Community"
];

export default function EditPropertyPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    name: "", slug: "", type: "apartment", address: "", tagline: "",
    description: "", google_maps_url: "", google_maps_embed_url: "",
    whatsapp_number: "", is_published: false, display_order: 0,
  });
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [rules, setRules] = useState<string[]>([]);
  const [newRule, setNewRule] = useState("");

  useEffect(() => { fetchProperty(); }, [id]);

  async function fetchProperty() {
    const { data } = await supabase.from("properties").select("*").eq("id", id).single();
    if (data) {
      setForm({
        name: data.name ?? "", slug: data.slug ?? "", type: data.type ?? "apartment",
        address: data.address ?? "", tagline: data.tagline ?? "",
        description: data.description ?? "", google_maps_url: data.google_maps_url ?? "",
        google_maps_embed_url: data.google_maps_embed_url ?? "",
        whatsapp_number: data.whatsapp_number ?? "",
        is_published: data.is_published ?? false,
        display_order: data.display_order ?? 0,
      });
      setSelectedAmenities(data.amenities ?? []);
      setRules(data.rules ?? []);
    }
    setLoading(false);
  }

  const update = (key: string, val: string | boolean | number) => setForm((prev) => ({ ...prev, [key]: val }));
  const toggleAmenity = (a: string) => setSelectedAmenities((prev) => prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]);
  const addRule = () => { if (newRule.trim()) { setRules((prev) => [...prev, newRule.trim()]); setNewRule(""); } };
  const removeRule = (i: number) => setRules((prev) => prev.filter((_, idx) => idx !== i));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setSuccess("");
    setSaving(true);
    const { error: err } = await supabase.from("properties").update({ ...form, amenities: selectedAmenities, rules }).eq("id", id);
    setSaving(false);
    if (err) { setError(err.message); } else { setSuccess("Property saved!"); }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this property? All rooms and data will be removed.")) return;
    setDeleting(true);
    await supabase.from("properties").delete().eq("id", id);
    router.push("/admin/properties");
  };

  if (loading) return <div className="admin-page-loading"><div className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} /></div>;

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/admin/properties" className="btn btn-ghost btn-sm"><ArrowLeft size={16} /></Link>
          <div>
            <h1 className="admin-page-title">Edit Property</h1>
            <p className="admin-page-subtitle">{form.name}</p>
          </div>
        </div>
        <button onClick={handleDelete} className="btn btn-danger btn-sm" disabled={deleting}>
          <Trash2 size={14} /> {deleting ? "Deleting..." : "Delete Property"}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="admin-form-grid">
        {error && <div className="alert alert-error" style={{ gridColumn: "1/-1" }}>⚠️ {error}</div>}
        {success && <div className="alert alert-success" style={{ gridColumn: "1/-1" }}>✅ {success}</div>}

        <div className="form-section" style={{ gridColumn: "1/-1" }}><h2 className="form-section-title">Basic Information</h2></div>

        <div className="form-group">
          <label className="form-label">Property Name *</label>
          <input className="form-input" value={form.name} onChange={(e) => update("name", e.target.value)} required />
        </div>

        <div className="form-group">
          <label className="form-label">URL Slug *</label>
          <input className="form-input" value={form.slug} onChange={(e) => update("slug", e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""))} required />
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>Public URL: /properties/{form.slug}</p>
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
          <input className="form-input" value={form.whatsapp_number} onChange={(e) => update("whatsapp_number", e.target.value)} placeholder="919876543210" />
        </div>

        <div className="form-group" style={{ gridColumn: "1/-1" }}>
          <label className="form-label">Address</label>
          <input className="form-input" value={form.address} onChange={(e) => update("address", e.target.value)} />
        </div>

        <div className="form-group" style={{ gridColumn: "1/-1" }}>
          <label className="form-label">Tagline</label>
          <input className="form-input" value={form.tagline} onChange={(e) => update("tagline", e.target.value)} />
        </div>

        <div className="form-group" style={{ gridColumn: "1/-1" }}>
          <label className="form-label">Description</label>
          <textarea className="form-input" rows={4} value={form.description} onChange={(e) => update("description", e.target.value)} style={{ resize: "vertical" }} />
        </div>

        <div className="form-section" style={{ gridColumn: "1/-1" }}><h2 className="form-section-title">Location</h2></div>

        <div className="form-group" style={{ gridColumn: "1/-1" }}>
          <label className="form-label">Google Maps URL</label>
          <input className="form-input" value={form.google_maps_url} onChange={(e) => update("google_maps_url", e.target.value)} />
        </div>

        <div className="form-group" style={{ gridColumn: "1/-1" }}>
          <label className="form-label">Google Maps Embed URL</label>
          <input className="form-input" value={form.google_maps_embed_url} onChange={(e) => update("google_maps_embed_url", e.target.value)} />
        </div>

        <div className="form-section" style={{ gridColumn: "1/-1" }}><h2 className="form-section-title">Amenities</h2></div>

        <div style={{ gridColumn: "1/-1" }}>
          <div className="amenity-grid">
            {AMENITY_OPTIONS.map((a) => (
              <button key={a} type="button" className={`amenity-chip ${selectedAmenities.includes(a) ? "selected" : ""}`} onClick={() => toggleAmenity(a)}>
                {selectedAmenities.includes(a) ? "✓ " : ""}{a}
              </button>
            ))}
          </div>
        </div>

        <div className="form-section" style={{ gridColumn: "1/-1" }}><h2 className="form-section-title">House Rules</h2></div>

        <div style={{ gridColumn: "1/-1" }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <input className="form-input" value={newRule} onChange={(e) => setNewRule(e.target.value)} placeholder="Add a rule..." onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addRule())} style={{ flex: 1 }} />
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

        <div style={{ gridColumn: "1/-1", display: "flex", alignItems: "center", gap: 16 }}>
          <label className="publish-checkbox-label">
            <input type="checkbox" checked={form.is_published} onChange={(e) => update("is_published", e.target.checked)} />
            <span>Published (visible on public page)</span>
          </label>
          <div className="form-group" style={{ marginBottom: 0, display: "flex", alignItems: "center", gap: 8 }}>
            <label className="form-label" style={{ marginBottom: 0 }}>Display Order</label>
            <input className="form-input" type="number" value={form.display_order} onChange={(e) => update("display_order", Number(e.target.value))} style={{ width: 80 }} />
          </div>
        </div>

        <div style={{ gridColumn: "1/-1", display: "flex", gap: 12, justifyContent: "flex-end", paddingTop: 8 }}>
          <Link href="/admin/properties" className="btn btn-ghost">Cancel</Link>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? <div className="spinner" /> : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
