"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Sidebar from "../../../layout/Sidebar";
import Topbar from "../../../layout/Topbar";
import { ChevronLeft, AlertCircle, CheckCircle } from "lucide-react";
import { isAdmin } from "../../../lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const LIFECYCLE_OPTIONS = ["Active", "Beta", "Deprecated"];
const CRITICALITY_OPTIONS = ["Critical", "High", "Medium", "Low"];

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [recordCode, setRecordCode] = useState("");
  const [name, setName] = useState("");
  const [currentVersion, setCurrentVersion] = useState("");
  const [lifecycleStatus, setLifecycleStatus] = useState(LIFECYCLE_OPTIONS[0]);
  const [criticality, setCriticality] = useState(CRITICALITY_OPTIONS[0]);
  const [owningTeam, setOwningTeam] = useState("");
  const [description, setDescription] = useState("");
  const [businessPurpose, setBusinessPurpose] = useState("");
  const [supportedMarkets, setSupportedMarkets] = useState("");
  const [technologies, setTechnologies] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("nexus_token");
    if (!token) {
      router.push("/login");
      return;
    }
    if (!isAdmin()) {
      router.push(`/products/${productId}`);
      return;
    }

    async function loadProduct() {
      try {
        const response = await fetch(`${API_URL}/api/products/${productId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("Failed to load product.");
        const data = await response.json();

        setRecordCode(data.recordCode);
        setName(data.name);
        setCurrentVersion(data.currentVersion ?? "");
        setLifecycleStatus(data.lifecycleStatus);
        setCriticality(data.criticality ?? CRITICALITY_OPTIONS[0]);
        setOwningTeam(data.owningTeam ?? "");
        setDescription(data.description ?? "");
        setBusinessPurpose(data.businessPurpose ?? "");
        setSupportedMarkets(data.supportedMarkets ?? "");
        setTechnologies(data.technologies ?? "");
        setNotes(data.notes ?? "");
      } catch (err) {
        console.error(err);
        setError("Could not load product.");
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [productId, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    const token = localStorage.getItem("nexus_token");
    setSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/api/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name,
          description: description || null,
          businessPurpose: businessPurpose || null,
          lifecycleStatus,
          currentVersion: currentVersion || null,
          supportedMarkets: supportedMarkets || null,
          criticality,
          technologies: technologies || null,
          owningTeam: owningTeam || null,
          notes: notes || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setError(data?.message ?? "Failed to update product.");
        return;
      }

      setSuccess("Product updated successfully!");
      setTimeout(() => {
        router.push(`/products/${productId}`);
      }, 1000);
    } catch (err) {
      console.error(err);
      setError("Could not reach the server.");
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    "w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all";
  const labelClass = "text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2 block";

  if (loading) {
    return (
      <div className="flex min-h-screen bg-white">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Topbar />
          <main className="flex-1 px-12 py-8">
            <p className="text-sm text-gray-500">Loading product…</p>
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
            onClick={() => router.push(`/products/${productId}`)}
            className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-semibold mb-6 transition-colors"
          >
            <ChevronLeft size={16} />
            Back to Product
          </button>

          <div className="mb-8">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Product</h1>
                <p className="text-gray-600 text-sm">
                  Update the details for <span className="font-semibold">{recordCode}</span>
                </p>
              </div>
              
              <button
                type="button"
                onClick={() => router.push(`/products/${productId}`)}
                className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-8">
            
            <form onSubmit={handleSubmit} className="col-span-2">
              <div className="bg-white border border-gray-300 rounded-lg p-8 space-y-6">
                
              
                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                    <AlertCircle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}

                
                {success && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                    <CheckCircle size={18} className="text-green-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-green-800">{success}</p>
                  </div>
                )}

                
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Product Identity</h2>
                  
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className={labelClass}>Product Name *</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className={inputClass}
                        required
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Record ID</label>
                      <input
                        type="text"
                        value={recordCode}
                        disabled
                        className={`${inputClass} bg-gray-50 text-gray-500 cursor-not-allowed`}
                      />
                    </div>
                  </div>
                </div>

                
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Version & Status</h2>
                  
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className={labelClass}>Current Version</label>
                      <input
                        type="text"
                        value={currentVersion}
                        onChange={(e) => setCurrentVersion(e.target.value)}
                        placeholder="v1.0.0"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Lifecycle Status</label>
                      <select
                        value={lifecycleStatus}
                        onChange={(e) => setLifecycleStatus(e.target.value)}
                        className={inputClass}
                      >
                        {LIFECYCLE_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Criticality & Ownership</h2>
                  
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className={labelClass}>Criticality Level</label>
                      <select
                        value={criticality}
                        onChange={(e) => setCriticality(e.target.value)}
                        className={inputClass}
                      >
                        {CRITICALITY_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Owning Team</label>
                      <input
                        type="text"
                        value={owningTeam}
                        onChange={(e) => setOwningTeam(e.target.value)}
                        placeholder="e.g., Platform Team"
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>

                
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Documentation</h2>
                  
                  <div className="space-y-5">
                    <div>
                      <label className={labelClass}>Product Description</label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="What does this product do?"
                        rows={3}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Business Purpose</label>
                      <textarea
                        value={businessPurpose}
                        onChange={(e) => setBusinessPurpose(e.target.value)}
                        placeholder="Why does this product exist? What business problem does it solve?"
                        rows={3}
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>

                
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Technical Details</h2>
                  
                  <div className="grid grid-cols-2 gap-5 mb-5">
                    <div>
                      <label className={labelClass}>Supported Markets</label>
                      <input
                        type="text"
                        value={supportedMarkets}
                        onChange={(e) => setSupportedMarkets(e.target.value)}
                        placeholder="e.g., Lebanon, UAE, Jordan"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Technologies</label>
                      <input
                        type="text"
                        value={technologies}
                        onChange={(e) => setTechnologies(e.target.value)}
                        placeholder="e.g., Java, PostgreSQL, Kafka"
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Additional Notes</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Any additional information or context..."
                      rows={4}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors duration-200"
                  >
                    {submitting ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    type="button"
                    onClick={() => router.push(`/products/${productId}`)}
                    className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>

            <div className="col-span-1">
              <div className="sticky top-8 space-y-4">
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
                  <h3 className="text-sm font-bold text-blue-900 mb-3">Editing Guidelines</h3>
                  <ul className="space-y-2.5 text-xs text-blue-800">
                    <li className="flex gap-2">
                      <span className="text-blue-600 font-bold mt-0.5">•</span>
                      <span>Keep the product identity consistent</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-blue-600 font-bold mt-0.5">•</span>
                      <span>Update ownership before releasing new versions</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-blue-600 font-bold mt-0.5">•</span>
                      <span>All changes are recorded in the activity log</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-blue-600 font-bold mt-0.5">•</span>
                      <span>Never include secrets or credentials</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
                  <h3 className="text-sm font-bold text-gray-900 mb-2">Change History</h3>
                  <p className="text-xs text-gray-600">
                    Your edits are automatically tracked in the product's activity timeline. View all changes on the Activity tab.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}