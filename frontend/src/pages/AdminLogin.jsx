import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { Loader2, Lock, Activity } from "lucide-react";
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
      className="min-h-screen bg-[#bebebe] flex items-center justify-center px-6 relative overflow-hidden"
      data-testid="admin-login"
    >
      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.07] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      {/* Sliver of accent */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-[#CCFF00] to-transparent" />

      <form
        onSubmit={submit}
        className="relative w-full max-w-md bg-white border border-[#9a9a9a] shadow-[0_8px_40px_rgba(0,0,0,0.18)]"
      >
        {/* Telemetry header */}
        <div className="border-b border-[#9a9a9a] px-7 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-[#CCFF00] animate-pulse shadow-[0_0_8px_#CCFF00]" />
            <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-black">
              SYSTEM ONLINE
            </span>
          </div>
          <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-[#5a5a64]">
            v1.0
          </div>
        </div>

        <div className="px-7 py-8">
          <div className="flex items-center gap-3 mb-7">
            <div className="w-11 h-11 border border-black flex items-center justify-center bg-[#CCFF00]">
              <Lock size={16} className="text-black" />
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-[#5a5a64]">
                / CONTROL ROOM
              </div>
              <h1 className="font-display text-2xl md:text-3xl font-black uppercase tracking-tight text-black leading-none mt-1">
                Authenticate
              </h1>
            </div>
          </div>

          <label className="block font-mono text-[10px] uppercase tracking-[0.3em] text-[#5a5a64] mb-2">
            Operator ID
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@brivomarketing.com"
            className="w-full bg-[#ececec] border border-[#9a9a9a] px-4 py-3 mb-4 font-mono text-sm focus:outline-none focus:border-black focus:bg-white text-black transition-colors"
            data-testid="admin-login-email"
          />

          <label className="block font-mono text-[10px] uppercase tracking-[0.3em] text-[#5a5a64] mb-2">
            Access Key
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full bg-[#ececec] border border-[#9a9a9a] px-4 py-3 mb-6 font-mono text-sm focus:outline-none focus:border-black focus:bg-white text-black transition-colors"
            data-testid="admin-login-password"
          />

          {err && (
            <div
              className="mb-4 text-sm text-[#8B0000] border border-[#8B0000]/40 bg-[#8B0000]/[0.06] px-3 py-2 font-mono"
              data-testid="admin-login-error"
            >
              {err}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 bg-black text-[#CCFF00] font-mono text-sm uppercase tracking-[0.25em] font-bold py-4 hover:bg-[#1a1a22] transition-colors disabled:opacity-60"
            data-testid="admin-login-submit"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Activity size={14} />}
            {loading ? "Authenticating" : "Engage"}
          </button>

          <p className="mt-6 font-mono text-[9px] uppercase tracking-[0.3em] text-[#5a5a64] text-center">
            Authorised operators only · Brivo OS v1
          </p>
        </div>
      </form>
    </div>
  );
}
