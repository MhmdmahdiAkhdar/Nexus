"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, Filter, Plus, Building2, ChevronRight, AlertCircle } from "lucide-react";
import Sidebar from "../layout/Sidebar";
import Topbar from "../layout/Topbar";
import {isAdmin} from "../lib/auth";

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
  const colors: Record<string, { bg: string; text: string; border: string }> = {
    Active: { bg: "bg-green-100", text: "text-green-700", border: "border-green-300" },
    Onboarding: { bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-300" },
    Inactive: { bg: "bg-gray-100", text: "text-gray-700", border: "border-gray-300" },
  };

  const style = colors[status] || { bg: "bg-gray-100", text: "text-gray-700", border: "border-gray-300" };

  return (
    <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full border ${style.bg} ${style.text} ${style.border}`}>
      {status}
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
  const [admin, setAdmin] = useState(false);

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
    setAdmin(isAdmin());

    const timeout = setTimeout(() => loadClients(), 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, statusFilter]);

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />

        <main className="flex-1 px-12 py-8 overflow-auto">
          
          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Client Register</h1>
              <p className="text-gray-600 text-sm">Companies using IDS Fintech products and their deployments</p>
            </div>

            {admin && (
              <Link
              href="/clients/new"
              className="inline-flex items-center gap-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors shadow-sm"
            >
              <Plus size={18} strokeWidth={2} />
              Add Client
            </Link>
            )}            
            
          </div>

          {/* Search & Filter */}
          <div className="mb-6 flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Search</label>
              <div className="relative">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by company, country, or contact"
                  className="w-full border border-gray-300 rounded-lg pl-11 pr-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none border border-gray-300 bg-white rounded-lg pl-4 pr-10 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                >
                  <option value="">All Status</option>
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <Filter size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Table */}
          <div className="bg-white border border-gray-300 rounded-lg overflow-hidden">
            
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-gray-50 border-b border-gray-200">
              <div className="col-span-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">Company</div>
              <div className="col-span-2 text-xs font-semibold text-gray-700 uppercase tracking-wider">Country</div>
              <div className="col-span-2 text-xs font-semibold text-gray-700 uppercase tracking-wider">Contact</div>
              <div className="col-span-2 text-xs font-semibold text-gray-700 uppercase tracking-wider">Deployments</div>
              <div className="col-span-2 text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="px-6 py-12 text-center">
                <p className="text-sm text-gray-600">Loading clients…</p>
              </div>
            )}

            {/* Empty State */}
            {!loading && clients.length === 0 && (
              <div className="px-6 py-12 text-center">
                <Building2 size={32} className="text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-600">
                  {search || statusFilter ? "No clients match your search" : "No clients yet"}
                </p>
              </div>
            )}

            {/* Table Rows */}
            <div className="divide-y divide-gray-200">
              {!loading &&
                clients.map((client) => (
                  <Link
                    key={client.id}
                    href={`/clients/${client.id}`}
                    className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50 transition-colors items-center group"
                  >
                    {/* Company */}
                    <div className="col-span-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 flex-shrink-0">
                          <Building2 size={18} strokeWidth={1.5} />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-gray-900 truncate">{client.companyName}</div>
                          <div className="text-xs text-gray-600 mt-0.5 truncate">{client.recordCode}</div>
                        </div>
                      </div>
                    </div>

                    {/* Country */}
                    <div className="col-span-2">
                      <span className="text-sm text-gray-700">{client.country ?? "—"}</span>
                    </div>

                    {/* Contact */}
                    <div className="col-span-2">
                      <span className="text-sm text-gray-700">{client.primaryContactName ?? "—"}</span>
                    </div>

                    {/* Deployments */}
                    <div className="col-span-2">
                      <span className="text-sm text-gray-700">{client.deploymentsLabel}</span>
                    </div>

                    {/* Status */}
                    <div className="col-span-2 flex items-center justify-between">
                      <StatusBadge status={client.status} />
                      <ChevronRight size={18} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
                    </div>
                  </Link>
                ))}
            </div>
          </div>

          {/* Footer Info */}
          {!loading && clients.length > 0 && (
            <div className="mt-6 text-xs text-gray-600">
              Showing <span className="font-semibold text-gray-900">{clients.length}</span> client{clients.length === 1 ? "" : "s"}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}