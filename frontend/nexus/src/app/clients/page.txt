"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, Filter, Plus, Building2 } from "lucide-react";
import Sidebar from "../layout/Sidebar";
import Topbar from "../layout/Topbar";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const STATUS_OPTIONS = ["Active", "Onboarding", "Inactive"];

interface ClientListItem {
  id: number;
  recordCode: string;
  companyName: string;
  country: string | null;
  primaryContactName: string | null;
  deploymentsLabel: string;
  status: string;
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Active: "border-[#6EAA99] text-[#267B67]",
    Onboarding: "border-[#C2762E] text-[#A15F25]",
    Inactive: "border-gray-300 text-gray-500",
  };

  return (
    <span className={`text-[9px] font-mono tracking-wide px-1.5 py-[3px] border ${styles[status] ?? "border-gray-300 text-gray-500"}`}>
      {status.toUpperCase()}
    </span>
  );
}

export default function ClientsPage() {
  const router = useRouter();
  const [clients, setClients] = useState<ClientListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const loadClients = useCallback(async () => {
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
      if (statusFilter) params.set("status", statusFilter);

      const response = await fetch(`${API_URL}/api/clients?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401) {
        localStorage.removeItem("nexus_token");
        localStorage.removeItem("nexus_user");
        router.push("/login");
        return;
      }

      if (!response.ok) throw new Error("Failed to load clients.");
      setClients(await response.json());
    } catch (err) {
      console.error(err);
      setError("Could not load clients. Is the API running?");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, router]);

  useEffect(() => {
    const token = localStorage.getItem("nexus_token");
    if (!token) {
      router.push("/login");
      return;
    }

    const storedUser = localStorage.getItem("nexus_user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      if (user.mustChangePassword) {
        router.push("/change-password");
        return;
      }
    }

    const timeout = setTimeout(() => loadClients(), 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, statusFilter]);

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
                Client register
              </h1>
              <p className="text-[11px] text-[#7A8FA4] mt-5">
                Companies connected to IDS Fintech products and the deployments accountable to each relationship.
              </p>
            </div>

            <Link
              href="/clients/new"
              className="flex items-center gap-2 bg-[#0B1E3A] hover:bg-[#152C50] text-white text-[13px] font-medium px-4 h-[39px] transition-colors"
            >
              <Plus size={16} strokeWidth={1.8} />
              Add client
            </Link>
          </div>

          <div className="border-t border-[#D3D3CF] mt-6 mb-6" />

          <div className="flex items-center gap-3 mb-6">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search company, country, or contact"
                className="w-full border border-gray-300 bg-white rounded-lg pl-9 pr-3 py-2 text-[12px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3F84E5]/30 focus:border-[#3F84E5]"
              />
            </div>

            <div className="relative">
              <Filter size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none border border-gray-300 bg-white rounded-lg pl-8 pr-8 py-2 text-[12px] text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#3F84E5]/30 focus:border-[#3F84E5]"
              >
                <option value="">All status</option>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error && <div className="text-[11px] text-red-600 mb-4">{error}</div>}

          <div className="bg-[#FAFAF8] border border-[#D2D5D3]">
            <div className="grid grid-cols-[1fr_140px_160px_120px_100px_20px] px-[18px] py-2.5 border-b border-[#D8D9D7] text-[9px] uppercase tracking-[0.1em] font-mono text-[#698097]">
              <span>Company</span>
              <span>Country</span>
              <span>Primary contact</span>
              <span>Deployments</span>
              <span>Status</span>
              <span></span>
            </div>

            {loading && <div className="px-[18px] py-8 text-[11px] text-[#8A99A7]">Loading clients…</div>}

            {!loading && clients.length === 0 && (
              <div className="px-[18px] py-8 text-[11px] text-[#8A99A7]">
                No clients found{search || statusFilter ? " for this search/filter." : "."}
              </div>
            )}

            {!loading &&
              clients.map((client) => (
                <Link
                  key={client.id}
                  href={`/clients/${client.id}`}
                  className="grid grid-cols-[1fr_140px_160px_120px_100px_20px] items-center min-h-[70px] px-[18px] border-b border-[#E0E1DE] last:border-b-0 hover:bg-white transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-md border border-[#D2D5D3] bg-white flex items-center justify-center shrink-0">
                      <Building2 size={15} className="text-[#3F84E5]" />
                    </div>
                    <div>
                      <div className="text-[12px] font-medium text-[#0B1E3A]">{client.companyName}</div>
                      <div className="text-[9px] font-mono text-[#8A99A7] mt-0.5">{client.recordCode}</div>
                    </div>
                  </div>

                  <div className="text-[11px] text-[#4A5A6A]">{client.country ?? "—"}</div>
                  <div className="text-[11px] text-[#4A5A6A]">{client.primaryContactName ?? "—"}</div>
                  <div className="text-[11px] text-[#4A5A6A]">{client.deploymentsLabel}</div>
                  <div>
                    <StatusBadge status={client.status} />
                  </div>
                  <div className="text-[#8A99A7] text-[12px]">›</div>
                </Link>
              ))}
          </div>

          {!loading && (
            <p className="text-[10px] text-[#8A99A7] mt-3">
              {clients.length} of {clients.length} company records shown
            </p>
          )}
        </main>
      </div>
    </div>
  );
}