"use client";

import {useState} from "react";
import {Mail,Lock,ArrowRight,KeyRound,ShieldCheck} from "lucide-react";

export default function Loginpage(){
    const [email,setEmail]=useState("");
    const [password,setPassword]=useState("");

    function handleSubmit(e: React.FormEvent){
        //To the backend
    }

return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6"style={{backgroundImage:"linear-gradient(to right, #e5e7eb 1px, transparent 1px), linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)",backgroundSize: "32px 32px",}}>
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row">
        <div className="relative flex-1 bg-[#0B1E3A] text-white p-10 flex flex-col justify-between overflow-hidden min-h-[520px]">
          <div className="absolute -right-16 top-10 w-72 h-72 rounded-full border border-white/10" />
          <div className="absolute -right-24 bottom-0 w-64 h-64 rounded-full border border-white/10" />

          <div className="relative flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#3F84E5] flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0B1E3A" strokeWidth="2">
                <circle cx="12" cy="5" r="2" />
                <circle cx="6" cy="19" r="2" />
                <circle cx="18" cy="19" r="2" />
                <path d="M12 7v6M12 13l-6 4M12 13l6 4" />
              </svg>
            </div>
            <div>
              <div className="font-semibold text-base leading-none">nexus</div>
              <div className="text-[10px] tracking-widest text-white/60 mt-0.5">IDS FINTECH</div>
            </div>
          </div>

          <div className="relative">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-5 h-px bg-[#3F84E5]" />
              <span className="text-[11px] tracking-widest text-[#7BA3D6] font-medium">SINCE 1991</span>
            </div>
            <h1 className="text-3xl font-semibold leading-tight mb-4">
              Where everything
              <br />
              Connects.
            </h1>
            <p className="text-sm text-white/60 max-w-xs leading-relaxed">
              One secure workspace for the products, clients, and people powering IDS Fintech.
            </p>
          </div>

          <div className="relative flex items-center gap-2 text-xs text-white/50">
            <ShieldCheck size={14} />
            Private workspace · IDS Fintech
          </div>
        </div>

        <div className="flex-1 p-10 flex flex-col justify-center">
          <div className="max-w-sm w-full mx-auto">
            <div className="text-[11px] tracking-widest text-[#3F84E5] font-semibold mb-2">
              SECURE WORKSPACE
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-1">Welcome back</h2>
            <p className="text-sm text-gray-500 mb-8">
              Sign in to continue to the internal products portal
            </p>

            <form onSubmit={handleSubmit}>
              <label className="block text-[11px] font-semibold tracking-wide text-gray-500 mb-1.5">
                EMAIL <span className="text-[#3F84E5]">*</span>
              </label>
              <div className="relative mb-4">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="maya.aoun@idsfintech.com"
                  className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3F84E5]/30 focus:border-[#3F84E5]"
                />
              </div>

              <label className="block text-[11px] font-semibold tracking-wide text-gray-500 mb-1.5">
                PASSWORD <span className="text-[#3F84E5]">*</span>
              </label>
              <div className="relative mb-6">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3F84E5]/30 focus:border-[#3F84E5]"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#3F84E5] hover:bg-[#2E6FCB] text-white text-sm font-semibold rounded-lg py-2.5 flex items-center justify-center gap-2 transition-colors"
              >
                <ArrowRight size={16} />
                Sign in
              </button>
            </form>

            <div className="border-t border-gray-200 mt-7 pt-5">
              <div className="flex gap-2.5">
                <KeyRound size={15} className="text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-sm font-medium text-gray-800">Need access help?</div>
                  <p className="text-xs text-gray-500 leading-relaxed mt-0.5">
                    Contact IT support to reset your password or request an account. Self-service sign-up is disabled
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-gray-400 mt-5">
              <ShieldCheck size={13} />
              SSO protected · IDS Fintech employees only
            </div>
          </div>
        </div>
      </div>
    </div>
  );
    
}
