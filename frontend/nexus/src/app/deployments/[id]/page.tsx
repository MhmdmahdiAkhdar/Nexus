"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ShieldCheck, ExternalLink, X, AlertCircle, ChevronLeft, Lock } from "lucide-react";
import Sidebar from "../../layout/Sidebar";
import Topbar from "../../layout/Topbar";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface EnvironmentItem {
  id: number;
  environmentName: string;
  environmentType: string | null;
  purpose: string | null;
  serverName: string | null;
  operatingSystem: string | null;
  applicationUrl: string | null;
  databaseInfo: string | null;
  monitoringLink: string | null;
  accessReference: string | null;
  notes: string | null;
}

interface DeploymentDetail {
  id: number;
  recordCode: string;
  clientId: number;
  clientName: string;
  clientCountry: string | null;
  clientSpecificNotes: string | null;
  productId: number;
  productName: string;
  productVersion: string | null;
  currentStage: string;
  supportTier: string | null;
  goLiveDate: string | null;
  enabledModulesCount: number;
  totalModulesCount: number;
  accountOwner: string | null;
  mainBranch: string | null;
  configuredEnvironmentsCount: number;
  latestActivityTitle: string | null;
  latestActivityCommitRef: string | null;
  environments: EnvironmentItem[];
}

function authHeaders() {
  const token = localStorage.getItem("nexus_token");
  return { Authorization: `Bearer ${token}` };
}

/** Only allow http(s) links through to `href` — blocks javascript: and data: URLs. */
function safeHref(url: string | null): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:" ? url : null;
  } catch {
    return null;
  }
}

// Same palette as the deployments list badges, for the environment-type dot.
const ENV_DOT_COLOR: Record<string, string> = {
  Development: "bg-blue-500",
  Test: "bg-blue-500",
  UAT: "bg-orange-500",
  Production: "bg-green-500",
};

// Same badge treatment as the deployments list.
const STAGE_BADGE: Record<string, string> = {
  Production: "bg-green-100 text-green-700",
  UAT: "bg-orange-100 text-orange-700",
  Test: "bg-blue-100 text-blue-700",
  Development: "bg-blue-100 text-blue-700",
  "Not deployed": "bg-gray-100 text-gray-600",
};

