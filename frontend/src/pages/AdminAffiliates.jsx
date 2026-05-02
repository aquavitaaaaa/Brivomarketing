import { useEffect, useState } from "react";
import { useNavigate, Navigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Users,
  Inbox,
  DollarSign,
  Check,
  X,
  Copy,
  Trophy,
  Crown,
  Award,
  Medal,
  RefreshCw,
  PlayCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import {
  adminMe,
  fetchAffiliateApplications,
  approveAffiliateApplication,
  rejectAffiliateApplication,
  fetchAffiliates,
  fetchAffiliateDetail,
  updateReferralStage,
  winReferral,
  runMonthlyCommissions,
  fetchCommissions,
  updateCommissionStatus,
} from "@/lib/api";

const TIER_VISUAL = {
  bronze: { Icon: Medal, color: "#A86B3A" },
  silver: { Icon: Award, color: "#B7C0CB" },
  gold: { Icon: Trophy, color: "#E8C28A" },
  platinum: { Icon: Crown, color: "#E8E1D2" },
};

const fmt = (n) => `$${(n || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

export default function AdminAffiliates() {
  const [admin, setAdmin] = useState(null);
  const [checked, setChecked] = useState(false);
  const [tab, setTab] = useState("applications");
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
        BOOTING…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#bebebe] text-black">
      <header className="bg-[#0B0B0F] border-b border-black px-6 md:px-10 py-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/admin"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white font-mono text-[10px] uppercase tracking-[0.28em]"
          >
            <ArrowLeft size={13} /> Control room
          </Link>
          <span className="text-white/30">·</span>
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.32em] text-[#CCFF00]">
              / PARTNER PROGRAM
            </div>
            <div className="font-display text-xl md:text-2xl font-black uppercase tracking-tight text-white leading-none mt-1">
              AFFILIATES
            </div>
          </div>
        </div>
        <button
          onClick={() => {
            localStorage.removeItem("brivo_admin_token");
            navigate("/admin/login");
          }}
          className="border border-white/30 text-white/80 hover:border-[#CCFF00] hover:text-[#CCFF00] font-mono text-[10px] uppercase tracking-[0.28em] px-4 py-2.5"
        >
          Logout
        </button>
      </header>

      <nav className="bg-[#d6d6d6] border-b border-[#9a9a9a] px-6 md:px-10 flex gap-0">
        {[
          { id: "applications", label: "Applications", icon: Inbox },
          { id: "affiliates", label: "Active partners", icon: Users },
          { id: "commissions", label: "Commissions", icon: DollarSign },
        ].map((t) => {
          const Icon = t.icon;
          const active = t.id === tab;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`relative inline-flex items-center gap-2 px-5 py-3 font-mono text-[11px] uppercase tracking-[0.28em] transition-colors ${
                active
                  ? "text-black bg-white"
                  : "text-[#5a5a64] hover:text-black hover:bg-white/40"
              }`}
              data-testid={`affiliates-tab-${t.id}`}
            >
              <Icon size={13} /> {t.label}
              {active && <span className="absolute left-0 right-0 -bottom-px h-[2px] bg-[#CCFF00]" />}
            </button>
          );
        })}
      </nav>

      <main className="px-6 md:px-10 py-8 max-w-[1480px] w-full mx-auto">
        <div className="bg-[#0B0B0F] border border-black p-6 text-white">
          {tab === "applications" && <ApplicationsTab />}
          {tab === "affiliates" && <AffiliatesTab />}
          {tab === "commissions" && <CommissionsTab />}
        </div>
      </main>
    </div>
  );
}

// ---------------------------------------------------------- Applications
function ApplicationsTab() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetchAffiliateApplications(filter === "all" ? null : filter);
      setApps(r.applications || []);
    } catch (e) {
      toast.error("Failed to load applications");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [filter]);

  const approve = async (id) => {
    try {
      const r = await approveAffiliateApplication(id);
      const code = r?.affiliate?.ref_code;
      toast.success(code ? `Approved · ${code}` : "Approved");
      load();
    } catch (e) {
      toast.error("Approve failed");
    }
  };
  const reject = async (id) => {
    if (!window.confirm("Reject this application?")) return;
    try {
      await rejectAffiliateApplication(id, "rejected by admin");
      toast.success("Rejected");
      load();
    } catch (e) {
      toast.error("Reject failed");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-display text-2xl uppercase tracking-tight">Applications</h2>
        <div className="flex items-center gap-2">
          {["pending", "approved", "rejected", "all"].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`font-mono text-[10px] uppercase tracking-[0.24em] px-3 py-1.5 border transition-colors ${
                filter === s ? "bg-[#CCFF00] text-black border-[#CCFF00]" : "border-white/30 text-white/70 hover:text-white"
              }`}
            >
              {s}
            </button>
          ))}
          <button
            onClick={load}
            className="ml-2 inline-flex items-center gap-1.5 border border-white/30 text-white/80 hover:text-white px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.24em]"
          >
            <RefreshCw size={11} /> Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <Loading />
      ) : apps.length === 0 ? (
        <Empty msg={`No ${filter} applications`} />
      ) : (
        <div className="space-y-3">
          {apps.map((a) => (
            <div key={a.id} className="bg-white/5 border border-white/10 rounded-lg p-5 hover:border-[#CCFF00]/40 transition-colors">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-display text-xl text-white">{a.name}</span>
                    <span className="text-white/55 text-[13px]">{a.email}</span>
                    {a.phone && <span className="text-white/45 text-[13px]">· {a.phone}</span>}
                    <Pill status={a.status} />
                  </div>
                  <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-4 text-[12.5px]">
                    <Field label="Location" value={a.location} />
                    <Field label="Channels" value={a.channels} />
                    <Field label="Audience" value={a.audience_size} />
                    <Field label="Expected/mo" value={a.expected_clients_per_month} />
                  </div>
                  {a.experience && (
                    <Field label="Experience" value={a.experience} className="mt-3" />
                  )}
                  {a.why_join && (
                    <div className="mt-3">
                      <div className="text-[10px] uppercase tracking-[0.22em] text-white/45">Why</div>
                      <div className="text-white/85 mt-1 text-[14px] leading-relaxed">{a.why_join}</div>
                    </div>
                  )}
                  {a.portfolio_url && (
                    <a
                      href={a.portfolio_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[12px] text-[#CCFF00] hover:underline mt-2 inline-block"
                    >
                      {a.portfolio_url}
                    </a>
                  )}
                  <div className="text-[11px] text-white/40 mt-3 font-mono">
                    {new Date(a.created_at).toLocaleString()}
                  </div>
                </div>
                {a.status === "pending" && (
                  <div className="flex md:flex-col gap-2 md:w-40 flex-shrink-0">
                    <button
                      onClick={() => approve(a.id)}
                      data-testid={`approve-${a.id}`}
                      className="flex-1 inline-flex items-center justify-center gap-2 bg-[#CCFF00] text-black hover:bg-white font-mono text-[11px] uppercase tracking-[0.22em] px-4 py-2.5 border border-[#CCFF00] transition-colors"
                    >
                      <Check size={13} /> Approve
                    </button>
                    <button
                      onClick={() => reject(a.id)}
                      className="flex-1 inline-flex items-center justify-center gap-2 border border-white/30 text-white/70 hover:border-[#FF6B6B] hover:text-[#FF6B6B] font-mono text-[11px] uppercase tracking-[0.22em] px-4 py-2.5"
                    >
                      <X size={13} /> Reject
                    </button>
                  </div>
                )}
                {a.status === "approved" && a.ref_code && (
                  <RefBadge code={a.ref_code} />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------- Affiliates
function AffiliatesTab() {
  const [data, setData] = useState({ affiliates: [], totals: {} });
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      setData(await fetchAffiliates());
    } catch (e) {
      toast.error("Failed to load affiliates");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const totals = data.totals || {};

  return (
    <div>
      <h2 className="font-display text-2xl uppercase tracking-tight mb-5">Active partners</h2>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-7">
        <KpiTile label="Partners" value={totals.affiliates ?? 0} />
        <KpiTile label="Pending apps" value={totals.pending_applications ?? 0} accent={(totals.pending_applications || 0) > 0} />
        <KpiTile label="Active clients" value={totals.active_clients ?? 0} />
        <KpiTile label="Pending payout" value={fmt(totals.pending_payout)} accent />
        <KpiTile label="Paid out" value={fmt(totals.paid_out)} />
      </div>

      {loading ? (
        <Loading />
      ) : data.affiliates.length === 0 ? (
        <Empty msg="No partners yet — approve some applications to get started." />
      ) : (
        <div className="space-y-3">
          {data.affiliates.map((a) => {
            const tier = TIER_VISUAL[a.tier] || TIER_VISUAL.bronze;
            const TierIcon = tier.Icon;
            const open = activeId === a.id;
            return (
              <div key={a.id} className="bg-white/5 border border-white/10 rounded-lg overflow-hidden">
                <button
                  onClick={() => setActiveId(open ? null : a.id)}
                  className="w-full flex items-center justify-between gap-4 p-5 hover:bg-white/10 transition-colors text-left"
                  data-testid={`affiliate-row-${a.id}`}
                >
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <TierIcon size={20} style={{ color: tier.color }} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-display text-lg text-white">{a.name}</span>
                        <span className="text-white/45 text-[13px]">{a.email}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-1.5">
                        <RefBadge code={a.ref_code} compact />
                        <span className="text-white/55 text-[12px]">
                          {a.active_clients} active · {a.total_referred} referred
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="hidden md:flex items-center gap-7 text-right">
                    <div>
                      <div className="text-[10px] uppercase tracking-[0.22em] text-white/45">Tier</div>
                      <div className="font-display text-base" style={{ color: tier.color }}>
                        {a.tier_name || a.tier}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-[0.22em] text-white/45">Earned</div>
                      <div className="font-display text-base text-white">{fmt(a.total_earned)}</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-[0.22em] text-white/45">Pending</div>
                      <div className="font-display text-base text-[#CCFF00]">{fmt(a.total_pending)}</div>
                    </div>
                  </div>
                </button>
                {open && <AffiliateDetail id={a.id} onChanged={load} />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function AffiliateDetail({ id, onChanged }) {
  const [d, setD] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      setD(await fetchAffiliateDetail(id));
    } catch (e) {
      toast.error("Failed to load detail");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

  const stage = async (refId, s) => {
    try {
      await updateReferralStage(refId, s);
      toast.success(`Marked ${s}`);
      load();
      onChanged?.();
    } catch {
      toast.error("Update failed");
    }
  };

  const win = async (refId) => {
    const mrrStr = window.prompt("Enter the client's monthly MRR (USD):", "7500");
    if (!mrrStr) return;
    const mrr = parseFloat(mrrStr.replace(/[^0-9.]/g, ""));
    if (!mrr || mrr <= 0) {
      toast.error("Invalid MRR");
      return;
    }
    const company = window.prompt("Client company name (optional):") || "";
    try {
      await winReferral(refId, { client_mrr: mrr, client_company: company });
      toast.success("Marked won — signing bonus + recurring queued");
      load();
      onChanged?.();
    } catch {
      toast.error("Failed to mark won");
    }
  };

  if (loading) return <div className="px-5 pb-5"><Loading /></div>;
  if (!d) return null;

  return (
    <div className="px-5 pb-5 border-t border-white/10">
      <div className="grid lg:grid-cols-2 gap-5 pt-5">
        <div>
          <h4 className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/55 mb-3">
            Referrals ({d.referrals.length})
          </h4>
          {d.referrals.length === 0 ? (
            <div className="text-white/45 text-[13px]">No referrals yet.</div>
          ) : (
            <div className="space-y-2">
              {d.referrals.map((r) => (
                <div key={r.id} className="bg-white/5 border border-white/10 rounded-md p-3 text-[13px]">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="min-w-0">
                      <div className="text-white">{r.lead_name || r.lead_email}</div>
                      <div className="text-white/45 text-[11px] font-mono mt-0.5">
                        {r.lead_email} {r.client_company ? `· ${r.client_company}` : ""}
                      </div>
                    </div>
                    <StagePill stage={r.stage} mrr={r.client_mrr} />
                  </div>
                  <div className="flex gap-2 mt-2.5 flex-wrap">
                    {r.stage !== "won" && (
                      <button
                        onClick={() => win(r.id)}
                        className="font-mono text-[10px] uppercase tracking-[0.22em] px-2.5 py-1 bg-[#CCFF00] text-black hover:bg-white"
                        data-testid={`win-${r.id}`}
                      >
                        Mark won
                      </button>
                    )}
                    {r.stage === "won" && (
                      <button
                        onClick={() => stage(r.id, "churned")}
                        className="font-mono text-[10px] uppercase tracking-[0.22em] px-2.5 py-1 border border-white/30 text-white/70 hover:text-[#FF6B6B]"
                      >
                        Churn
                      </button>
                    )}
                    {r.stage === "referred" && (
                      <button
                        onClick={() => stage(r.id, "qualified")}
                        className="font-mono text-[10px] uppercase tracking-[0.22em] px-2.5 py-1 border border-white/30 text-white/70 hover:text-white"
                      >
                        Qualified
                      </button>
                    )}
                    {!["won", "lost"].includes(r.stage) && (
                      <button
                        onClick={() => stage(r.id, "lost")}
                        className="font-mono text-[10px] uppercase tracking-[0.22em] px-2.5 py-1 border border-white/30 text-white/70 hover:text-[#FF6B6B]"
                      >
                        Lost
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h4 className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/55 mb-3">
            Commissions ({d.commissions.length})
          </h4>
          {d.commissions.length === 0 ? (
            <div className="text-white/45 text-[13px]">No commissions yet.</div>
          ) : (
            <div className="space-y-2">
              {d.commissions.map((c) => (
                <div key={c.id} className="bg-white/5 border border-white/10 rounded-md p-3 text-[13px] flex items-center justify-between">
                  <div>
                    <div className="text-white">{fmt(c.amount)}</div>
                    <div className="text-white/45 text-[11px] font-mono mt-0.5">
                      {c.period} · {c.type} · {Math.round((c.percentage || 0) * 100)}%
                    </div>
                    {c.note && <div className="text-white/60 text-[11.5px] mt-1">{c.note}</div>}
                  </div>
                  <CommissionStatusButton id={c.id} status={c.status} onChanged={load} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------- Commissions tab
function CommissionsTab() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [running, setRunning] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter !== "all") params.status = statusFilter;
      const r = await fetchCommissions(params);
      setRows(r.commissions || []);
    } catch {
      toast.error("Failed to load commissions");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [statusFilter]);

  const runMonth = async () => {
    setRunning(true);
    try {
      const r = await runMonthlyCommissions();
      toast.success(`Ran ${r.period} · inserted ${r.inserted}, skipped ${r.skipped}`);
      load();
    } catch {
      toast.error("Run failed");
    } finally {
      setRunning(false);
    }
  };

  const totalPending = rows.filter((r) => r.status === "pending").reduce((a, b) => a + (b.amount || 0), 0);
  const totalPaid = rows.filter((r) => r.status === "paid").reduce((a, b) => a + (b.amount || 0), 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <h2 className="font-display text-2xl uppercase tracking-tight">Commissions</h2>
        <div className="flex items-center gap-2 flex-wrap">
          {["pending", "paid", "void", "all"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`font-mono text-[10px] uppercase tracking-[0.24em] px-3 py-1.5 border transition-colors ${
                statusFilter === s ? "bg-[#CCFF00] text-black border-[#CCFF00]" : "border-white/30 text-white/70 hover:text-white"
              }`}
            >
              {s}
            </button>
          ))}
          <button
            onClick={runMonth}
            disabled={running}
            data-testid="run-monthly"
            className="inline-flex items-center gap-2 bg-[#CCFF00] text-black hover:bg-white border border-[#CCFF00] font-mono text-[10px] uppercase tracking-[0.24em] px-3 py-1.5 disabled:opacity-60"
          >
            {running ? <Loader2 size={11} className="animate-spin" /> : <PlayCircle size={11} />}
            Run this month
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        <KpiTile label={`Visible (${statusFilter})`} value={rows.length} />
        <KpiTile label="Total pending" value={fmt(totalPending)} accent />
        <KpiTile label="Total paid" value={fmt(totalPaid)} />
      </div>

      {loading ? (
        <Loading />
      ) : rows.length === 0 ? (
        <Empty msg="No commissions match this filter." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-left font-mono text-[10px] uppercase tracking-[0.22em] text-white/55 border-b border-white/10">
                <th className="py-3 pr-4">Period</th>
                <th className="py-3 pr-4">Partner</th>
                <th className="py-3 pr-4">Type</th>
                <th className="py-3 pr-4">Rate</th>
                <th className="py-3 pr-4">Amount</th>
                <th className="py-3 pr-4">Status</th>
                <th className="py-3 pr-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-3 pr-4 font-mono text-white/85">{c.period}</td>
                  <td className="py-3 pr-4">
                    <div className="text-white">{c.affiliate_name || "—"}</div>
                    <div className="text-white/45 text-[11px] font-mono">{c.affiliate_ref_code}</div>
                  </td>
                  <td className="py-3 pr-4 text-white/75 capitalize">{c.type}</td>
                  <td className="py-3 pr-4 text-white/75">
                    {c.percentage ? `${Math.round(c.percentage * 100)}%` : "—"}
                  </td>
                  <td className="py-3 pr-4 font-display text-white">{fmt(c.amount)}</td>
                  <td className="py-3 pr-4">
                    <Pill status={c.status} />
                  </td>
                  <td className="py-3 pr-4 text-right">
                    <CommissionStatusButton id={c.id} status={c.status} onChanged={load} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------- Helpers
function CommissionStatusButton({ id, status, onChanged }) {
  const [busy, setBusy] = useState(false);
  const action = async (next) => {
    setBusy(true);
    try {
      await updateCommissionStatus(id, { status: next });
      toast.success(`Marked ${next}`);
      onChanged?.();
    } catch {
      toast.error("Failed");
    } finally {
      setBusy(false);
    }
  };
  if (status === "pending") {
    return (
      <div className="inline-flex gap-1.5">
        <button
          onClick={() => action("paid")}
          disabled={busy}
          data-testid={`mark-paid-${id}`}
          className="font-mono text-[10px] uppercase tracking-[0.22em] px-2.5 py-1 bg-[#CCFF00] text-black hover:bg-white disabled:opacity-60"
        >
          Mark paid
        </button>
        <button
          onClick={() => action("void")}
          disabled={busy}
          className="font-mono text-[10px] uppercase tracking-[0.22em] px-2.5 py-1 border border-white/30 text-white/70 hover:text-[#FF6B6B] disabled:opacity-60"
        >
          Void
        </button>
      </div>
    );
  }
  if (status === "paid") {
    return <span className="text-[11px] text-white/45 font-mono">paid</span>;
  }
  return (
    <button
      onClick={() => action("pending")}
      disabled={busy}
      className="font-mono text-[10px] uppercase tracking-[0.22em] px-2.5 py-1 border border-white/30 text-white/70 hover:text-white disabled:opacity-60"
    >
      Reopen
    </button>
  );
}

function RefBadge({ code, compact }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        navigator.clipboard?.writeText(code);
        toast.success(`Copied ${code}`);
      }}
      className={`inline-flex items-center gap-1.5 font-mono text-[11px] tracking-[0.18em] uppercase border border-[#CCFF00]/40 text-[#CCFF00] hover:bg-[#CCFF00] hover:text-black transition-colors px-2 ${compact ? "py-0.5" : "py-1"}`}
      title="Copy referral code"
    >
      <Copy size={10} /> {code}
    </button>
  );
}

