"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, FileText, ExternalLink, X, AlertCircle, Trash2 } from "lucide-react";
import Sidebar from "../layout/Sidebar";
import Topbar from "../layout/Topbar";
import { isAdmin } from "../lib/auth";

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

export default function ReferenceIndexPage() {
  const router = useRouter();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [admin, setAdmin] = useState(false);


  
  const requestIdRef = useRef(0);

  const loadDocuments = useCallback(async () => {
    const token = localStorage.getItem("nexus_token");
    if (!token) {
      router.push("/login");
      return;
    }

    const thisRequestId = ++requestIdRef.current;
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
      const data = await res.json();

      
      if (thisRequestId === requestIdRef.current) {
        setDocuments(data);
      }
    } catch {
      if (thisRequestId === requestIdRef.current) {
        setError("Could not load references. Is the API running?");
      }
    } finally {
      if (thisRequestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [search, router]);

  useEffect(() => {
    setAdmin(isAdmin());
    const timeout = setTimeout(() => loadDocuments(), 300);
    return () => clearTimeout(timeout);
  }, [loadDocuments]);

  async function handleDelete(doc: DocumentItem) {
    
    if (!admin) return;
    if (!window.confirm(`Remove "${doc.name}" from the reference index?`)) return;

    setDeletingId(doc.id);
    try {
      const res = await fetch(`${API_URL}/api/documents/${doc.id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error();
      setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
    } catch {
      setError("Could not delete that reference. Please try again.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />

        <main className="flex-1 px-12 py-8 overflow-auto">

          
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Reference Index</h1>
              <p className="text-gray-600 text-sm">External documentation links and references for products</p>
            </div>

            {admin && (
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors shadow-sm"
              >
                <Plus size={18} strokeWidth={2} />
                Add Reference
              </button>
            )}
          </div>

          
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by document or product"
                aria-label="Search references"
                className="w-full border border-gray-300 rounded-lg pl-11 pr-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          
          {error && (
            <div role="alert" className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          
          <div className="bg-white border border-gray-300 rounded-lg overflow-hidden">

            
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                External References • <span className="font-bold text-gray-900">{documents.length}</span> indexed
              </p>
            </div>

            
            {loading && (
              <div className="px-6 py-12 text-center">
                <p className="text-sm text-gray-600">Loading references…</p>
              </div>
            )}

            
            {!loading && documents.length === 0 && (
              <div className="px-6 py-12 text-center">
                <FileText size={32} className="text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-600">
                  {search ? `No references match "${search}".` : "No references indexed yet."}
                </p>
              </div>
            )}

            
            <div className="divide-y divide-gray-200">
              {!loading &&
                documents.map((d) => {
                  const link = safeHref(d.urlReference);
                  return (
                    <div
                      key={d.id}
                      className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50 transition-colors items-center"
                    >
                      
                      <div className="col-span-5 flex items-start gap-3">
                        <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 flex-shrink-0 mt-0.5">
                          <FileText size={18} strokeWidth={1.5} />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs text-gray-600 font-medium uppercase tracking-wide">
                            {d.productName}
                          </div>
                          <div className="text-sm font-semibold text-gray-900 mt-1 truncate">
                            {d.name}
                          </div>
                        </div>
                      </div>

                      
                      <div className="col-span-2">
                        <span className="inline-block text-xs font-medium px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full">
                          {d.documentType ?? "Reference"}
                        </span>
                      </div>

                      
                      <div className="col-span-2">
                        <p className="text-sm text-gray-700">{d.ownerName}</p>
                      </div>

                      
                      <div className="col-span-1 text-right">
                        <p className="text-xs text-gray-600">
                          {d.lastUpdatedDate ? new Date(d.lastUpdatedDate).toLocaleDateString() : "—"}
                        </p>
                      </div>

                      
                      <div className="col-span-2 flex items-center justify-end gap-1">
                        {link && (
                          <a
                            href={link}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center justify-center p-2 text-gray-400 hover:text-blue-600 transition-colors"
                            title="Open reference"
                            aria-label={`Open ${d.name} in a new tab`}
                          >
                            <ExternalLink size={16} />
                          </a>
                        )}
                        {admin && (
                          <button
                            onClick={() => handleDelete(d)}
                            disabled={deletingId === d.id}
                            className="inline-flex items-center justify-center p-2 text-gray-400 hover:text-red-600 disabled:opacity-50 transition-colors"
                            title="Remove reference"
                            aria-label={`Remove ${d.name}`}
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          
          {!loading && documents.length > 0 && (
            <div className="mt-6 text-xs text-gray-600">
              Showing <span className="font-semibold text-gray-900">{documents.length}</span> reference{documents.length === 1 ? "" : "s"}
            </div>
          )}
        </main>
      </div>

      {admin && showAddModal && (
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
  const [productsError, setProductsError] = useState("");
  const [productId, setProductId] = useState("");
  const [name, setName] = useState("");
  const [documentType, setDocumentType] = useState("");
  const [urlReference, setUrlReference] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const firstFieldRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    fetch(`${API_URL}/api/products`, { headers: authHeaders() })
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((data) => setProducts(data.map((p: any) => ({ id: p.id, name: p.name }))))
      .catch(() => setProductsError("Could not load products. Try reopening this dialog."));
  }, []);

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
    const trimmedName = name.trim();
    if (!productId || !trimmedName) {
      setError("Product and document name are required.");
      return;
    }
    if (urlReference && !safeHref(urlReference)) {
      setError("Please enter a valid http:// or https:// URL.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/api/documents`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({
          productId: Number(productId),
          name: trimmedName,
          documentType: documentType.trim() || null,
          urlReference: urlReference.trim() || null,
        }),
      });
      if (!res.ok) {
        setError("Failed to add reference.");
        return;
      }
      onSaved();
    } catch {
      setError("Failed to add reference. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={() => !submitting && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-reference-title"
        className="bg-white rounded-lg shadow-xl w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 id="add-reference-title" className="text-lg font-bold text-gray-900">Add Reference</h2>
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
            <label htmlFor="ref-product" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
              Product *
            </label>
            <select
              id="ref-product"
              ref={firstFieldRef}
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:bg-gray-50"
              disabled={submitting}
              required
            >
              <option value="">Select a product…</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            {productsError && <p className="text-xs text-red-700 mt-1.5">{productsError}</p>}
          </div>

          <div>
            <label htmlFor="ref-name" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
              Document Name *
            </label>
            <input
              id="ref-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Production Runbook"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:bg-gray-50"
              disabled={submitting}
              required
            />
          </div>

          <div>
            <label htmlFor="ref-type" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
              Type
            </label>
            <input
              id="ref-type"
              type="text"
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              placeholder="e.g., Runbook, API Reference"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:bg-gray-50"
              disabled={submitting}
            />
          </div>

          <div>
            <label htmlFor="ref-url" className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
              URL
            </label>
            <input
              id="ref-url"
              type="url"
              value={urlReference}
              onChange={(e) => setUrlReference(e.target.value)}
              placeholder="https://example.com/docs"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:bg-gray-50"
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
              {submitting ? "Adding..." : "Add Reference"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}