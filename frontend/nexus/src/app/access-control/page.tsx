"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ShieldCheck, X, Check } from "lucide-react";
import Sidebar from "../layout/Sidebar";
import Topbar from "../layout/Topbar";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface UserItem {
  id: number;
  fullName: string;
  email: string;
  roleName: string;
  isActive: boolean;
}

interface RoleItem {
  id: number;
  name: string;
  permissionsCount: number;
}

function authHeaders() {
  const token = localStorage.getItem("nexus_token");
  return { Authorization: `Bearer ${token}` };
}

export default function AccessControlPage() {
  const router = useRouter();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [roleId, setRoleId] = useState("");
  const [inviteError, setInviteError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [invitedResult, setInvitedResult] = useState<{ email: string; tempPassword: string } | null>(null);

  async function loadAll() {
    const [usersRes, rolesRes] = await Promise.all([
      fetch(`${API_URL}/api/users`, { headers: authHeaders() }),
      fetch(`${API_URL}/api/roles`, { headers: authHeaders() }),
    ]);
    if (usersRes.ok) setUsers(await usersRes.json());
    if (rolesRes.ok) setRoles(await rolesRes.json());
  }

  useEffect(() => {
    const token = localStorage.getItem("nexus_token");
    if (!token) {
      router.push("/login");
      return;
    }

    async function init() {
      setLoading(true);
      try {
        await loadAll();
      } catch {
        setError("Could not load access control data. Is the API running?");
      } finally {
        setLoading(false);
      }
    }
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function toggleActive(user: UserItem) {
    await fetch(`${API_URL}/api/users/${user.id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ isActive: !user.isActive }),
    });
    loadAll();
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setInviteError("");
    setInvitedResult(null);

    if (!email.trim() || !fullName.trim() || !roleId) {
      setInviteError("Email, name, and permission set are required.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ email, fullName, roleId: Number(roleId) }),
      });

      const data = await res.json();
      if (!res.ok) {
        setInviteError(data?.message ?? "Failed to create account.");
        return;
      }

      setInvitedResult({ email: data.email, tempPassword: data.temporaryPassword });
      setEmail("");
      setFullName("");
      setRoleId("");
      loadAll();
    } catch {
      setInviteError("Could not reach the server.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-[#F4F0E8]">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />

        <main className="flex-1 px-[30px] pt-[30px] pb-10">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-[9px] uppercase tracking-[0.18em] text-[#C2762E] font-mono mb-3">
                System register
              </div>
              <h1 className="text-[32px] leading-none tracking-[-1.2px] font-semibold text-[#0B1E3A]">
                Access control
              </h1>
              <p className="text-[11px] text-[#7A8FA4] mt-3">
                Create employee accounts, assign permission sets, and keep access current.
              </p>
            </div>
          </div>

          <div className="border-t border-[#D3D3CF] mt-6 mb-6" />

          {error && <div className="text-[11px] text-red-600 mb-4">{error}</div>}

          <div className="grid grid-cols-[1fr_320px] gap-5">
            <section className="bg-[#FAFAF8] border border-[#D2D5D3] p-6">
              <div className="text-[9px] uppercase tracking-wide text-[#8A99A7] font-mono mb-1">
                Employee accounts / {users.length} records
              </div>
              <h3 className="text-[14px] font-semibold text-[#0B1E3A] mb-4">Workspace access</h3>

              {loading && <p className="text-[11px] text-[#8A99A7]">Loading…</p>}

              <div className="space-y-1">
                {users.map((u) => (
                  <div key={u.id} className="flex items-center gap-3 py-3 border-b border-[#E0E1DE] last:border-b-0">
                    <div className="w-8 h-8 rounded-full bg-[#0B1E3A] text-white flex items-center justify-center text-[11px] font-semibold shrink-0">
                      {u.fullName.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] font-medium text-[#0B1E3A]">{u.fullName}</div>
                      <div className="text-[10px] text-[#8A99A7]">{u.email}</div>
                    </div>
                    <div className="text-[11px] text-[#4A5A6A] w-32 shrink-0">{u.roleName}</div>
                    <span className={`text-[9px] font-mono px-2 py-1 border shrink-0 ${u.isActive ? "border-[#6EAA99] text-[#267B67]" : "border-gray-300 text-gray-400"}`}>
                      {u.isActive ? "ACTIVE" : "INACTIVE"}
                    </span>
                    <button onClick={() => toggleActive(u)} className="text-[#3F84E5] hover:text-[#0B1E3A] shrink-0" title={u.isActive ? "Deactivate" : "Activate"}>
                      {u.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                  </div>
                ))}
              </div>
            </section>

            <div className="space-y-5">
              <section className="bg-white border border-[#D2D5D3] p-5">
                <div className="text-[9px] uppercase tracking-wide text-[#8A99A7] font-mono mb-1">Invite employee</div>
                <h3 className="text-[14px] font-semibold text-[#0B1E3A] mb-4">Create a scoped account</h3>

                <form onSubmit={handleInvite} className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 mb-1">EMPLOYEE EMAIL</label>
                    <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@idsfintech.com" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 mb-1">FULL NAME</label>
                    <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-gray-500 mb-1">PERMISSION SET</label>
                    <select value={roleId} onChange={(e) => setRoleId(e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
                      <option value="">Select...</option>
                      {roles.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {inviteError && <div className="text-xs text-red-600">{inviteError}</div>}

                  {invitedResult && (
                    <div className="bg-[#EEF6EF] border border-[#6EAA99] rounded-md p-3 text-[11px] text-[#267B67]">
                      <div className="flex items-center gap-1.5 font-medium mb-1">
                        <Check size={13} /> Account created for {invitedResult.email}
                      </div>
                      <div>
                        Temporary password: <span className="font-mono font-semibold">{invitedResult.tempPassword}</span>
                      </div>
                      <div className="text-[10px] text-[#4A947E] mt-1">
                        No email was sent — share this with them directly. They'll be required to change it on first login.
                      </div>
                    </div>
                  )}

                  <button type="submit" disabled={submitting} className="w-full bg-[#0B1E3A] hover:bg-[#152C50] disabled:opacity-60 text-white text-sm font-semibold rounded-md py-2.5">
                    {submitting ? "Creating..." : "+ Prepare invitation"}
                  </button>
                </form>
              </section>

              <section className="bg-white border border-[#D2D5D3] p-5">
                <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-wide text-[#8A99A7] font-mono mb-3">
                  <ShieldCheck size={12} /> Permission sets
                </div>
                <div className="space-y-2">
                  {roles.map((r) => (
                    <div key={r.id} className="flex items-center justify-between text-[12px]">
                      <span className="flex items-center gap-1.5 text-[#267B67]">
                        <Check size={13} /> {r.name}
                      </span>
                      <span className="text-[#8A99A7]">{r.permissionsCount} permissions</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}