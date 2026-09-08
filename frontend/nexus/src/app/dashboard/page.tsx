"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../../app/layout/Sidebar";
import Topbar from "../../app/layout/Topbar";

import { Plus, AlertCircle, ShieldCheck, TrendingUp, Users, Package, Zap } from "lucide-react";

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
  const styleMap: Record<string, { bg: string; text: string; border: string }> = {
    Active: { bg: "bg-green-100", text: "text-green-800", border: "border-green-300" },
    Beta: { bg: "bg-blue-100", text: "text-blue-800", border: "border-blue-300" },
    Deprecated: { bg: "bg-red-100", text: "text-red-800", border: "border-red-300" },
    Live: { bg: "bg-emerald-100", text: "text-emerald-800", border: "border-emerald-300" },
    Staging: { bg: "bg-yellow-100", text: "text-yellow-800", border: "border-yellow-300" },
  };

  const style = styleMap[status] || { bg: "bg-gray-100", text: "text-gray-800", border: "border-gray-300" };

  return (
    <span className={`inline-block text-xs font-semibold px-3 py-1.5 rounded-full border ${style.bg} ${style.text} ${style.border}`}>
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
      const user = JSON.parse(storedUser);
      if (user.mustChangePassword) {
        router.push("/change-password");
        return;
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

        <main className="flex-1 px-12 py-8 overflow-auto">
          
          {/* Header Section */}
          <div className="mb-10">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
                <p className="text-gray-600 text-sm">Monitor your products, deployments, and team operations</p>
              </div>
            </div>
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
            <div className="text-gray-600 text-sm mb-8">Loading dashboard…</div>
          ) : (
            stats && (
              <div className="mb-10">
                <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">Key Metrics</h2>
                <div className="grid grid-cols-4 gap-5">
                  <div className="bg-white border border-gray-300 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Products</div>
                      <Package size={18} className="text-blue-600" strokeWidth={1.5} />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">{stats.totalProducts}</div>
                    <div className="text-xs text-gray-600">
                      <span className="font-medium text-green-700">{stats.activeProducts}</span> active
                    </div>
                  </div>

                  <div className="bg-white border border-gray-300 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Deployments</div>
                      <Zap size={18} className="text-amber-600" strokeWidth={1.5} />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">{stats.totalDeployments}</div>
                    <div className="text-xs text-gray-600">
                      <span className="font-medium text-emerald-700">{stats.liveDeployments}</span> live
                    </div>
                  </div>

                  <div className="bg-white border border-gray-300 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Clients</div>
                      <TrendingUp size={18} className="text-purple-600" strokeWidth={1.5} />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">{stats.clientCompanies}</div>
                    <div className="text-xs text-gray-600">Active partners</div>
                  </div>

                  <div className="bg-white border border-gray-300 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Team</div>
                      <Users size={18} className="text-indigo-600" strokeWidth={1.5} />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">{stats.totalTeamMembers}</div>
                    <div className="text-xs text-gray-600">Team members</div>
                  </div>
                </div>
              </div>
            )
          )}

          {/* Main Content Grid */}
          <div className="grid grid-cols-3 gap-6">
            
            {/* Recent Products */}
            <div className="col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Recent Products</h2>
                <a href="/products" className="text-sm text-blue-600 hover:text-blue-800 font-semibold">View All →</a>
              </div>
              
              <div className="bg-white border border-gray-300 rounded-lg overflow-hidden">
                {recentProducts.length === 0 && !loading && (
                  <div className="px-6 py-12 text-center">
                    <Package size={32} className="text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">No products yet</p>
                  </div>
                )}
                
                <div className="divide-y divide-gray-200">
                  {recentProducts.map((product, idx) => (
                    <div
                      key={product.id}
                      className="px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-semibold text-xs">
                            {product.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-900">{product.name}</div>
                            <div className="text-xs text-gray-500 mt-0.5">
                              {product.currentVersion ? `v${product.currentVersion}` : "No release"}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <StatusBadge status={product.lifecycleStatus} />
                          <div className="text-xs text-gray-500 mt-2">{timeAgo(product.updatedAt)}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="flex flex-col gap-6">
              
              {/* Needs Attention */}
              <div>
                <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">Needs Attention</h2>
                <div className="bg-white border border-gray-300 rounded-lg overflow-hidden">
                  {attentionItems.length === 0 && (
                    <div className="px-6 py-8 text-center">
                      <ShieldCheck size={24} className="text-green-600 mx-auto mb-2" />
                      <p className="text-gray-600 text-sm font-medium">All systems healthy</p>
                    </div>
                  )}
                  
                  <div className="divide-y divide-gray-200">
                    {attentionItems.map((item) => (
                      <div
                        key={item.deploymentId}
                        className="px-4 py-4 hover:bg-amber-50 transition-colors cursor-pointer border-l-4 border-l-amber-500"
                      >
                        <div className="flex gap-3 items-start">
                          <AlertCircle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-semibold text-gray-900">{item.productName}</div>
                            <div className="text-xs text-gray-600 mt-1">{item.clientName}</div>
                            <div className="text-xs text-gray-700 font-medium mt-2">{item.deploymentStatus}</div>
                            {item.goLiveDate && (
                              <div className="text-xs text-amber-700 font-semibold mt-1">
                                Go-live: {new Date(item.goLiveDate).toLocaleDateString("en-US", { 
                                  month: "short", 
                                  day: "numeric", 
                                  year: "numeric" 
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
                <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">Environment Status</h2>
                <div className="bg-white border border-gray-300 rounded-lg p-6">
                  {readiness && (
                    <>
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <div className="text-sm font-semibold text-gray-900">
                            {readiness.configuredEnvironments} of {readiness.totalEnvironments}
                          </div>
                          <div className="text-xs text-gray-600 mt-0.5">environments configured</div>
                        </div>
                        <ShieldCheck size={20} className="text-green-600" strokeWidth={1.5} />
                      </div>
                      
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-3">
                        <div
                          className="h-full bg-green-600 rounded-full transition-all duration-300"
                          style={{ width: `${readiness.percentageConfigured}%` }}
                        />
                      </div>

                      <p className="text-xs text-gray-600">
                        {readiness.percentageConfigured}% ready for production
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}