"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Users, Package, X, Trash2, Pencil, GitBranch, ChevronLeft, AlertCircle, FileText } from "lucide-react";
import Sidebar from "../../layout/Sidebar";
import Topbar from "../../layout/Topbar";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface ProductDetail {
  id: number;
  recordCode: string;
  name: string;
  lifecycleStatus: string;
  criticality: string | null;
  description: string | null;
  businessPurpose: string | null;
  currentVersion: string | null;
  supportedMarkets: string | null;
  technologies: string | null;
  owningTeam: string | null;
  notes: string | null;
  deployedClientsCount: number;
  responsiblePeople: {
    responsibilityId: number;
    teamMemberId: number;
    fullName: string;
    jobTitle: string | null;
    responsibility: string;
  }[];
  modules: { id: number; name: string; description: string | null; status: string }[];
}

interface Deployment {
  id: number;
  clientName: string;
  productVersion: string | null;
  deploymentStatus: string;
  goLiveDate: string | null;
  supportTier: string | null;
}

interface DocumentItem {
  id: number;
  name: string;
  documentType: string | null;
  urlReference: string | null;
  lastUpdatedDate: string | null;
}

interface ActivityItem {
  id: number;
  repositoryName: string;
  title: string;
  description: string | null;
  commitReference: string | null;
  updatedByName: string;
  updateDate: string;
}

interface TeamMemberOption {
  id: number;
  fullName: string;
  jobTitle: string | null;
}

interface RepositoryOption {
  id: number;
  name: string;
}

interface RepositoryFull {
  id: number;
  name: string;
  gitHubUrl: string;
  mainBranch: string | null;
  description: string | null;
}

const TABS = ["Overview", "Deployments", "Documents", "Activity"] as const;
type Tab = (typeof TABS)[number];

function authHeaders() {
  const token = localStorage.getItem("nexus_token");
  return { Authorization: `Bearer ${token}` };
}

function CriticalityBadge({ level }: { level: string | null }) {
  if (!level) return null;
  
  const colors: Record<string, { bg: string; text: string }> = {
    Critical: { bg: "bg-red-100", text: "text-red-700" },
    High: { bg: "bg-orange-100", text: "text-orange-700" },
    Medium: { bg: "bg-yellow-100", text: "text-yellow-700" },
    Low: { bg: "bg-green-100", text: "text-green-700" },
  };

  const style = colors[level] || { bg: "bg-gray-100", text: "text-gray-700" };
  return (
    <span className={`inline-block text-xs font-semibold px-3 py-1.5 rounded-full ${style.bg} ${style.text}`}>
      {level}
    </span>
  );
}

function LifecycleBadge({ status }: { status: string }) {
  const colors: Record<string, { bg: string; text: string }> = {
    Active: { bg: "bg-green-100", text: "text-green-700" },
    Beta: { bg: "bg-blue-100", text: "text-blue-700" },
    Deprecated: { bg: "bg-red-100", text: "text-red-700" },
  };

  const style = colors[status] || { bg: "bg-gray-100", text: "text-gray-700" };
  return (
    <span className={`inline-block text-xs font-semibold px-3 py-1.5 rounded-full ${style.bg} ${style.text}`}>
      {status}
    </span>
  );
}