export default function DeploymentDossierPage() {
  const router = useRouter();
  const params = useParams();
  const deploymentId = params.id as string;

  const [detail, setDetail] = useState<DeploymentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddEnvironment, setShowAddEnvironment] = useState(false);
  const [expandedEnvId, setExpandedEnvId] = useState<number | null>(null);

  async function loadDetail() {
    const res = await fetch(`${API_URL}/api/deployments/${deploymentId}`, { headers: authHeaders() });
    if (res.ok) setDetail(await res.json());
  }

  useEffect(() => {
    const token = localStorage.getItem("nexus_token");
    if (!token) {
      router.push("/login");
      return;
    }

    async function init() {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/api/deployments/${deploymentId}`, { headers: authHeaders() });
        if (res.status === 404) {
          setError("Deployment not found.");
          return;
        }
        if (!res.ok) throw new Error();
        setDetail(await res.json());
      } catch {
        setError("Could not load deployment. Is the API running?");
      } finally {
        setLoading(false);
      }
    }

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deploymentId]);

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

  if (error || !detail) {
    return (
      <div className="flex min-h-screen bg-white">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Topbar />
          <main className="flex-1 px-12 py-8">
            <div role="alert" className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error || "Deployment not found."}</p>
            </div>
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
            onClick={() => router.push("/deployments")}
            className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ChevronLeft size={16} />
            Deployment Register
          </button>

          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {detail.productName} × {detail.clientName}
              </h1>
              <p className="text-gray-600 text-sm">
                {detail.recordCode} · {detail.productName} {detail.productVersion ? `v${detail.productVersion}` : ""} · {detail.currentStage}
              </p>
            </div>

            <button
              onClick={() => router.push(`/deployments/${deploymentId}/edit`)}
              className="border border-gray-300 text-gray-700 text-sm font-semibold px-6 py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Edit Deployment
            </button>
          </div>

          <div className="grid grid-cols-[1fr_320px] gap-6">
            <div className="space-y-6">

              {/* Overview */}
              <section className="bg-white border border-gray-300 rounded-lg overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                  <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full ${STAGE_BADGE[detail.currentStage] ?? "bg-gray-100 text-gray-600"}`}>
                    {detail.currentStage}
                  </span>
                  <div className="text-right">
                    <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Support Tier</div>
                    <div className="text-sm font-semibold text-gray-900 mt-0.5">{detail.supportTier ?? "—"}</div>
                  </div>
                </div>

                <div className="px-6 py-5">
                  <p className="text-sm text-gray-600 mb-5">
                    {detail.clientName} · {detail.clientCountry ?? "—"}
                    {detail.goLiveDate ? ` · deployed ${new Date(detail.goLiveDate).toLocaleDateString()}` : ""}
                  </p>

                  <div className="grid grid-cols-3 gap-6 pt-5 border-t border-gray-200">
                    <div>
                      <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Enabled Modules</div>
                      <div className="text-sm font-semibold text-gray-900">
                        {detail.enabledModulesCount} / {detail.totalModulesCount} active
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Account Owner</div>
                      <div className="text-sm font-semibold text-gray-900">{detail.accountOwner || "—"}</div>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Current Release</div>
                      <div className="text-sm font-semibold text-blue-600">
                        {detail.productVersion ? `v${detail.productVersion}` : "—"}
                        {detail.mainBranch ? ` · ${detail.mainBranch}` : ""}
                      </div>
                    </div>
                  </div>

                  {detail.clientSpecificNotes && (
                    <div className="pt-5 mt-5 border-t border-gray-200">
                      <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Client-Specific Notes</div>
                      <div className="text-sm text-gray-700 whitespace-pre-wrap">{detail.clientSpecificNotes}</div>
                    </div>
                  )}
                </div>
              </section>

              {/* Environments */}
              <section className="bg-white border border-gray-300 rounded-lg overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Environments • <span className="font-bold text-gray-900">{detail.environments.length}</span> configured
                  </p>
                  <button
                    onClick={() => setShowAddEnvironment(true)}
                    className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    + Add Environment
                  </button>
                </div>

                {detail.environments.length === 0 && (
                  <div className="px-6 py-12 text-center">
                    <p className="text-sm text-gray-600">No environments recorded for this deployment yet.</p>
                  </div>
                )}

                <div className="divide-y divide-gray-200">
                  {detail.environments.map((env) => {
                    const appLink = safeHref(env.applicationUrl);
                    const monitoringLink = safeHref(env.monitoringLink);
                    return (
                      <div key={env.id}>
                        <button
                          onClick={() => setExpandedEnvId(expandedEnvId === env.id ? null : env.id)}
                          aria-expanded={expandedEnvId === env.id}
                          className="w-full flex items-center gap-3 px-6 py-3.5 text-left hover:bg-gray-50 transition-colors"
                        >
                          <span className={`w-2 h-2 rounded-full shrink-0 ${ENV_DOT_COLOR[env.environmentType ?? ""] ?? "bg-gray-400"}`} />
                          <span className="text-sm font-medium text-gray-900 w-28 shrink-0">{env.environmentType ?? env.environmentName}</span>
                          <span className="text-xs text-gray-600 w-28 shrink-0">{env.serverName ?? "—"}</span>
                          {appLink ? (
                            <span className="text-sm text-blue-600 flex items-center gap-1 truncate">
                              {appLink} <ExternalLink size={12} className="shrink-0" />
                            </span>
                          ) : (
                            <span className="text-sm text-gray-500">No URL on file</span>
                          )}
                        </button>

                        {expandedEnvId === env.id && (
                          <div className="grid grid-cols-2 gap-3 px-6 pb-4 pl-11 text-xs text-gray-700">
                            <div><span className="text-gray-500">Purpose:</span> {env.purpose || "—"}</div>
                            <div><span className="text-gray-500">OS:</span> {env.operatingSystem || "—"}</div>
                            <div><span className="text-gray-500">Database:</span> {env.databaseInfo || "—"}</div>
                            <div>
                              <span className="text-gray-500">Monitoring:</span>{" "}
                              {monitoringLink ? (
                                <a href={monitoringLink} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-700">
                                  {monitoringLink}
                                </a>
                              ) : "—"}
                            </div>
                            <div><span className="text-gray-500">Access reference:</span> {env.accessReference || "—"}</div>
                            {env.notes && <div className="col-span-2"><span className="text-gray-500">Notes:</span> {env.notes}</div>}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>

            <div className="space-y-6">
              <section className="bg-white border border-gray-300 rounded-lg p-6">
                <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Safety Boundary</div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">References, not secrets.</h3>
                <p className="text-sm text-gray-600 leading-relaxed mb-4">
                  This dossier intentionally records environment names, servers, and application URLs only.
                  Credentials, passwords, tokens, and secrets never render here.
                </p>
                <div className="flex items-start gap-2 pt-4 border-t border-gray-200 text-xs text-orange-700">
                  <Lock size={13} className="shrink-0 mt-0.5" />
                  <span>Secret storage is handled outside Nexus by approved infrastructure controls.</span>
                </div>
              </section>

              <section className="bg-white border border-gray-300 rounded-lg p-6">
                <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Deployment Health</div>
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck size={18} className="text-green-600" />
                  <span className="text-sm font-semibold text-gray-900">
                    {detail.configuredEnvironmentsCount} of {detail.environments.length} environments configured
                  </span>
                </div>
                <p className="text-xs text-gray-600 mb-4">
                  Configured means an environment has both an application URL and access reference on file.
                  This is not a live health check.
                </p>
                {detail.latestActivityTitle && (
                  <div className="pt-4 border-t border-gray-200 text-xs text-gray-600">
                    Latest activity: {detail.latestActivityTitle}
                    {detail.latestActivityCommitRef ? ` · ${detail.latestActivityCommitRef}` : ""}
                  </div>
                )}
              </section>
            </div>
          </div>
        </main>
      </div>

      {showAddEnvironment && (
        <AddEnvironmentModal
          deploymentId={deploymentId}
          onClose={() => setShowAddEnvironment(false)}
          onSaved={() => {
            setShowAddEnvironment(false);
            loadDetail();
          }}
        />
      )}
    </div>
  );
}

function AddEnvironmentModal({
  deploymentId,
  onClose,
  onSaved,
}: {
  deploymentId: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [environmentName, setEnvironmentName] = useState("");
  const [environmentType, setEnvironmentType] = useState("Development");
  const [purpose, setPurpose] = useState("");
  const [serverName, setServerName] = useState("");
  const [operatingSystem, setOperatingSystem] = useState("");
  const [applicationUrl, setApplicationUrl] = useState("");
  const [databaseInfo, setDatabaseInfo] = useState("");
  const [monitoringLink, setMonitoringLink] = useState("");
  const [accessReference, setAccessReference] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const firstFieldRef = useRef<HTMLInputElement>(null);

  // Focus the first field and let Escape close the dialog, like the Add Reference modal.
  useEffect(() => {
    firstFieldRef.current?.focus();
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedName = environmentName.trim();
    if (!trimmedName) {
      setError("Environment name is required.");
      return;
    }
    if (applicationUrl && !safeHref(applicationUrl)) {
      setError("Application URL must be a valid http:// or https:// address.");
      return;
    }
    if (monitoringLink && !safeHref(monitoringLink)) {
      setError("Monitoring link must be a valid http:// or https:// address.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/api/deployments/${deploymentId}/environments`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({
          environmentName: trimmedName,
          environmentType,
          purpose: purpose.trim() || null,
          serverName: serverName.trim() || null,
          operatingSystem: operatingSystem.trim() || null,
          applicationUrl: applicationUrl.trim() || null,
          databaseInfo: databaseInfo.trim() || null,
          monitoringLink: monitoringLink.trim() || null,
          accessReference: accessReference.trim() || null,
          notes: notes.trim() || null,
        }),
      });
      if (!res.ok) {
        setError("Failed to add environment.");
        return;
      }
      onSaved();
    } catch {
      setError("Failed to add environment. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const fieldClass =
    "w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:bg-gray-50";
  const labelClass = "block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2";

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={() => !submitting && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-environment-title"
        className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 id="add-environment-title" className="text-lg font-bold text-gray-900">Add Environment</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close dialog"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="env-name" className={labelClass}>Name *</label>
            <input
              id="env-name"
              ref={firstFieldRef}
              value={environmentName}
              onChange={(e) => setEnvironmentName(e.target.value)}
              placeholder="Production"
              className={fieldClass}
              disabled={submitting}
              required
            />
          </div>

          <div>
            <label htmlFor="env-type" className={labelClass}>Type</label>
            <select
              id="env-type"
              value={environmentType}
              onChange={(e) => setEnvironmentType(e.target.value)}
              className={fieldClass}
              disabled={submitting}
            >
              <option>Development</option>
              <option>Test</option>
              <option>UAT</option>
              <option>Production</option>
            </select>
          </div>

          <div>
            <label htmlFor="env-purpose" className={labelClass}>Purpose</label>
            <input
              id="env-purpose"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="Internal QA testing"
              className={fieldClass}
              disabled={submitting}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="env-server" className={labelClass}>Server Name</label>
              <input
                id="env-server"
                value={serverName}
                onChange={(e) => setServerName(e.target.value)}
                placeholder="prod-lb-02"
                className={fieldClass}
                disabled={submitting}
              />
            </div>
            <div>
              <label htmlFor="env-os" className={labelClass}>Operating System</label>
              <input
                id="env-os"
                value={operatingSystem}
                onChange={(e) => setOperatingSystem(e.target.value)}
                placeholder="Ubuntu 22.04"
                className={fieldClass}
                disabled={submitting}
              />
            </div>
          </div>

          <div>
            <label htmlFor="env-url" className={labelClass}>Application URL</label>
            <input
              id="env-url"
              type="url"
              value={applicationUrl}
              onChange={(e) => setApplicationUrl(e.target.value)}
              placeholder="https://..."
              className={fieldClass}
              disabled={submitting}
            />
          </div>

          <div>
            <label htmlFor="env-db" className={labelClass}>Database Info</label>
            <input
              id="env-db"
              value={databaseInfo}
              onChange={(e) => setDatabaseInfo(e.target.value)}
              placeholder="MySQL 8.0, db-lb-02"
              className={fieldClass}
              disabled={submitting}
            />
          </div>

          <div>
            <label htmlFor="env-monitoring" className={labelClass}>Monitoring Link</label>
            <input
              id="env-monitoring"
              type="url"
              value={monitoringLink}
              onChange={(e) => setMonitoringLink(e.target.value)}
              placeholder="https://grafana..."
              className={fieldClass}
              disabled={submitting}
            />
          </div>

          <div>
            <label htmlFor="env-access" className={labelClass}>Access Reference</label>
            <input
              id="env-access"
              value={accessReference}
              onChange={(e) => setAccessReference(e.target.value)}
              placeholder="See internal access vault entry #..."
              className={fieldClass}
              disabled={submitting}
            />
          </div>

          <div>
            <label htmlFor="env-notes" className={labelClass}>Notes</label>
            <textarea
              id="env-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
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

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
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
              {submitting ? "Adding..." : "Add Environment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}