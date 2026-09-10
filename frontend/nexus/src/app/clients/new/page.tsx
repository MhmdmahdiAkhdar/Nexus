"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../../layout/Sidebar";
import Topbar from "../../layout/Topbar";
import { ChevronLeft, AlertCircle, CheckCircle2 } from "lucide-react";
import { isAdmin } from "../../lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const STATUS_OPTIONS = ["Active", "Onboarding", "Inactive"];

export default function NewClientPage() {
  const router = useRouter();
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

  // Gate: only admins may access this page at all.
  const [checkingAccess, setCheckingAccess] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("nexus_token");
    if (!token) {
      router.replace("/login");
      return;
    }
    if (!isAdmin()) {
      router.replace("/clients");
      return;
    }
    setCheckingAccess(false);
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!companyName.trim()) {
      setError("Company name is required.");
      return;
    }

    const token = localStorage.getItem("nexus_token");
    setSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/api/clients`, {
        method: "POST",
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

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setError(data?.message ?? data?.title ?? "Failed to create client.");
        return;
      }

      const created = await response.json();
      setSuccess("Client created successfully!");
      setTimeout(() => {
        router.push(`/clients/${created.id}`);
      }, 1000);
    } catch (err) {
      console.error(err);
      setError("Could not reach the server.");
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    "w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all";
  const labelClass = "text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2 block";

  // While we verify the user is an admin, render nothing (avoids a flash of the form).
  if (checkingAccess) {
    return (
      <div className="flex min-h-screen bg-white">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Topbar />
          <main className="flex-1 px-12 py-8 overflow-auto">
            <p className="text-sm text-gray-500">Checking access…</p>
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
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Client</h1>
                <p className="text-gray-600 text-sm">Add a new company relationship to your IDS Fintech ecosystem</p>
              </div>
              
              <button
                type="button"
                onClick={() => router.push("/clients")}
                className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>

          {/* Form Section */}
          <div className="grid grid-cols-3 gap-8">
            
            {/* Main Form */}
            <form onSubmit={handleSubmit} className="col-span-2">
              <div className="bg-white border border-gray-300 rounded-lg p-8 space-y-6">
                
                {/* Error Alert */}
                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                    <AlertCircle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}

                {/* Success Alert */}
                {success && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                    <CheckCircle2 size={18} className="text-green-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-green-800">{success}</p>
                  </div>
                )}

                {/* Company Information */}
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Company Information</h2>
                  
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className={labelClass}>Company Name *</label>
                      <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="e.g., Acme Corp"
                        className={inputClass}
                        required
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Client Record ID</label>
                      <input
                        type="text"
                        value="Auto-generated on save"
                        disabled
                        className={`${inputClass} bg-gray-50 text-gray-500 cursor-not-allowed`}
                      />
                    </div>
                  </div>
                </div>

                {/* Location & Industry */}
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Location & Industry</h2>
                  
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className={labelClass}>Country</label>
                      <input
                        type="text"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        placeholder="e.g., Lebanon"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Industry</label>
                      <input
                        type="text"
                        value={industry}
                        onChange={(e) => setIndustry(e.target.value)}
                        placeholder="e.g., Banking"
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
                      placeholder="Full address"
                      className={inputClass}
                    />
                  </div>
                </div>

                {/* Contact Information */}
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Primary Contact</h2>
                  
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className={labelClass}>Contact Name</label>
                      <input
                        type="text"
                        value={primaryContactName}
                        onChange={(e) => setPrimaryContactName(e.target.value)}
                        placeholder="Full name"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Contact Email</label>
                      <input
                        type="email"
                        value={primaryContactEmail}
                        onChange={(e) => setPrimaryContactEmail(e.target.value)}
                        placeholder="email@example.com"
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>

                {/* Account Management */}
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Account Management</h2>
                  
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className={labelClass}>Support Phone</label>
                      <input
                        type="tel"
                        value={supportPhone}
                        onChange={(e) => setSupportPhone(e.target.value)}
                        placeholder="+961 1 555 742"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Account Owner</label>
                      <input
                        type="text"
                        value={accountOwner}
                        onChange={(e) => setAccountOwner(e.target.value)}
                        placeholder="Name or team"
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>

                {/* Status & Notes */}
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
                      placeholder="Any additional information..."
                      rows={4}
                      className={inputClass}
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex gap-4 pt-4 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors duration-200"
                  >
                    {submitting ? "Creating..." : "Create Client"}
                  </button>
                  <button
                    type="button"
                    onClick={() => router.push("/clients")}
                    className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>

            {/* Sidebar Guidance */}
            <div className="col-span-1">
              <div className="sticky top-8 space-y-4">
                
                {/* Guidance Card */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
                  <h3 className="text-sm font-bold text-blue-900 mb-3">Form Guide</h3>
                  <ul className="space-y-2.5 text-xs text-blue-800">
                    <li className="flex gap-2">
                      <span className="text-blue-600 font-bold mt-0.5">•</span>
                      <span>Use the official company name for legal reference</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-blue-600 font-bold mt-0.5">•</span>
                      <span>Primary contact should be the main point of communication</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-blue-600 font-bold mt-0.5">•</span>
                      <span>Account owner tracks responsibility within your team</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-blue-600 font-bold mt-0.5">•</span>
                      <span>Status changes are recorded in the activity trail</span>
                    </li>
                  </ul>
                </div>

                {/* Info Card */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-xs text-amber-900 font-medium">
                    💡 <span className="block mt-1">After creating this client, you can link deployments and manage their relationship with your products.</span>
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