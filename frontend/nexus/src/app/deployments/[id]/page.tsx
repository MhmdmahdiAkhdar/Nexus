"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ShieldCheck, ExternalLink, X } from "lucide-react";
import Sidebar from "../../layout/Sidebar";
import Topbar from "../../layout/Topbar";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface EnvironmentItem {
  id: number;
  environmentName: string;
  environmentType: string | null;
  serverName: string | null;
  applicationUrl: string | null;
  accessReference: string | null;
}

interface DeploymentDetail {
  id: number;
  recordCode: string;
  clientId: number;
  clientName: string;
  clientCountry: string | null;
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

  return {
    Authorization: `Bearer ${token}`,
  };
}

const ENV_DOT_COLOR: Record<string, string> = {
  Development: "bg-[#3F84E5]",
  Test: "bg-[#3F84E5]",
  UAT: "bg-[#C2762E]",
  Production: "bg-[#267B67]",
};

export default function DeploymentDossierPage() {
  const router = useRouter();
  const params = useParams();
  const deploymentId = params.id as string;

  const [detail, setDetail] = useState<DeploymentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddEnvironment, setShowAddEnvironment] = useState(false);

  async function loadDetail() {
    try {
      const res = await fetch(
        `${API_URL}/api/deployments/${deploymentId}`,
        {
          headers: authHeaders(),
        }
      );

      if (res.status === 404) {
        setError("Deployment not found.");
        return;
      }

      if (!res.ok) {
        throw new Error("Failed to load deployment");
      }

      const data = await res.json();
      setDetail(data);
      setError("");
    } catch (err) {
      console.error("Error loading deployment:", err);
      setError("Could not load deployment. Is the API running?");
    }
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
        const res = await fetch(
          `${API_URL}/api/deployments/${deploymentId}`,
          {
            headers: authHeaders(),
          }
        );

        if (res.status === 404) {
          setError("Deployment not found.");
          return;
        }

        if (!res.ok) {
          throw new Error("Failed to load deployment");
        }

        const data = await res.json();
        setDetail(data);
        setError("");
      } catch (err) {
        console.error("Error loading deployment:", err);
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
      <div className="flex min-h-screen bg-[#F4F0E8]">
        <Sidebar />

        <div className="flex-1 flex flex-col min-w-0">
          <Topbar />

          <main className="flex-1 px-[30px] pt-[30px]">
            <p className="text-[11px] text-[#7A8FA4]">
              Loading deployment…
            </p>
          </main>
        </div>
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="flex min-h-screen bg-[#F4F0E8]">
        <Sidebar />

        <div className="flex-1 flex flex-col min-w-0">
          <Topbar />

          <main className="flex-1 px-[30px] pt-[30px]">
            <p className="text-[11px] text-red-600">
              {error || "Deployment not found."}
            </p>
          </main>
        </div>
      </div>
    );
  }

  const stageStyles: Record<string, string> = {
    Production: "border-[#6EAA99] text-[#267B67]",
    UAT: "border-[#C2762E] text-[#A15F25]",
    Test: "border-[#82A7C4] text-[#36719C]",
    Development: "border-[#82A7C4] text-[#36719C]",
    "Not deployed": "border-gray-300 text-gray-500",
  };

  return (
    <div className="flex min-h-screen bg-[#F4F0E8]">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />

        <main className="flex-1 px-[30px] pt-[30px] pb-10">
          <button
            onClick={() => router.push("/deployments")}
            className="text-[11px] text-[#2874B6] hover:text-[#0B1E3A] mb-3"
          >
            ← DEPLOYMENT REGISTER
          </button>

          <div className="flex items-start justify-between">
            <div>
              <div className="text-[9px] uppercase tracking-[0.18em] text-[#C2762E] font-mono mb-3">
                System register
              </div>

              <h1 className="text-[32px] leading-none tracking-[-1.2px] font-semibold text-[#0B1E3A]">
                {detail.productName} × {detail.clientName}
              </h1>

              <p className="text-[11px] text-[#7A8FA4] mt-2">
                {detail.recordCode} · {detail.productName}{" "}
                {detail.productVersion
                  ? `v${detail.productVersion}`
                  : ""}{" "}
                · {detail.currentStage}
              </p>
            </div>

            <button
              onClick={() =>
                router.push(`/deployments/${deploymentId}/edit`)
              }
              className="border border-gray-300 text-gray-700 text-[13px] font-medium px-4 h-[39px] rounded-md hover:bg-gray-50 transition-colors"
            >
              Edit deployment
            </button>
          </div>

          <div className="border-t border-[#D3D3CF] mt-6 mb-6" />

          <div className="grid grid-cols-[1fr_320px] gap-5">
            <div className="space-y-5">
              <section className="bg-[#FAFAF8] border border-[#D2D5D3] p-6">
                <div className="flex items-center justify-between mb-4">
                  <span
                    className={`text-[9px] font-mono px-2 py-1 border ${
                      stageStyles[detail.currentStage] ??
                      "border-gray-300 text-gray-500"
                    }`}
                  >
                    {detail.currentStage.toUpperCase()}
                  </span>

                  <div className="text-right">
                    <div className="text-[9px] uppercase tracking-wide text-[#8A99A7] font-mono">
                      Support tier
                    </div>

                    <div className="text-[12px] font-medium text-[#0B1E3A]">
                      {detail.supportTier ?? "—"}
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-[#8A99A7] mb-4">
                  {detail.clientName} · {detail.clientCountry ?? "—"}
                  {detail.goLiveDate
                    ? ` · deployed ${new Date(
                        detail.goLiveDate
                      ).toLocaleDateString()}`
                    : ""}
                </p>

                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[#E0E1DE]">
                  <div>
                    <div className="text-[9px] uppercase tracking-wide text-[#8A99A7] font-mono mb-1">
                      Enabled modules
                    </div>

                    <div className="text-[13px] font-medium text-[#3A4A5A]">
                      {detail.enabledModulesCount} /{" "}
                      {detail.totalModulesCount} active
                    </div>
                  </div>

                  <div>
                    <div className="text-[9px] uppercase tracking-wide text-[#8A99A7] font-mono mb-1">
                      Account owner
                    </div>

                    <div className="text-[13px] font-medium text-[#3A4A5A]">
                      {detail.accountOwner || "—"}
                    </div>
                  </div>

                  <div>
                    <div className="text-[9px] uppercase tracking-wide text-[#8A99A7] font-mono mb-1">
                      Current release
                    </div>

                    <div className="text-[13px] font-medium text-[#3F84E5]">
                      {detail.productVersion
                        ? `v${detail.productVersion}`
                        : "—"}
                      {detail.mainBranch
                        ? ` · ${detail.mainBranch}`
                        : ""}
                    </div>
                  </div>
                </div>
              </section>

              <section className="bg-[#FAFAF8] border border-[#D2D5D3] p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-[9px] uppercase tracking-wide text-[#8A99A7] font-mono">
                      Environment references
                    </div>

                    <h3 className="text-[14px] font-semibold text-[#0B1E3A] mt-1">
                      Runtime map /{" "}
                      {String(detail.environments.length).padStart(2, "0")}
                    </h3>
                  </div>

                  <button
                    onClick={() => setShowAddEnvironment(true)}
                    className="text-[11px] text-[#2874B6] hover:text-[#0B1E3A]"
                  >
                    + Add environment
                  </button>
                </div>

                {detail.environments.length === 0 && (
                  <p className="text-[11px] text-[#8A99A7]">
                    No environments recorded for this deployment yet.
                  </p>
                )}

                <div className="space-y-1">
                  {detail.environments.map((env) => (
                    <div
                      key={env.id}
                      className="flex items-center gap-3 py-2.5 border-b border-[#E0E1DE] last:border-b-0"
                    >
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          ENV_DOT_COLOR[
                            env.environmentType ?? ""
                          ] ?? "bg-gray-400"
                        }`}
                      />

                      <span className="text-[12px] text-[#0B1E3A] w-28 shrink-0">
                        {env.environmentType ??
                          env.environmentName}
                      </span>

                      <span className="text-[10px] font-mono text-[#8A99A7] w-24 shrink-0">
                        {env.serverName ?? "—"}
                      </span>

                      {env.applicationUrl ? (
                        <a
                          href={env.applicationUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-[#2874B6] hover:text-[#0B1E3A] flex items-center gap-1"
                        >
                          {env.applicationUrl}
                          <ExternalLink size={11} />
                        </a>
                      ) : (
                        <span className="text-[11px] text-[#8A99A7]">
                          No URL on file
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <div className="space-y-5">
              <section className="bg-white border border-[#D2D5D3] p-5">
                <div className="text-[9px] uppercase tracking-wide text-[#8A99A7] font-mono mb-1">
                  Safety boundary
                </div>

                <h3 className="text-[14px] font-semibold text-[#0B1E3A] mb-3">
                  References, not secrets.
                </h3>

                <p className="text-[11px] text-[#8A99A7] leading-relaxed mb-3">
                  This dossier intentionally records environment names,
                  servers, and application URLs only. Credentials,
                  passwords, tokens, and secrets never render here.
                </p>

                <div className="flex items-start gap-2 pt-3 border-t border-[#E0E1DE] text-[10px] text-[#A15F25]">
                  <span>🔒</span>

                  <span>
                    Secret storage is handled outside Nexus by approved
                    infrastructure controls.
                  </span>
                </div>
              </section>

              <section className="bg-white border border-[#D2D5D3] p-5">
                <div className="text-[9px] uppercase tracking-wide text-[#8A99A7] font-mono mb-2">
                  Deployment health
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck
                    size={16}
                    className="text-[#4A947E]"
                  />

                  <span className="text-[13px] font-semibold text-[#0B1E3A]">
                    {detail.configuredEnvironmentsCount} of{" "}
                    {detail.environments.length} environments
                    configured
                  </span>
                </div>

                <p className="text-[10px] text-[#8A99A7] mb-3">
                  Configured means an environment has both an
                  application URL and access reference on file. This
                  is not a live health check.
                </p>

                {detail.latestActivityTitle && (
                  <div className="pt-3 border-t border-[#E0E1DE] text-[10px] text-[#698097]">
                    Latest activity: {detail.latestActivityTitle}
                    {detail.latestActivityCommitRef
                      ? ` · ${detail.latestActivityCommitRef}`
                      : ""}
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
  const [environmentType, setEnvironmentType] =
    useState("Development");
  const [serverName, setServerName] = useState("");
  const [applicationUrl, setApplicationUrl] = useState("");
  const [accessReference, setAccessReference] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!environmentName.trim()) {
      setError("Environment name is required.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch(
        `${API_URL}/api/deployments/${deploymentId}/environments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...authHeaders(),
          },
          body: JSON.stringify({
            environmentName,
            environmentType,
            serverName: serverName || null,
            applicationUrl: applicationUrl || null,
            accessReference: accessReference || null,
          }),
        }
      );

      if (!res.ok) {
        let message = "Failed to add environment.";

        try {
          const data = await res.json();

          if (data?.message) {
            message = data.message;
          }
        } catch {
          // Response did not contain JSON.
        }

        setError(message);
        return;
      }

      onSaved();
    } catch (err) {
      console.error("Error adding environment:", err);
      setError(
        "Could not connect to the API. Is the server running?"
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-gray-900">
            Add environment
          </h2>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={18} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 mb-1.5">
              NAME
            </label>

            <input
              value={environmentName}
              onChange={(e) =>
                setEnvironmentName(e.target.value)
              }
              placeholder="Production"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-gray-500 mb-1.5">
              TYPE
            </label>

            <select
              value={environmentType}
              onChange={(e) =>
                setEnvironmentType(e.target.value)
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option>Development</option>
              <option>Test</option>
              <option>UAT</option>
              <option>Production</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-gray-500 mb-1.5">
              SERVER NAME
            </label>

            <input
              value={serverName}
              onChange={(e) => setServerName(e.target.value)}
              placeholder="prod-lb-02"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-gray-500 mb-1.5">
              APPLICATION URL
            </label>

            <input
              value={applicationUrl}
              onChange={(e) =>
                setApplicationUrl(e.target.value)
              }
              placeholder="https://..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-gray-500 mb-1.5">
              ACCESS REFERENCE
            </label>

            <input
              value={accessReference}
              onChange={(e) =>
                setAccessReference(e.target.value)
              }
              placeholder="See internal access vault entry #..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>

          {error && (
            <div className="text-xs text-red-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#0B1E3A] hover:bg-[#152C50] disabled:opacity-60 text-white text-sm font-semibold rounded-lg py-2.5"
          >
            {submitting ? "Adding..." : "Add environment"}
          </button>
        </form>
      </div>
    </div>
  );
}
