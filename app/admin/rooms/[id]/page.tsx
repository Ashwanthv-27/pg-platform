"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { ArrowLeft, Trash2, Plus, X } from "lucide-react";

const ROOM_AMENITIES = [
  "AC", "Attached Bath", "Balcony", "WiFi", "TV", "Wardrobe",
  "Study Table", "Bed & Mattress", "Geyser", "Window", "Fan", "Power Backup"
];

export default function EditRoomPage() {
  const { id } = useParams<{ id: string }>();
  const isNew = id === "new";
  const router = useRouter();

  const [properties, setProperties] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    property_id: "", room_number: "", label: "", type: "pg_room",
    floor: 0, capacity: 1, current_occupants: 0,
    rent_amount: "", deposit_amount: "", status: "vacant",
    available_from: "", notes: "", is_visible: true, display_order: 0,
  });
  const [amenities, setAmenities] = useState<string[]>([]);

  useEffect(() => {
    supabase.from("properties").select("id, name").then(({ data }) => setProperties(data ?? []));
    if (!isNew) fetchRoom();
  }, [id]);

  async function fetchRoom() {
    const { data } = await supabase.from("rooms").select("*").eq("id", id).single();
    if (data) {
      setForm({
        property_id: data.property_id ?? "",
        room_number: data.room_number ?? "",
        label: data.label ?? "",
        type: data.type ?? "pg_room",
        floor: data.floor ?? 0,
        capacity: data.capacity ?? 1,
        current_occupants: data.current_occupants ?? 0,
        rent_amount: data.rent_amount?.toString() ?? "",
        deposit_amount: data.deposit_amount?.toString() ?? "",
        status: data.status ?? "vacant",
        available_from: data.available_from ?? "",
        notes: data.notes ?? "",
        is_visible: data.is_visible ?? true,
        display_order: data.display_order ?? 0,
      });
      setAmenities(data.amenities ?? []);
    }
    setLoading(false);
  }

  const update = (key: string, val: string | boolean | number) => setForm((p) => ({ ...p, [key]: val }));
  const toggleAmenity = (a: string) => setAmenities((p) => p.includes(a) ? p.filter((x) => x !== a) : [...p, a]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (!form.property_id) { setError("Please select a property."); return; }
    setSaving(true);

    const payload = {
      ...form,
      rent_amount: form.rent_amount ? Number(form.rent_amount) : null,
      deposit_amount: form.deposit_amount ? Number(form.deposit_amount) : null,
      available_from: form.available_from || null,
      amenities,
    };

    const { error: err } = isNew
      ? await supabase.from("rooms").insert(payload)
      : await supabase.from("rooms").update(payload).eq("id", id);

    setSaving(false);
    if (err) { setError(err.message); } else {
      if (isNew) router.push("/admin/rooms");
      else setSuccess("Room saved!");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this room?")) return;
    setDeleting(true);
    await supabase.from("rooms").delete().eq("id", id);
    router.push("/admin/rooms");
  };

  if (loading) return <div className="admin-page-loading"><div className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} /></div>;

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/admin/rooms" className="btn btn-ghost btn-sm"><ArrowLeft size={16} /></Link>
          <div>
            <h1 className="admin-page-title">{isNew ? "Add Room" : "Edit Room"}</h1>
            <p className="admin-page-subtitle">{isNew ? "Create a new room/unit" : form.label || form.room_number || "Room"}</p>
          </div>
        </div>
        {!isNew && (
          <button onClick={handleDelete} className="btn btn-danger btn-sm" disabled={deleting}>
            <Trash2 size={14} /> Delete
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="admin-form-grid">
        {error && <div className="alert alert-error" style={{ gridColumn: "1/-1" }}>⚠️ {error}</div>}
        {success && <div className="alert alert-success" style={{ gridColumn: "1/-1" }}>✅ {success}</div>}

        <div className="form-section" style={{ gridColumn: "1/-1" }}><h2 className="form-section-title">Room Details</h2></div>

        <div className="form-group">
          <label className="form-label">Property *</label>
          <select className="form-input" value={form.property_id} onChange={(e) => update("property_id", e.target.value)} required>
            <option value="">Select property...</option>
            {properties.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Room Number</label>
          <input className="form-input" value={form.room_number} onChange={(e) => update("room_number", e.target.value)} placeholder="101, A2, Room 3..." />
        </div>

        <div className="form-group">
          <label className="form-label">Label / Name</label>
          <input className="form-input" value={form.label} onChange={(e) => update("label", e.target.value)} placeholder="Studio Flat, Triple Sharing..." />
        </div>

        <div className="form-group">
          <label className="form-label">Type</label>
          <select className="form-input" value={form.type} onChange={(e) => update("type", e.target.value)}>
            <option value="pg_bed">PG Bed (shared room)</option>
            <option value="pg_room">PG Room (private room)</option>
            <option value="studio">Studio</option>
            <option value="1bhk">1 BHK</option>
            <option value="2bhk">2 BHK</option>
            <option value="3bhk">3 BHK</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Floor</label>
          <input className="form-input" type="number" min={0} value={form.floor} onChange={(e) => update("floor", Number(e.target.value))} />
        </div>

        <div className="form-group">
          <label className="form-label">Capacity (max occupants)</label>
          <input className="form-input" type="number" min={1} value={form.capacity} onChange={(e) => update("capacity", Number(e.target.value))} />
        </div>

        <div className="form-group">
          <label className="form-label">Current Occupants</label>
          <input className="form-input" type="number" min={0} value={form.current_occupants} onChange={(e) => update("current_occupants", Number(e.target.value))} />
        </div>

        <div className="form-group">
          <label className="form-label">Status</label>
          <select className="form-input" value={form.status} onChange={(e) => update("status", e.target.value)}>
            <option value="vacant">Vacant</option>
            <option value="occupied">Occupied</option>
            <option value="notice_period">Notice Period</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Available From</label>
          <input className="form-input" type="date" value={form.available_from} onChange={(e) => update("available_from", e.target.value)} />
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>For notice period rooms — when it'll be free</p>
        </div>

        <div className="form-section" style={{ gridColumn: "1/-1" }}><h2 className="form-section-title">Pricing</h2></div>

        <div className="form-group">
          <label className="form-label">Rent (₹/month)</label>
          <input className="form-input" type="number" min={0} value={form.rent_amount} onChange={(e) => update("rent_amount", e.target.value)} placeholder="8000" />
        </div>

        <div className="form-group">
          <label className="form-label">Deposit (₹)</label>
          <input className="form-input" type="number" min={0} value={form.deposit_amount} onChange={(e) => update("deposit_amount", e.target.value)} placeholder="16000" />
        </div>

        <div className="form-section" style={{ gridColumn: "1/-1" }}><h2 className="form-section-title">Amenities</h2></div>

        <div style={{ gridColumn: "1/-1" }}>
          <div className="amenity-grid">
            {ROOM_AMENITIES.map((a) => (
              <button key={a} type="button" className={`amenity-chip ${amenities.includes(a) ? "selected" : ""}`} onClick={() => toggleAmenity(a)}>
                {amenities.includes(a) ? "✓ " : ""}{a}
              </button>
            ))}
          </div>
        </div>

        <div className="form-section" style={{ gridColumn: "1/-1" }}><h2 className="form-section-title">Admin Notes</h2></div>

        <div className="form-group" style={{ gridColumn: "1/-1" }}>
          <textarea className="form-input" rows={3} value={form.notes} onChange={(e) => update("notes", e.target.value)} placeholder="Internal notes (not shown on public page)" style={{ resize: "vertical" }} />
        </div>

        <div style={{ gridColumn: "1/-1", display: "flex", gap: 24 }}>
          <label className="publish-checkbox-label">
            <input type="checkbox" checked={form.is_visible} onChange={(e) => update("is_visible", e.target.checked)} />
            <span>Show on public page</span>
          </label>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <label className="form-label" style={{ marginBottom: 0 }}>Display Order</label>
            <input className="form-input" type="number" value={form.display_order} onChange={(e) => update("display_order", Number(e.target.value))} style={{ width: 80 }} />
          </div>
        </div>

        <div style={{ gridColumn: "1/-1", display: "flex", gap: 12, justifyContent: "flex-end", paddingTop: 8 }}>
          <Link href="/admin/rooms" className="btn btn-ghost">Cancel</Link>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? <div className="spinner" /> : isNew ? "Add Room" : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
