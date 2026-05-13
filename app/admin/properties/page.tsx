"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { Plus, Edit, Eye, EyeOff, MoreVertical, Building2 } from "lucide-react";

interface Property {
  id: string;
  name: string;
  slug: string;
  type: string;
  address: string | null;
  tagline: string | null;
  is_published: boolean;
  display_order: number;
  created_at: string;
  room_count?: number;
  vacant_count?: number;
}

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);

  useEffect(() => { fetchProperties(); }, []);

  async function fetchProperties() {
    setLoading(true);
    const { data: props } = await supabase
      .from("properties")
      .select("*")
      .order("display_order", { ascending: true });

    if (!props) { setLoading(false); return; }

    // Count rooms per property
    const { data: rooms } = await supabase
      .from("rooms")
      .select("property_id, status")
      .eq("is_visible", true);

    const enriched = props.map((p) => {
      const propRooms = rooms?.filter((r) => r.property_id === p.id) ?? [];
      return {
        ...p,
        room_count: propRooms.length,
        vacant_count: propRooms.filter((r) => r.status === "vacant").length,
      };
    });

    setProperties(enriched as Property[]);
    setLoading(false);
  }

  async function togglePublish(id: string, current: boolean) {
    setToggling(id);
    await supabase.from("properties").update({ is_published: !current }).eq("id", id);
    setProperties((prev) => prev.map((p) => p.id === id ? { ...p, is_published: !current } : p));
    setToggling(null);
  }

  const typeLabel: Record<string, string> = {
    apartment: "Apartment",
    house_pg: "House PG",
    mixed: "Mixed",
  };

  if (loading) {
    return <div className="admin-page-loading"><div className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} /></div>;
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Properties</h1>
          <p className="admin-page-subtitle">{properties.length} {properties.length === 1 ? "property" : "properties"} managed</p>
        </div>
        <Link href="/admin/properties/new" className="btn btn-primary btn-sm">
          <Plus size={16} /> Add Property
        </Link>
      </div>

      {properties.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><Building2 size={56} /></div>
          <p>No properties yet.</p>
          <Link href="/admin/properties/new" className="btn btn-primary">+ Add Your First Property</Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {properties.map((p) => (
            <div key={p.id} className="card property-row">
              <div className="property-row-left">
                <div className="property-type-badge">{typeLabel[p.type] ?? p.type}</div>
                <div>
                  <div className="property-row-name">{p.name}</div>
                  {p.tagline && <div className="property-row-tagline">{p.tagline}</div>}
                  {p.address && <div className="property-row-address">📍 {p.address}</div>}
                </div>
              </div>

              <div className="property-row-stats">
                <div className="prop-stat">
                  <span className="prop-stat-value">{p.room_count}</span>
                  <span className="prop-stat-label">Rooms</span>
                </div>
                <div className="prop-stat">
                  <span className="prop-stat-value" style={{ color: "#22c55e" }}>{p.vacant_count}</span>
                  <span className="prop-stat-label">Vacant</span>
                </div>
              </div>

              <div className="property-row-actions">
                <button
                  className={`publish-toggle ${p.is_published ? "published" : ""}`}
                  onClick={() => togglePublish(p.id, p.is_published)}
                  disabled={toggling === p.id}
                  title={p.is_published ? "Unpublish" : "Publish"}
                >
                  {toggling === p.id ? (
                    <div className="spinner" style={{ width: 14, height: 14, borderWidth: 2, borderTopColor: "currentColor" }} />
                  ) : p.is_published ? (
                    <><Eye size={14} /> Published</>
                  ) : (
                    <><EyeOff size={14} /> Draft</>
                  )}
                </button>
                <Link href={`/admin/properties/${p.id}`} className="btn btn-ghost btn-sm">
                  <Edit size={14} /> Edit
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
