"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Building2, MapPin, Mail, Phone, X, Trash2, ChevronLeft, AlertCircle, Package } from "lucide-react";
import Sidebar from "../../layout/Sidebar";
import Topbar from "../../layout/Topbar";
import { isAdmin } from "@/app/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface ConnectedProduct {
  deploymentId: number;
  productId: number;
  productName: string;
  productVersion: string | null;
  environmentType: string | null;
  recordCode: string;
}

interface ClientDetail {
  id: number;
  recordCode: string;
  companyName: string;
  country: string | null;
  industry: string | null;
  status: string;
  primaryContactName: string | null;
  primaryContactEmail: string | null;
  supportPhone: string | null;
  registeredOffice: string | null;
  accountOwner: string | null;
  notes: string | null;
  createdAt: string;
  connectedProducts: ConnectedProduct[];
}

interface ProductOption {
  id: number;
  name: string;
}

function authHeaders() {
  const token = localStorage.getItem("nexus_token");
  return { Authorization: `Bearer ${token}` };
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, { bg: string; text: string }> = {
    Active: { bg: "bg-green-100", text: "text-green-700" },
    Onboarding: { bg: "bg-amber-100", text: "text-amber-700" },
    Inactive: { bg: "bg-gray-100", text: "text-gray-700" },
  };

  const style = colors[status] || { bg: "bg-gray-100", text: "text-gray-700" };
  return (
    <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${style.bg} ${style.text}`}>
      {status}
    </span>
  );
}

export default function ClientDossierPage() {
  const router = useRouter();
  const params = useParams();
  const clientId = params.id as string;

  const [detail, setDetail] = useState<ClientDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddDeployment, setShowAddDeployment] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  async function loadDetail() {
    const res = await fetch(`${API_URL}/api/clients/${clientId}`, { headers: authHeaders() });
    if (res.ok) setDetail(await res.json());
  }

  useEffect(() => {
    const token = localStorage.getItem("nexus_token");
    if (!token) {
      router.push("/login");
      return;
    }
    if (!isAdmin()){
      router.push(`/clients/${clientId}`)
    }

    async function init() {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/api/clients/${clientId}`, { headers: authHeaders() });
        if (res.status === 404) {
          setError("Client not found.");
          return;
        }
        if (!res.ok) throw new Error();
        setDetail(await res.json());
      } catch {
        setError("Could not load client. Is the API running?");
      } finally {
        setLoading(false);
      }
    }

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId]);

  async function handleDeleteClient() {
    setDeleteError("");
    const res = await fetch(`${API_URL}/api/clients/${clientId}`, { method: "DELETE", headers: authHeaders() });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setDeleteError(data?.message ?? "Failed to delete client.");
      return;
    }
    router.push("/clients");
  }

  if (loading) {
    return (
      <div className="flex min-h-screen bg-white">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Topbar />
          <main className="flex-1 px-12 py-8">
            <p className="text-sm text-gray-500">Loading client…</p>
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
              <p className="text-sm text-red-800">{error || "Client not found."}</p>
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
            onClick={() => router.push("/clients")}
            className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-semibold mb-6 transition-colors"
          >
            <ChevronLeft size={16} />
            Back to Clients
          </button>

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{detail.companyName}</h1>
                <p className="text-gray-600 text-sm">
                  {detail.recordCode} • {detail.country ?? "—"}
                  {detail.industry ? ` • ${detail.industry}` : ""}
                </p>
              </div>

                {isAdmin() && (
                <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 border border-red-300 text-red-700 hover:bg-red-50 rounded-lg font-semibold text-sm transition-colors"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
                <button
                  onClick={() => router.push(`/clients/${clientId}/edit`)}
                  className="px-4 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-semibold text-sm transition-colors"
                >
                  Edit
                </button>
              </div>    
                )}
              
            </div>

            {/* Status Badge */}
            <StatusBadge status={detail.status} />
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-3 gap-8">
            
            {/* Left Column - Client Info */}
            <div className="col-span-2 space-y-6">
              
              {/* Company Overview */}
              <div className="bg-white border border-gray-300 rounded-lg p-6">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                    <Building2 size={24} strokeWidth={1.5} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">{detail.companyName}</h2>
                    <p className="text-sm text-gray-600 mt-1">Client {detail.status}</p>
                  </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-6 pt-6 border-t border-gray-200">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin size={14} className="text-gray-400" />
                      <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Registered Office</span>
                    </div>
                    <p className="text-sm text-gray-700">{detail.registeredOffice || "—"}</p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Mail size={14} className="text-gray-400" />
                      <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Primary Contact</span>
                    </div>
                    <p className="text-sm text-gray-700">{detail.primaryContactName ?? "—"}</p>
                    {detail.primaryContactEmail && (
                      <p className="text-sm text-gray-600 mt-1">{detail.primaryContactEmail}</p>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Phone size={14} className="text-gray-400" />
                      <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Support Line</span>
                    </div>
                    <p className="text-sm text-gray-700">{detail.supportPhone || "—"}</p>
                  </div>

                  <div>
                    <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2 block">Account Owner</span>
                    <p className="text-sm text-gray-700">{detail.accountOwner || "—"}</p>
                  </div>
                </div>

                {/* Timeline */}
                <div className="pt-6 mt-6 border-t border-gray-200">
                  <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2 block">Client Since</span>
                  <p className="text-sm text-gray-700">{new Date(detail.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
                </div>

                {/* Notes */}
                {detail.notes && (
                  <div className="pt-6 mt-6 border-t border-gray-200">
                    <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2 block">Notes</span>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{detail.notes}</p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <div className="bg-white border border-gray-300 rounded-lg overflow-hidden">
                
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                  <div className="flex items-center justify-between mb-1">
                    <h2 className="text-lg font-bold text-gray-900">Connected Products</h2>
                    <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full">
                      {detail.connectedProducts.length}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">Deployments attached to this client</p>
                </div>

                {/* Content */}
                {detail.connectedProducts.length === 0 && (
                  <div className="px-6 py-12 text-center">
                    <Package size={32} className="text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-600 mb-4">No deployments yet</p>

                    {isAdmin() &&(
                    <button
                      onClick={() => setShowAddDeployment(true)}
                      className="text-sm text-blue-600 hover:text-blue-800 font-semibold"
                    >
                      Add deployment →
                    </button>
                    )}
                  </div>
                )}

                {detail.connectedProducts.length > 0 && (
                  <>
                    <div className="divide-y divide-gray-200">
                      {detail.connectedProducts.map((p) => (
                        <div key={p.deploymentId} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 flex-shrink-0">
                              <Package size={16} strokeWidth={1.5} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-semibold text-gray-900 truncate">{p.productName}</div>
                              <div className="text-xs text-gray-600 mt-0.5">
                                {p.environmentType ?? "Environment not set"}
                              </div>
                              {p.productVersion && (
                                <div className="text-xs text-gray-600 mt-1 font-mono">v{p.productVersion}</div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {isAdmin() && (
                      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                      <button
                        onClick={() => setShowAddDeployment(true)}
                        className="text-sm text-blue-600 hover:text-blue-800 font-semibold"
                      >
                        + Add deployment
                      </button>
                    </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {showAddDeployment && isAdmin() && (
        <AddDeploymentModal
          clientId={clientId}
          onClose={() => setShowAddDeployment(false)}
          onSaved={() => {
            setShowAddDeployment(false);
            loadDetail();
          }}
        />
      )}

      {showDeleteConfirm && isAdmin() &&(
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-gray-900 mb-2">Delete Client?</h2>
            <p className="text-sm text-gray-600 mb-6">
              This action cannot be undone. If deployments are linked, deletion will be blocked.
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
                onClick={handleDeleteClient}
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

function AddDeploymentModal({ clientId, onClose, onSaved }: { clientId: string; onClose: () => void; onSaved: () => void }) {
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [productId, setProductId] = useState("");
  const [productVersion, setProductVersion] = useState("");
  const [deploymentStatus, setDeploymentStatus] = useState("Pilot");
  const [goLiveDate, setGoLiveDate] = useState("");
  const [supportTier, setSupportTier] = useState("Standard");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/api/products`, { headers: authHeaders() })
      .then((r) => r.json())
      .then((data) => setProducts(data.map((p: any) => ({ id: p.id, name: p.name }))))
      .catch(() => setProducts([]));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!productId) {
      setError("Pick a product.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/clients/${clientId}/deployments`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({
          productId: Number(productId),
          productVersion: productVersion || null,
          deploymentStatus,
          goLiveDate: goLiveDate || null,
          supportTier: supportTier || null,
        }),
      });
      if (!res.ok) {
        setError("Failed to add deployment.");
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
          <h2 className="text-lg font-bold text-gray-900">Add Deployment</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
              Product *
            </label>
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              required
            >
              <option value="">Select a product…</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
              Product Version
            </label>
            <input
              type="text"
              value={productVersion}
              onChange={(e) => setProductVersion(e.target.value)}
              placeholder="e.g., 1.0.0"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Status
              </label>
              <select
                value={deploymentStatus}
                onChange={(e) => setDeploymentStatus(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              >
                <option>Pilot</option>
                <option>In Progress</option>
                <option>Live</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Support Tier
              </label>
              <select
                value={supportTier}
                onChange={(e) => setSupportTier(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              >
                <option>Standard</option>
                <option>Premium</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
              Go-Live Date
            </label>
            <input
              type="date"
              value={goLiveDate}
              onChange={(e) => setGoLiveDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle size={14} className="text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-800">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-lg text-sm font-semibold transition-colors"
            >
              {submitting ? "Adding..." : "Add Deployment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}