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
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-6 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 inset-x-0 h-screen overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-brand-200/40 blur-[120px]" />
        <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-200/30 blur-[100px]" />
      </div>

      <div className="w-full max-w-md glass-card p-10 relative z-10">
        {/* Brand */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-xl bg-brand-500 flex items-center justify-center text-white shadow-lg shadow-brand-500/20">
            <span className="text-2xl">🏡</span>
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Nakshathra</h1>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Property Management</p>
          </div>
        </div>

        <h2 className="text-xl font-bold text-slate-900 mb-1">Admin Access</h2>
        <p className="text-sm text-slate-500 font-medium mb-6">Sign in to manage your properties</p>

        {/* Mode toggle */}
        <div className="flex bg-slate-100/50 p-1 rounded-xl mb-6 border border-slate-200/50">
          <button 
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${mode === "password" ? "bg-white text-slate-900 shadow-sm border border-slate-200/50" : "text-slate-500 hover:text-slate-700"}`} 
            onClick={() => setMode("password")}
            type="button"
          >
            Password
          </button>
          <button 
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${mode === "magic" ? "bg-white text-slate-900 shadow-sm border border-slate-200/50" : "text-slate-500 hover:text-slate-700"}`} 
            onClick={() => setMode("magic")}
            type="button"
          >
            Magic Link
          </button>
        </div>

        {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-semibold border border-red-100 flex items-center gap-2">⚠️ {error}</div>}

        {magicSent ? (
          <div className="bg-brand-50 border border-brand-100 rounded-xl p-6 text-center">
            <div className="text-4xl mb-3">📬</div>
            <strong className="block text-brand-900 text-lg mb-1">Check your email!</strong>
            <p className="text-brand-700 text-sm font-medium">We sent a magic link to <strong className="font-bold">{email}</strong>. Click it to sign in.</p>
          </div>
        ) : (
          <form onSubmit={mode === "password" ? handlePasswordLogin : handleMagicLink} className="flex flex-col gap-5">
            <div>
              <label className="form-label">Email Address</label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  id="login-email"
                  type="email"
                  className="form-input pl-12"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {mode === "password" && (
              <div>
                <label className="form-label">Password</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    className="form-input pl-12 pr-12"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                  <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            )}

            <button type="submit" id="login-submit" className="btn btn-cta w-full py-3.5 text-[15px] mt-2 shadow-brand-500/20" disabled={loading}>
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : mode === "password" ? (
                "Sign In →"
              ) : (
                "Send Magic Link →"
              )}
            </button>
          </form>
        )}

        <p className="text-center mt-8 text-xs font-semibold text-slate-400">
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
