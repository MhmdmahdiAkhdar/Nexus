"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, Filter, Plus, Layers3 } from "lucide-react";
import Sidebar from "../layout/Sidebar";
import Topbar from "../layout/Topbar";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const STAGE_OPTIONS = ["Development", "Test", "UAT", "Production", "Not deployed"];

interface DeploymentListItem {
  id: number;
  recordCode: string;
  clientName: string;
  productName: string;
  productVersion: string | null;
  modulesCount: number;
  goLiveDate: string | null;
  currentStage: string;
}

function StageBadge({ stage }: { stage: string }) {
  const styles: Record<string, string> = {
    Production: "border-[#6EAA99] text-[#267B67]",
    UAT: "border-[#C2762E] text-[#A15F25]",
    Test: "border-[#82A7C4] text-[#36719C]",
    Development: "border-[#82A7C4] text-[#36719C]",
    "Not deployed": "border-gray-300 text-gray-500",
  };

  return (
    <span className={`text-[9px] font-mono tracking-wide px-1.5 py-[3px] border ${styles[stage] ?? "border-gray-300 text-gray-500"}`}>
      {stage.toUpperCase()}
    </span>
  );
}

export default function DeploymentsPage() {
  const router = useRouter();
  const [deployments, setDeployments] = useState<DeploymentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("");

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
      if (stageFilter) params.set("stage", stageFilter);

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
  }, [search, stageFilter, router]);

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

    const timeout = setTimeout(() => loadDeployments(), 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, stageFilter]);

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
                Deployment register
              </h1>
              <p className="text-[11px] text-[#7A8FA4] mt-5">
                The installation record: which version is running for which client, and where it stands.
              </p>
            </div>

            <Link
              href="/deployments/new"
              className="flex items-center gap-2 bg-[#0B1E3A] hover:bg-[#152C50] text-white text-[13px] font-medium px-4 h-[39px] transition-colors"
            >
              <Plus size={16} strokeWidth={1.8} />
              Create deployment
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
                placeholder="Search client, product, or deployment ID"
                className="w-full border border-gray-300 bg-white rounded-lg pl-9 pr-3 py-2 text-[12px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3F84E5]/30 focus:border-[#3F84E5]"
              />
            </div>

            <div className="relative">
              <Filter size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <select
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value)}
                className="appearance-none border border-gray-300 bg-white rounded-lg pl-8 pr-8 py-2 text-[12px] text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#3F84E5]/30 focus:border-[#3F84E5]"
              >
                <option value="">All status</option>
                {STAGE_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error && <div className="text-[11px] text-red-600 mb-4">{error}</div>}

          <div className="bg-[#FAFAF8] border border-[#D2D5D3]">
            <div className="grid grid-cols-[110px_1fr_100px_100px_110px_120px_20px] px-[18px] py-2.5 border-b border-[#D8D9D7] text-[9px] uppercase tracking-[0.1em] font-mono text-[#698097]">
              <span>Deployment</span>
              <span>Client / Product</span>
              <span>Version</span>
              <span>Modules</span>
              <span>Go-live</span>
              <span>Status</span>
              <span></span>
            </div>

            {loading && <div className="px-[18px] py-8 text-[11px] text-[#8A99A7]">Loading deployments…</div>}

            {!loading && deployments.length === 0 && (
              <div className="px-[18px] py-8 text-[11px] text-[#8A99A7]">
                No deployments found{search || stageFilter ? " for this search/filter." : "."}
              </div>
            )}

            {!loading &&
              deployments.map((d) => (
                <Link
                  key={d.id}
                  href={`/deployments/${d.id}`}
                  className="grid grid-cols-[110px_1fr_100px_100px_110px_120px_20px] items-center min-h-[70px] px-[18px] border-b border-[#E0E1DE] last:border-b-0 hover:bg-white transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-md border border-[#D2D5D3] bg-white flex items-center justify-center shrink-0">
                      <Layers3 size={15} className="text-[#3F84E5]" />
                    </div>
                    <span className="text-[9px] font-mono text-[#8A99A7]">{d.recordCode}</span>
                  </div>

                  <div>
                    <div className="text-[12px] font-medium text-[#0B1E3A]">{d.clientName}</div>
                    <div className="text-[10px] text-[#8A99A7]">{d.productName}</div>
                  </div>

                  <div className="text-[11px] text-[#4A5A6A]">{d.productVersion ? `v${d.productVersion}` : "—"}</div>
                  <div className="text-[11px] text-[#4A5A6A]">{d.modulesCount} module{d.modulesCount === 1 ? "" : "s"}</div>
                  <div className="text-[11px] text-[#8A99A7]">
                    {d.goLiveDate ? new Date(d.goLiveDate).toLocaleDateString() : "—"}
                  </div>
                  <div>
                    <StageBadge stage={d.currentStage} />
                  </div>
                  <div className="text-[#8A99A7] text-[12px]">›</div>
                </Link>
              ))}
          </div>
        </main>
      </div>
    </div>
  );
}