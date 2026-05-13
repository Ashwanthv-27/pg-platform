"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Lock, Mail, Eye, EyeOff } from "lucide-react";

import { Suspense } from "react";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"password" | "magic">("password");
  const [magicSent, setMagicSent] = useState(false);

  const redirectTo = searchParams.get("redirect") ?? "/admin";
  const urlError = searchParams.get("error");

  useEffect(() => {
    if (urlError === "unauthorized") {
      setError("Your account doesn't have admin access. Contact the super admin.");
    }
  }, [urlError]);

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (err) { setError(err.message); return; }
    router.push(redirectTo);
    router.refresh();
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error: err } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: `${window.location.origin}/admin` } });
    setLoading(false);
    if (err) { setError(err.message); return; }
    setMagicSent(true);
  };

  return (
    <div className="login-page">
      <div className="login-bg-orbs">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
      </div>

      <div className="login-card">
        {/* Brand */}
        <div className="login-brand">
          <div className="login-brand-icon">🏡</div>
          <div>
            <h1 className="login-brand-name">Nakshathra</h1>
            <p className="login-brand-sub">Property Management</p>
          </div>
        </div>

        <h2 className="login-title">Admin Access</h2>
        <p className="login-subtitle">Sign in to manage your properties</p>

        {/* Mode toggle */}
        <div className="login-mode-toggle">
          <button className={`mode-btn ${mode === "password" ? "active" : ""}`} onClick={() => setMode("password")}>Password</button>
          <button className={`mode-btn ${mode === "magic" ? "active" : ""}`} onClick={() => setMode("magic")}>Magic Link</button>
        </div>

        {error && <div className="alert alert-error">⚠️ {error}</div>}

        {magicSent ? (
          <div className="alert alert-success" style={{ textAlign: "center" }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>📬</div>
            <strong>Check your email!</strong>
            <p style={{ marginTop: 4, fontSize: 13 }}>We sent a magic link to <strong>{email}</strong>. Click it to sign in.</p>
          </div>
        ) : (
          <form onSubmit={mode === "password" ? handlePasswordLogin : handleMagicLink}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="input-icon-wrap relative">
                <Mail size={16} className="input-icon absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="login-email"
                  type="email"
                  className="form-input pl-10"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {mode === "password" && (
              <div className="form-group mt-4">
                <label className="form-label">Password</label>
                <div className="input-icon-wrap relative">
                  <Lock size={16} className="input-icon absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    className="form-input pl-10 pr-10"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                  <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            )}

            <button type="submit" id="login-submit" className="btn btn-cta" style={{ width: "100%", marginTop: 16, padding: "13px 0", fontSize: 15 }} disabled={loading}>
              {loading ? (
                <div className="spinner" />
              ) : mode === "password" ? (
                "Sign In →"
              ) : (
                "Send Magic Link →"
              )}
            </button>
          </form>
        )}

        <p style={{ textAlign: "center", marginTop: 24, fontSize: 13, color: "var(--text-muted)" }}>
          This is a private admin panel. Unauthorized access is prohibited.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
