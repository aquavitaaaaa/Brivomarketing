import { useEffect, useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import {
  BarChart3,
  Inbox,
  PhoneCall,
  Radio,
  MessageSquare,
  Bot,
} from "lucide-react";
import { adminMe } from "@/lib/api";
import AnalyticsTab from "@/components/admin/AnalyticsTab";
import LeadsTab from "@/components/admin/LeadsTab";
import CallsTab from "@/components/admin/CallsTab";
import OperatorTab from "@/components/admin/OperatorTab";
import MessagesTab from "@/components/admin/MessagesTab";
import AgentsTab from "@/components/admin/AgentsTab";
import AdminNav from "@/components/admin/AdminNav";

const TABS = [
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "messages", label: "Messages", icon: MessageSquare },
  { id: "leads", label: "Inbox", icon: Inbox },
  { id: "agents", label: "AI Agents", icon: Bot },
  { id: "calls", label: "Calls", icon: PhoneCall },
  { id: "operator", label: "Operator", icon: Radio },
];

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

  // eslint-disable-next-line no-unused-vars
  const _navigate = navigate; // reserved for future actions

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
      <div className="bg-black text-white px-4 sm:px-6 md:px-10 py-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div className="flex items-center gap-2 shrink-0">
            <span className="w-2 h-2 rounded-full bg-[#CCFF00] animate-pulse shadow-[0_0_8px_#CCFF00]" />
            <span className="font-mono text-[9px] uppercase tracking-[0.28em] sm:tracking-[0.32em] text-[#CCFF00]">
              AI ONLINE
            </span>
          </div>
          <span className="hidden md:inline font-mono text-[9px] uppercase tracking-[0.32em] text-white/45">
            BRIVO OS · v1.0
          </span>
        </div>
        <div className="flex items-center gap-3 sm:gap-4 shrink-0">
          <span className="hidden md:inline font-mono text-[9px] uppercase tracking-[0.32em] text-white/45 truncate max-w-[220px]">
            {admin?.email}
          </span>
          <span className="font-mono text-[9px] uppercase tracking-[0.28em] sm:tracking-[0.32em] text-[#CCFF00]">
            {new Date().toLocaleTimeString(undefined, { hour12: false })}
          </span>
        </div>
      </div>

      {/* Shared admin nav */}
      <AdminNav
        title="BRIVO ADMIN"
        subtitle="/ CONTROL ROOM"
        current="dashboard"
      />

      {/* Tabs */}
      <nav
        className="sticky top-[73px] md:top-[81px] z-20 bg-[#d6d6d6]/95 backdrop-blur-md border-b border-[#9a9a9a] px-4 sm:px-6 md:px-10 flex gap-0 overflow-x-auto no-scrollbar"
        data-testid="admin-tabs"
      >
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = t.id === tab;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`relative inline-flex items-center gap-2 px-4 sm:px-5 py-3 font-mono text-[11px] uppercase tracking-[0.28em] whitespace-nowrap transition-colors ${
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

      <main className="flex-1 px-4 sm:px-6 md:px-10 py-6 md:py-8 max-w-[1480px] w-full mx-auto">
        <div className="mb-5 md:mb-6 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h2 className="font-display text-2xl md:text-3xl font-black uppercase tracking-tight text-black">
            {Tab?.label}
          </h2>
          <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-[#5a5a64]">
            · {new Date().toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "short", day: "numeric" })}
          </span>
        </div>
        <div className="bg-[#0B0B0F] border border-black shadow-[0_8px_30px_rgba(0,0,0,0.25)] p-3 sm:p-5 md:p-6 text-white overflow-x-auto">
          <TabContent />
        </div>
      </main>
    </div>
  );
}
