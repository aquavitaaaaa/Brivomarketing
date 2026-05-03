import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  Target,
  Send,
  Users,
  Palette,
  ArrowLeft,
} from "lucide-react";

/**
 * Shared Admin top bar + mobile drawer.
 * Used across /admin, /admin/leads, /admin/social, /admin/affiliates, /brand-kit.
 *
 * Props:
 *   title        — big display title (e.g. "BRIVO ADMIN")
 *   subtitle     — small mono label above title (e.g. "/ CONTROL ROOM")
 *   current      — one of: dashboard | leads | social | affiliates | brandkit
 *   backTo       — optional route (e.g. "/admin") to render a "< Back" link on mobile
 *   rightSlot    — optional JSX rendered on the right of the bar (e.g. page-specific CTAs).
 *                  On mobile these collapse into a secondary row below the bar.
 *   showLogout   — default true
 *   theme        — "grey" (default, X11-gray chassis) | "bone" (bone/dark for BrandKit + Social)
 */
export default function AdminNav({
  title = "BRIVO ADMIN",
  subtitle = "/ CONTROL ROOM",
  current = "dashboard",
  backTo = null,
  rightSlot = null,
  showLogout = true,
  theme = "grey",
}) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  // Close drawer on route change / escape
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Lock body scroll when drawer open
  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  const logout = () => {
    localStorage.removeItem("brivo_admin_token");
    setOpen(false);
    navigate("/admin/login");
  };

  const links = [
    { key: "dashboard", to: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { key: "leads", to: "/admin/leads", label: "Lead Engine", icon: Target },
    { key: "social", to: "/admin/social", label: "Auto-Poster", icon: Send },
    { key: "affiliates", to: "/admin/affiliates", label: "Partners", icon: Users },
    { key: "brandkit", to: "/brand-kit", label: "Brand Kit", icon: Palette },
  ];

  const chrome =
    theme === "bone"
      ? {
          bar: "border-b border-[#E7E3D8] bg-white",
          border: "border-[#E7E3D8]",
          title: "text-[#0B1B2B]",
          subtitle: "text-[#4E5C6E]",
          btnBase:
            "border border-[#E7E3D8] text-[#4E5C6E] hover:text-[#0B1B2B] hover:border-[#0B1B2B] bg-white",
          btnActive: "bg-[#0B1B2B] text-white border-[#0B1B2B]",
          logout:
            "border-[#E7E3D8] text-[#8190A1] hover:text-[#8B0000] hover:border-[#8B0000]",
        }
      : {
          bar: "border-b border-[#9a9a9a] bg-[#d6d6d6]/95 backdrop-blur-md",
          border: "border-[#9a9a9a]",
          title: "text-black",
          subtitle: "text-black/55",
          btnBase:
            "border border-black text-black hover:bg-black hover:text-white bg-white",
          btnActive: "bg-[#CCFF00] text-black border-black",
          logout:
            "border-[#5a5a64] text-[#5a5a64] hover:border-[#8B0000] hover:text-[#8B0000]",
        };

  return (
    <>
      <header className={`sticky top-0 z-30 ${chrome.bar}`} data-testid="admin-nav">
        <div className="px-4 sm:px-6 md:px-10 py-4 md:py-5 flex items-center justify-between gap-3">
          {/* Left cluster */}
          <div className="flex items-center gap-3 md:gap-4 min-w-0">
            {backTo ? (
              <Link
                to={backTo}
                className={`hidden md:inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.32em] ${chrome.subtitle} hover:${chrome.title}`}
                data-testid="admin-nav-back"
              >
                <ArrowLeft size={13} /> Admin
              </Link>
            ) : (
              <img
                src="/owl-logo.jpg"
                alt="Brivo"
                className="w-9 h-9 md:w-10 md:h-10 border border-black shrink-0"
              />
            )}
            <div className={backTo ? "md:border-l md:border-black md:pl-4 min-w-0" : "min-w-0"}>
              <div
                className={`font-mono text-[9px] md:text-[10px] uppercase tracking-[0.28em] md:tracking-[0.32em] ${chrome.subtitle} truncate`}
              >
                {subtitle}
              </div>
              <div
                className={`font-display text-base sm:text-lg md:text-2xl font-black uppercase tracking-tight leading-none mt-1 truncate ${chrome.title}`}
              >
                {title}
              </div>
            </div>
          </div>

          {/* Right cluster — desktop only */}
          <div className="hidden lg:flex items-center gap-2">
            {rightSlot}
            {links.map((l) => {
              if (l.key === current) return null;
              const Icon = l.icon;
              return (
                <Link
                  key={l.key}
                  to={l.to}
                  className={`inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.28em] px-3 xl:px-4 py-2.5 transition-colors ${chrome.btnBase}`}
                  data-testid={`admin-nav-${l.key}`}
                >
                  <Icon size={13} /> {l.label}
                </Link>
              );
            })}
            {showLogout && (
              <button
                onClick={logout}
                className={`inline-flex items-center gap-2 border font-mono text-[10px] uppercase tracking-[0.28em] px-3 xl:px-4 py-2.5 transition-colors ${chrome.logout}`}
                data-testid="admin-nav-logout"
              >
                <LogOut size={13} /> Logout
              </button>
            )}
          </div>

          {/* Hamburger — mobile + tablet */}
          <button
            onClick={() => setOpen(true)}
            className={`lg:hidden inline-flex items-center justify-center w-10 h-10 border ${chrome.border} ${chrome.title} shrink-0`}
            aria-label="Open menu"
            data-testid="admin-nav-toggle"
          >
            <Menu size={18} />
          </button>
        </div>

        {/* Optional rightSlot shelf — mobile + tablet */}
        {rightSlot && (
          <div
            className={`lg:hidden border-t ${chrome.border} px-4 sm:px-6 py-2.5 flex items-center gap-2 overflow-x-auto no-scrollbar`}
          >
            {rightSlot}
          </div>
        )}
      </header>

      {/* Mobile drawer */}
      {open && (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          role="dialog"
          aria-modal="true"
          data-testid="admin-nav-drawer"
        >
          {/* Backdrop */}
          <button
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/60"
          />
          {/* Panel */}
          <aside className="absolute top-0 right-0 bottom-0 w-[86%] max-w-[360px] bg-black text-white border-l border-[#CCFF00]/40 shadow-[0_0_60px_rgba(204,255,0,0.15)] flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-[#CCFF00] animate-pulse" />
                <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-[#CCFF00]">
                  Control Room
                </span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-9 h-9 inline-flex items-center justify-center border border-white/20 hover:border-[#CCFF00] hover:text-[#CCFF00]"
                aria-label="Close menu"
                data-testid="admin-nav-close"
              >
                <X size={16} />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto py-2">
              {links.map((l) => {
                const Icon = l.icon;
                const active = l.key === current;
                return (
                  <Link
                    key={l.key}
                    to={l.to}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 px-5 py-4 border-b border-white/5 transition-colors ${
                      active
                        ? "bg-[#CCFF00]/10 text-[#CCFF00]"
                        : "text-white/85 hover:bg-white/5 hover:text-white"
                    }`}
                    data-testid={`admin-nav-drawer-${l.key}`}
                  >
                    <Icon size={16} />
                    <span className="font-mono text-[12px] uppercase tracking-[0.28em]">
                      {l.label}
                    </span>
                    {active && (
                      <span className="ml-auto text-[9px] font-mono uppercase tracking-[0.3em] text-[#CCFF00]">
                        · now
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
            {showLogout && (
              <button
                onClick={logout}
                className="flex items-center justify-center gap-2 px-5 py-4 border-t border-white/10 text-white/70 hover:text-[#8B0000] hover:bg-white/5 font-mono text-[11px] uppercase tracking-[0.28em]"
                data-testid="admin-nav-drawer-logout"
              >
                <LogOut size={14} /> Logout
              </button>
            )}
          </aside>
        </div>
      )}
    </>
  );
}
