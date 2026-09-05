"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Building2, MapPin, Mail, Phone, X } from "lucide-react";
import Sidebar from "../../layout/Sidebar";
import Topbar from "../../layout/Topbar";

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

export default function ClientDossierPage() {
  const router = useRouter();
  const params = useParams();
  const clientId = params.id as string;

  const [detail, setDetail] = useState<ClientDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddDeployment, setShowAddDeployment] = useState(false);

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

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#F4F0E8]">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Topbar />
          <main className="flex-1 px-[30px] pt-[30px]">
            <p className="text-[11px] text-[#7A8FA4]">Loading client…</p>
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
            <p className="text-[11px] text-red-600">{error || "Client not found."}</p>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F4F0E8]">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />

        <main className="flex-1 px-[30px] pt-[30px] pb-10">
          <button onClick={() => router.push("/clients")} className="text-[11px] text-[#2874B6] hover:text-[#0B1E3A] mb-3">
            ← CLIENT REGISTER
          </button>

          <div className="flex items-start justify-between">
            <div>
              <div className="text-[9px] uppercase tracking-[0.18em] text-[#C2762E] font-mono mb-3">System register</div>
              <h1 className="text-[32px] leading-none tracking-[-1.2px] font-semibold text-[#0B1E3A]">{detail.companyName}</h1>
              <p className="text-[11px] text-[#7A8FA4] mt-2">
                {detail.recordCode} · {detail.country ?? "—"}
                {detail.industry ? ` · ${detail.industry}` : ""}
              </p>
            </div>

            <button
              onClick={() => router.push(`/clients/${clientId}/edit`)}
              className="border border-gray-300 text-gray-700 text-[13px] font-medium px-4 h-[39px] rounded-md hover:bg-gray-50 transition-colors"
            >
              Edit client
            </button>
          </div>

          <div className="border-t border-[#D3D3CF] mt-6 mb-6" />

          <div className="grid grid-cols-[1fr_1.3fr] gap-5">
            <section className="bg-[#FAFAF8] border border-[#D2D5D3] p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-md border border-[#D2D5D3] bg-white flex items-center justify-center">
                  <Building2 size={18} className="text-[#3F84E5]" />
                </div>
                <div>
                  <span className="text-[9px] font-mono px-2 py-1 border border-[#6EAA99] text-[#267B67] inline-block mb-1">
                    {detail.status.toUpperCase()}
                  </span>
                  <div className="text-[15px] font-semibold text-[#0B1E3A]">{detail.companyName}</div>
                </div>
              </div>

              <div className="space-y-3 pt-3 border-t border-[#E0E1DE]">
                <div>
                  <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-wide text-[#8A99A7] font-mono mb-1">
                    <MapPin size={11} /> Registered office
                  </div>
                  <div className="text-[11px] text-[#3A4A5A]">{detail.registeredOffice || "—"}</div>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-wide text-[#8A99A7] font-mono mb-1">
                    <Mail size={11} /> Primary contact
                  </div>
                  <div className="text-[11px] text-[#3A4A5A]">
                    {detail.primaryContactName ?? "—"}
                    {detail.primaryContactEmail ? ` · ${detail.primaryContactEmail}` : ""}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-wide text-[#8A99A7] font-mono mb-1">
                    <Phone size={11} /> Support line
                  </div>
                  <div className="text-[11px] text-[#3A4A5A]">{detail.supportPhone || "—"}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-3 mt-3 border-t border-[#E0E1DE]">
                <div>
                  <div className="text-[9px] uppercase tracking-wide text-[#8A99A7] font-mono mb-1">Client since</div>
                  <div className="text-[11px] text-[#3A4A5A]">{new Date(detail.createdAt).toLocaleDateString()}</div>
                </div>
                <div>
                  <div className="text-[9px] uppercase tracking-wide text-[#8A99A7] font-mono mb-1">Account owner</div>
                  <div className="text-[11px] text-[#3A4A5A]">{detail.accountOwner || "—"}</div>
                </div>
              </div>
            </section>

            <section className="bg-[#FAFAF8] border border-[#D2D5D3] p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-[9px] uppercase tracking-wide text-[#8A99A7] font-mono">
                    Deployment register / {String(detail.connectedProducts.length).padStart(2, "0")}
                  </div>
                  <h3 className="text-[14px] font-semibold text-[#0B1E3A] mt-1">Connected products</h3>
                </div>
                <button onClick={() => setShowAddDeployment(true)} className="text-[11px] text-[#2874B6] hover:text-[#0B1E3A]">
                  + Add deployment
                </button>
              </div>

              {detail.connectedProducts.length === 0 && (
                <p className="text-[11px] text-[#8A99A7]">No deployments recorded for this client yet.</p>
              )}

              <div className="space-y-1">
                {detail.connectedProducts.map((p) => (
                  <div
                    key={p.deploymentId}
                    className="flex items-center justify-between border-b border-[#E0E1DE] last:border-b-0 py-3"
                  >
                    <div>
                      <div className="text-[12px] font-medium text-[#0B1E3A]">{p.productName}</div>
                      <div className="text-[10px] text-[#8A99A7]">{p.environmentType ?? "Environment not set"}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[11px] text-[#4A5A6A]">{p.productVersion ? `v${p.productVersion}` : "—"}</div>
                      <div className="text-[9px] font-mono text-[#8A99A7]">{p.recordCode}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </main>
      </div>

      {showAddDeployment && (
        <AddDeploymentModal
          clientId={clientId}
          onClose={() => setShowAddDeployment(false)}
          onSaved={() => {
            setShowAddDeployment(false);
            loadDetail();
          }}
        />
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
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-gray-900">Add deployment</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 mb-1.5">PRODUCT</label>
            <select value={productId} onChange={(e) => setProductId(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
              <option value="">Select...</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 mb-1.5">PRODUCT VERSION</label>
            <input value={productVersion} onChange={(e) => setProductVersion(e.target.value)} placeholder="1.0.0" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 mb-1.5">STATUS</label>
              <select value={deploymentStatus} onChange={(e) => setDeploymentStatus(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                <option>Pilot</option>
                <option>In Progress</option>
                <option>Live</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 mb-1.5">SUPPORT TIER</label>
              <select value={supportTier} onChange={(e) => setSupportTier(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                <option>Standard</option>
                <option>Premium</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 mb-1.5">GO-LIVE DATE</label>
            <input type="date" value={goLiveDate} onChange={(e) => setGoLiveDate(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          {error && <div className="text-xs text-red-600">{error}</div>}
          <button type="submit" disabled={submitting} className="w-full bg-[#0B1E3A] hover:bg-[#152C50] disabled:opacity-60 text-white text-sm font-semibold rounded-lg py-2.5">
            {submitting ? "Adding..." : "Add deployment"}
          </button>
        </form>
      </div>
    </div>
  );
}