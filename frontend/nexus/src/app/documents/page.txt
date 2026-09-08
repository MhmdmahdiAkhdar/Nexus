"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, FileText, ExternalLink, X } from "lucide-react";
import Sidebar from "../layout/Sidebar";
import Topbar from "../layout/Topbar";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface DocumentItem {
  id: number;
  productName: string;
  name: string;
  documentType: string | null;
  urlReference: string | null;
  ownerName: string;
  lastUpdatedDate: string | null;
}

interface ProductOption {
  id: number;
  name: string;
}

function authHeaders() {
  const token = localStorage.getItem("nexus_token");
  return { Authorization: `Bearer ${token}` };
}

export default function ReferenceIndexPage() {
  const router = useRouter();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  const loadDocuments = useCallback(async () => {
    const token = localStorage.getItem("nexus_token");
    if (!token) {
      router.push("/login");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);

      const res = await fetch(`${API_URL}/api/documents?${params.toString()}`, { headers: authHeaders() });

      if (res.status === 401) {
        localStorage.removeItem("nexus_token");
        localStorage.removeItem("nexus_user");
        router.push("/login");
        return;
      }

      if (!res.ok) throw new Error();
      setDocuments(await res.json());
    } catch {
      setError("Could not load references. Is the API running?");
    } finally {
      setLoading(false);
    }
  }, [search, router]);

  useEffect(() => {
    const timeout = setTimeout(() => loadDocuments(), 300);
    return () => clearTimeout(timeout);
  }, [loadDocuments]);

  return (
    <div className="flex min-h-screen bg-[#F4F0E8]">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />

        <main className="flex-1 px-[30px] pt-[30px] pb-10">
          <div className="flex items-end justify-between">
            <div>
              <div className="text-[9px] uppercase tracking-[0.18em] text-[#C2762E] font-mono mb-3">
                System register
              </div>
              <h1 className="text-[36px] leading-none tracking-[-1.5px] font-semibold text-[#0B1E3A]">
                Reference index
              </h1>
              <p className="text-[11px] text-[#7A8FA4] mt-5">
                External documentation references attached to products. Nexus stores links and review ownership, never uploaded files.
              </p>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-[#0B1E3A] hover:bg-[#152C50] text-white text-[13px] font-medium px-4 h-[39px] transition-colors"
            >
              <Plus size={16} strokeWidth={1.8} />
              Add reference
            </button>
          </div>

          <div className="border-t border-[#D3D3CF] mt-6 mb-6" />

          <div className="relative mb-6 max-w-md">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search document or product"
              className="w-full border border-gray-300 bg-white rounded-lg pl-9 pr-3 py-2 text-[12px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3F84E5]/30 focus:border-[#3F84E5]"
            />
          </div>

          {error && <div className="text-[11px] text-red-600 mb-4">{error}</div>}

          <div className="bg-[#FAFAF8] border border-[#D2D5D3]">
            <div className="px-[18px] py-2.5 border-b border-[#D8D9D7] text-[9px] uppercase tracking-[0.1em] font-mono text-[#698097]">
              External references / {documents.length} indexed
            </div>

            {loading && <div className="px-[18px] py-8 text-[11px] text-[#8A99A7]">Loading references…</div>}
            {!loading && documents.length === 0 && (
              <div className="px-[18px] py-8 text-[11px] text-[#8A99A7]">No references indexed yet.</div>
            )}

            {!loading &&
              documents.map((d) => (
                <div key={d.id} className="grid grid-cols-[1fr_140px_160px_120px_30px] items-center min-h-[72px] px-[18px] border-b border-[#E0E1DE] last:border-b-0">
                  <div className="flex items-start gap-3">
                    <FileText size={16} className="text-[#3F84E5] mt-1 shrink-0" />
                    <div>
                      <div className="text-[9px] text-[#8A99A7]">{d.productName}</div>
                      <div className="text-[12px] font-medium text-[#0B1E3A]">{d.name}</div>
                    </div>
                  </div>

                  <div className="text-[11px] text-[#2874B6]">{d.documentType ?? "Reference"}</div>
                  <div className="text-[11px] text-[#4A5A6A]">{d.ownerName}</div>
                  <div className="text-[10px] text-[#8A99A7]">
                    {d.lastUpdatedDate ? new Date(d.lastUpdatedDate).toLocaleDateString() : "—"}
                  </div>

                  {d.urlReference && (
                    <a href={d.urlReference} target="_blank" rel="noreferrer" className="text-[#8A99A7] hover:text-[#0B1E3A]">
                      <ExternalLink size={14} />
                    </a>
                  )}
                </div>
              ))}
          </div>
        </main>
      </div>

      {showAddModal && (
        <AddReferenceModal
          onClose={() => setShowAddModal(false)}
          onSaved={() => {
            setShowAddModal(false);
            loadDocuments();
          }}
        />
      )}
    </div>
  );
}

function AddReferenceModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [productId, setProductId] = useState("");
  const [name, setName] = useState("");
  const [documentType, setDocumentType] = useState("");
  const [urlReference, setUrlReference] = useState("");
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
    if (!productId || !name.trim()) {
      setError("Product and document name are required.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/documents`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({
          productId: Number(productId),
          name,
          documentType: documentType || null,
          urlReference: urlReference || null,
        }),
      });
      if (!res.ok) {
        setError("Failed to add reference.");
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
          <h2 className="text-lg font-semibold text-gray-900">Add reference</h2>
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
            <label className="block text-[11px] font-semibold text-gray-500 mb-1.5">DOCUMENT NAME</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Atlas production runbook" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 mb-1.5">TYPE</label>
            <input value={documentType} onChange={(e) => setDocumentType(e.target.value)} placeholder="Runbook, API reference..." className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-gray-500 mb-1.5">URL</label>
            <input value={urlReference} onChange={(e) => setUrlReference(e.target.value)} placeholder="https://..." className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          {error && <div className="text-xs text-red-600">{error}</div>}
          <button type="submit" disabled={submitting} className="w-full bg-[#0B1E3A] hover:bg-[#152C50] disabled:opacity-60 text-white text-sm font-semibold rounded-lg py-2.5">
            {submitting ? "Adding..." : "Add reference"}
          </button>
        </form>
      </div>
    </div>
  );
}