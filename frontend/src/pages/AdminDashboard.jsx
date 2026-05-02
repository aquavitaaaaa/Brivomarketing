import { useEffect, useState } from "react";
import { useNavigate, Navigate, Link } from "react-router-dom";
import {
  LogOut, BarChart3, Inbox, PhoneCall, Radio, MessageSquare, Bot, Send, Target, Activity, Users,
} from "lucide-react";
import { adminMe } from "@/lib/api";
import AnalyticsTab from "@/components/admin/AnalyticsTab";
import LeadsTab from "@/components/admin/LeadsTab";
import CallsTab from "@/components/admin/CallsTab";
import OperatorTab from "@/components/admin/OperatorTab";
import MessagesTab from "@/components/admin/MessagesTab";
import AgentsTab from "@/components/admin/AgentsTab";

const TABS = [
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "messages", label: "Messages", icon: MessageSquare },
  { id: "leads", label: "Inbox", icon: Inbox },
  { id: "agents", label: "AI Agents", icon: Bot },
  { id: "calls", label: "Calls", icon: PhoneCall },
  { id: "operator", label: "Operator", icon: Radio },
];

function LiveClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-black">
      {now.toLocaleTimeString(undefined, { hour12: false })}
    </span>
  );
}

export default function AdminDashboard() {
  const [tab, setTab] = useState("analytics");
  const [admin, setAdmin] = useState(null);
  const [checked, setChecked] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    adminMe()
      .then((u) => setAdmin(u))
      .catch(() => {
        localStorage.removeItem("brivo_admin_token");
        setAdmin(null);
      })
      .finally(() => setChecked(true));
  }, []);

  if (checked && !admin) return <Navigate to="/admin/login" replace />;
  if (!checked) {
    return (
      <div className="min-h-screen bg-[#bebebe] flex items-center justify-center text-[#5a5a64] font-mono text-xs uppercase tracking-[0.3em]">
        BOOTING CONTROL ROOM…
      </div>
    );
  }

  const logout = () => {
    localStorage.removeItem("brivo_admin_token");
    navigate("/admin/login");
  };

  const Tab = TABS.find((t) => t.id === tab);
  const TabContent = {
    analytics: AnalyticsTab,
    messages: MessagesTab,
    leads: LeadsTab,
    agents: AgentsTab,
    calls: CallsTab,
    operator: OperatorTab,
  }[tab];

  return (
    <div
      className="min-h-screen bg-[#bebebe] text-black flex flex-col"
      data-testid="admin-dashboard"
    >
      {/* Telemetry strip */}
      <div className="bg-black text-white px-6 md:px-10 py-2 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#CCFF00] animate-pulse shadow-[0_0_8px_#CCFF00]" />
            <span className="font-mono text-[9px] uppercase tracking-[0.32em] text-[#CCFF00]">
              AI ONLINE
            </span>
          </div>
          <span className="hidden md:inline font-mono text-[9px] uppercase tracking-[0.32em] text-white/45">
            BRIVO OS · v1.0
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden md:inline font-mono text-[9px] uppercase tracking-[0.32em] text-white/45">
            {admin?.email}
          </span>
          <span className="font-mono text-[9px] uppercase tracking-[0.32em] text-[#CCFF00]">
            {new Date().toLocaleTimeString(undefined, { hour12: false })}
          </span>
        </div>
      </div>

      {/* Top bar */}
      <header className="sticky top-0 z-20 border-b border-[#9a9a9a] bg-[#d6d6d6]/95 backdrop-blur-md">
        <div className="px-6 md:px-10 py-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src="/owl-logo.jpg"
              alt="Brivo"
              className="w-10 h-10 border border-black"
            />
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-black/55">
                / CONTROL ROOM
              </div>
              <div className="font-display text-xl md:text-2xl font-black uppercase tracking-tight leading-none mt-1 text-black">
                BRIVO ADMIN
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/admin/leads"
              className="hidden md:inline-flex items-center gap-2 bg-[#CCFF00] text-black border border-black hover:bg-black hover:text-[#CCFF00] font-mono text-[10px] uppercase tracking-[0.28em] px-4 py-2.5 transition-colors"
              data-testid="admin-leads-link"
            >
              <Target size={13} /> LEAD ENGINE
            </Link>
            <Link
              to="/admin/social"
              className="hidden md:inline-flex items-center gap-2 border border-black text-black hover:bg-black hover:text-white font-mono text-[10px] uppercase tracking-[0.28em] px-4 py-2.5 transition-colors"
              data-testid="admin-social-link"
            >
              <Send size={13} /> AUTO-POSTER
            </Link>
            <Link
              to="/admin/affiliates"
              className="hidden md:inline-flex items-center gap-2 border border-black text-black hover:bg-black hover:text-white font-mono text-[10px] uppercase tracking-[0.28em] px-4 py-2.5 transition-colors"
              data-testid="admin-affiliates-link"
            >
              <Users size={13} /> PARTNERS
            </Link>
            <button
              onClick={logout}
              className="inline-flex items-center gap-2 border border-[#5a5a64] text-[#5a5a64] hover:border-[#8B0000] hover:text-[#8B0000] font-mono text-[10px] uppercase tracking-[0.28em] px-4 py-2.5 transition-colors"
              data-testid="admin-logout"
            >
              <LogOut size={13} /> LOGOUT
            </button>
          </div>
        </div>

        {/* Tabs */}
        <nav className="px-6 md:px-10 flex gap-0 overflow-x-auto border-t border-[#9a9a9a]">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = t.id === tab;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`relative inline-flex items-center gap-2 px-5 py-3 font-mono text-[11px] uppercase tracking-[0.28em] whitespace-nowrap transition-colors ${
                  active
                    ? "text-black bg-white"
                    : "text-[#5a5a64] hover:text-black hover:bg-white/40"
                }`}
                data-testid={`admin-tab-${t.id}`}
              >
                <Icon size={13} />
                {t.label}
                {active && (
                  <span className="absolute left-0 right-0 -bottom-px h-[2px] bg-[#CCFF00]" />
                )}
              </button>
            );
          })}
        </nav>
      </header>

      <main className="flex-1 px-6 md:px-10 py-8 max-w-[1480px] w-full mx-auto">
        <div className="mb-6 flex items-baseline gap-3">
          <h2 className="font-display text-2xl md:text-3xl font-black uppercase tracking-tight text-black">
            {Tab?.label}
          </h2>
          <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-[#5a5a64]">
            · {new Date().toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "short", day: "numeric" })}
          </span>
        </div>
        <div className="bg-[#0B0B0F] border border-black shadow-[0_8px_30px_rgba(0,0,0,0.25)] p-6 text-white">
          <TabContent />
        </div>
      </main>
    </div>
  );
}
