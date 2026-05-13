"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { UserPlus, Mail, Shield, UserX } from "lucide-react";

interface AdminProfile {
  id: string;
  name: string;
  phone: string | null;
  role: string;
  is_active: boolean;
  created_at: string;
  email?: string;
}

export default function TeamPage() {
  const [admins, setAdmins] = useState<AdminProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviting, setInviting] = useState(false);
  const [inviteMsg, setInviteMsg] = useState("");

  useEffect(() => { fetchTeam(); }, []);

  async function fetchTeam() {
    setLoading(true);
    const { data } = await supabase.from("admin_profiles").select("*").order("created_at");
    setAdmins((data ?? []) as AdminProfile[]);
    setLoading(false);
  }

  async function toggleActive(id: string, current: boolean) {
    await supabase.from("admin_profiles").update({ is_active: !current }).eq("id", id);
    setAdmins((prev) => prev.map((a) => a.id === id ? { ...a, is_active: !current } : a));
  }

  async function sendInvite(e: React.FormEvent) {
    e.preventDefault();
    setInviteMsg("");
    setInviting(true);
    // Use Supabase admin to invite — this sends a magic link email
    const { error } = await supabase.auth.signInWithOtp({ email: inviteEmail });
    setInviting(false);
    if (error) {
      setInviteMsg("Error: " + error.message);
    } else {
      setInviteMsg(`✅ Magic link sent to ${inviteEmail}. They'll need you to add their profile after first login.`);
      setInviteEmail(""); setInviteName("");
    }
  }

  if (loading) return <div className="admin-page-loading"><div className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} /></div>;

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Team</h1>
          <p className="admin-page-subtitle">{admins.filter((a) => a.is_active).length} active admins</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowInvite(!showInvite)}>
          <UserPlus size={16} /> Invite Admin
        </button>
      </div>

      {/* Invite form */}
      {showInvite && (
        <div className="card admin-card" style={{ marginBottom: 24 }}>
          <div className="admin-card-header"><h2 className="admin-card-title">Invite a New Admin</h2></div>
          <div className="admin-card-body">
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 16 }}>
              We'll send a magic login link to their email. After they log in, add their profile below.
            </p>
            {inviteMsg && <div className={`alert ${inviteMsg.startsWith("✅") ? "alert-success" : "alert-error"}`}>{inviteMsg}</div>}
            <form onSubmit={sendInvite} style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <input className="form-input" type="email" placeholder="admin@email.com" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} required style={{ flex: 2, minWidth: 200 }} />
              <button type="submit" className="btn btn-primary" disabled={inviting}>
                {inviting ? <div className="spinner" /> : <><Mail size={14} /> Send Invite</>}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Admin list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {admins.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><Shield size={48} /></div>
            <p>No admin profiles found.</p>
          </div>
        ) : (
          admins.map((admin) => (
            <div key={admin.id} className="card tenant-row" style={{ opacity: admin.is_active ? 1 : 0.55 }}>
              <div className="tenant-avatar" style={{ background: admin.is_active ? "linear-gradient(135deg, #14b8a6, #0d9488)" : "rgba(148,163,184,0.2)" }}>
                {admin.name.charAt(0).toUpperCase()}
              </div>
              <div className="tenant-info">
                <div className="tenant-name" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {admin.name}
                  <span style={{ fontSize: 11, background: "rgba(20,184,166,0.12)", color: "#14b8a6", padding: "2px 8px", borderRadius: 100, fontWeight: 600 }}>
                    {admin.role}
                  </span>
                </div>
                <div className="tenant-meta">
                  {admin.phone && <span>📞 {admin.phone}</span>}
                  <span>👤 Joined {new Date(admin.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {admin.is_active ? (
                  <span className="badge-active">Active</span>
                ) : (
                  <span className="badge-inactive">Inactive</span>
                )}
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => toggleActive(admin.id, admin.is_active)}
                  title={admin.is_active ? "Deactivate" : "Reactivate"}
                >
                  <UserX size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
