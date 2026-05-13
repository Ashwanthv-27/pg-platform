"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { Building2, DoorOpen, Users, MessageSquare, TrendingUp, Plus, ArrowRight } from "lucide-react";

interface Stats {
  totalProperties: number;
  publishedProperties: number;
  totalRooms: number;
  vacantRooms: number;
  occupiedRooms: number;
  noticePeriod: number;
  maintenanceRooms: number;
  activeTenants: number;
  newLeads: number;
  totalLeads: number;
}

interface RecentLead {
  id: string;
  name: string;
  phone: string;
  room_type: string | null;
  source: string;
  status: string;
  created_at: string;
  properties: { name: string } | { name: string }[] | null;
}

interface PropertyOccupancy {
  id: string;
  name: string;
  type: string;
  total: number;
  occupied: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentLeads, setRecentLeads] = useState<RecentLead[]>([]);
  const [occupancy, setOccupancy] = useState<PropertyOccupancy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    setLoading(true);
    try {
      const [propertiesRes, roomsRes, tenantsRes, leadsRes] = await Promise.all([
        supabase.from("properties").select("id, name, type, is_published"),
        supabase.from("rooms").select("id, property_id, status"),
        supabase.from("tenants").select("id").eq("is_active", true),
        supabase.from("leads").select("id, name, phone, room_type, source, status, created_at, properties(name)").order("created_at", { ascending: false }).limit(5),
      ]);

      const properties = propertiesRes.data ?? [];
      const rooms = roomsRes.data ?? [];
      const tenants = tenantsRes.data ?? [];
      const leads = leadsRes.data ?? [];

      setStats({
        totalProperties: properties.length,
        publishedProperties: properties.filter((p) => p.is_published).length,
        totalRooms: rooms.length,
        vacantRooms: rooms.filter((r) => r.status === "vacant").length,
        occupiedRooms: rooms.filter((r) => r.status === "occupied").length,
        noticePeriod: rooms.filter((r) => r.status === "notice_period").length,
        maintenanceRooms: rooms.filter((r) => r.status === "maintenance").length,
        activeTenants: tenants.length,
        newLeads: leads.filter((l) => l.status === "new").length,
        totalLeads: leads.length,
      });

      setRecentLeads(leads as RecentLead[]);

      // Build occupancy per property
      const propOccupancy: PropertyOccupancy[] = properties.map((p) => {
        const propRooms = rooms.filter((r) => r.property_id === p.id);
        return {
          id: p.id,
          name: p.name,
          type: p.type,
          total: propRooms.length,
          occupied: propRooms.filter((r) => r.status === "occupied" || r.status === "notice_period").length,
        };
      });
      setOccupancy(propOccupancy);
    } finally {
      setLoading(false);
    }
  }

  const statusColor: Record<string, string> = {
    new: "#14b8a6",
    contacted: "#f59e0b",
    converted: "#22c55e",
    not_interested: "#ef4444",
  };

  const statusLabel: Record<string, string> = {
    new: "New",
    contacted: "Contacted",
    converted: "Converted",
    not_interested: "Not Interested",
  };

  if (loading) {
    return (
      <div className="admin-page-loading">
        <div className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
      </div>
    );
  }

  return (
    <div className="admin-page">
      {/* Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Dashboard</h1>
          <p className="admin-page-subtitle">Overview of your properties</p>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <Link href="/admin/properties/new" className="btn btn-primary btn-sm">
            <Plus size={16} /> Add Property
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "rgba(20,184,166,0.12)", color: "#14b8a6" }}>
            <Building2 size={22} />
          </div>
          <div>
            <div className="stat-value">{stats?.totalProperties ?? 0}</div>
            <div className="stat-label">Properties</div>
            <div className="stat-sub">{stats?.publishedProperties} published</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: "rgba(34,197,94,0.12)", color: "#22c55e" }}>
            <DoorOpen size={22} />
          </div>
          <div>
            <div className="stat-value">{stats?.vacantRooms ?? 0}</div>
            <div className="stat-label">Vacant Rooms</div>
            <div className="stat-sub">of {stats?.totalRooms} total</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: "rgba(99,102,241,0.12)", color: "#818cf8" }}>
            <Users size={22} />
          </div>
          <div>
            <div className="stat-value">{stats?.activeTenants ?? 0}</div>
            <div className="stat-label">Active Tenants</div>
            <div className="stat-sub">{stats?.occupiedRooms} occupied rooms</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: "rgba(245,158,11,0.12)", color: "#f59e0b" }}>
            <MessageSquare size={22} />
          </div>
          <div>
            <div className="stat-value">{stats?.newLeads ?? 0}</div>
            <div className="stat-label">New Leads</div>
            <div className="stat-sub">{stats?.totalLeads} total enquiries</div>
          </div>
        </div>
      </div>

      {/* Room Status Breakdown */}
      <div className="dashboard-row">
        {/* Occupancy by Property */}
        <div className="card admin-card" style={{ flex: 1 }}>
          <div className="admin-card-header">
            <h2 className="admin-card-title"><TrendingUp size={18} /> Occupancy</h2>
          </div>
          <div className="admin-card-body">
            {occupancy.length === 0 ? (
              <p style={{ color: "var(--text-muted)", fontSize: 14 }}>No properties yet. <Link href="/admin/properties/new" style={{ color: "var(--brand-primary)" }}>Add one →</Link></p>
            ) : (
              occupancy.map((p) => {
                const pct = p.total > 0 ? Math.round((p.occupied / p.total) * 100) : 0;
                return (
                  <div key={p.id} className="occupancy-row">
                    <div className="occupancy-info">
                      <span className="occupancy-name">{p.name}</span>
                      <span className="occupancy-count">{p.occupied}/{p.total} rooms</span>
                    </div>
                    <div className="occupancy-bar-wrap">
                      <div className="occupancy-bar" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="occupancy-pct">{pct}%</span>
                  </div>
                );
              })
            )}

            {/* Status chips */}
            <div className="room-status-chips">
              {[
                { label: "Vacant", count: stats?.vacantRooms ?? 0, color: "#22c55e" },
                { label: "Occupied", count: stats?.occupiedRooms ?? 0, color: "#14b8a6" },
                { label: "Notice", count: stats?.noticePeriod ?? 0, color: "#f59e0b" },
                { label: "Maintenance", count: stats?.maintenanceRooms ?? 0, color: "#ef4444" },
              ].map((s) => (
                <div key={s.label} className="status-chip" style={{ borderColor: `${s.color}40`, background: `${s.color}12` }}>
                  <span style={{ color: s.color, fontWeight: 700 }}>{s.count}</span>
                  <span style={{ color: "var(--text-muted)", fontSize: 12 }}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Leads */}
        <div className="card admin-card" style={{ flex: 1 }}>
          <div className="admin-card-header">
            <h2 className="admin-card-title"><MessageSquare size={18} /> Recent Leads</h2>
            <Link href="/admin/leads" className="admin-card-link">View all <ArrowRight size={14} /></Link>
          </div>
          <div className="admin-card-body">
            {recentLeads.length === 0 ? (
              <p style={{ color: "var(--text-muted)", fontSize: 14 }}>No leads yet.</p>
            ) : (
              recentLeads.map((lead) => (
                <div key={lead.id} className="lead-row">
                  <div className="lead-avatar">
                    {lead.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="lead-info">
                    <div className="lead-name">{lead.name}</div>
                    <div className="lead-meta">{lead.phone} · {Array.isArray(lead.properties) ? lead.properties[0]?.name : lead.properties?.name ?? "Any"}</div>
                  </div>
                  <span
                    className="lead-status-badge"
                    style={{ background: `${statusColor[lead.status]}20`, color: statusColor[lead.status], borderColor: `${statusColor[lead.status]}40` }}
                  >
                    {statusLabel[lead.status]}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