function KpiTile({ label, value, accent }) {
  return (
    <div className={`border ${accent ? "border-[#CCFF00]/40 bg-[#CCFF00]/10" : "border-white/10 bg-white/5"} rounded-md p-4`}>
      <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/55">{label}</div>
      <div className={`font-display text-2xl mt-1 ${accent ? "text-[#CCFF00]" : "text-white"}`}>{value}</div>
    </div>
  );
}

function Field({ label, value, className = "" }) {
  if (!value) return null;
  return (
    <div className={className}>
      <div className="text-[10px] uppercase tracking-[0.22em] text-white/45">{label}</div>
      <div className="text-white/85 mt-0.5">{value}</div>
    </div>
  );
}

function Pill({ status }) {
  const map = {
    pending: { c: "#CCFF00", b: "rgba(204,255,0,0.4)" },
    approved: { c: "#7EE787", b: "rgba(126,231,135,0.35)" },
    rejected: { c: "#FF6B6B", b: "rgba(255,107,107,0.35)" },
    paid: { c: "#7EE787", b: "rgba(126,231,135,0.35)" },
    void: { c: "#9aa0a6", b: "rgba(154,160,166,0.35)" },
    referred: { c: "#9aa0a6", b: "rgba(154,160,166,0.35)" },
    qualified: { c: "#CCFF00", b: "rgba(204,255,0,0.35)" },
    won: { c: "#7EE787", b: "rgba(126,231,135,0.35)" },
    lost: { c: "#FF6B6B", b: "rgba(255,107,107,0.35)" },
    churned: { c: "#FF6B6B", b: "rgba(255,107,107,0.35)" },
  };
  const v = map[status] || { c: "#fff", b: "rgba(255,255,255,0.2)" };
  return (
    <span
      className="font-mono text-[10px] uppercase tracking-[0.22em] px-2 py-0.5 border"
      style={{ color: v.c, borderColor: v.b }}
    >
      {status}
    </span>
  );
}

function StagePill({ stage, mrr }) {
  return (
    <div className="flex items-center gap-2">
      <Pill status={stage} />
      {mrr ? (
        <span className="font-mono text-[11px] text-white/65">{fmt(mrr)}/mo</span>
      ) : null}
    </div>
  );
}

function Loading() {
  return (
    <div className="flex items-center gap-2 text-white/55 text-[13px]">
      <Loader2 size={14} className="animate-spin" /> Loading…
    </div>
  );
}
function Empty({ msg }) {
  return (
    <div className="border border-dashed border-white/15 rounded-md p-10 text-center text-white/55 text-[13.5px]">
      {msg}
    </div>
  );
}
