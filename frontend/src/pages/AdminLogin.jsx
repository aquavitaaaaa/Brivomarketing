import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { Loader2, Lock } from "lucide-react";
import { adminLogin } from "@/lib/api";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  if (typeof window !== "undefined" && localStorage.getItem("brivo_admin_token")) {
    return <Navigate to="/admin" replace />;
  }

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const { token } = await adminLogin(email, password);
      localStorage.setItem("brivo_admin_token", token);
      navigate("/admin");
    } catch (ex) {
      const d = ex?.response?.data?.detail;
      setErr(typeof d === "string" ? d : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-[#0B0B0F] flex items-center justify-center px-6 relative overflow-hidden"
      data-testid="admin-login"
    >
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-[#CCFF00]/[0.09] blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 -right-40 w-[600px] h-[600px] rounded-full bg-[#6F4FFF]/[0.14] blur-[120px] pointer-events-none" />

      <form
        onSubmit={submit}
        className="relative w-full max-w-md bg-[#13131C] border border-white/10 p-8 md:p-10"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full border border-[#CCFF00]/50 flex items-center justify-center text-[#CCFF00]">
            <Lock size={16} />
          </div>
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-[#CCFF00]">
              / Control Room
            </div>
            <h1 className="font-display text-2xl md:text-3xl font-black uppercase tracking-tight">
              Admin login
            </h1>
          </div>
        </div>

        <label className="block font-mono text-[10px] uppercase tracking-[0.25em] text-white/55 mb-2">
          Email
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@brivomarketing.com"
          className="w-full bg-black border border-white/15 px-4 py-3 mb-4 font-mono text-sm focus:outline-none focus:border-[#CCFF00] text-white"
          data-testid="admin-login-email"
        />

        <label className="block font-mono text-[10px] uppercase tracking-[0.25em] text-white/55 mb-2">
          Password
        </label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="w-full bg-black border border-white/15 px-4 py-3 mb-6 font-mono text-sm focus:outline-none focus:border-[#CCFF00] text-white"
          data-testid="admin-login-password"
        />

        {err && (
          <div
            className="mb-4 text-sm text-red-400 border border-red-400/30 bg-red-400/10 px-3 py-2"
            data-testid="admin-login-error"
          >
            {err}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full inline-flex items-center justify-center gap-2 bg-[#CCFF00] text-black font-mono text-sm uppercase tracking-[0.2em] font-bold py-4 accent-glow disabled:opacity-60"
          data-testid="admin-login-submit"
        >
          {loading ? <Loader2 size={14} className="animate-spin" /> : null}
          {loading ? "Authenticating" : "Enter the control room"}
        </button>

        <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.2em] text-white/35 text-center">
          For authorised operators only.
        </p>
      </form>
    </div>
  );
}
