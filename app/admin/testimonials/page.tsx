"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Plus, Edit, Trash2, Star } from "lucide-react";

interface Testimonial {
  id: string;
  property_id: string | null;
  tenant_name: string;
  content: string;
  rating: number;
  is_visible: boolean;
  display_order: number;
  properties: { name: string } | null;
}

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [properties, setProperties] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ property_id: "", tenant_name: "", content: "", rating: 5, is_visible: true, display_order: 0 });

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    setLoading(true);
    const [tRes, pRes] = await Promise.all([
      supabase.from("testimonials").select("*, properties(name)").order("display_order"),
      supabase.from("properties").select("id, name"),
    ]);
    setTestimonials((tRes.data ?? []) as Testimonial[]);
    setProperties(pRes.data ?? []);
    setLoading(false);
  }

  async function saveTestimonial(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    if (editId) {
      await supabase.from("testimonials").update(form).eq("id", editId);
    } else {
      await supabase.from("testimonials").insert(form);
    }
    setSaving(false);
    setShowForm(false);
    setEditId(null);
    setForm({ property_id: "", tenant_name: "", content: "", rating: 5, is_visible: true, display_order: 0 });
    fetchData();
  }

  async function deleteTestimonial(id: string) {
    if (!confirm("Delete this testimonial?")) return;
    await supabase.from("testimonials").delete().eq("id", id);
    setTestimonials((prev) => prev.filter((t) => t.id !== id));
  }

  async function toggleVisible(id: string, current: boolean) {
    await supabase.from("testimonials").update({ is_visible: !current }).eq("id", id);
    setTestimonials((prev) => prev.map((t) => t.id === id ? { ...t, is_visible: !current } : t));
  }

  function openEdit(t: Testimonial) {
    setForm({ property_id: t.property_id ?? "", tenant_name: t.tenant_name, content: t.content, rating: t.rating, is_visible: t.is_visible, display_order: t.display_order });
    setEditId(t.id);
    setShowForm(true);
  }

  if (loading) return <div className="admin-page-loading"><div className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} /></div>;

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Testimonials</h1>
          <p className="admin-page-subtitle">{testimonials.length} reviews</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => { setShowForm(true); setEditId(null); setForm({ property_id: "", tenant_name: "", content: "", rating: 5, is_visible: true, display_order: 0 }); }}>
          <Plus size={16} /> Add Testimonial
        </button>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginBottom: 20, fontSize: 20, fontWeight: 700 }}>{editId ? "Edit" : "Add"} Testimonial</h2>
            <form onSubmit={saveTestimonial} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Property</label>
                <select className="form-input" value={form.property_id} onChange={(e) => setForm((p) => ({ ...p, property_id: e.target.value }))}>
                  <option value="">General (no specific property)</option>
                  {properties.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Tenant Name *</label>
                <input className="form-input" value={form.tenant_name} onChange={(e) => setForm((p) => ({ ...p, tenant_name: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Review *</label>
                <textarea className="form-input" rows={3} value={form.content} onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))} required style={{ resize: "vertical" }} />
              </div>
              <div className="form-group">
                <label className="form-label">Rating (1–5)</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {[1,2,3,4,5].map((n) => (
                    <button key={n} type="button" onClick={() => setForm((p) => ({ ...p, rating: n }))}
                      style={{ fontSize: 24, background: "none", border: "none", cursor: "pointer", opacity: n <= form.rating ? 1 : 0.3 }}>
                      ⭐
                    </button>
                  ))}
                </div>
              </div>
              <label className="publish-checkbox-label">
                <input type="checkbox" checked={form.is_visible} onChange={(e) => setForm((p) => ({ ...p, is_visible: e.target.checked }))} />
                <span>Show on public page</span>
              </label>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? <div className="spinner" /> : "Save"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {testimonials.length === 0 ? (
          <div className="empty-state"><div className="empty-icon"><Star size={48} /></div><p>No testimonials yet.</p></div>
        ) : (
          testimonials.map((t) => (
            <div key={t.id} className="card testimonial-row" style={{ opacity: t.is_visible ? 1 : 0.5 }}>
              <div style={{ display: "flex", gap: 4, marginBottom: 6 }}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} style={{ fontSize: 14, opacity: i < t.rating ? 1 : 0.2 }}>⭐</span>
                ))}
              </div>
              <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 8 }}>"{t.content}"</p>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{t.tenant_name}</span>
                  {t.properties?.name && <span style={{ fontSize: 12, color: "var(--text-muted)", marginLeft: 8 }}>@ {t.properties.name}</span>}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => toggleVisible(t.id, t.is_visible)} title={t.is_visible ? "Hide" : "Show"}>
                    {t.is_visible ? "👁️" : "🙈"}
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={() => openEdit(t)}><Edit size={13} /></button>
                  <button className="btn btn-danger btn-sm" onClick={() => deleteTestimonial(t.id)}><Trash2 size={13} /></button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
