"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../../layout/Sidebar";
import Topbar from "../../layout/Topbar";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const LIFECYCLE_OPTIONS = ["Active", "Beta", "Deprecated"];
const CRITICALITY_OPTIONS = ["Critical", "High", "Medium", "Low"];

export default function NewProductPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [currentVersion, setCurrentVersion] = useState("");
  const [lifecycleStatus, setLifecycleStatus] = useState(LIFECYCLE_OPTIONS[0]);
  const [criticality, setCriticality] = useState(CRITICALITY_OPTIONS[0]);
  const [owningTeam, setOwningTeam] = useState("");
  const [description, setDescription] = useState("");
  const [businessPurpose, setBusinessPurpose] = useState("");
  const [supportedMarkets, setSupportedMarkets] = useState("");
  const [technologies, setTechnologies] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Product name is required.");
      return;
    }

    const token = localStorage.getItem("nexus_token");
    setSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/api/products`, {
        method: "POST",
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
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setError(data?.message ?? data?.title ?? "Failed to create product.");
        return;
      }

      const created = await response.json();
      router.push(`/products/${created.id}`);
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
          <button
            onClick={() => router.push("/products")}
            className="text-[11px] text-[#2874B6] hover:text-[#0B1E3A] mb-3"
          >
            ← PRODUCT REGISTER
          </button>

          <div className="flex items-start justify-between">
            <div>
              <div className="text-[9px] uppercase tracking-[0.18em] text-[#C2762E] font-mono mb-3">
                System register
              </div>
              <h1 className="text-[32px] leading-none tracking-[-1.2px] font-semibold text-[#0B1E3A]">
                Product intake
              </h1>
              <p className="text-[11px] text-[#7A8FA4] mt-3">
                Create or revise a product record. Every field is part of the accountability chain.
              </p>
            </div>

            <button
              type="button"
              onClick={() => router.push("/products")}
              className="border border-gray-300 text-gray-700 text-[13px] font-medium px-4 h-[39px] rounded-md hover:bg-gray-50 transition-colors"
            >
              Discard
            </button>
          </div>

          <div className="border-t border-[#D3D3CF] mt-6 mb-6" />

          <form onSubmit={handleSubmit} className="grid grid-cols-[1fr_280px] gap-5 items-start">
            <div className="bg-[#FAFAF8] border border-[#D2D5D3] p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>PRODUCT NAME</label>
                  <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>RECORD ID</label>
                  <input
                    value="Auto-generated on save"
                    disabled
                    className={`${inputClass} bg-gray-100 text-gray-400`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>CURRENT VERSION</label>
                  <input
                    value={currentVersion}
                    onChange={(e) => setCurrentVersion(e.target.value)}
                    placeholder="v1.0.0"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>LIFECYCLE</label>
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>CRITICALITY</label>
                  <select value={criticality} onChange={(e) => setCriticality(e.target.value)} className={inputClass}>
                    {CRITICALITY_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>OWNING TEAM</label>
                  <input
                    value={owningTeam}
                    onChange={(e) => setOwningTeam(e.target.value)}
                    placeholder="Payments Platform"
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>DESCRIPTION</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>BUSINESS PURPOSE</label>
                <textarea
                  value={businessPurpose}
                  onChange={(e) => setBusinessPurpose(e.target.value)}
                  rows={2}
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>SUPPORTED MARKETS</label>
                  <input
                    value={supportedMarkets}
                    onChange={(e) => setSupportedMarkets(e.target.value)}
                    placeholder="Lebanon, UAE, Jordan"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>TECHNOLOGIES</label>
                  <input
                    value={technologies}
                    onChange={(e) => setTechnologies(e.target.value)}
                    placeholder="Java, PostgreSQL, Kafka"
                    className={inputClass}
                  />
                </div>
              </div>

              {error && <div className="text-xs text-red-600">{error}</div>}

              <button
                type="submit"
                disabled={submitting}
                className="bg-[#0B1E3A] hover:bg-[#152C50] disabled:opacity-60 text-white text-sm font-semibold rounded-md px-5 py-2.5 transition-colors"
              >
                {submitting ? "Saving..." : "Save product"}
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-white border border-[#D2D5D3] p-5">
                <div className="text-[9px] uppercase tracking-[0.15em] font-mono text-[#698097] mb-2">
                  Record guidance
                </div>
                <h3 className="text-[14px] font-semibold text-[#0B1E3A] mb-3">What belongs here</h3>
                <ul className="space-y-2 text-[11px] text-[#4A5A6A]">
                  <li>✓ Use the stable product identity, not a project nickname.</li>
                  <li>✓ Keep ownership current before publishing a release.</li>
                  <li>✓ Repository links contain references only — never secrets.</li>
                </ul>
              </div>
              <div className="bg-[#FDF3E3] border border-[#E8C99A] p-4 text-[10px] text-[#8A5A1E]">
                Changes are recorded in the product activity trail after save.
              </div>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}