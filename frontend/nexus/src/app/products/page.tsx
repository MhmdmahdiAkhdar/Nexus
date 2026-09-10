"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, Filter, Plus, Package, ChevronRight } from "lucide-react";
import Sidebar from "../layout/Sidebar";
import Topbar from "../layout/Topbar";
import { isAdmin } from "../lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const LIFECYCLE_OPTIONS = ["Active", "Beta", "Deprecated"];

interface ProductListItem {
  id: number;
  recordCode: string;
  name: string;
  currentVersion: string | null;
  marketsCount: number;
  lifecycleStatus: string;
  criticality: string | null;
  accountableTeam: string;
}

function LifecycleBadge({ status }: { status: string }) {
  const styles: Record<string, { bg: string; text: string; border: string }> = {
    Active: { bg: "bg-green-100", text: "text-green-800", border: "border-green-300" },
    Beta: { bg: "bg-blue-100", text: "text-blue-800", border: "border-blue-300" },
    Deprecated: { bg: "bg-red-100", text: "text-red-800", border: "border-red-300" },
  };

  const style = styles[status] || { bg: "bg-gray-100", text: "text-gray-800", border: "border-gray-300" };

  return (
    <span className={`text-xs font-semibold px-2.5 py-1.5 rounded-full border inline-block ${style.bg} ${style.text} ${style.border}`}>
      {status}
    </span>
  );
}

function CriticalityBadge({ level }: { level: string | null }) {
  if (!level) return <span className="text-sm text-gray-500">—</span>;

  const colors: Record<string, string> = {
    Critical: "text-red-700 font-semibold",
    High: "text-orange-700 font-semibold",
    Medium: "text-yellow-700 font-semibold",
    Low: "text-green-700 font-semibold",
  };

  return <span className={`text-sm ${colors[level] || "text-gray-700"}`}>{level}</span>;
}

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [lifecycleFilter, setLifecycleFilter] = useState("");
  const [admin, setAdmin] = useState(false);

  const loadProducts = useCallback(async () => {
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
      if (lifecycleFilter) params.set("lifecycle", lifecycleFilter);

      const response = await fetch(`${API_URL}/api/products?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401) {
        localStorage.removeItem("nexus_token");
        localStorage.removeItem("nexus_user");
        router.push("/login");
        return;
      }

      if (!response.ok) throw new Error("Failed to load products.");

      setProducts(await response.json());
    } catch (err) {
      console.error(err);
      setError("Could not load products. Is the API running?");
    } finally {
      setLoading(false);
    }
  }, [search, lifecycleFilter, router]);

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

    const timeout = setTimeout(() => {
      loadProducts();
    }, 300);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, lifecycleFilter]);

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />

        <main className="flex-1 px-12 py-8 overflow-auto">
          
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Product Register</h1>
                <p className="text-gray-600 text-sm">Manage and track all software products in the IDS Fintech ecosystem</p>
              </div>
              {admin && (
                <Link
                  href="/products/new"
                  className="inline-flex items-center gap-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors duration-200 shadow-sm"
                >
                  <Plus size={18} strokeWidth={2.5} />
                  Create Product
                </Link>
              )}
            </div>
          </div>

          {/* Search & Filter Section */}
          <div className="mb-6 flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Search</label>
              <div className="relative">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name, record ID, or team"
                  className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Lifecycle</label>
              <div className="relative">
                <select
                  value={lifecycleFilter}
                  onChange={(e) => setLifecycleFilter(e.target.value)}
                  className="appearance-none border border-gray-300 rounded-lg pl-4 pr-10 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white"
                >
                  <option value="">All Status</option>
                  {LIFECYCLE_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                <Filter size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <span className="text-red-600 font-bold">!</span>
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Products Table */}
          <div className="bg-white border border-gray-300 rounded-lg overflow-hidden">
            
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-gray-50 border-b border-gray-300">
              <div className="col-span-4 text-xs font-semibold text-gray-700 uppercase tracking-wider">Product</div>
              <div className="col-span-2 text-xs font-semibold text-gray-700 uppercase tracking-wider">Version</div>
              <div className="col-span-2 text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</div>
              <div className="col-span-2 text-xs font-semibold text-gray-700 uppercase tracking-wider">Criticality</div>
              <div className="col-span-2 text-xs font-semibold text-gray-700 uppercase tracking-wider">Team</div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="px-6 py-12 text-center">
                <Package size={32} className="text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600 text-sm">Loading products…</p>
              </div>
            )}

            {/* Empty State */}
            {!loading && products.length === 0 && (
              <div className="px-6 py-12 text-center">
                <Package size={32} className="text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600 text-sm">
                  {search || lifecycleFilter ? "No products match your search" : "No products yet"}
                </p>
              </div>
            )}

            {/* Table Rows */}
            <div className="divide-y divide-gray-200">
              {!loading &&
                products.map((product) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.id}`}
                    className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer items-center group"
                  >
                    {/* Product Info */}
                    <div className="col-span-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Package size={16} className="text-blue-600" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-gray-900 truncate">{product.name}</div>
                          <div className="text-xs text-gray-600 mt-0.5 truncate">
                            {product.recordCode} • {product.marketsCount} market{product.marketsCount === 1 ? "" : "s"}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Version */}
                    <div className="col-span-2">
                      <span className="text-sm text-gray-700 font-medium">
                        {product.currentVersion ? `v${product.currentVersion}` : "—"}
                      </span>
                    </div>

                    {/* Status */}
                    <div className="col-span-2">
                      <LifecycleBadge status={product.lifecycleStatus} />
                    </div>

                    {/* Criticality */}
                    <div className="col-span-2">
                      <CriticalityBadge level={product.criticality} />
                    </div>

                    {/* Team */}
                    <div className="col-span-2 flex items-center justify-between">
                      <span className="text-sm text-gray-700">{product.accountableTeam}</span>
                      <ChevronRight size={16} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
                    </div>
                  </Link>
                ))}
            </div>
          </div>

          {/* Footer Info */}
          {!loading && products.length > 0 && (
            <div className="mt-6 text-xs text-gray-600">
              Showing <span className="font-semibold text-gray-900">{products.length}</span> product{products.length === 1 ? "" : "s"}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}