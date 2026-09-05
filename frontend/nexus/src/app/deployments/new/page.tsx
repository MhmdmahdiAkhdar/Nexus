"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../../layout/Sidebar";
import Topbar from "../../layout/Topbar";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const LIFECYCLE_OPTIONS = ["Pilot", "In Progress", "Live"];
const TIER_OPTIONS = ["Standard", "Premium", "Priority"];

interface Option {
  id: number;
  companyName?: string;
  name?: string;
}

export default function NewDeploymentPage() {
  const router = useRouter();
  const [clients, setClients] = useState<Option[]>([]);
  const [products, setProducts] = useState<Option[]>([]);
  const [clientId, setClientId] = useState("");
  const [productId, setProductId] = useState("");
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

    const headers = { Authorization: `Bearer ${token}` };
    fetch(`${API_URL}/api/deployments/options/clients`, { headers }).then((r) => r.json()).then(setClients);
    fetch(`${API_URL}/api/deployments/options/products`, { headers }).then((r) => r.json()).then(setProducts);
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!clientId || !productId) {
      setError("Client and product are required.");
      return;
    }

    const token = localStorage.getItem("nexus_token");
    setSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/api/deployments`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          clientId: Number(clientId),
          productId: Number(productId),
          productVersion: productVersion || null,
          deploymentStatus,
          goLiveDate: goLiveDate || null,
          supportTier: supportTier || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setError(data?.message ?? "Failed to create deployment.");
        return;
      }

      const created = await response.json();
      router.push(`/deployments/${created.id}`);
    } catch (err) {
      console.error(err);
      setError("Could not reach the server.");
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    "w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#3F84E5]/30 focus:border-[#3F84E5]";
  const labelClass = "text-[10px] uppercase tracking-wide text-[#7A8FA4] font-mono mb-1.5 block";

  return (
    <div className="flex min-h-screen bg-[#F4F0E8]">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />

        <main className="flex-1 px-[30px] pt-[30px] pb-10">
          <button onClick={() => router.push("/deployments")} className="text-[11px] text-[#2874B6] hover:text-[#0B1E3A] mb-3">
            ← DEPLOYMENT REGISTER
          </button>

          <div className="text-[9px] uppercase tracking-[0.18em] text-[#C2762E] font-mono mb-3">System register</div>
          <h1 className="text-[32px] leading-none tracking-[-1.2px] font-semibold text-[#0B1E3A]">Deployment intake</h1>
          <p className="text-[11px] text-[#7A8FA4] mt-3">Record a new installation of a product at a client.</p>

          <div className="border-t border-[#D3D3CF] mt-6 mb-6" />

          <form onSubmit={handleSubmit} className="max-w-2xl bg-[#FAFAF8] border border-[#D2D5D3] p-6 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>CLIENT</label>
                <select value={clientId} onChange={(e) => setClientId(e.target.value)} className={inputClass}>
                  <option value="">Select...</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.companyName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>PRODUCT</label>
                <select value={productId} onChange={(e) => setProductId(e.target.value)} className={inputClass}>
                  <option value="">Select...</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>PRODUCT VERSION</label>
                <input value={productVersion} onChange={(e) => setProductVersion(e.target.value)} placeholder="1.0.0" className={inputClass} />
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

            <p className="text-[10px] text-[#8A99A7]">
              Environment records (Dev/Test/UAT/Production) are added from the deployment's own page after it's created.
            </p>

            {error && <div className="text-xs text-red-600">{error}</div>}

            <button
              type="submit"
              disabled={submitting}
              className="bg-[#0B1E3A] hover:bg-[#152C50] disabled:opacity-60 text-white text-sm font-semibold rounded-md px-5 py-2.5 transition-colors"
            >
              {submitting ? "Saving..." : "Create deployment"}
            </button>
          </form>
        </main>
      </div>
    </div>
  );
}