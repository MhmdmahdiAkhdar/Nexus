"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, Plus, Layers3, AlertCircle, ChevronRight } from "lucide-react";
import Sidebar from "../layout/Sidebar";
import Topbar from "../layout/Topbar";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const ENVIRONMENT_OPTIONS = ["Development", "Test", "UAT", "Production"];
const STATUS_OPTIONS = ["Pilot", "In Progress", "Live"];

interface DeploymentListItem {
  id: number;
  recordCode: string;
  clientName: string;
  productName: string;
  productVersion: string | null;
  modulesCount: number;
  goLiveDate: string | null;
  currentStage: string;
  deploymentStatus: string;
}

interface Option {
  id: number;
  companyName?: string;
  name?: string;
}

// Environment badge — mirrors the rounded-pill badge style used for document type elsewhere in the app.
function EnvironmentBadge({ stage }: { stage: string }) {
  const styles: Record<string, string> = {
    Production: "bg-green-100 text-green-700",
    UAT: "bg-orange-100 text-orange-700",
    Test: "bg-blue-100 text-blue-700",
    Development: "bg-blue-100 text-blue-700",
    "Not deployed": "bg-gray-100 text-gray-600",
  };

  return (
    <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full ${styles[stage] ?? "bg-gray-100 text-gray-600"}`}>
      {stage}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Live: "bg-green-100 text-green-700",
    "In Progress": "bg-blue-100 text-blue-700",
    Pilot: "bg-orange-100 text-orange-700",
  };

  return (
    <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full ${styles[status] ?? "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
}

export default function DeploymentsPage() {
  const router = useRouter();
  const [deployments, setDeployments] = useState<DeploymentListItem[]>([]);
  const [clients, setClients] = useState<Option[]>([]);
  const [products, setProducts] = useState<Option[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [productId, setProductId] = useState("");
  const [clientId, setClientId] = useState("");
  const [version, setVersion] = useState("");
  const [environment, setEnvironment] = useState("");
  const [status, setStatus] = useState("");

  const loadDeployments = useCallback(async () => {
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
      if (productId) params.set("productId", productId);
      if (clientId) params.set("clientId", clientId);
      if (version) params.set("version", version);
      if (environment) params.set("environment", environment);
      if (status) params.set("status", status);

      const response = await fetch(`${API_URL}/api/deployments?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401) {
        localStorage.removeItem("nexus_token");
        localStorage.removeItem("nexus_user");
        router.push("/login");
        return;
      }

      if (!response.ok) throw new Error("Failed to load deployments.");
      setDeployments(await response.json());
    } catch (err) {
      console.error(err);
      setError("Could not load deployments. Is the API running?");
    } finally {
      setLoading(false);
    }
  }, [search, productId, clientId, version, environment, status, router]);

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

    const headers = { Authorization: `Bearer ${token}` };
    fetch(`${API_URL}/api/deployments/options/clients`, { headers })
      .then((r) => r.json())
      .then(setClients)
      .catch(() => setClients([]));
    fetch(`${API_URL}/api/deployments/options/products`, { headers })
      .then((r) => r.json())
      .then(setProducts)
      .catch(() => setProducts([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => loadDeployments(), 300);
    return () => clearTimeout(timeout);
  }, [loadDeployments]);

  const selectClass =
    "border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all";

  const hasFilters = Boolean(search || productId || clientId || version || environment || status);

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />

        <main className="flex-1 px-12 py-8 overflow-auto">

          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Deployment Register</h1>
              <p className="text-gray-600 text-sm">Which version is running for which client, and where it stands</p>
            </div>

            <Link
              href="/deployments/new"
              className="inline-flex items-center gap-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors shadow-sm"
            >
              <Plus size={18} strokeWidth={2} />
              Create Deployment
            </Link>
          </div>

          {/* Search + Filters */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <div className="relative flex-1 min-w-[220px] max-w-md">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search client or product"
                aria-label="Search deployments"
                className="w-full border border-gray-300 rounded-lg pl-11 pr-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>

            <select value={productId} onChange={(e) => setProductId(e.target.value)} className={selectClass}>
              <option value="">All products</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>

            <select value={clientId} onChange={(e) => setClientId(e.target.value)} className={selectClass}>
              <option value="">All clients</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.companyName}
                </option>
              ))}
            </select>

            <input
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              placeholder="Version"
              className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-500 w-28 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />

            <select value={environment} onChange={(e) => setEnvironment(e.target.value)} className={selectClass}>
              <option value="">All environments</option>
              {ENVIRONMENT_OPTIONS.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </select>

            <select value={status} onChange={(e) => setStatus(e.target.value)} className={selectClass}>
              <option value="">All status</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Error Alert */}
          {error && (
            <div role="alert" className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Table */}
          <div className="bg-white border border-gray-300 rounded-lg overflow-hidden">

            {/* Header */}
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Deployments • <span className="font-bold text-gray-900">{deployments.length}</span> indexed
              </p>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="px-6 py-12 text-center">
                <p className="text-sm text-gray-600">Loading deployments…</p>
              </div>
            )}

            {/* Empty State */}
            {!loading && deployments.length === 0 && (
              <div className="px-6 py-12 text-center">
                <Layers3 size={32} className="text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-600">
                  {hasFilters ? "No deployments match these filters." : "No deployments recorded yet."}
                </p>
              </div>
            )}

            {/* Table Rows */}
            <div className="divide-y divide-gray-200">
              {!loading &&
                deployments.map((d) => (
                  <Link
                    key={d.id}
                    href={`/deployments/${d.id}`}
                    className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50 transition-colors items-center"
                  >
                    {/* Deployment / Client / Product */}
                    <div className="col-span-4 flex items-start gap-3">
                      <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 flex-shrink-0 mt-0.5">
                        <Layers3 size={18} strokeWidth={1.5} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs text-gray-600 font-medium uppercase tracking-wide">
                          {d.recordCode}
                        </div>
                        <div className="text-sm font-semibold text-gray-900 mt-1 truncate">
                          {d.clientName}
                        </div>
                        <div className="text-xs text-gray-500 truncate">{d.productName}</div>
                      </div>
                    </div>

                    {/* Version */}
                    <div className="col-span-1">
                      <p className="text-sm text-gray-700">{d.productVersion ? `v${d.productVersion}` : "—"}</p>
                    </div>

                    {/* Modules */}
                    <div className="col-span-1">
                      <p className="text-sm text-gray-700">{d.modulesCount}</p>
                    </div>

                    {/* Go-live */}
                    <div className="col-span-2">
                      <p className="text-xs text-gray-600">
                        {d.goLiveDate ? new Date(d.goLiveDate).toLocaleDateString() : "—"}
                      </p>
                    </div>

                    {/* Status */}
                    <div className="col-span-2">
                      <StatusBadge status={d.deploymentStatus} />
                    </div>

                    {/* Environment */}
                    <div className="col-span-1">
                      <EnvironmentBadge stage={d.currentStage} />
                    </div>

                    {/* Chevron */}
                    <div className="col-span-1 flex justify-end">
                      <ChevronRight size={16} className="text-gray-400" />
                    </div>
                  </Link>
                ))}
            </div>
          </div>

          {/* Results Count */}
          {!loading && deployments.length > 0 && (
            <div className="mt-6 text-xs text-gray-600">
              Showing <span className="font-semibold text-gray-900">{deployments.length}</span> deployment{deployments.length === 1 ? "" : "s"}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}