"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { MessageSquare, Phone, Calendar, ArrowRight } from "lucide-react";

interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  message: string | null;
  room_type: string | null;
  budget: number | null;
  source: string;
  status: string;
  admin_notes: string | null;
  created_at: string;
  properties: { name: string } | null;
}

const STATUSES = [
  { key: "new", label: "New", color: "#14b8a6" },
  { key: "contacted", label: "Contacted", color: "#f59e0b" },
  { key: "converted", label: "Converted", color: "#22c55e" },
  { key: "not_interested", label: "Not Interested", color: "#94a3b8" },
];

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [savingNote, setSavingNote] = useState<string | null>(null);
  const [noteValues, setNoteValues] = useState<Record<string, string>>({});
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  useEffect(() => { fetchLeads(); }, []);

  async function fetchLeads() {
    setLoading(true);
    const { data } = await supabase.from("leads").select("*, properties(name)").order("created_at", { ascending: false });
    const leadsData = (data ?? []) as Lead[];
    setLeads(leadsData);
    const notes: Record<string, string> = {};
    leadsData.forEach((l) => { notes[l.id] = l.admin_notes ?? ""; });
    setNoteValues(notes);
    setLoading(false);
  }

  async function updateStatus(id: string, status: string) {
    setUpdatingStatus(id);
    await supabase.from("leads").update({ status }).eq("id", id);
    setLeads((prev) => prev.map((l) => l.id === id ? { ...l, status } : l));
    setUpdatingStatus(null);
  }

  async function saveNote(id: string) {
    setSavingNote(id);
    await supabase.from("leads").update({ admin_notes: noteValues[id] }).eq("id", id);
    setSavingNote(null);
  }

  const grouped = STATUSES.map((s) => ({
    ...s,
    leads: leads.filter((l) => l.status === s.key),
  }));

  if (loading) return <div className="admin-page-loading"><div className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} /></div>;

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Leads</h1>
          <p className="admin-page-subtitle">{leads.length} total · {leads.filter((l) => l.status === "new").length} new</p>
        </div>
      </div>

      {/* Kanban board */}
      <div className="kanban-board">
        {grouped.map((col) => (
          <div key={col.key} className="kanban-col">
            <div className="kanban-col-header" style={{ borderTopColor: col.color }}>
              <span className="kanban-col-title" style={{ color: col.color }}>{col.label}</span>
              <span className="kanban-col-count" style={{ background: `${col.color}20`, color: col.color }}>{col.leads.length}</span>
            </div>

            <div className="kanban-cards">
              {col.leads.length === 0 && (
                <div style={{ color: "var(--text-muted)", fontSize: 13, textAlign: "center", padding: "20px 0" }}>No leads</div>
              )}
              {col.leads.map((lead) => (
                <div key={lead.id} className="kanban-card card">
                  <div className="kanban-card-header">
                    <div className="lead-kanban-avatar">{lead.name.charAt(0).toUpperCase()}</div>
                    <div>
                      <div className="lead-kanban-name">{lead.name}</div>
                      <div className="lead-kanban-time">
                        <Calendar size={11} /> {new Date(lead.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </div>
                    </div>
                    <button className="kanban-expand" onClick={() => setExpandedId(expandedId === lead.id ? null : lead.id)}>
                      <ArrowRight size={14} style={{ transform: expandedId === lead.id ? "rotate(90deg)" : "none", transition: "transform 0.2s" }} />
                    </button>
                  </div>

                  <div className="kanban-card-meta">
                    {lead.properties?.name && <span className="meta-chip">🏠 {lead.properties.name}</span>}
                    {lead.room_type && <span className="meta-chip">🚪 {lead.room_type}</span>}
                    {lead.source !== "website" && <span className="meta-chip">📍 {lead.source}</span>}
                  </div>

                  {expandedId === lead.id && (
                    <div className="kanban-card-expanded">
                      {lead.message && <p className="lead-message">"{lead.message}"</p>}
                      {lead.budget && <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>Budget: ₹{lead.budget.toLocaleString()}</p>}

                      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                        <a href={`tel:${lead.phone}`} className="btn btn-ghost btn-sm" style={{ flex: 1, justifyContent: "center" }}>
                          <Phone size={13} /> Call
                        </a>
                        <a href={`https://wa.me/${lead.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="btn btn-whatsapp btn-sm" style={{ flex: 1, justifyContent: "center" }}>
                          💬 WhatsApp
                        </a>
                      </div>

                      {/* Status changer */}
                      <div style={{ marginTop: 12 }}>
                        <label className="form-label" style={{ marginBottom: 6 }}>Move to</label>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          {STATUSES.filter((s) => s.key !== col.key).map((s) => (
                            <button
                              key={s.key}
                              className="btn btn-ghost btn-sm"
                              style={{ fontSize: 12, borderColor: `${s.color}40`, color: s.color }}
                              onClick={() => updateStatus(lead.id, s.key)}
                              disabled={updatingStatus === lead.id}
                            >
                              {s.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Admin notes */}
                      <div style={{ marginTop: 12 }}>
                        <label className="form-label" style={{ marginBottom: 6 }}>Notes</label>
                        <textarea
                          className="form-input"
                          rows={2}
                          value={noteValues[lead.id] ?? ""}
                          onChange={(e) => setNoteValues((p) => ({ ...p, [lead.id]: e.target.value }))}
                          placeholder="Add follow-up notes..."
                          style={{ resize: "none", fontSize: 13 }}
                        />
                        <button className="btn btn-ghost btn-sm" style={{ marginTop: 6, width: "100%" }} onClick={() => saveNote(lead.id)} disabled={savingNote === lead.id}>
                          {savingNote === lead.id ? "Saving..." : "Save Note"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
