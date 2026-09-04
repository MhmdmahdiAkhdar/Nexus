"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, Filter, Plus, Boxes } from "lucide-react";
import Sidebar from "../layout/Sidebar";
import Topbar from "../layout/Topbar";

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
  const styles: Record<string, string> = {
    Active: "border-[#6EAA99] text-[#267B67]",
    Beta: "border-[#82A7C4] text-[#36719C]",
    Deprecated: "border-[#C2762E] text-[#A15F25]",
  };

  return (
    <span
      className={`text-[9px] font-mono tracking-wide px-1.5 py-[3px] border ${
        styles[status] ?? "border-gray-300 text-gray-500"
      }`}
    >
      {status.toUpperCase()}
    </span>
  );
}

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [lifecycleFilter, setLifecycleFilter] = useState("");

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

    const timeout = setTimeout(() => {
      loadProducts();
    }, 300);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, lifecycleFilter]);

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
                Product register
              </h1>
              <p className="text-[11px] text-[#7A8FA4] mt-5">
                A traceable catalogue of every software product delivered by IDS Fintech.
              </p>
            </div>

            <Link
              href="/products/new"
              className="flex items-center gap-2 bg-[#0B1E3A] hover:bg-[#152C50] text-white text-[13px] font-medium px-4 h-[39px] transition-colors"
            >
              <Plus size={16} strokeWidth={1.8} />
              Create product
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
                placeholder="Search name, record ID, or team"
                className="w-full border border-gray-300 bg-white rounded-lg pl-9 pr-3 py-2 text-[12px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3F84E5]/30 focus:border-[#3F84E5]"
              />
            </div>

            <div className="relative">
              <Filter size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <select
                value={lifecycleFilter}
                onChange={(e) => setLifecycleFilter(e.target.value)}
                className="appearance-none border border-gray-300 bg-white rounded-lg pl-8 pr-8 py-2 text-[12px] text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#3F84E5]/30 focus:border-[#3F84E5]"
              >
                <option value="">All lifecycle</option>
                {LIFECYCLE_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error && <div className="text-[11px] text-red-600 mb-4">{error}</div>}

          <div className="bg-[#FAFAF8] border border-[#D2D5D3]">
            <div className="grid grid-cols-[1fr_100px_120px_120px_1fr_20px] px-[18px] py-2.5 border-b border-[#D8D9D7] text-[9px] uppercase tracking-[0.1em] font-mono text-[#698097]">
              <span>Product / Record</span>
              <span>Version</span>
              <span>Lifecycle</span>
              <span>Criticality</span>
              <span>Accountable team</span>
              <span></span>
            </div>

            {loading && <div className="px-[18px] py-8 text-[11px] text-[#8A99A7]">Loading products…</div>}

            {!loading && products.length === 0 && (
              <div className="px-[18px] py-8 text-[11px] text-[#8A99A7]">
                No products found{search || lifecycleFilter ? " for this search/filter." : "."}
              </div>
            )}

            {!loading &&
              products.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  className="grid grid-cols-[1fr_100px_120px_120px_1fr_20px] items-center min-h-[70px] px-[18px] border-b border-[#E0E1DE] last:border-b-0 hover:bg-white transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-md border border-[#D2D5D3] bg-white flex items-center justify-center shrink-0">
                      <Boxes size={15} className="text-[#3F84E5]" />
                    </div>
                    <div>
                      <div className="text-[12px] font-medium text-[#0B1E3A]">{product.name}</div>
                      <div className="text-[9px] font-mono text-[#8A99A7] mt-0.5">
                        {product.recordCode} · {product.marketsCount} market{product.marketsCount === 1 ? "" : "s"}
                      </div>
                    </div>
                  </div>

                  <div className="text-[11px] text-[#4A5A6A]">
                    {product.currentVersion ? `v${product.currentVersion}` : "—"}
                  </div>

                  <div>
                    <LifecycleBadge status={product.lifecycleStatus} />
                  </div>

                  <div className="text-[11px] text-[#3F84E5]">{product.criticality ?? "—"}</div>

                  <div className="text-[11px] text-[#A15F25]">{product.accountableTeam}</div>

                  <div className="text-[#8A99A7] text-[12px]">›</div>
                </Link>
              ))}
          </div>
        </main>
      </div>
    </div>
  );
}