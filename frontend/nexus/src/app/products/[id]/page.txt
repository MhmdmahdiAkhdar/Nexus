"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Users, Layers, X, Trash2, Pencil, GitBranch } from "lucide-react";
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
      <div className="flex min-h-screen bg-[#F4F0E8]">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Topbar />
          <main className="flex-1 px-[30px] pt-[30px]">
            <p className="text-[11px] text-[#7A8FA4]">Loading product…</p>
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
            <p className="text-[11px] text-red-600">{error || "Product not found."}</p>
          </main>
        </div>
      </div>
    );
  }

  const lifecycleStyles: Record<string, string> = {
    Active: "border-[#6EAA99] text-[#267B67]",
    Beta: "border-[#82A7C4] text-[#36719C]",
    Deprecated: "border-[#C2762E] text-[#A15F25]",
  };

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
                {detail.name}
              </h1>
              <p className="text-[11px] text-[#7A8FA4] mt-2">
                {detail.recordCode} · {detail.owningTeam ?? "Unassigned"}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="border border-red-300 text-red-500 text-[13px] font-medium px-3 h-[39px] rounded-md hover:bg-red-500 hover:text-white hover:border-red-500 transition-colors flex items-center gap-1.5"
              >
                <Trash2 size={14} /> Delete
              </button>
              <button
                onClick={() => router.push(`/products/${productId}/edit`)}
                className="border border-gray-300 text-gray-700 text-[13px] font-medium px-4 h-[39px] rounded-md hover:bg-gray-50 transition-colors"
              >
                Edit product
              </button>
              <button
                onClick={() => setShowLogUpdate(true)}
                className="flex items-center gap-2 bg-[#0B1E3A] hover:bg-[#152C50] text-white text-[13px] font-medium px-4 h-[39px] rounded-md transition-colors"
              >
                + Log update
              </button>
            </div>
          </div>

          <div className="flex gap-6 border-b border-[#D3D3CF] mt-6">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`text-[12px] pb-3 -mb-px border-b-2 transition-colors ${
                  tab === t
                    ? "border-[#0B1E3A] text-[#0B1E3A] font-semibold"
                    : "border-transparent text-[#8A99A7] hover:text-[#0B1E3A]"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {tab === "Overview" && (
            <div className="grid grid-cols-[1fr_320px] gap-5 mt-6">
              <div className="space-y-5">
                <section className="bg-[#FAFAF8] border border-[#D2D5D3] p-6">
                  <div className="flex gap-2 mb-4">
                    <span className={`text-[9px] font-mono px-2 py-1 border ${lifecycleStyles[detail.lifecycleStatus] ?? "border-gray-300 text-gray-500"}`}>
                      {detail.lifecycleStatus.toUpperCase()}
                    </span>
                    {detail.criticality && (
                      <span className="text-[9px] font-mono px-2 py-1 border border-[#C2762E] text-[#A15F25]">
                        {detail.criticality.toUpperCase()}
                      </span>
                    )}
                  </div>

                  {detail.description && (
                    <p className="text-[13px] text-[#3A4A5A] leading-relaxed mb-4">{detail.description}</p>
                  )}

                  {detail.currentVersion && (
                    <div className="mb-4">
                      <div className="text-[9px] uppercase tracking-wide text-[#8A99A7] font-mono">Current version</div>
                      <div className="text-[16px] font-semibold text-[#3F84E5]">v{detail.currentVersion}</div>
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[#E0E1DE]">
                    <div>
                      <div className="text-[9px] uppercase tracking-wide text-[#8A99A7] font-mono mb-1">Business purpose</div>
                      <div className="text-[11px] text-[#3A4A5A]">{detail.businessPurpose || "—"}</div>
                    </div>
                    <div>
                      <div className="text-[9px] uppercase tracking-wide text-[#8A99A7] font-mono mb-1">Supported markets</div>
                      <div className="text-[11px] text-[#3A4A5A]">{detail.supportedMarkets || "—"}</div>
                    </div>
                    <div>
                      <div className="text-[9px] uppercase tracking-wide text-[#8A99A7] font-mono mb-1">Technology</div>
                      <div className="text-[11px] text-[#3A4A5A]">{detail.technologies || "—"}</div>
                    </div>
                  </div>

                  {detail.notes && (
                    <div className="pt-4 mt-4 border-t border-[#E0E1DE]">
                      <div className="text-[9px] uppercase tracking-wide text-[#8A99A7] font-mono mb-1">Notes</div>
                      <div className="text-[11px] text-[#3A4A5A] whitespace-pre-wrap">{detail.notes}</div>
                    </div>
                  )}
                </section>

                <section className="bg-[#FAFAF8] border border-[#D2D5D3] p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-[9px] uppercase tracking-wide text-[#8A99A7] font-mono">Product architecture</div>
                      <h3 className="text-[14px] font-semibold text-[#0B1E3A] mt-1">Modules</h3>
                    </div>
                    <button
                      onClick={() => setShowAddModule(true)}
                      className="text-[11px] text-[#2874B6] hover:text-[#0B1E3A]"
                    >
                      + Add module
                    </button>
                  </div>

                  {detail.modules.length === 0 && (
                    <p className="text-[11px] text-[#8A99A7]">No modules recorded yet.</p>
                  )}

                  <div className="space-y-2">
                    {detail.modules.map((m) => (
                      <div key={m.id} className="flex items-center gap-3 border border-[#E0E1DE] bg-white rounded-md px-3 py-2.5">
                        <Layers size={14} className="text-[#3F84E5] shrink-0" />
                        <div className="flex-1">
                          <div className="text-[12px] font-medium text-[#0B1E3A]">{m.name}</div>
                          {m.description && <div className="text-[10px] text-[#8A99A7]">{m.description}</div>}
                        </div>
                        <span className="text-[9px] font-mono text-[#698097]">{m.status}</span>
                        <button onClick={() => setEditingModule(m)} className="text-gray-400 hover:text-[#3F84E5]">
                          <Pencil size={13} />
                        </button>
                        <button onClick={() => handleDeleteModule(m.id)} className="text-gray-400 hover:text-red-500">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="bg-[#FAFAF8] border border-[#D2D5D3] p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-[9px] uppercase tracking-wide text-[#8A99A7] font-mono">Source control</div>
                      <h3 className="text-[14px] font-semibold text-[#0B1E3A] mt-1">Repositories</h3>
                    </div>
                    <button
                      onClick={() => setShowManageRepos(true)}
                      className="flex items-center gap-1.5 text-[11px] text-[#2874B6] hover:text-[#0B1E3A]"
                    >
                      <GitBranch size={13} /> Manage repositories
                    </button>
                  </div>
                  <p className="text-[11px] text-[#8A99A7]">
                    Repository name, GitHub URL, and main branch are stored here for reference — no automatic sync.
                  </p>
                </section>
              </div>

              <div className="space-y-5">
                <section className="bg-white border border-[#D2D5D3] p-5">
                  <div className="text-[9px] uppercase tracking-wide text-[#8A99A7] font-mono">Accountability chain</div>
                  <h3 className="text-[14px] font-semibold text-[#0B1E3A] mt-1 mb-3">Responsible people</h3>

                  {detail.responsiblePeople.length === 0 && (
                    <p className="text-[11px] text-[#8A99A7] mb-3">No one assigned yet.</p>
                  )}

                  <div className="space-y-3 mb-3">
                    {detail.responsiblePeople.map((p) => (
                      <div key={p.responsibilityId} className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-[#0B1E3A] text-white flex items-center justify-center text-[10px] font-semibold shrink-0">
                          {p.fullName.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[12px] font-medium text-[#0B1E3A] truncate">{p.fullName}</div>
                          <div className="text-[10px] text-[#8A99A7]">{p.jobTitle || ""}</div>
                        </div>
                        <span className="text-[9px] font-mono text-[#698097] uppercase shrink-0">{p.responsibility}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => setShowManageResp(true)}
                    className="flex items-center gap-1.5 text-[11px] text-[#2874B6] hover:text-[#0B1E3A]"
                  >
                    <Users size={13} /> Manage responsibility
                  </button>
                </section>

                <section className="bg-white border border-[#D2D5D3] p-5">
                  <div className="text-[9px] uppercase tracking-wide text-[#8A99A7] font-mono">
                    Client footprint / {String(detail.deployedClientsCount).padStart(2, "0")}
                  </div>
                  <h3 className="text-[14px] font-semibold text-[#0B1E3A] mt-1">Deployed clients</h3>
                  <p className="text-[11px] text-[#8A99A7] mt-2">
                    See the Deployments tab for the full list of clients this product is live with.
                  </p>
                </section>
              </div>
            </div>
          )}

          {tab === "Deployments" && (
            <div className="bg-[#FAFAF8] border border-[#D2D5D3] mt-6">
              <div className="grid grid-cols-[1fr_100px_120px_120px_100px] px-[18px] py-2.5 border-b border-[#D8D9D7] text-[9px] uppercase tracking-[0.1em] font-mono text-[#698097]">
                <span>Client</span>
                <span>Version</span>
                <span>Status</span>
                <span>Go-live</span>
                <span>Tier</span>
              </div>
              {deployments === null && <div className="px-[18px] py-6 text-[11px] text-[#8A99A7]">Loading…</div>}
              {deployments?.length === 0 && (
                <div className="px-[18px] py-6 text-[11px] text-[#8A99A7]">No deployments for this product yet.</div>
              )}
              {deployments?.map((d) => (
                <div key={d.id} className="grid grid-cols-[1fr_100px_120px_120px_100px] items-center min-h-[56px] px-[18px] border-b border-[#E0E1DE] last:border-b-0 text-[11px]">
                  <span className="text-[#0B1E3A] font-medium">{d.clientName}</span>
                  <span className="text-[#4A5A6A]">{d.productVersion ? `v${d.productVersion}` : "—"}</span>
                  <span className="text-[#3F84E5]">{d.deploymentStatus}</span>
                  <span className="text-[#8A99A7]">{d.goLiveDate ? new Date(d.goLiveDate).toLocaleDateString() : "—"}</span>
                  <span className="text-[#A15F25]">{d.supportTier ?? "—"}</span>
                </div>
              ))}
            </div>
          )}

          {tab === "Documents" && (
            <div className="mt-6">
              <div className="flex justify-end mb-3">
                <button
                  onClick={() => setShowAddDocument(true)}
                  className="text-[11px] text-[#2874B6] hover:text-[#0B1E3A]"
                >
                  + Add document
                </button>
              </div>
              <div className="bg-[#FAFAF8] border border-[#D2D5D3]">
                {documents === null && <div className="px-[18px] py-6 text-[11px] text-[#8A99A7]">Loading…</div>}
                {documents?.length === 0 && (
                  <div className="px-[18px] py-6 text-[11px] text-[#8A99A7]">No documents recorded yet.</div>
                )}
                {documents?.map((d) => (
                  <div key={d.id} className="flex items-center justify-between px-[18px] py-3 border-b border-[#E0E1DE] last:border-b-0">
                    <div>
                      <div className="text-[12px] font-medium text-[#0B1E3A]">{d.name}</div>
                      <div className="text-[10px] text-[#8A99A7]">
                        {d.documentType ?? "Document"}
                        {d.lastUpdatedDate ? ` · updated ${new Date(d.lastUpdatedDate).toLocaleDateString()}` : ""}
                      </div>
                    </div>
                    {d.urlReference && (
                      <a href={d.urlReference} target="_blank" rel="noreferrer" className="text-[11px] text-[#2874B6] hover:text-[#0B1E3A]">
                        Open ↗
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "Activity" && (
            <div className="bg-[#FAFAF8] border border-[#D2D5D3] mt-6">
              {activity === null && <div className="px-[18px] py-6 text-[11px] text-[#8A99A7]">Loading…</div>}
              {activity?.length === 0 && (
                <div className="px-[18px] py-6 text-[11px] text-[#8A99A7]">No activity logged yet.</div>
              )}
              {activity?.map((a) => (
                <div key={a.id} className="px-[18px] py-3.5 border-b border-[#E0E1DE] last:border-b-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-medium text-[#0B1E3A]">{a.title}</span>
                    <span className="text-[10px] text-[#8A99A7]">{new Date(a.updateDate).toLocaleDateString()}</span>
                  </div>
                  <div className="text-[10px] text-[#8A99A7] mt-0.5">
                    {a.repositoryName} · {a.updatedByName}
                    {a.commitReference ? ` · ${a.commitReference}` : ""}
                  </div>
                  {a.description && <p className="text-[11px] text-[#3A4A5A] mt-1.5">{a.description}</p>}
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

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
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Delete this product?</h2>
            <p className="text-sm text-gray-500 mb-4">
              This can't be undone. If modules, deployments, repositories, or documents are still linked, the
              delete will be blocked.
            </p>
            {deleteError && <div className="text-xs text-red-600 mb-4">{deleteError}</div>}
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium py-2.5 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteProduct}
                className="flex-1 rounded-lg bg-red-500 text-white text-sm font-medium py-2.5 hover:bg-red-600"
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
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-gray-900">{existing ? "Edit module" : "Add module"}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 mb-1.5">NAME</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 mb-1.5">DESCRIPTION</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 mb-1.5">STATUS</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
              <option>Active</option>
              <option>In Development</option>
              <option>Deprecated</option>
            </select>
          </div>
          {error && <div className="text-xs text-red-600">{error}</div>}
          <button type="submit" disabled={submitting} className="w-full bg-[#0B1E3A] hover:bg-[#152C50] disabled:opacity-60 text-white text-sm font-semibold rounded-lg py-2.5">
            {submitting ? "Saving..." : existing ? "Save changes" : "Add module"}
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
      setError("Pick a person and enter a responsibility.");
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
        setError("Failed to add.");
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
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-gray-900">Manage responsibility</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-2 mb-5">
          {people.length === 0 && <p className="text-[11px] text-gray-400">No one assigned yet.</p>}
          {people.map((p) => (
            <div key={p.responsibilityId} className="flex items-center justify-between border border-gray-200 rounded-lg px-3 py-2">
              <div>
                <div className="text-[12px] font-medium text-gray-800">{p.fullName}</div>
                <div className="text-[10px] text-gray-500">{p.responsibility}</div>
              </div>
              <button onClick={() => handleRemove(p.responsibilityId)} className="text-[11px] text-red-500 hover:text-red-700">
                Remove
              </button>
            </div>
          ))}
        </div>

        <form onSubmit={handleAdd} className="space-y-3 border-t border-gray-200 pt-4">
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 mb-1.5">TEAM MEMBER</label>
            <select value={teamMemberId} onChange={(e) => setTeamMemberId(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
              <option value="">Select...</option>
              {teamMembers.map((tm) => (
                <option key={tm.id} value={tm.id}>
                  {tm.fullName} {tm.jobTitle ? `— ${tm.jobTitle}` : ""}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 mb-1.5">RESPONSIBILITY</label>
            <input
              value={responsibility}
              onChange={(e) => setResponsibility(e.target.value)}
              placeholder="e.g. Product Owner"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          {error && <div className="text-xs text-red-600">{error}</div>}
          <button type="submit" disabled={submitting} className="w-full bg-[#0B1E3A] hover:bg-[#152C50] disabled:opacity-60 text-white text-sm font-semibold rounded-lg py-2.5">
            {submitting ? "Adding..." : "Add responsibility"}
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
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-gray-900">Log update</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>
        {repositories.length === 0 ? (
          <p className="text-[12px] text-gray-500">
            This product has no repositories linked yet, so there's nowhere to attach an update log entry. Add
            one via "Manage repositories" first.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 mb-1.5">REPOSITORY</label>
              <select value={repositoryId} onChange={(e) => setRepositoryId(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                <option value="">Select...</option>
                {repositories.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 mb-1.5">TITLE</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 mb-1.5">DESCRIPTION</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 mb-1.5">COMMIT REFERENCE</label>
              <input value={commitReference} onChange={(e) => setCommitReference(e.target.value)} placeholder="a1b2c3d" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 mb-1.5">UPDATED BY</label>
              <select value={teamMemberId} onChange={(e) => setTeamMemberId(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                <option value="">Select...</option>
                {teamMembers.map((tm) => (
                  <option key={tm.id} value={tm.id}>
                    {tm.fullName}
                  </option>
                ))}
              </select>
            </div>
            {error && <div className="text-xs text-red-600">{error}</div>}
            <button type="submit" disabled={submitting} className="w-full bg-[#0B1E3A] hover:bg-[#152C50] disabled:opacity-60 text-white text-sm font-semibold rounded-lg py-2.5">
              {submitting ? "Logging..." : "Log update"}
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
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-gray-900">Add document</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 mb-1.5">NAME</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 mb-1.5">TYPE</label>
            <input value={documentType} onChange={(e) => setDocumentType(e.target.value)} placeholder="Technical, Operational..." className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 mb-1.5">URL</label>
            <input value={urlReference} onChange={(e) => setUrlReference(e.target.value)} placeholder="https://..." className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          {error && <div className="text-xs text-red-600">{error}</div>}
          <button type="submit" disabled={submitting} className="w-full bg-[#0B1E3A] hover:bg-[#152C50] disabled:opacity-60 text-white text-sm font-semibold rounded-lg py-2.5">
            {submitting ? "Adding..." : "Add document"}
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
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-gray-900">Manage repositories</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        {editingId === null && (
          <>
            <div className="space-y-2 mb-4">
              {repos === null && <p className="text-[11px] text-gray-400">Loading…</p>}
              {repos?.length === 0 && <p className="text-[11px] text-gray-400">No repositories recorded yet.</p>}
              {repos?.map((r) => (
                <div key={r.id} className="flex items-center justify-between border border-gray-200 rounded-lg px-3 py-2.5">
                  <div className="min-w-0">
                    <div className="text-[12px] font-medium text-gray-800">{r.name}</div>
                    <div className="text-[10px] text-gray-500 truncate">
                      {r.gitHubUrl} · {r.mainBranch ?? "main"}
                    </div>
                  </div>
                  <button onClick={() => startEdit(r)} className="text-[#3F84E5] hover:text-[#0B1E3A] shrink-0">
                    <Pencil size={14} />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={startNew}
              className="w-full border border-dashed border-gray-300 text-gray-600 text-sm rounded-lg py-2.5 hover:bg-gray-50"
            >
              + Add repository
            </button>
          </>
        )}

        {editingId !== null && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 mb-1.5">NAME</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="corepay-api" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 mb-1.5">GITHUB URL</label>
              <input value={gitHubUrl} onChange={(e) => setGitHubUrl(e.target.value)} placeholder="https://github.com/org/repo" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 mb-1.5">MAIN BRANCH</label>
              <input value={mainBranch} onChange={(e) => setMainBranch(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 mb-1.5">DESCRIPTION</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            {error && <div className="text-xs text-red-600">{error}</div>}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setEditingId(null)}
                className="flex-1 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg py-2.5 hover:bg-gray-50"
              >
                Back
              </button>
              <button type="submit" disabled={submitting} className="flex-1 bg-[#0B1E3A] hover:bg-[#152C50] disabled:opacity-60 text-white text-sm font-semibold rounded-lg py-2.5">
                {submitting ? "Saving..." : editingId === "new" ? "Add" : "Save"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}