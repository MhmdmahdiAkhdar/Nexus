"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Sidebar from "../../../layout/Sidebar";
import Topbar from "../../../layout/Topbar";

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
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("nexus_token");
    if (!token) {
      router.push("/login");
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
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.message ?? "Failed to update client.");
        return;
      }

      router.push(`/clients/${clientId}`);
    } catch {
      setError("Could not reach the server.");
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    "w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#3F84E5]/30 focus:border-[#3F84E5]";
  const labelClass = "text-[10px] uppercase tracking-wide text-[#7A8FA4] font-mono mb-1.5 block";

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

  return (
    <div className="flex min-h-screen bg-[#F4F0E8]">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />

        <main className="flex-1 px-[30px] pt-[30px] pb-10">
          <button onClick={() => router.push(`/clients/${clientId}`)} className="text-[11px] text-[#2874B6] hover:text-[#0B1E3A] mb-3">
            ← {companyName.toUpperCase()}
          </button>

          <div className="text-[9px] uppercase tracking-[0.18em] text-[#C2762E] font-mono mb-3">System register</div>
          <h1 className="text-[32px] leading-none tracking-[-1.2px] font-semibold text-[#0B1E3A]">Edit client</h1>
          <p className="text-[11px] text-[#7A8FA4] mt-3">Revise the record for {recordCode}.</p>

          <div className="border-t border-[#D3D3CF] mt-6 mb-6" />

          <form onSubmit={handleSubmit} className="max-w-2xl bg-[#FAFAF8] border border-[#D2D5D3] p-6 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>COMPANY NAME</label>
                <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>CLIENT RECORD ID</label>
                <input value={recordCode} disabled className={`${inputClass} bg-gray-100 text-gray-400`} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>COUNTRY</label>
                <input value={country} onChange={(e) => setCountry(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>STATUS</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputClass}>
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className={labelClass}>INDUSTRY</label>
              <input value={industry} onChange={(e) => setIndustry(e.target.value)} className={inputClass} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>PRIMARY CONTACT NAME</label>
                <input value={primaryContactName} onChange={(e) => setPrimaryContactName(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>PRIMARY CONTACT EMAIL</label>
                <input value={primaryContactEmail} onChange={(e) => setPrimaryContactEmail(e.target.value)} className={inputClass} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>SUPPORT PHONE</label>
                <input value={supportPhone} onChange={(e) => setSupportPhone(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>ACCOUNT OWNER</label>
                <input value={accountOwner} onChange={(e) => setAccountOwner(e.target.value)} className={inputClass} />
              </div>
            </div>

            <div>
              <label className={labelClass}>REGISTERED OFFICE</label>
              <input value={registeredOffice} onChange={(e) => setRegisteredOffice(e.target.value)} className={inputClass} />
            </div>

            {error && <div className="text-xs text-red-600">{error}</div>}

            <button
              type="submit"
              disabled={submitting}
              className="bg-[#0B1E3A] hover:bg-[#152C50] disabled:opacity-60 text-white text-sm font-semibold rounded-md px-5 py-2.5 transition-colors"
            >
              {submitting ? "Saving..." : "Save changes"}
            </button>
          </form>
        </main>
      </div>
    </div>
  );
}