"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Sidebar from "../../app/layout/Sidebar";
import Topbar from "../../app/layout/Topbar";

import { AlertCircle, ShieldCheck, TrendingUp, Users, Package, Zap } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface DashboardStats {
  totalProducts: number;
  activeProducts: number;
  clientCompanies: number;
  totalDeployments: number;
  liveDeployments: number;
  totalTeamMembers: number;
  pendingItems: number;
}

interface RecentProduct {
  id: number;
  name: string;
  lifecycleStatus: string;
  currentVersion: string | null;
  updatedAt: string;
}

interface AttentionItem {
  deploymentId: number;
  clientName: string;
  productName: string;
  deploymentStatus: string;
  goLiveDate: string | null;
}

interface EnvironmentReadiness {
  totalEnvironments: number;
  configuredEnvironments: number;
  percentageConfigured: number;
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, { bg: string; text: string; dot: string }> = {
    Active: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
    Live: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
    Beta: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
    Staging: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
    Deprecated: { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500" },
  };

  const style = styles[status] || { bg: "bg-slate-100", text: "text-slate-500", dot: "bg-slate-400" };

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${style.bg} ${style.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      {status}
    </span>
  );
}

function timeAgo(dateString: string): string {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  return `${days}d ago`;
}

const STAT_CARDS = [
  { key: "totalProducts", label: "Products", icon: Package, sub: (s: DashboardStats) => `${s.activeProducts} active` },
  { key: "totalDeployments", label: "Deployments", icon: Zap, sub: (s: DashboardStats) => `${s.liveDeployments} live` },
  { key: "clientCompanies", label: "Clients", icon: TrendingUp, sub: () => "Active partners" },
  { key: "totalTeamMembers", label: "Team", icon: Users, sub: () => "Team members" },
] as const;

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentProducts, setRecentProducts] = useState<RecentProduct[]>([]);
  const [attentionItems, setAttentionItems] = useState<AttentionItem[]>([]);
  const [readiness, setReadiness] = useState<EnvironmentReadiness | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("nexus_token");
    if (!token) {
      router.push("/login");
      return;
    }

    const storedUser = localStorage.getItem("nexus_user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if (user.mustChangePassword) {
          router.push("/change-password");
          return;
        }
      } catch {
        // ignore malformed cache
      }
    }

    async function loadDashboard() {
      try {
        const headers = { Authorization: `Bearer ${token}` };

        const [statsRes, productsRes, attentionRes, readinessRes] = await Promise.all([
          fetch(`${API_URL}/api/dashboard/stats`, { headers }),
          fetch(`${API_URL}/api/dashboard/recent-products?limit=5`, { headers }),
          fetch(`${API_URL}/api/dashboard/needs-attention?limit=5`, { headers }),
          fetch(`${API_URL}/api/dashboard/environment-readiness`, { headers }),
        ]);

        if (
          statsRes.status === 401 ||
          productsRes.status === 401 ||
          attentionRes.status === 401 ||
          readinessRes.status === 401
        ) {
          localStorage.removeItem("nexus_token");
          localStorage.removeItem("nexus_user");
          router.push("/login");
          return;
        }

        if (!statsRes.ok || !productsRes.ok || !attentionRes.ok || !readinessRes.ok) {
          throw new Error("Failed to load dashboard data.");
        }

        setStats(await statsRes.json());
        setRecentProducts(await productsRes.json());
        setAttentionItems(await attentionRes.json());
        setReadiness(await readinessRes.json());
      } catch (err) {
        console.error(err);
        setError("Could not load dashboard data. Is the API running?");
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [router]);

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />

        <main className="flex-1 px-8 py-14 overflow-auto">
          <div className="max-w-6xl mx-auto">
            
            {/* Header */}
            <div className="mb-10">
              <div className="text-sm text-slate-400 mb-3">Nexus / Dashboard</div>
              <h1 className="text-4xl leading-tight font-semibold text-slate-900 tracking-tight">
                Dashboard
              </h1>
              <p className="text-base text-slate-500 mt-2">
                Monitor your products, deployments, and team operations.
              </p>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Stats Section */}
            {loading ? (
              <div className="text-sm text-slate-400 mb-10">Loading dashboard…</div>
            ) : (
              stats && (
                <div className="mb-10">
                  <h2 className="text-xs font-semibold text-slate-600 mb-4 px-0.5 uppercase tracking-wider">Key Metrics</h2>
                  <div className="grid grid-cols-4 gap-4">
                    {STAT_CARDS.map(({ key, label, icon: Icon, sub }) => (
                      <div
                        key={key}
                        className="rounded-lg border border-slate-200 p-5 hover:border-slate-300 hover:shadow-sm transition-all"
                      >
                        <div className="flex items-start justify-between mb-5">
                          <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider">{label}</div>
                          <Icon size={16} className="text-slate-400" strokeWidth={1.75} />
                        </div>
                        <div className="text-3xl font-bold text-slate-900 leading-none mb-2">
                          {stats[key as keyof DashboardStats]}
                        </div>
                        <div className="text-xs text-slate-500">{sub(stats)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            )}

            {/* Main Content Grid */}
            <div className="grid grid-cols-3 gap-8">
              
              {/* Recent Products */}
              <div className="col-span-2">
                <div className="flex items-center justify-between mb-4 px-0.5">
                  <h2 className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Recent Products</h2>
                  <Link
                    href="/products"
                    className="text-xs text-blue-600 hover:text-blue-800 font-semibold transition-colors"
                  >
                    View all →
                  </Link>
                </div>

                <div className="rounded-lg border border-slate-200 overflow-hidden">
                  {recentProducts.length === 0 && !loading && (
                    <div className="px-6 py-16 text-center">
                      <Package size={28} className="text-slate-300 mx-auto mb-3" strokeWidth={1.5} />
                      <p className="text-sm text-slate-500">No products yet</p>
                    </div>
                  )}

                  <div className="divide-y divide-slate-200">
                    {recentProducts.map((product) => (
                      <Link
                        key={product.id}
                        href={`/products/${product.id}`}
                        className="flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs flex-shrink-0">
                            {product.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-semibold text-slate-900 truncate">
                              {product.name}
                            </div>
                            <div className="text-xs text-slate-500 mt-1">
                              {product.currentVersion ? `v${product.currentVersion}` : "No release"}
                            </div>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0 pl-4">
                          <StatusBadge status={product.lifecycleStatus} />
                          <div className="text-xs text-slate-400 mt-2">
                            {timeAgo(product.updatedAt)}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Sidebar */}
              <div className="flex flex-col gap-8">
                
                {/* Needs Attention */}
                <div>
                  <h2 className="text-xs font-semibold text-slate-600 mb-4 px-0.5 uppercase tracking-wider">Needs Attention</h2>
                  <div className="rounded-lg border border-slate-200 overflow-hidden">
                    {attentionItems.length === 0 && (
                      <div className="px-5 py-10 text-center">
                        <ShieldCheck size={22} className="text-emerald-500 mx-auto mb-2" strokeWidth={1.75} />
                        <p className="text-xs text-slate-500 font-medium">All systems healthy</p>
                      </div>
                    )}

                    <div className="divide-y divide-slate-200">
                      {attentionItems.map((item) => (
                        <div
                          key={item.deploymentId}
                          className="px-4 py-4 hover:bg-amber-50/40 transition-colors border-l-2 border-l-amber-400"
                        >
                          <div className="flex gap-3 items-start">
                            <AlertCircle size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-semibold text-slate-900 truncate">
                                {item.productName}
                              </div>
                              <div className="text-xs text-slate-500 mt-0.5 truncate">
                                {item.clientName}
                              </div>
                              <div className="text-xs text-slate-700 font-medium mt-2">
                                {item.deploymentStatus}
                              </div>
                              {item.goLiveDate && (
                                <div className="text-xs text-amber-700 font-medium mt-1">
                                  Go-live:{" "}
                                  {new Date(item.goLiveDate).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Environment Readiness */}
                <div>
                  <h2 className="text-xs font-semibold text-slate-600 mb-4 px-0.5 uppercase tracking-wider">Environment Status</h2>
                  <div className="rounded-lg border border-slate-200 p-5">
                    {readiness && (
                      <>
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <div className="text-sm font-bold text-slate-900">
                              {readiness.configuredEnvironments} of {readiness.totalEnvironments}
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5">
                              environments configured
                            </div>
                          </div>
                          <ShieldCheck size={18} className="text-emerald-500" strokeWidth={1.75} />
                        </div>

                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-3">
                          <div
                            className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                            style={{ width: `${readiness.percentageConfigured}%` }}
                          />
                        </div>

                        <p className="text-xs text-slate-500">
                          {readiness.percentageConfigured}% ready for production
                        </p>
                      </>
                    )}
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