export default function ProductDossierPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [tab, setTab] = useState<Tab>("Overview");
  const [detail, setDetail] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [deployments, setDeployments] = useState<Deployment[] | null>(null);
  const [documents, setDocuments] = useState<DocumentItem[] | null>(null);
  const [activity, setActivity] = useState<ActivityItem[] | null>(null);

  const [showAddModule, setShowAddModule] = useState(false);
  const [editingModule, setEditingModule] = useState<ProductDetail["modules"][number] | null>(null);
  const [showManageResp, setShowManageResp] = useState(false);
  const [showLogUpdate, setShowLogUpdate] = useState(false);
  const [showAddDocument, setShowAddDocument] = useState(false);
  const [showManageRepos, setShowManageRepos] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const loadDetail = useCallback(async () => {
    const response = await fetch(`${API_URL}/api/products/${productId}`, { headers: authHeaders() });
    if (response.ok) setDetail(await response.json());
  }, [productId]);

  useEffect(() => {
    const token = localStorage.getItem("nexus_token");
    if (!token) {
      router.push("/login");
      return;
    }

    async function init() {
      setLoading(true);
      try {
        const response = await fetch(`${API_URL}/api/products/${productId}`, { headers: authHeaders() });
        if (response.status === 404) {
          setError("Product not found.");
          return;
        }
        if (!response.ok) throw new Error("Failed to load product.");
        setDetail(await response.json());
      } catch (err) {
        console.error(err);
        setError("Could not load product. Is the API running?");
      } finally {
        setLoading(false);
      }
    }

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  useEffect(() => {
    async function loadTabData() {
      if (tab === "Deployments" && deployments === null) {
        const res = await fetch(`${API_URL}/api/products/${productId}/deployments`, { headers: authHeaders() });
        if (res.ok) setDeployments(await res.json());
      }
      if (tab === "Documents" && documents === null) {
        const res = await fetch(`${API_URL}/api/products/${productId}/documents`, { headers: authHeaders() });
        if (res.ok) setDocuments(await res.json());
      }
      if (tab === "Activity" && activity === null) {
        const res = await fetch(`${API_URL}/api/products/${productId}/activity`, { headers: authHeaders() });
        if (res.ok) setActivity(await res.json());
      }
    }
    loadTabData();
  }, [tab, productId, deployments, documents, activity]);

  async function handleDeleteModule(moduleId: number) {
    await fetch(`${API_URL}/api/products/${productId}/modules/${moduleId}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    loadDetail();
  }

  async function handleDeleteProduct() {
    setDeleteError("");
    const res = await fetch(`${API_URL}/api/products/${productId}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setDeleteError(data?.message ?? "Failed to delete product.");
      return;
    }
    router.push("/products");
  }

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

  if (error || !detail) {
    return (
      <div className="flex min-h-screen bg-white">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Topbar />
          <main className="flex-1 px-12 py-8">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error || "Product not found."}</p>
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
          
          {/* Back Button */}
          <button
            onClick={() => router.push("/products")}
            className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-semibold mb-6 transition-colors"
          >
            <ChevronLeft size={16} />
            Back to Products
          </button>

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{detail.name}</h1>
                <p className="text-gray-600 text-sm">
                  {detail.recordCode} • {detail.owningTeam ?? "Unassigned Team"}
                </p>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 border border-red-300 text-red-700 hover:bg-red-50 rounded-lg font-semibold text-sm transition-colors"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
                <button
                  onClick={() => router.push(`/products/${productId}/edit`)}
                  className="px-4 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-semibold text-sm transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => setShowLogUpdate(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm transition-colors"
                >
                  Log Update
                </button>
              </div>
            </div>

            {/* Status Badges */}
            <div className="flex gap-2">
              <LifecycleBadge status={detail.lifecycleStatus} />
              <CriticalityBadge level={detail.criticality} />
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-8">
            <div className="flex gap-8">
              {TABS.map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
                    tab === t
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          {tab === "Overview" && (
            <div className="grid grid-cols-3 gap-8">
              <div className="col-span-2 space-y-6">
                
                {/* Description */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Product Information</h2>
                  
                  {detail.description && (
                    <div className="mb-6">
                      <h3 className="text-sm font-semibold text-gray-700 mb-2">Description</h3>
                      <p className="text-gray-700 text-sm leading-relaxed">{detail.description}</p>
                    </div>
                  )}

                  {detail.businessPurpose && (
                    <div className="mb-6">
                      <h3 className="text-sm font-semibold text-gray-700 mb-2">Business Purpose</h3>
                      <p className="text-gray-700 text-sm leading-relaxed">{detail.businessPurpose}</p>
                    </div>
                  )}

                  {detail.notes && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-2">Notes</h3>
                      <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{detail.notes}</p>
                    </div>
                  )}
                </div>

                {/* Technical Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
                    <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Current Version</h3>
                    <p className="text-2xl font-bold text-gray-900">
                      {detail.currentVersion ? `v${detail.currentVersion}` : "—"}
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
                    <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Deployed Clients</h3>
                    <p className="text-2xl font-bold text-gray-900">{detail.deployedClientsCount}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
                    <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Supported Markets</h3>
                    <p className="text-sm text-gray-800">{detail.supportedMarkets || "—"}</p>
                  </div>
                  
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
                    <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Technologies</h3>
                    <p className="text-sm text-gray-800">{detail.technologies || "—"}</p>
                  </div>
                </div>

                {/* Modules */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-gray-900">Modules</h2>
                    <button
                      onClick={() => setShowAddModule(true)}
                      className="text-sm text-blue-600 hover:text-blue-800 font-semibold"
                    >
                      + Add Module
                    </button>
                  </div>

                  {detail.modules.length === 0 && (
                    <p className="text-gray-600 text-sm">No modules recorded yet.</p>
                  )}

                  <div className="space-y-2">
                    {detail.modules.map((m) => (
                      <div key={m.id} className="flex items-start gap-3 p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                        <Package size={16} className="text-blue-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-gray-900">{m.name}</div>
                          {m.description && <p className="text-xs text-gray-600 mt-1">{m.description}</p>}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="inline-block text-xs font-semibold px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full">
                            {m.status}
                          </span>
                          <button
                            onClick={() => setEditingModule(m)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteModule(m.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Repositories */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-gray-900">Repositories</h2>
                    <button
                      onClick={() => setShowManageRepos(true)}
                      className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-semibold"
                    >
                      <GitBranch size={14} />
                      Manage
                    </button>
                  </div>
                  <p className="text-sm text-gray-600">
                    Repository references and GitHub URLs are stored here for tracking purposes only.
                  </p>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                
                {/* Responsible People */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-gray-900">Responsibility</h2>
                    <button
                      onClick={() => setShowManageResp(true)}
                      className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-semibold"
                    >
                      <Users size={14} />
                      Manage
                    </button>
                  </div>

                  {detail.responsiblePeople.length === 0 && (
                    <p className="text-sm text-gray-600">No one assigned yet.</p>
                  )}

                  <div className="space-y-3">
                    {detail.responsiblePeople.map((p) => (
                      <div key={p.responsibilityId} className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {p.fullName
                            .split(" ")
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join("")
                            .toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-gray-900">{p.fullName}</div>
                          {p.jobTitle && <div className="text-xs text-gray-600">{p.jobTitle}</div>}
                          <div className="text-xs font-semibold text-blue-600 mt-1 uppercase tracking-wider">
                            {p.responsibility}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === "Deployments" && (
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Client</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Version</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Go-Live</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Support Tier</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {deployments === null && (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-600">
                          Loading…
                        </td>
                      </tr>
                    )}
                    {deployments?.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-600">
                          No deployments for this product yet.
                        </td>
                      </tr>
                    )}
                    {deployments?.map((d) => (
                      <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">{d.clientName}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{d.productVersion ? `v${d.productVersion}` : "—"}</td>
                        <td className="px-6 py-4">
                          <span className="inline-block text-xs font-semibold px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full">
                            {d.deploymentStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {d.goLiveDate ? new Date(d.goLiveDate).toLocaleDateString() : "—"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">{d.supportTier ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === "Documents" && (
            <div>
              <div className="flex justify-end mb-4">
                <button
                  onClick={() => setShowAddDocument(true)}
                  className="text-sm text-blue-600 hover:text-blue-800 font-semibold"
                >
                  + Add Document
                </button>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                {documents === null && (
                  <div className="px-6 py-8 text-center text-sm text-gray-600">Loading…</div>
                )}
                {documents?.length === 0 && (
                  <div className="px-6 py-8 text-center text-sm text-gray-600">No documents recorded yet.</div>
                )}
                <div className="divide-y divide-gray-200">
                  {documents?.map((d) => (
                    <div key={d.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <FileText size={16} className="text-gray-400" />
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{d.name}</div>
                          <div className="text-xs text-gray-600 mt-0.5">
                            {d.documentType ?? "Document"}
                            {d.lastUpdatedDate && ` • Updated ${new Date(d.lastUpdatedDate).toLocaleDateString()}`}
                          </div>
                        </div>
                      </div>
                      {d.urlReference && (
                        <a
                          href={d.urlReference}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-800 font-semibold"
                        >
                          Open →
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === "Activity" && (
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              {activity === null && (
                <div className="px-6 py-8 text-center text-sm text-gray-600">Loading…</div>
              )}
              {activity?.length === 0 && (
                <div className="px-6 py-8 text-center text-sm text-gray-600">No activity logged yet.</div>
              )}
              <div className="divide-y divide-gray-200">
                {activity?.map((a) => (
                  <div key={a.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-sm font-semibold text-gray-900">{a.title}</h3>
                      <span className="text-xs text-gray-600">
                        {new Date(a.updateDate).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">
                      {a.repositoryName} • {a.updatedByName}
                      {a.commitReference && ` • ${a.commitReference}`}
                    </p>
                    {a.description && <p className="text-sm text-gray-700">{a.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
      {showAddModule && (
        <ModuleFormModal
          productId={productId}
          onClose={() => setShowAddModule(false)}
          onSaved={() => {
            setShowAddModule(false);
            loadDetail();
          }}
        />
      )}

      {editingModule && (
        <ModuleFormModal
          productId={productId}
          existing={editingModule}
          onClose={() => setEditingModule(null)}
          onSaved={() => {
            setEditingModule(null);
            loadDetail();
          }}
        />
      )}

      {showManageResp && (
        <ManageResponsibilityModal
          productId={productId}
          people={detail.responsiblePeople}
          onClose={() => setShowManageResp(false)}
          onChanged={() => loadDetail()}
        />
      )}

      {showLogUpdate && (
        <LogUpdateModal
          productId={productId}
          onClose={() => setShowLogUpdate(false)}
          onSaved={() => {
            setShowLogUpdate(false);
            setActivity(null);
          }}
        />
      )}

      {showAddDocument && (
        <AddDocumentModal
          productId={productId}
          onClose={() => setShowAddDocument(false)}
          onSaved={() => {
            setShowAddDocument(false);
            setDocuments(null);
          }}
        />
      )}

      {showManageRepos && (
        <ManageRepositoriesModal productId={productId} onClose={() => setShowManageRepos(false)} />
      )}

      {showDeleteConfirm && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-gray-900 mb-2">Delete Product?</h2>
            <p className="text-sm text-gray-600 mb-4">
              This action cannot be undone. If modules, deployments, repositories, or documents are linked, deletion will be blocked.
            </p>
            {deleteError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-800">
                {deleteError}
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-semibold text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteProduct}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold text-sm transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ModuleFormModal({
  productId,
  existing,
  onClose,
  onSaved,
}: {
  productId: string;
  existing?: { id: number; name: string; description: string | null; status: string };
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(existing?.name ?? "");
  const [description, setDescription] = useState(existing?.description ?? "");
  const [status, setStatus] = useState(existing?.status ?? "Active");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Module name is required.");
      return;
    }
    setSubmitting(true);
    try {
      const url = existing
        ? `${API_URL}/api/products/${productId}/modules/${existing.id}`
        : `${API_URL}/api/products/${productId}/modules`;
      const res = await fetch(url, {
        method: existing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ name, description: description || null, status }),
      });
      if (!res.ok) {
        setError(existing ? "Failed to update module." : "Failed to add module.");
        return;
      }
      onSaved();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900">
            {existing ? "Edit Module" : "Add Module"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            >
              <option>Active</option>
              <option>In Development</option>
              <option>Deprecated</option>
            </select>
          </div>

          {error && <div className="text-xs text-red-600">{error}</div>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg transition-colors"
          >
            {submitting ? "Saving..." : existing ? "Save Changes" : "Add Module"}
          </button>
        </form>
      </div>
    </div>
  );
}

function ManageResponsibilityModal({
  productId,
  people,
  onClose,
  onChanged,
}: {
  productId: string;
  people: ProductDetail["responsiblePeople"];
  onClose: () => void;
  onChanged: () => void;
}) {
  const [teamMembers, setTeamMembers] = useState<TeamMemberOption[]>([]);
  const [teamMemberId, setTeamMemberId] = useState("");
  const [responsibility, setResponsibility] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/api/team-members`, { headers: authHeaders() })
      .then((r) => r.json())
      .then(setTeamMembers)
      .catch(() => setTeamMembers([]));
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!teamMemberId || !responsibility.trim()) {
      setError("Select a person and enter a responsibility.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/products/${productId}/responsibilities`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ teamMemberId: Number(teamMemberId), responsibility }),
      });
      if (!res.ok) {
        setError("Failed to add responsibility.");
        return;
      }
      setTeamMemberId("");
      setResponsibility("");
      onChanged();
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRemove(responsibilityId: number) {
    await fetch(`${API_URL}/api/products/${productId}/responsibilities/${responsibilityId}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    onChanged();
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900">Manage Responsibility</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-2 mb-6 pb-6 border-b border-gray-200">
          {people.length === 0 && <p className="text-sm text-gray-600">No one assigned yet.</p>}
          {people.map((p) => (
            <div key={p.responsibilityId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="min-w-0">
                <div className="text-sm font-semibold text-gray-900">{p.fullName}</div>
                <div className="text-xs text-gray-600">{p.responsibility}</div>
              </div>
              <button
                onClick={() => handleRemove(p.responsibilityId)}
                className="text-xs text-red-600 hover:text-red-800 font-semibold ml-2 flex-shrink-0"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
              Team Member
            </label>
            <select
              value={teamMemberId}
              onChange={(e) => setTeamMemberId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            >
              <option value="">Select a person…</option>
              {teamMembers.map((tm) => (
                <option key={tm.id} value={tm.id}>
                  {tm.fullName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
              Responsibility
            </label>
            <input
              type="text"
              value={responsibility}
              onChange={(e) => setResponsibility(e.target.value)}
              placeholder="e.g., Product Owner"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          {error && <div className="text-xs text-red-600">{error}</div>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg transition-colors"
          >
            {submitting ? "Adding..." : "Add Responsibility"}
          </button>
        </form>
      </div>
    </div>
  );
}

function LogUpdateModal({ productId, onClose, onSaved }: { productId: string; onClose: () => void; onSaved: () => void }) {
  const [repositories, setRepositories] = useState<RepositoryOption[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMemberOption[]>([]);
  const [repositoryId, setRepositoryId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [commitReference, setCommitReference] = useState("");
  const [teamMemberId, setTeamMemberId] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/api/products/${productId}/repositories`, { headers: authHeaders() })
      .then((r) => r.json())
      .then(setRepositories)
      .catch(() => setRepositories([]));
    fetch(`${API_URL}/api/team-members`, { headers: authHeaders() })
      .then((r) => r.json())
      .then(setTeamMembers)
      .catch(() => setTeamMembers([]));
  }, [productId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!repositoryId || !title.trim() || !teamMemberId) {
      setError("Repository, title, and who made the update are required.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/products/${productId}/activity`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({
          repositoryId: Number(repositoryId),
          title,
          description: description || null,
          commitReference: commitReference || null,
          teamMemberId: Number(teamMemberId),
        }),
      });
      if (!res.ok) {
        setError("Failed to log update.");
        return;
      }
      onSaved();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900">Log Update</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {repositories.length === 0 ? (
          <p className="text-sm text-gray-600">
            This product has no repositories linked. Add one via "Manage repositories" first.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Repository
              </label>
              <select
                value={repositoryId}
                onChange={(e) => setRepositoryId(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              >
                <option value="">Select repository…</option>
                {repositories.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Commit Reference
              </label>
              <input
                type="text"
                value={commitReference}
                onChange={(e) => setCommitReference(e.target.value)}
                placeholder="e.g., a1b2c3d"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Updated By
              </label>
              <select
                value={teamMemberId}
                onChange={(e) => setTeamMemberId(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              >
                <option value="">Select person…</option>
                {teamMembers.map((tm) => (
                  <option key={tm.id} value={tm.id}>
                    {tm.fullName}
                  </option>
                ))}
              </select>
            </div>

            {error && <div className="text-xs text-red-600">{error}</div>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg transition-colors"
            >
              {submitting ? "Logging..." : "Log Update"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

function AddDocumentModal({ productId, onClose, onSaved }: { productId: string; onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState("");
  const [documentType, setDocumentType] = useState("");
  const [urlReference, setUrlReference] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Document name is required.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/products/${productId}/documents`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ name, documentType: documentType || null, urlReference: urlReference || null }),
      });
      if (!res.ok) {
        setError("Failed to add document.");
        return;
      }
      onSaved();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900">Add Document</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
              Type
            </label>
            <input
              type="text"
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              placeholder="e.g., Technical, Operational"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
              URL
            </label>
            <input
              type="url"
              value={urlReference}
              onChange={(e) => setUrlReference(e.target.value)}
              placeholder="https://example.com"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          {error && <div className="text-xs text-red-600">{error}</div>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg transition-colors"
          >
            {submitting ? "Adding..." : "Add Document"}
          </button>
        </form>
      </div>
    </div>
  );
}

function ManageRepositoriesModal({ productId, onClose }: { productId: string; onClose: () => void }) {
  const [repos, setRepos] = useState<RepositoryFull[] | null>(null);
  const [editingId, setEditingId] = useState<number | "new" | null>(null);
  const [name, setName] = useState("");
  const [gitHubUrl, setGitHubUrl] = useState("");
  const [mainBranch, setMainBranch] = useState("main");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function loadRepos() {
    const res = await fetch(`${API_URL}/api/products/${productId}/repositories/full`, { headers: authHeaders() });
    if (res.ok) setRepos(await res.json());
  }

  useEffect(() => {
    loadRepos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function startEdit(repo: RepositoryFull) {
    setEditingId(repo.id);
    setName(repo.name);
    setGitHubUrl(repo.gitHubUrl);
    setMainBranch(repo.mainBranch ?? "main");
    setDescription(repo.description ?? "");
  }

  function startNew() {
    setEditingId("new");
    setName("");
    setGitHubUrl("");
    setMainBranch("main");
    setDescription("");
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!name.trim() || !gitHubUrl.trim()) {
      setError("Name and GitHub URL are required.");
      return;
    }
    setSubmitting(true);
    try {
      const url =
        editingId === "new"
          ? `${API_URL}/api/products/${productId}/repositories`
          : `${API_URL}/api/products/${productId}/repositories/${editingId}`;

      const res = await fetch(url, {
        method: editingId === "new" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ name, gitHubUrl, mainBranch: mainBranch || null, description: description || null }),
      });

      if (!res.ok) {
        setError("Failed to save repository.");
        return;
      }

      setEditingId(null);
      loadRepos();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900">Manage Repositories</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {editingId === null && (
          <>
            <div className="space-y-2 mb-4">
              {repos === null && <p className="text-sm text-gray-600">Loading…</p>}
              {repos?.length === 0 && <p className="text-sm text-gray-600">No repositories yet.</p>}
              {repos?.map((r) => (
                <div key={r.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-gray-900">{r.name}</div>
                    <div className="text-xs text-gray-600 truncate">
                      {r.gitHubUrl} • {r.mainBranch ?? "main"}
                    </div>
                  </div>
                  <button
                    onClick={() => startEdit(r)}
                    className="text-blue-600 hover:text-blue-800 flex-shrink-0"
                  >
                    <Pencil size={14} />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={startNew}
              className="w-full border-2 border-dashed border-gray-300 text-gray-600 hover:text-gray-900 font-semibold py-2.5 rounded-lg transition-colors text-sm"
            >
              + Add Repository
            </button>
          </>
        )}

        {editingId !== null && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., corepay-api"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                GitHub URL
              </label>
              <input
                type="url"
                value={gitHubUrl}
                onChange={(e) => setGitHubUrl(e.target.value)}
                placeholder="https://github.com/org/repo"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Main Branch
              </label>
              <input
                type="text"
                value={mainBranch}
                onChange={(e) => setMainBranch(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>

            {error && <div className="text-xs text-red-600">{error}</div>}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setEditingId(null)}
                className="flex-1 border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold py-2.5 rounded-lg transition-colors text-sm"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg transition-colors text-sm"
              >
                {submitting ? "Saving..." : editingId === "new" ? "Add" : "Save"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}