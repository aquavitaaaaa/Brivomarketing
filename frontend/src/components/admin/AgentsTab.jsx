import { useEffect, useState } from "react";
import {
  Bot,
  Plus,
  Edit3,
  Trash2,
  Star,
  Loader2,
  Save,
  X,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("brivo_admin_token")}`,
});

const ROLES = [
  { id: "chat", label: "Website chat" },
  { id: "voice", label: "Voice operator" },
  { id: "email", label: "Email replies" },
];

const EMPTY = {
  name: "",
  role: "chat",
  provider: "anthropic",
  model: "claude-sonnet-4-5-20250929",
  system_prompt: "",
  description: "",
  temperature: 0.7,
  enabled: true,
  is_default: false,
};

export default function AgentsTab() {
  const [agents, setAgents] = useState([]);
  const [models, setModels] = useState([]);
  const [editing, setEditing] = useState(null); // agent or EMPTY
  const [saving, setSaving] = useState(false);

  const load = () => {
    Promise.all([
      axios.get(`${API}/admin/agents`, { headers: authHeaders() }),
      axios.get(`${API}/admin/agents/models`, { headers: authHeaders() }),
    ])
      .then(([a, m]) => {
        setAgents(a.data);
        setModels(m.data.options || []);
      })
      .catch(() => {});
  };

  useEffect(load, []);

  const save = async () => {
    if (!editing.name || !editing.system_prompt) {
      toast.error("Name and system prompt are required.");
      return;
    }
    setSaving(true);
    try {
      if (editing.id) {
        await axios.patch(
          `${API}/admin/agents/${editing.id}`,
          editing,
          { headers: authHeaders() }
        );
        toast.success(`${editing.name} updated.`);
      } else {
        await axios.post(`${API}/admin/agents`, editing, {
          headers: authHeaders(),
        });
        toast.success(`${editing.name} created.`);
      }
      setEditing(null);
      load();
    } catch (e) {
      const d = e?.response?.data?.detail;
      toast.error(typeof d === "string" ? d : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (a) => {
    if (!confirm(`Delete agent "${a.name}"?`)) return;
    try {
      await axios.delete(`${API}/admin/agents/${a.id}`, {
        headers: authHeaders(),
      });
      toast.success("Agent deleted.");
      load();
    } catch (e) {
      const d = e?.response?.data?.detail;
      toast.error(typeof d === "string" ? d : "Delete failed");
    }
  };

  const setDefault = async (a) => {
    try {
      await axios.patch(
        `${API}/admin/agents/${a.id}`,
        { is_default: true, enabled: true },
        { headers: authHeaders() }
      );
      toast.success(`${a.name} is now the default ${a.role} agent.`);
      load();
    } catch (e) {
      toast.error("Failed to set default");
    }
  };

  const toggleEnabled = async (a) => {
    try {
      await axios.patch(
        `${API}/admin/agents/${a.id}`,
        { enabled: !a.enabled },
        { headers: authHeaders() }
      );
      load();
    } catch (e) {
      toast.error("Toggle failed");
    }
  };

  const modelLabel = (provider, model) =>
    models.find((m) => m.provider === provider && m.model === model)?.label ||
    `${provider} / ${model}`;

  return (
    <div className="space-y-6" data-testid="agents-tab">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-white/60 text-sm max-w-2xl leading-relaxed">
            Agents are reusable AI personas that can run your chat widget, your
            phone operator, or draft your email replies. The default agent per
            role is the one that actually runs live.
          </p>
        </div>
        <button
          onClick={() => setEditing({ ...EMPTY })}
          className="inline-flex items-center gap-2 bg-[#CCFF00] text-black font-mono text-xs uppercase tracking-[0.2em] font-bold px-5 py-3 accent-glow"
          data-testid="agent-create"
        >
          <Plus size={14} /> New agent
        </button>
      </div>

      {agents.length === 0 ? (
        <div className="bg-[#13131C] border border-white/10 p-10 text-center">
          <Bot size={26} className="text-white/25 mx-auto" />
          <div className="mt-3 font-mono text-xs uppercase tracking-[0.3em] text-white/40">
            No agents yet
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {agents.map((a) => (
            <div
              key={a.id}
              className={`bg-[#13131C] border p-5 transition-colors ${
                a.is_default
                  ? "border-[#CCFF00]/50"
                  : "border-white/10 hover:border-[#CCFF00]/30"
              }`}
              data-testid={`agent-card-${a.id}`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-display text-lg font-black uppercase tracking-tight truncate">
                      {a.name}
                    </h3>
                    {a.is_default && (
                      <span className="inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-[0.25em] bg-[#CCFF00] text-black px-1.5 py-0.5 font-bold">
                        <Star size={9} /> Default
                      </span>
                    )}
                    {!a.enabled && (
                      <span className="font-mono text-[9px] uppercase tracking-[0.25em] border border-white/25 text-white/50 px-1.5 py-0.5">
                        Disabled
                      </span>
                    )}
                  </div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/45">
                    {a.role} · {modelLabel(a.provider, a.model)}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setEditing(a)}
                    className="p-2 border border-white/15 hover:border-[#CCFF00]/50 hover:text-[#CCFF00]"
                    title="Edit"
                    data-testid={`agent-edit-${a.id}`}
                  >
                    <Edit3 size={13} />
                  </button>
                  <button
                    onClick={() => remove(a)}
                    disabled={a.is_default}
                    className="p-2 border border-white/15 hover:border-red-400/50 hover:text-red-400 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Delete"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {a.description && (
                <p className="text-white/65 text-sm mb-3 leading-snug">
                  {a.description}
                </p>
              )}

              <div className="bg-black/30 border border-white/10 p-3 max-h-[140px] overflow-y-auto text-xs text-white/65 font-mono whitespace-pre-wrap leading-relaxed">
                {a.system_prompt.slice(0, 400)}
                {a.system_prompt.length > 400 ? "…" : ""}
              </div>

              <div className="mt-4 flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => toggleEnabled(a)}
                  className={`font-mono text-[10px] uppercase tracking-[0.2em] px-3 py-1.5 border ${
                    a.enabled
                      ? "border-[#CCFF00]/50 text-[#CCFF00]"
                      : "border-white/15 text-white/45"
                  }`}
                >
                  {a.enabled ? "Enabled" : "Disabled"}
                </button>
                {!a.is_default && (
                  <button
                    onClick={() => setDefault(a)}
                    className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.2em] px-3 py-1.5 border border-white/15 hover:border-[#CCFF00]/50 hover:text-[#CCFF00]"
                  >
                    <Star size={11} /> Set as default
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <AgentEditor
          value={editing}
          models={models}
          onChange={setEditing}
          onClose={() => setEditing(null)}
          onSave={save}
          saving={saving}
        />
      )}
    </div>
  );
}

function AgentEditor({ value, models, onChange, onClose, onSave, saving }) {
  const update = (k, v) => onChange({ ...value, [k]: v });

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-start md:items-center justify-center p-4 md:p-8 overflow-y-auto"
      onClick={onClose}
      data-testid="agent-editor"
    >
      <div
        className="relative w-full max-w-3xl bg-[#13131C] border border-white/10 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 border border-white/15 hover:border-[#CCFF00]/50 hover:text-[#CCFF00] flex items-center justify-center"
          aria-label="Close"
        >
          <X size={14} />
        </button>

        <div className="p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <Sparkles size={16} className="text-[#CCFF00]" />
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-[#CCFF00]">
                / {value.id ? "Edit agent" : "New agent"}
              </div>
              <h2 className="font-display text-2xl font-black uppercase tracking-tight">
                Configure persona
              </h2>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <Field label="Name *">
              <input
                value={value.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="e.g., Brivo Strategist"
                className="w-full bg-black border border-white/15 px-4 py-3 text-sm font-mono focus:outline-none focus:border-[#CCFF00]"
                data-testid="agent-name"
              />
            </Field>
            <Field label="Role">
              <select
                value={value.role}
                onChange={(e) => update("role", e.target.value)}
                className="w-full bg-black border border-white/15 px-4 py-3 text-sm font-mono focus:outline-none focus:border-[#CCFF00]"
                data-testid="agent-role"
              >
                {ROLES.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Model" className="md:col-span-2">
              <select
                value={`${value.provider}|${value.model}`}
                onChange={(e) => {
                  const [provider, model] = e.target.value.split("|");
                  onChange({ ...value, provider, model });
                }}
                className="w-full bg-black border border-white/15 px-4 py-3 text-sm font-mono focus:outline-none focus:border-[#CCFF00]"
                data-testid="agent-model"
              >
                {models.map((m) => (
                  <option key={`${m.provider}-${m.model}`} value={`${m.provider}|${m.model}`}>
                    {m.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Description" className="md:col-span-2">
              <input
                value={value.description || ""}
                onChange={(e) => update("description", e.target.value)}
                placeholder="Short note so you remember what this agent is for"
                className="w-full bg-black border border-white/15 px-4 py-3 text-sm focus:outline-none focus:border-[#CCFF00]"
              />
            </Field>
            <Field label="System prompt *" className="md:col-span-2">
              <textarea
                value={value.system_prompt}
                onChange={(e) => update("system_prompt", e.target.value)}
                rows={12}
                placeholder="You are a helpful assistant…"
                className="w-full bg-black border border-white/15 px-4 py-3 text-sm font-mono focus:outline-none focus:border-[#CCFF00] leading-relaxed"
                data-testid="agent-prompt"
              />
              <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">
                {value.system_prompt.length} chars
              </div>
            </Field>
            <Field label="Temperature">
              <input
                type="number"
                step="0.1"
                min="0"
                max="1"
                value={value.temperature ?? 0.7}
                onChange={(e) => update("temperature", parseFloat(e.target.value))}
                className="w-full bg-black border border-white/15 px-4 py-3 text-sm font-mono focus:outline-none focus:border-[#CCFF00]"
              />
            </Field>
            <Field label="Status">
              <div className="flex gap-3 pt-3">
                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={value.enabled}
                    onChange={(e) => update("enabled", e.target.checked)}
                  />
                  Enabled
                </label>
                <label className="inline-flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={value.is_default}
                    onChange={(e) => update("is_default", e.target.checked)}
                  />
                  Default for role
                </label>
              </div>
            </Field>
          </div>

          <div className="mt-8 flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="font-mono text-xs uppercase tracking-[0.25em] text-white/55 hover:text-white px-4 py-3"
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              disabled={saving}
              className="inline-flex items-center gap-2 bg-[#CCFF00] text-black font-mono text-xs uppercase tracking-[0.2em] font-bold px-6 py-3 accent-glow disabled:opacity-60"
              data-testid="agent-save"
            >
              {saving ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Save size={13} />
              )}
              {saving ? "Saving" : value.id ? "Save changes" : "Create agent"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children, className = "" }) {
  return (
    <div className={className}>
      <label className="block font-mono text-[10px] uppercase tracking-[0.25em] text-white/55 mb-2">
        {label}
      </label>
      {children}
    </div>
  );
}
