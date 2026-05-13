"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { Plus, Edit, UserCheck, UserX, Phone } from "lucide-react";

interface Tenant {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  move_in_date: string | null;
  move_out_date: string | null;
  id_proof_type: string | null;
  emergency_contact: string | null;
  is_active: boolean;
  room_id: string | null;
  rooms: { room_number: string | null; label: string | null; properties: { name: string } | { name: string }[] | null } | null;
}

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInactive, setShowInactive] = useState(false);
  const [modalTenant, setModalTenant] = useState<Tenant | null>(null);
  const [rooms, setRooms] = useState<{ id: string; room_number: string | null; label: string | null; property_name: string }[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", room_id: "", move_in_date: "", id_proof_type: "", emergency_contact: "", notes: "" });
  const [formError, setFormError] = useState("");

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    setLoading(true);
    const [tenantsRes, roomsRes] = await Promise.all([
      supabase.from("tenants").select("*, rooms(room_number, label, properties(name))").order("created_at", { ascending: false }),
      supabase.from("rooms").select("id, room_number, label, properties(name)").in("status", ["occupied", "vacant", "notice_period"]),
    ]);
    setTenants((tenantsRes.data ?? []) as Tenant[]);
    const roomData = roomsRes.data ?? [];
    setRooms(roomData.map((r: { id: string; room_number: string | null; label: string | null; properties: { name: string } | { name: string }[] | null }) => ({
      id: r.id,
      room_number: r.room_number,
      label: r.label,
      property_name: Array.isArray(r.properties) ? r.properties[0]?.name : r.properties?.name ?? "",
    })));
    setLoading(false);
  }

  async function moveOut(id: string) {
    if (!confirm("Mark this tenant as moved out?")) return;
    await supabase.from("tenants").update({ is_active: false, move_out_date: new Date().toISOString().slice(0, 10) }).eq("id", id);
    setTenants((prev) => prev.map((t) => t.id === id ? { ...t, is_active: false, move_out_date: new Date().toISOString().slice(0, 10) } : t));
  }

  async function addTenant(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    if (!form.name.trim() || !form.phone.trim()) { setFormError("Name and phone are required."); return; }
    setSaving(true);
    const { error } = await supabase.from("tenants").insert({ ...form, is_active: true });
    setSaving(false);
    if (error) { setFormError(error.message); return; }
    setShowAddForm(false);
    setForm({ name: "", phone: "", email: "", room_id: "", move_in_date: "", id_proof_type: "", emergency_contact: "", notes: "" });
    fetchData();
  }

  const displayed = tenants.filter((t) => showInactive ? true : t.is_active);

  if (loading) return <div className="admin-page-loading"><div className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} /></div>;

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Tenants</h1>
          <p className="admin-page-subtitle">{tenants.filter((t) => t.is_active).length} active · {tenants.filter((t) => !t.is_active).length} past</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <label className="publish-checkbox-label">
            <input type="checkbox" checked={showInactive} onChange={(e) => setShowInactive(e.target.checked)} />
            <span style={{ fontSize: 13 }}>Show past tenants</span>
          </label>
          <button className="btn btn-primary btn-sm" onClick={() => setShowAddForm(true)}>
            <Plus size={16} /> Add Tenant
          </button>
        </div>
      </div>

      {/* Add Tenant Modal */}
      {showAddForm && (
        <div className="modal-overlay" onClick={() => setShowAddForm(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginBottom: 24, fontSize: 20, fontWeight: 700 }}>Add Tenant</h2>
            {formError && <div className="alert alert-error">⚠️ {formError}</div>}
            <form onSubmit={addTenant} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Name *</label>
                <input className="form-input" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Phone *</label>
                <input className="form-input" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Room</label>
                <select className="form-input" value={form.room_id} onChange={(e) => setForm((p) => ({ ...p, room_id: e.target.value }))}>
                  <option value="">No room assigned</option>
                  {rooms.map((r) => <option key={r.id} value={r.id}>{r.property_name} — {r.room_number ?? r.label ?? r.id.slice(0, 6)}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Move-in Date</label>
                <input className="form-input" type="date" value={form.move_in_date} onChange={(e) => setForm((p) => ({ ...p, move_in_date: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">ID Proof Type</label>
                <select className="form-input" value={form.id_proof_type} onChange={(e) => setForm((p) => ({ ...p, id_proof_type: e.target.value }))}>
                  <option value="">Select...</option>
                  <option value="aadhaar">Aadhaar</option>
                  <option value="passport">Passport</option>
                  <option value="driving_license">Driving License</option>
                  <option value="voter_id">Voter ID</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Emergency Contact</label>
                <input className="form-input" value={form.emergency_contact} onChange={(e) => setForm((p) => ({ ...p, emergency_contact: e.target.value }))} placeholder="Name & phone" />
              </div>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowAddForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? <div className="spinner" /> : "Add Tenant"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {displayed.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">👥</div>
          <p>No tenants found.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {displayed.map((t) => (
            <div key={t.id} className="card tenant-row" style={{ opacity: t.is_active ? 1 : 0.6 }}>
              <div className="tenant-avatar">{t.name.charAt(0).toUpperCase()}</div>
              <div className="tenant-info">
                <div className="tenant-name">{t.name}</div>
                <div className="tenant-meta">
                  {t.phone && <span>📞 {t.phone}</span>}
                  {t.rooms && <span>🚪 {Array.isArray(t.rooms.properties) ? t.rooms.properties[0]?.name : t.rooms.properties?.name} — {t.rooms.room_number ?? t.rooms.label ?? "Room"}</span>}
                  {t.move_in_date && <span>📅 Moved in {new Date(t.move_in_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                {t.is_active ? (
                  <>
                    <span className="badge-active">Active</span>
                    {t.phone && (
                      <a href={`tel:${t.phone}`} className="btn btn-ghost btn-sm" title="Call"><Phone size={14} /></a>
                    )}
                    <button className="btn btn-ghost btn-sm" onClick={() => moveOut(t.id)} title="Move out">
                      <UserX size={14} />
                    </button>
                  </>
                ) : (
                  <span className="badge-inactive">Moved out {t.move_out_date ? new Date(t.move_out_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : ""}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
