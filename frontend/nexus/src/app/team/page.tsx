"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, UserPlus, X } from "lucide-react";
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

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Active: "border-[#6EAA99] text-[#267B67]",
    Away: "border-[#C2762E] text-[#A15F25]",
    Inactive: "border-gray-300 text-gray-500",
  };
  return (
    <span className={`text-[9px] font-mono tracking-wide px-1.5 py-[3px] border ${styles[status] ?? "border-gray-300 text-gray-500"}`}>
      {status.toUpperCase()}
    </span>
  );
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

      const res = await fetch(`${API_URL}/api/team-members/register?${params.toString()}`, { headers: authHeaders() });

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
    <div className="flex min-h-screen bg-[#F4F0E8]">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />

        <main className="flex-1 px-[30px] pt-[30px] pb-10">
          <div className="flex items-end justify-between">
            <div>
              <div className="text-[9px] uppercase tracking-[0.18em] text-[#C2762E] font-mono mb-3">
                System register
              </div>
              <h1 className="text-[36px] leading-none tracking-[-1.5px] font-semibold text-[#0B1E3A]">
                People & ownership
              </h1>
              <p className="text-[11px] text-[#7A8FA4] mt-5">
                The human index behind every product record — role, department, and responsibility type.
              </p>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 border border-gray-300 text-gray-700 text-[13px] font-medium px-4 h-[39px] rounded-md hover:bg-gray-50 transition-colors"
            >
              <UserPlus size={16} strokeWidth={1.8} />
              Add member
            </button>
          </div>

          <div className="border-t border-[#D3D3CF] mt-6 mb-6" />

          <div className="relative mb-6 max-w-md">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, department, or product"
              className="w-full border border-gray-300 bg-white rounded-lg pl-9 pr-3 py-2 text-[12px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3F84E5]/30 focus:border-[#3F84E5]"
            />
          </div>

          {error && <div className="text-[11px] text-red-600 mb-4">{error}</div>}

          <div className="bg-[#FAFAF8] border border-[#D2D5D3]">
            <div className="grid grid-cols-[1fr_1fr_1fr_140px_100px] px-[18px] py-2.5 border-b border-[#D8D9D7] text-[9px] uppercase tracking-[0.1em] font-mono text-[#698097]">
              <span>Employee</span>
              <span>Role / Department</span>
              <span>Responsible products</span>
              <span>Responsibility type</span>
              <span>Status</span>
            </div>

            {loading && <div className="px-[18px] py-8 text-[11px] text-[#8A99A7]">Loading team…</div>}
            {!loading && members.length === 0 && (
              <div className="px-[18px] py-8 text-[11px] text-[#8A99A7]">No team members recorded yet.</div>
            )}

            {!loading &&
              members.map((m) => (
                <div key={m.id} className="grid grid-cols-[1fr_1fr_1fr_140px_100px] items-center min-h-[70px] px-[18px] border-b border-[#E0E1DE] last:border-b-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#0B1E3A] text-white flex items-center justify-center text-[11px] font-semibold shrink-0">
                      {m.fullName.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()}
                    </div>
                    <span className="text-[12px] font-medium text-[#0B1E3A]">{m.fullName}</span>
                  </div>

                  <div>
                    <div className="text-[11px] text-[#0B1E3A]">{m.jobTitle ?? "—"}</div>
                    <div className="text-[9px] text-[#8A99A7]">{m.department ?? ""}</div>
                  </div>

                  <div className="text-[11px] text-[#8A99A7]">{m.responsibleProducts}</div>
                  <div className="text-[11px] text-[#4A5A6A]">{m.responsibilityType ?? "—"}</div>
                  <div>
                    <StatusBadge status={m.status} />
                  </div>
                </div>
              ))}
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
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-gray-900">Add member</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 mb-1.5">FULL NAME</label>
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 mb-1.5">JOB TITLE</label>
            <input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 mb-1.5">DEPARTMENT</label>
            <input value={department} onChange={(e) => setDepartment(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 mb-1.5">EMAIL</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 mb-1.5">STATUS</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          {error && <div className="text-xs text-red-600">{error}</div>}
          <button type="submit" disabled={submitting} className="w-full bg-[#0B1E3A] hover:bg-[#152C50] disabled:opacity-60 text-white text-sm font-semibold rounded-lg py-2.5">
            {submitting ? "Adding..." : "Add member"}
          </button>
        </form>
      </div>
    </div>
  );
}