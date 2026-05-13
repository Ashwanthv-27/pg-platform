"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { Plus, Edit, Filter } from "lucide-react";

interface Room {
  id: string;
  property_id: string;
  room_number: string | null;
  label: string | null;
  type: string;
  floor: number;
  capacity: number;
  current_occupants: number;
  rent_amount: number | null;
  deposit_amount: number | null;
  status: string;
  is_visible: boolean;
  available_from: string | null;
  amenities: string[];
  properties: { name: string } | null;
}

const STATUS_COLORS: Record<string, { bg: string; color: string; label: string }> = {
  vacant:        { bg: "rgba(34,197,94,0.12)",   color: "#22c55e", label: "Vacant" },
  occupied:      { bg: "rgba(20,184,166,0.12)",   color: "#14b8a6", label: "Occupied" },
  notice_period: { bg: "rgba(245,158,11,0.12)",  color: "#f59e0b", label: "Notice Period" },
  maintenance:   { bg: "rgba(239,68,68,0.12)",   color: "#ef4444", label: "Maintenance" },
};

const TYPE_LABELS: Record<string, string> = {
  pg_bed: "PG Bed", pg_room: "PG Room", studio: "Studio",
  "1bhk": "1 BHK", "2bhk": "2 BHK", "3bhk": "3 BHK",
};

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [properties, setProperties] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterProperty, setFilterProperty] = useState("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    setLoading(true);
    const [roomsRes, propsRes] = await Promise.all([
      supabase.from("rooms").select("*, properties(name)").order("display_order"),
      supabase.from("properties").select("id, name").order("display_order"),
    ]);
    setRooms((roomsRes.data ?? []) as Room[]);
    setProperties(propsRes.data ?? []);
    setLoading(false);
  }

  async function updateStatus(id: string, status: string) {
    setUpdatingId(id);
    await supabase.from("rooms").update({ status }).eq("id", id);
    setRooms((prev) => prev.map((r) => r.id === id ? { ...r, status } : r));
    setUpdatingId(null);
  }

  const filtered = rooms.filter((r) => {
    if (filterStatus !== "all" && r.status !== filterStatus) return false;
    if (filterProperty !== "all" && r.property_id !== filterProperty) return false;
    return true;
  });

  if (loading) return <div className="admin-page-loading"><div className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} /></div>;

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Rooms</h1>
          <p className="admin-page-subtitle">{filtered.length} of {rooms.length} rooms</p>
        </div>
        <Link href="/admin/rooms/new" className="btn btn-primary btn-sm">
          <Plus size={16} /> Add Room
        </Link>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <Filter size={16} style={{ color: "var(--text-muted)" }} />
        <select className="filter-select" value={filterProperty} onChange={(e) => setFilterProperty(e.target.value)}>
          <option value="all">All Properties</option>
          {properties.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <select className="filter-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="all">All Statuses</option>
          <option value="vacant">Vacant</option>
          <option value="occupied">Occupied</option>
          <option value="notice_period">Notice Period</option>
          <option value="maintenance">Maintenance</option>
        </select>

        {/* Status count chips */}
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          {Object.entries(STATUS_COLORS).map(([status, s]) => {
            const count = rooms.filter((r) => r.status === status && (filterProperty === "all" || r.property_id === filterProperty)).length;
            return (
              <button key={status} className="filter-chip" style={{ background: s.bg, color: s.color, border: `1px solid ${s.color}40` }} onClick={() => setFilterStatus(filterStatus === status ? "all" : status)}>
                {count} {s.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Room Grid */}
      <div className="rooms-grid">
        {filtered.length === 0 ? (
          <div className="empty-state" style={{ gridColumn: "1/-1" }}>
            <div className="empty-icon">🚪</div>
            <p>No rooms found.</p>
            <Link href="/admin/rooms/new" className="btn btn-primary">+ Add First Room</Link>
          </div>
        ) : (
          filtered.map((room) => {
            const s = STATUS_COLORS[room.status] ?? STATUS_COLORS.vacant;
            return (
              <div key={room.id} className="room-card card">
                <div className="room-card-header">
                  <div>
                    <div className="room-card-number">{room.room_number ?? "—"}</div>
                    <div className="room-card-label">{room.label ?? TYPE_LABELS[room.type] ?? room.type}</div>
                    <div className="room-card-property">{room.properties?.name ?? "—"}</div>
                  </div>
                  <span className="room-status-badge" style={{ background: s.bg, color: s.color }}>
                    {s.label}
                  </span>
                </div>

                <div className="room-card-meta">
                  {room.rent_amount && <span>₹{room.rent_amount.toLocaleString()}/mo</span>}
                  {room.capacity > 1 && <span>👥 {room.current_occupants}/{room.capacity}</span>}
                  {room.floor > 0 && <span>Floor {room.floor}</span>}
                </div>

                <div className="room-card-actions">
                  <select
                    className="status-select"
                    value={room.status}
                    onChange={(e) => updateStatus(room.id, e.target.value)}
                    disabled={updatingId === room.id}
                    style={{ borderColor: `${s.color}60` }}
                  >
                    <option value="vacant">Vacant</option>
                    <option value="occupied">Occupied</option>
                    <option value="notice_period">Notice Period</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                  <Link href={`/admin/rooms/${room.id}`} className="btn btn-ghost btn-sm">
                    <Edit size={14} />
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
