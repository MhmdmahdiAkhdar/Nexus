"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Shield, CheckCircle2, AlertCircle, Copy, UserPlus } from "lucide-react";
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

const inputClass =
  "w-full border border-slate-300 rounded-md px-3.5 py-2.5 text-[14px] text-slate-900 placeholder:text-slate-400 bg-white focus:outline-none focus:ring-2 focus:ring-[#2451B0]/20 focus:border-[#2451B0] transition-all";

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
  const [copiedPassword, setCopiedPassword] = useState(false);

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

  function copyPassword() {
    if (invitedResult) {
      navigator.clipboard.writeText(invitedResult.tempPassword);
      setCopiedPassword(true);
      setTimeout(() => setCopiedPassword(false), 2000);
    }
  }

  function initials(name: string) {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />

        <main className="flex-1 px-8 py-14 overflow-auto">
          <div className="max-w-6xl mx-auto">
            
            <div className="mb-10">
              <div className="text-sm text-slate-400 mb-3">Nexus / Settings / Access control</div>
              <h1 className="text-[28px] leading-tight font-semibold text-slate-900 tracking-tight">
                Access control
              </h1>
              <p className="text-[15px] text-slate-500 mt-1.5">
                Manage who can sign in and what they're allowed to do.
              </p>
            </div>

            
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-[14px] text-red-800">{error}</p>
              </div>
            )}

            
            <div className="grid grid-cols-3 gap-8">
              
              <div className="col-span-2">
                <div className="flex items-baseline justify-between mb-3 px-0.5">
                  <h2 className="text-[13px] font-medium text-slate-500">Employee accounts</h2>
                  <span className="text-[13px] text-slate-400">{users.length} total</span>
                </div>

                <div className="rounded-lg border border-slate-200 overflow-hidden">
                  {loading && (
                    <div className="px-6 py-16 text-center">
                      <p className="text-[14px] text-slate-400">Loading accounts…</p>
                    </div>
                  )}

                  {!loading && users.length === 0 && (
                    <div className="px-6 py-16 text-center">
                      <p className="text-[14px] text-slate-500">No employee accounts yet.</p>
                      <p className="text-[13px] text-slate-400 mt-1">
                        Create one from the panel on the right.
                      </p>
                    </div>
                  )}

                  <div className="divide-y divide-slate-200">
                    {users.map((u) => (
                      <div
                        key={u.id}
                        className="flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-full bg-[#2451B0] text-white flex items-center justify-center text-[11px] font-semibold flex-shrink-0">
                            {initials(u.fullName)}
                          </div>
                          <div className="min-w-0">
                            <div className="text-[14px] font-medium text-slate-900 truncate">
                              {u.fullName}
                            </div>
                            <div className="text-[13px] text-slate-500 truncate">{u.email}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 flex-shrink-0">
                          <span className="text-[13px] font-medium text-slate-600 min-w-fit">
                            {u.roleName}
                          </span>

                          <span
                            className={`inline-flex items-center gap-1.5 text-[12px] font-medium px-2.5 py-1 rounded-full ${
                              u.isActive
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                u.isActive ? "bg-emerald-500" : "bg-slate-400"
                              }`}
                            />
                            {u.isActive ? "Active" : "Inactive"}
                          </span>

                          <button
                            onClick={() => toggleActive(u)}
                            className="p-1.5 rounded-md text-slate-400 hover:text-[#2451B0] hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2451B0]"
                            title={u.isActive ? "Deactivate account" : "Activate account"}
                          >
                            {u.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              
              <div className="space-y-8">
                
                <div>
                  <h2 className="text-[13px] font-medium text-slate-500 mb-3 px-0.5">
                    Create account
                  </h2>
                  <div className="rounded-lg border border-slate-200 p-5">
                    <form onSubmit={handleInvite} className="space-y-4">
                      <div>
                        <label className="block text-[13px] font-medium text-slate-700 mb-1.5">
                          Email address
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="name@idsfintech.com"
                          className={inputClass}
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[13px] font-medium text-slate-700 mb-1.5">
                          Full name
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
                          Permission set
                        </label>
                        <select
                          value={roleId}
                          onChange={(e) => setRoleId(e.target.value)}
                          className={`${inputClass} appearance-none`}
                          required
                        >
                          <option value="" className="text-slate-400">
                            Select a role…
                          </option>
                          {roles.map((r) => (
                            <option key={r.id} value={r.id} className="text-slate-900">
                              {r.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {inviteError && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-start gap-2">
                          <AlertCircle size={14} className="text-red-600 flex-shrink-0 mt-0.5" />
                          <p className="text-[13px] text-red-800">{inviteError}</p>
                        </div>
                      )}

                      {invitedResult && (
                        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-md space-y-3">
                          <div className="flex items-start gap-2">
                            <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-[14px] font-medium text-emerald-900">
                                Account created
                              </p>
                              <p className="text-[13px] text-emerald-700 mt-0.5">
                                {invitedResult.email}
                              </p>
                            </div>
                          </div>

                          <div className="bg-white border border-emerald-200 rounded-md p-3">
                            <p className="text-[12px] text-slate-500 mb-1.5">
                              Temporary password
                            </p>
                            <div className="flex items-center gap-2">
                              <code className="flex-1 text-[13px] font-mono font-medium text-slate-900 truncate">
                                {invitedResult.tempPassword}
                              </code>
                              <button
                                type="button"
                                onClick={copyPassword}
                                className="p-1.5 rounded-md text-slate-400 hover:text-[#2451B0] hover:bg-slate-100 transition-colors"
                              >
                                <Copy size={14} />
                              </button>
                            </div>
                            {copiedPassword && (
                              <p className="text-[12px] text-emerald-700 mt-2">
                                Copied to clipboard
                              </p>
                            )}
                          </div>

                          <p className="text-[12px] text-emerald-700">
                            Share this password directly. They'll be asked to change it on
                            first login.
                          </p>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-[#2451B0] hover:bg-[#1D4291] disabled:opacity-60 text-white font-medium py-2.5 rounded-md transition-colors text-[14px] flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#2451B0]"
                      >
                        <UserPlus size={15} />
                        {submitting ? "Creating…" : "Create account"}
                      </button>
                    </form>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}