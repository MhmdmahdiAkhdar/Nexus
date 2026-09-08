"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, UserPlus, X, AlertCircle } from "lucide-react";
import Sidebar from "../layout/Sidebar";
import Topbar from "../layout/Topbar";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const STATUS_OPTIONS = ["Active", "Away", "Inactive"];

interface TeamMemberItem {
  id: number;
  fullName: string;
  jobTitle: string | null;
  department: string | null;
  responsibleProducts: string;
  responsibilityType: string | null;
  status: string;
}

function authHeaders() {
  const token = localStorage.getItem("nexus_token");
  return { Authorization: `Bearer ${token}` };
}

const inputClass =
  "w-full border border-slate-300 rounded-md px-3.5 py-2.5 text-[14px] text-slate-900 placeholder:text-slate-400 bg-white focus:outline-none focus:ring-2 focus:ring-[#2451B0]/20 focus:border-[#2451B0] transition-all";

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, { bg: string; text: string; dot: string }> = {
    Active: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
    Away: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
    Inactive: { bg: "bg-slate-100", text: "text-slate-500", dot: "bg-slate-400" },
  };

  const style = styles[status] || styles.Inactive;

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[12px] font-medium px-2.5 py-1 rounded-full ${style.bg} ${style.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      {status}
    </span>
  );
}

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function TeamPage() {
  const router = useRouter();
  const [members, setMembers] = useState<TeamMemberItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  const loadMembers = useCallback(async () => {
    const token = localStorage.getItem("nexus_token");
    if (!token) {
      router.push("/login");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);

      const res = await fetch(`${API_URL}/api/team-members/register?${params.toString()}`, {
        headers: authHeaders(),
      });

      if (res.status === 401) {
        localStorage.removeItem("nexus_token");
        localStorage.removeItem("nexus_user");
        router.push("/login");
        return;
      }

      if (!res.ok) throw new Error();
      setMembers(await res.json());
    } catch {
      setError("Could not load team members. Is the API running?");
    } finally {
      setLoading(false);
    }
  }, [search, router]);

  useEffect(() => {
    const timeout = setTimeout(() => loadMembers(), 300);
    return () => clearTimeout(timeout);
  }, [loadMembers]);

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />

        <main className="flex-1 px-8 py-14 overflow-auto">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-start justify-between mb-10 gap-6">
              <div>
                <div className="text-sm text-slate-400 mb-3">Nexus / People & ownership</div>
                <h1 className="text-[28px] leading-tight font-semibold text-slate-900 tracking-tight">
                  People & ownership
                </h1>
                <p className="text-[15px] text-slate-500 mt-1.5">
                  Team members, roles, and product responsibilities.
                </p>
              </div>

              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-2 bg-[#2451B0] hover:bg-[#1D4291] text-white font-medium px-4 py-2.5 rounded-md transition-colors text-[14px] shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#2451B0]"
              >
                <UserPlus size={16} strokeWidth={2} />
                Add member
              </button>
            </div>

            {/* Search */}
            <div className="mb-6">
              <div className="relative max-w-md">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name, department, or product"
                  className={`${inputClass} pl-10`}
                />
              </div>
            </div>

            {/* Error State */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-[14px] text-red-800">{error}</p>
              </div>
            )}

            {/* Table */}
            <div className="rounded-lg border border-slate-200 overflow-hidden">
              {/* Table Header */}
              <div className="grid grid-cols-5 gap-4 px-5 py-3 bg-slate-50 border-b border-slate-200">
                <div className="text-[12px] font-medium text-slate-500">Employee</div>
                <div className="text-[12px] font-medium text-slate-500">Role</div>
                <div className="text-[12px] font-medium text-slate-500">Responsible products</div>
                <div className="text-[12px] font-medium text-slate-500">Responsibility</div>
                <div className="text-[12px] font-medium text-slate-500">Status</div>
              </div>

              {loading && (
                <div className="px-6 py-16 text-center">
                  <p className="text-[14px] text-slate-400">Loading team members…</p>
                </div>
              )}

              {!loading && members.length === 0 && (
                <div className="px-6 py-16 text-center">
                  <p className="text-[14px] text-slate-500">No team members recorded yet.</p>
                  <p className="text-[13px] text-slate-400 mt-1">
                    Add one with the button above.
                  </p>
                </div>
              )}

              <div className="divide-y divide-slate-200">
                {!loading &&
                  members.map((m) => (
                    <div
                      key={m.id}
                      className="grid grid-cols-5 gap-4 px-5 py-4 hover:bg-slate-50 transition-colors items-center"
                    >
                      {/* Employee */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-[#2451B0] text-white flex items-center justify-center text-[11px] font-semibold flex-shrink-0">
                          {initials(m.fullName)}
                        </div>
                        <div className="min-w-0">
                          <div className="text-[14px] font-medium text-slate-900 truncate">
                            {m.fullName}
                          </div>
                        </div>
                      </div>

                      {/* Role & Department */}
                      <div className="min-w-0">
                        <div className="text-[14px] text-slate-900 truncate">{m.jobTitle ?? "—"}</div>
                        {m.department && (
                          <div className="text-[12px] text-slate-500 mt-0.5 truncate">
                            {m.department}
                          </div>
                        )}
                      </div>

                      {/* Responsible Products */}
                      <div className="min-w-0">
                        <p className="text-[14px] text-slate-600 truncate">{m.responsibleProducts}</p>
                      </div>

                      {/* Responsibility Type */}
                      <div className="min-w-0">
                        <p className="text-[14px] text-slate-600 truncate">
                          {m.responsibilityType ?? "—"}
                        </p>
                      </div>

                      {/* Status */}
                      <div>
                        <StatusBadge status={m.status} />
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Results Count */}
            {!loading && members.length > 0 && (
              <div className="mt-4 text-[13px] text-slate-400">
                Showing {members.length} team member{members.length === 1 ? "" : "s"}
              </div>
            )}
          </div>
        </main>
      </div>

      {showAddModal && (
        <AddMemberModal
          onClose={() => setShowAddModal(false)}
          onSaved={() => {
            setShowAddModal(false);
            loadMembers();
          }}
        />
      )}
    </div>
  );
}

function AddMemberModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [fullName, setFullName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(STATUS_OPTIONS[0]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fullName.trim()) {
      setError("Name is required.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/team-members`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({
          fullName,
          jobTitle: jobTitle || null,
          department: department || null,
          email: email || null,
          status,
        }),
      });
      if (!res.ok) {
        setError("Failed to add member.");
        return;
      }
      onSaved();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      role="presentation"
      className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 px-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-member-title"
        className="bg-white rounded-lg shadow-xl w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 id="add-member-title" className="text-[17px] font-semibold text-slate-900">
            Add team member
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors rounded-md p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2451B0]"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[13px] font-medium text-slate-700 mb-1.5">
              Full name *
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="John Doe"
              className={inputClass}
              required
            />
          </div>

          <div>
            <label className="block text-[13px] font-medium text-slate-700 mb-1.5">
              Job title
            </label>
            <input
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="e.g. Product Manager"
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-[13px] font-medium text-slate-700 mb-1.5">
              Department
            </label>
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="e.g. Engineering"
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-[13px] font-medium text-slate-700 mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-[13px] font-medium text-slate-700 mb-1.5">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className={`${inputClass} appearance-none`}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s} className="text-slate-900">
                  {s}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-start gap-2">
              <AlertCircle size={14} className="text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-[13px] text-red-800">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-md text-[14px] font-medium hover:bg-slate-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2451B0]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2.5 bg-[#2451B0] hover:bg-[#1D4291] disabled:opacity-60 text-white rounded-md text-[14px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#2451B0]"
            >
              {submitting ? "Adding…" : "Add member"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}