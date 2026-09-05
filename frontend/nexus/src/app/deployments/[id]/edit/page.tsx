"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Sidebar from "../../../layout/Sidebar";
import Topbar from "../../../layout/Topbar";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const LIFECYCLE_OPTIONS = ["Pilot", "In Progress", "Live"];
const TIER_OPTIONS = ["Standard", "Premium", "Priority"];

export default function EditDeploymentPage() {
  const router = useRouter();
  const params = useParams();
  const deploymentId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [productVersion, setProductVersion] = useState("");
  const [deploymentStatus, setDeploymentStatus] = useState(LIFECYCLE_OPTIONS[0]);
  const [supportTier, setSupportTier] = useState(TIER_OPTIONS[0]);
  const [goLiveDate, setGoLiveDate] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("nexus_token");
    if (!token) {
      router.push("/login");
      return;
    }

    async function load() {
      try {
        const res = await fetch(`${API_URL}/api/deployments/${deploymentId}`, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error();
        const data = await res.json();

        setTitle(`${data.productName} × ${data.clientName}`);
        setProductVersion(data.productVersion ?? "");
        setSupportTier(data.supportTier ?? TIER_OPTIONS[0]);
        setGoLiveDate(data.goLiveDate ? data.goLiveDate.split("T")[0] : "");
      } catch {
        setError("Could not load deployment.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [deploymentId, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const token = localStorage.getItem("nexus_token");
    setSubmitting(true);

    try {
      const res = await fetch(`${API_URL}/api/deployments/${deploymentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          productVersion: productVersion || null,
          deploymentStatus,
          goLiveDate: goLiveDate || null,
          supportTier: supportTier || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.message ?? "Failed to update deployment.");
        return;
      }

      router.push(`/deployments/${deploymentId}`);
    } catch {
      setError("Could not reach the server.");
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    "w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#3F84E5]/30 focus:border-[#3F84E5]";
  const labelClass = "text-[10px] uppercase tracking-wide text-[#7A8FA4] font-mono mb-1.5 block";

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#F4F0E8]">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Topbar />
          <main className="flex-1 px-[30px] pt-[30px]">
            <p className="text-[11px] text-[#7A8FA4]">Loading deployment…</p>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F4F0E8]">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />

        <main className="flex-1 px-[30px] pt-[30px] pb-10">
          <button onClick={() => router.push(`/deployments/${deploymentId}`)} className="text-[11px] text-[#2874B6] hover:text-[#0B1E3A] mb-3">
            ← {title.toUpperCase()}
          </button>

          <div className="text-[9px] uppercase tracking-[0.18em] text-[#C2762E] font-mono mb-3">System register</div>
          <h1 className="text-[32px] leading-none tracking-[-1.2px] font-semibold text-[#0B1E3A]">Edit deployment</h1>

          <div className="border-t border-[#D3D3CF] mt-6 mb-6" />

          <form onSubmit={handleSubmit} className="max-w-2xl bg-[#FAFAF8] border border-[#D2D5D3] p-6 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>PRODUCT VERSION</label>
                <input value={productVersion} onChange={(e) => setProductVersion(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>GO-LIVE DATE</label>
                <input type="date" value={goLiveDate} onChange={(e) => setGoLiveDate(e.target.value)} className={inputClass} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>LIFECYCLE STATUS</label>
                <select value={deploymentStatus} onChange={(e) => setDeploymentStatus(e.target.value)} className={inputClass}>
                  {LIFECYCLE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>SUPPORT TIER</label>
                <select value={supportTier} onChange={(e) => setSupportTier(e.target.value)} className={inputClass}>
                  {TIER_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {error && <div className="text-xs text-red-600">{error}</div>}

            <button
              type="submit"
              disabled={submitting}
              className="bg-[#0B1E3A] hover:bg-[#152C50] disabled:opacity-60 text-white text-sm font-semibold rounded-md px-5 py-2.5 transition-colors"
            >
              {submitting ? "Saving..." : "Save changes"}
            </button>
          </form>
        </main>
      </div>
    </div>
  );
}