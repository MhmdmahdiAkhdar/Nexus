"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../../app/layout/Sidebar";
import Topbar from "../../app/layout/Topbar";

import { Plus, AlertCircle, ShieldCheck } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface DashboardStats {
  activeProducts: number;
  clientCompanies: number;
  liveDeployments: number;
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

function timeAgo(dateString: string): string {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
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

  const statCards = stats
    ? [
        { label: "Active products", value: stats.activeProducts },
        { label: "Client companies", value: stats.clientCompanies },
        { label: "Live deployments", value: stats.liveDeployments },
        { label: "Pending items", value: stats.pendingItems },
      ]
    : [];

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
                Command center
              </h1>

              <p className="text-[11px] text-[#7A8FA4] mt-5">
                A working index of what is live, changing, and waiting for an accountable owner.
              </p>
            </div>

            <button className="flex items-center gap-2 bg-[#0B1E3A] hover:bg-[#152C50] text-white text-[13px] font-medium px-4 h-[39px] transition-colors">
              <Plus size={16} strokeWidth={1.8} />
              Quick record
            </button>
          </div>

          <div className="border-t border-[#D3D3CF] mt-6 mb-6" />

          {error && <div className="text-[11px] text-red-600 mb-4">{error}</div>}

          {loading ? (
            <div className="text-[11px] text-[#7A8FA4] mb-7">Loading dashboard…</div>
          ) : (
            <div className="grid grid-cols-4 mb-7">
              {statCards.map((stat) => (
                <div key={stat.label} className="border-l-2 border-[#C2762E] pl-3 min-h-[63px]">
                  <div className="text-[9px] uppercase tracking-[0.14em] font-mono text-[#698097] mb-2">
                    {stat.label}
                  </div>
                  <div className="text-[22px] leading-none font-semibold text-[#0B1E3A]">
                    {stat.value}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-3 gap-5">
            <section className="col-span-2 bg-[#FAFAF8] border border-[#D2D5D3]">
              <div className="flex items-center justify-between px-[18px] py-[15px] border-b border-[#D8D9D7]">
                <div>
                  <div className="text-[9px] uppercase tracking-[0.15em] font-mono text-[#698097]">
                    Register activity
                  </div>
                  <h2 className="text-[16px] font-semibold text-[#0B1E3A] mt-1">
                    Recently updated products
                  </h2>
                </div>
                <a href="/products" className="text-[11px] text-[#2874B6] hover:text-[#0B1E3A]">
                  View register ↗
                </a>
              </div>

              <div>
                {recentProducts.length === 0 && !loading && (
                  <div className="px-[18px] py-6 text-[11px] text-[#8A99A7]">No products yet.</div>
                )}
                {recentProducts.map((product) => (
                  <div
                    key={product.id}
                    className="grid grid-cols-[1fr_80px] items-center min-h-[78px] px-[18px] border-b border-[#E0E1DE] last:border-b-0"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-medium text-[#0B1E3A]">{product.name}</span>
                        <StatusBadge status={product.lifecycleStatus} />
                      </div>
                      <div className="text-[8px] text-[#8A99A7] mt-1">
                        {product.currentVersion ? `release v${product.currentVersion}` : "no release yet"}
                      </div>
                    </div>
                    <div className="text-[8px] text-[#8193A4] text-right">{timeAgo(product.updatedAt)}</div>
                  </div>
                ))}
              </div>
            </section>

            <div className="flex flex-col gap-5">
              <section className="bg-[#FAFAF8] border border-[#D2D5D3] p-[18px]">
                <div className="text-[9px] uppercase tracking-[0.15em] font-mono text-[#698097]">
                  Operations queue
                </div>
                <h2 className="text-[16px] font-semibold text-[#0B1E3A] mt-1 mb-4">Needs attention</h2>

                <div className="space-y-2">
                  {attentionItems.length === 0 && (
                    <div className="text-[9px] text-[#8A99A7]">Nothing needs attention right now.</div>
                  )}
                  {attentionItems.map((item) => (
                    <div
                      key={item.deploymentId}
                      className="flex gap-2.5 py-2 pl-2.5 border-l-2 border-l-amber-600"
                    >
                      <AlertCircle size={16} strokeWidth={1.6} className="text-amber-600 shrink-0 mt-[1px]" />
                      <div>
                        <div className="text-[9px] font-medium text-[#0B1E3A]">
                          {item.productName} · {item.clientName}
                        </div>
                        <div className="text-[8px] text-[#8A99A7] mt-1">
                          {item.deploymentStatus}
                          {item.goLiveDate
                            ? ` · Go-live ${new Date(item.goLiveDate).toLocaleDateString()}`
                            : ""}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="bg-[#FAFAF8] border border-[#D2D5D3] p-[18px]">
                <div className="text-[9px] uppercase tracking-[0.15em] font-mono text-[#698097] mb-3">
                  Environment readiness
                </div>

                {readiness && (
                  <>
                    <div className="flex items-center gap-2 mb-3">
                      <ShieldCheck size={16} className="text-[#4A947E]" />
                      <span className="text-[12px] font-bold text-[#0B1E3A]">
                        {readiness.configuredEnvironments} of {readiness.totalEnvironments} environments fully
                        configured
                      </span>
                    </div>

                    <div className="w-full h-[4px] bg-[#DCE5E1] overflow-hidden mb-2">
                      <div
                        className="h-full bg-[#4A947E]"
                        style={{ width: `${readiness.percentageConfigured}%` }}
                      />
                    </div>

                    <p className="text-[8px] text-[#8494A4]">
                      {readiness.percentageConfigured}% of environments have both an application URL and access
                      reference on file.
                    </p>
                  </>
                )}
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}