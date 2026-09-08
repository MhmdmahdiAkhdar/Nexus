"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ChevronLeft, AlertCircle } from "lucide-react";
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
  const [clientSpecificNotes, setClientSpecificNotes] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const firstFieldRef = useRef<HTMLInputElement>(null);

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
        setDeploymentStatus(data.deploymentStatus ?? LIFECYCLE_OPTIONS[0]);
        setSupportTier(data.supportTier ?? TIER_OPTIONS[0]);
        setGoLiveDate(data.goLiveDate ? data.goLiveDate.split("T")[0] : "");
        setClientSpecificNotes(data.clientSpecificNotes ?? "");
      } catch {
        setError("Could not load deployment.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [deploymentId, router]);

  // Focus the first field once the form has data to show.
  useEffect(() => {
    if (!loading) firstFieldRef.current?.focus();
  }, [loading]);

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
          productVersion: productVersion.trim() || null,
          deploymentStatus,
          goLiveDate: goLiveDate || null,
          supportTier: supportTier || null,
          clientSpecificNotes: clientSpecificNotes.trim() || null,
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

  const fieldClass =
    "w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:bg-gray-50";
  const labelClass = "block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2";

  if (loading) {
    return (
      <div className="flex min-h-screen bg-white">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Topbar />
          <main className="flex-1 px-12 py-8">
            <p className="text-sm text-gray-600">Loading deployment…</p>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />

        <main className="flex-1 px-12 py-8 overflow-auto">

          <button
            onClick={() => router.push(`/deployments/${deploymentId}`)}
            className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ChevronLeft size={16} />
            {title}
          </button>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Deployment</h1>
            <p className="text-gray-600 text-sm">Update version, lifecycle status, and client notes for this deployment</p>
          </div>

          <form onSubmit={handleSubmit} className="max-w-2xl bg-white border border-gray-300 rounded-lg p-6 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="dep-version" className={labelClass}>Product Version</label>
                <input
                  id="dep-version"
                  ref={firstFieldRef}
                  value={productVersion}
                  onChange={(e) => setProductVersion(e.target.value)}
                  placeholder="e.g., 4.2.1"
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
                className={fieldClass}
                disabled={submitting}
              />
            </div>

            {error && (
              <div role="alert" className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                <AlertCircle size={14} className="text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-red-800">{error}</p>
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => router.push(`/deployments/${deploymentId}`)}
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
                {submitting ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}