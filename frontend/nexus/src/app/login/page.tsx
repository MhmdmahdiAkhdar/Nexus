"use client";

import { useState } from "react";
import { Mail, Lock, ArrowRight, KeyRound, ShieldCheck, AlertCircle } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data?.message ?? "Login failed. Please check your credentials");
        setIsLoading(false);
        return;
      }

      localStorage.setItem("nexus_token", data.token);
      localStorage.setItem("nexus_user", JSON.stringify(data));

      if (data.mustChangePassword) {
        window.location.href = "/change-password";
      } else {
        window.location.href = "/dashboard";
      }
    } catch (error) {
      console.error(error);
      setError("Login failed. Please check your credentials");
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center p-4 sm:p-6">

      <div className="absolute top-0 right-0 w-96 h-96 bg-[#3F84E5]/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#0B1E3A]/5 rounded-full blur-3xl -z-10" />

      <div className="w-full max-w-5xl">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-gray-100">

          <div className="relative flex-1 bg-gradient-to-br from-[#0B1E3A] to-[#1a2f4a] text-white p-8 sm:p-12 flex flex-col justify-between min-h-[500px] overflow-hidden">

            <div className="absolute -right-20 top-0 w-80 h-80 rounded-full border border-white/10" />
            <div className="absolute -right-32 bottom-0 w-96 h-96 rounded-full border border-white/10" />
            <div className="absolute -left-16 top-1/2 w-96 h-96 border border-[#3F84E5]/20 rounded-full" />

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-12">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#3F84E5] to-[#2E6FCB] flex items-center justify-center shadow-lg">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                    <circle cx="12" cy="5" r="2" />
                    <circle cx="6" cy="19" r="2" />
                    <circle cx="18" cy="19" r="2" />
                    <path d="M12 7v6M12 13l-6 4M12 13l6 4" />
                  </svg>
                </div>
                <div>
                  <div className="font-bold text-xl leading-none">nexus</div>
                  <div className="text-[10px] tracking-widest text-[#7BA3D6] mt-1 font-semibold">IDS FINTECH</div>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-6">
                  <span className="w-6 h-px bg-gradient-to-r from-[#3F84E5] to-transparent" />
                  <span className="text-[11px] tracking-widest text-[#7BA3D6] font-semibold uppercase">Enterprise Portal</span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-bold leading-tight mb-6">
                  Where Everything
                  <br />
                  <span className="bg-gradient-to-r from-[#3F84E5] to-[#7BA3D6] bg-clip-text text-transparent">
                    Connects
                  </span>
                </h1>
                <p className="text-base text-gray-300 max-w-sm leading-relaxed">
                  Secure workspace for products, clients, and teams powering IDS Fintech's infrastructure.
                </p>
              </div>
            </div>

            <div className="relative z-10 flex items-center gap-2.5 text-xs text-gray-400 bg-white/5 rounded-lg px-3 py-3 backdrop-blur-sm border border-white/10">
              <ShieldCheck size={14} className="flex-shrink-0" />
              <span className="font-medium">Enterprise SSO · IDS Employees Only</span>
            </div>
          </div>

          <div className="flex-1 p-8 sm:p-12 flex flex-col justify-center bg-white">
            <div className="max-w-sm w-full mx-auto">

              <div className="mb-8">
                <div className="text-[11px] font-semibold tracking-widest text-[#3F84E5] mb-3 uppercase">
                  Secure Access
                </div>
                <h2 className="text-3xl font-bold text-[#0B1E3A] mb-2">Welcome back</h2>
                <p className="text-sm text-gray-600">
                  Sign in to your IDS Fintech workspace
                </p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                  <AlertCircle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">

                <div>
                  <label className="block text-xs font-semibold tracking-wide text-gray-700 mb-2 uppercase">
                    Email Address <span className="text-[#3F84E5]">*</span>
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@idsfintech.com"
                      disabled={isLoading}
                      className="w-full border border-gray-300 rounded-xl pl-11 pr-4 py-3 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#3F84E5]/30 focus:border-[#3F84E5] transition-all disabled:bg-gray-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold tracking-wide text-gray-700 mb-2 uppercase">
                    Password <span className="text-[#3F84E5]">*</span>
                  </label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      disabled={isLoading}
                      className="w-full border border-gray-300 rounded-xl pl-11 pr-4 py-3 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#3F84E5]/30 focus:border-[#3F84E5] transition-all disabled:bg-gray-50"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-[#3F84E5] to-[#2E6FCB] hover:from-[#2E6FCB] hover:to-[#1F5AA8] text-white text-sm font-bold rounded-xl py-3 flex items-center justify-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed mt-6"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      <ArrowRight size={18} />
                      Sign in to Nexus
                    </>
                  )}
                </button>
              </form>

              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-blue-50/50 border border-blue-100 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <KeyRound size={16} className="text-[#3F84E5] mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-sm font-semibold text-gray-900">Need access help?</div>
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                      Contact IT support to reset your password or request an account.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-6 justify-center">
                <ShieldCheck size={13} className="text-[#3F84E5]" />
                Enterprise SSO protected
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}