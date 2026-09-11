"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Sidebar from "../../../layout/Sidebar";
import Topbar from "../../../layout/Topbar";
import { ChevronLeft, AlertCircle, CheckCircle2 } from "lucide-react";
import {isAdmin} from "../../../lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const STATUS_OPTIONS = ["Active", "Onboarding", "Inactive"];

export default function EditClientPage() {
  const router = useRouter();
  const params = useParams();
  const clientId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [recordCode, setRecordCode] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [country, setCountry] = useState("");
  const [industry, setIndustry] = useState("");
  const [status, setStatus] = useState(STATUS_OPTIONS[0]);
  const [primaryContactName, setPrimaryContactName] = useState("");
  const [primaryContactEmail, setPrimaryContactEmail] = useState("");
  const [supportPhone, setSupportPhone] = useState("");
  const [accountOwner, setAccountOwner] = useState("");
  const [registeredOffice, setRegisteredOffice] = useState("");
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
    if(!isAdmin()){
      router.push(`/clients/${clientId}`);
      return;
    }

    async function load() {
      try {
        const res = await fetch(`${API_URL}/api/clients/${clientId}`, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error();
        const data = await res.json();

        setRecordCode(data.recordCode);
        setCompanyName(data.companyName);
        setCountry(data.country ?? "");
        setIndustry(data.industry ?? "");
        setStatus(data.status);
        setPrimaryContactName(data.primaryContactName ?? "");
        setPrimaryContactEmail(data.primaryContactEmail ?? "");
        setSupportPhone(data.supportPhone ?? "");
        setAccountOwner(data.accountOwner ?? "");
        setRegisteredOffice(data.registeredOffice ?? "");
        setNotes(data.notes ?? "");
      } catch {
        setError("Could not load client.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [clientId, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    const token = localStorage.getItem("nexus_token");
    setSubmitting(true);

    try {
      const res = await fetch(`${API_URL}/api/clients/${clientId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          companyName,
          country: country || null,
          industry: industry || null,
          status,
          primaryContactName: primaryContactName || null,
          primaryContactEmail: primaryContactEmail || null,
          supportPhone: supportPhone || null,
          registeredOffice: registeredOffice || null,
          accountOwner: accountOwner || null,
          notes: notes || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.message ?? "Failed to update client.");
        return;
      }

      setSuccess("Client updated successfully!");
      setTimeout(() => {
        router.push(`/clients/${clientId}`);
      }, 1000);
    } catch {
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
            <p className="text-sm text-gray-500">Loading client…</p>
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
            onClick={() => router.push(`/clients/${clientId}`)}
            className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-semibold mb-6 transition-colors"
          >
            <ChevronLeft size={16} />
            Back to Client
          </button>

        
          <div className="mb-8">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Client</h1>
                <p className="text-gray-600 text-sm">
                  Update the details for <span className="font-semibold">{recordCode}</span>
                </p>
              </div>
              
              <button
                type="button"
                onClick={() => router.push(`/clients/${clientId}`)}
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
                    <CheckCircle2 size={18} className="text-green-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-green-800">{success}</p>
                  </div>
                )}

              
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Company Information</h2>
                  
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className={labelClass}>Company Name *</label>
                      <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className={inputClass}
                        required
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Client Record ID</label>
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
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Location & Industry</h2>
                  
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className={labelClass}>Country</label>
                      <input
                        type="text"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Industry</label>
                      <input
                        type="text"
                        value={industry}
                        onChange={(e) => setIndustry(e.target.value)}
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div className="mt-5">
                    <label className={labelClass}>Registered Office</label>
                    <input
                      type="text"
                      value={registeredOffice}
                      onChange={(e) => setRegisteredOffice(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>

              
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Primary Contact</h2>
                  
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className={labelClass}>Contact Name</label>
                      <input
                        type="text"
                        value={primaryContactName}
                        onChange={(e) => setPrimaryContactName(e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Contact Email</label>
                      <input
                        type="email"
                        value={primaryContactEmail}
                        onChange={(e) => setPrimaryContactEmail(e.target.value)}
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>

              
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Account Management</h2>
                  
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className={labelClass}>Support Phone</label>
                      <input
                        type="tel"
                        value={supportPhone}
                        onChange={(e) => setSupportPhone(e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Account Owner</label>
                      <input
                        type="text"
                        value={accountOwner}
                        onChange={(e) => setAccountOwner(e.target.value)}
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>

              
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Status & Notes</h2>
                  
                  <div className="mb-5">
                    <label className={labelClass}>Client Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className={inputClass}
                    >
                      {STATUS_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>Additional Notes</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
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
                    onClick={() => router.push(`/clients/${clientId}`)}
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
                      <span>Keep company name consistent with legal documents</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-blue-600 font-bold mt-0.5">•</span>
                      <span>Update contact information when personnel changes</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-blue-600 font-bold mt-0.5">•</span>
                      <span>Status changes are tracked in activity logs</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-blue-600 font-bold mt-0.5">•</span>
                      <span>Account owner manages relationship internally</span>
                    </li>
                  </ul>
                </div>

              
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-xs text-amber-900 font-medium">
                    💡 <span className="block mt-1">All changes to this client record are saved automatically in the change history.</span>
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