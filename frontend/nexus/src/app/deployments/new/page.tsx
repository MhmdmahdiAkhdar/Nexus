"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, AlertCircle } from "lucide-react";
import Sidebar from "../../layout/Sidebar";
import Topbar from "../../layout/Topbar";
import {isAdmin} from "../../lib/auth";

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
  const [optionsError, setOptionsError] = useState("");
  const [clientId, setClientId] = useState("");
  const [productId, setProductId] = useState("");
  const [productVersion, setProductVersion] = useState("");
  const [deploymentStatus, setDeploymentStatus] = useState(LIFECYCLE_OPTIONS[0]);
  const [supportTier, setSupportTier] = useState(TIER_OPTIONS[0]);
  const [goLiveDate, setGoLiveDate] = useState("");
  const [clientSpecificNotes, setClientSpecificNotes] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const firstFieldRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    const token = localStorage.getItem("nexus_token");
    if (!token) {
      router.push("/login");
      return;
    }
    if(!isAdmin()){
      router.push("/deployments");
    }

    const headers = { Authorization: `Bearer ${token}` };
    Promise.all([
      fetch(`${API_URL}/api/deployments/options/clients`, { headers }).then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      }),
      fetch(`${API_URL}/api/deployments/options/products`, { headers }).then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      }),
    ])
      .then(([clientsData, productsData]) => {
        setClients(clientsData);
        setProducts(productsData);
      })
      .catch(() => setOptionsError("Could not load clients and products. Try reloading this page."));
  }, [router]);

  useEffect(() => {
    firstFieldRef.current?.focus();
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
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
          productVersion: productVersion.trim() || null,
          deploymentStatus,
          goLiveDate: goLiveDate || null,
          supportTier: supportTier || null,
          clientSpecificNotes: clientSpecificNotes.trim() || null,
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

  const fieldClass =
    "w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:bg-gray-50";
  const labelClass = "block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2";

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />

        <main className="flex-1 px-12 py-8 overflow-auto">

          <button
            onClick={() => router.push("/deployments")}
            className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ChevronLeft size={16} />
            Deployment Register
          </button>

          
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Deployment Intake</h1>
            <p className="text-gray-600 text-sm">Record a new installation of a product at a client</p>
          </div>

          {optionsError && (
            <div role="alert" className="max-w-2xl mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{optionsError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="max-w-2xl bg-white border border-gray-300 rounded-lg p-6 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="dep-client" className={labelClass}>Client *</label>
                <select
                  id="dep-client"
                  ref={firstFieldRef}
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className={fieldClass}
                  disabled={submitting}
                  required
                >
                  <option value="">Select…</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.companyName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="dep-product" className={labelClass}>Product *</label>
                <select
                  id="dep-product"
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  className={fieldClass}
                  disabled={submitting}
                  required
                >
                  <option value="">Select…</option>
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
                <label htmlFor="dep-version" className={labelClass}>Product Version</label>
                <input
                  id="dep-version"
                  value={productVersion}
                  onChange={(e) => setProductVersion(e.target.value)}
                  placeholder="1.0.0"
                  className={fieldClass}
                  disabled={submitting}
                />
              </div>
              <div>
                <label htmlFor="dep-golive" className={labelClass}>Go-Live Date</label>
                <input
                  id="dep-golive"
                  type="date"
                  value={goLiveDate}
                  onChange={(e) => setGoLiveDate(e.target.value)}
                  className={fieldClass}
                  disabled={submitting}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="dep-status" className={labelClass}>Lifecycle Status</label>
                <select
                  id="dep-status"
                  value={deploymentStatus}
                  onChange={(e) => setDeploymentStatus(e.target.value)}
                  className={fieldClass}
                  disabled={submitting}
                >
                  {LIFECYCLE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="dep-tier" className={labelClass}>Support Tier</label>
                <select
                  id="dep-tier"
                  value={supportTier}
                  onChange={(e) => setSupportTier(e.target.value)}
                  className={fieldClass}
                  disabled={submitting}
                >
                  {TIER_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="dep-notes" className={labelClass}>Client-Specific Notes</label>
              <textarea
                id="dep-notes"
                value={clientSpecificNotes}
                onChange={(e) => setClientSpecificNotes(e.target.value)}
                rows={3}
                placeholder="Anything unique to how this client uses the product…"
                className={fieldClass}
                disabled={submitting}
              />
            </div>

            <p className="text-xs text-gray-500">
              Environment records (Dev/Test/UAT/Production) are added from the deployment's own page after it's created.
            </p>

            {error && (
              <div role="alert" className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                <AlertCircle size={14} className="text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-red-800">{error}</p>
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => router.push("/deployments")}
                disabled={submitting}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 disabled:opacity-60 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-lg text-sm font-semibold transition-colors"
              >
                {submitting ? "Saving..." : "Create Deployment"}
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}