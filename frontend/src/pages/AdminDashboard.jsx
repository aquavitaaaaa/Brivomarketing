import { useEffect, useState } from "react";
import { useNavigate, Navigate, Link } from "react-router-dom";
import { LogOut, BarChart3, Inbox, PhoneCall, Radio, MessageSquare, Bot, Send, Target } from "lucide-react";
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
  { id: "leads", label: "Leads", icon: Inbox },
  { id: "agents", label: "Agents", icon: Bot },
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
      <div className="min-h-screen bg-[#0B0B0F] flex items-center justify-center text-white/50 font-mono text-xs uppercase tracking-[0.3em]">
        Loading control room…
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
      className="min-h-screen bg-[#0B0B0F] text-white flex flex-col"
      data-testid="admin-dashboard"
    >
      {/* Top bar */}
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#0B0B0F]/90 backdrop-blur-md">
        <div className="px-6 md:px-10 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src="/owl-logo.jpg"
              alt="Brivo"
              className="w-9 h-9 rounded-full border border-[#CCFF00]/50"
            />
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#CCFF00]">
                / Control Room
              </div>
              <div className="font-display text-lg font-black uppercase tracking-tight leading-none mt-1">
                Brivo Admin
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/admin/leads"
              className="hidden md:inline-flex items-center gap-2 border border-[#CCFF00]/40 text-[#CCFF00] hover:bg-[#CCFF00]/10 font-mono text-[10px] uppercase tracking-[0.25em] px-4 py-2 transition-colors"
              data-testid="admin-leads-link"
            >
              <Target size={13} /> Lead Engine
            </Link>
            <Link
              to="/admin/social"
              className="hidden md:inline-flex items-center gap-2 border border-[#CCFF00]/40 text-[#CCFF00] hover:bg-[#CCFF00]/10 font-mono text-[10px] uppercase tracking-[0.25em] px-4 py-2 transition-colors"
              data-testid="admin-social-link"
            >
              <Send size={13} /> Auto-Poster
            </Link>
            <span className="hidden md:inline font-mono text-[10px] uppercase tracking-[0.25em] text-white/45">
              {admin?.email}
            </span>
            <button
              onClick={logout}
              className="inline-flex items-center gap-2 border border-white/15 hover:border-[#CCFF00]/50 hover:text-[#CCFF00] font-mono text-[10px] uppercase tracking-[0.25em] px-4 py-2 transition-colors"
              data-testid="admin-logout"
            >
              <LogOut size={13} /> Logout
            </button>
          </div>
        </div>

        {/* Tabs */}
        <nav className="px-6 md:px-10 flex gap-1 overflow-x-auto">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = t.id === tab;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`relative inline-flex items-center gap-2 px-4 py-3 font-mono text-[11px] uppercase tracking-[0.25em] whitespace-nowrap transition-colors ${
                  active
                    ? "text-[#CCFF00]"
                    : "text-white/50 hover:text-white"
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
          <h2 className="font-display text-2xl md:text-3xl font-black uppercase tracking-tight">
            {Tab?.label}
          </h2>
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/35">
            · {new Date().toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "short", day: "numeric" })}
          </span>
        </div>
        <TabContent />
      </main>
    </div>
  );
}
