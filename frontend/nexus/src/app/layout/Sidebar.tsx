"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Gauge,
  Network,
  Building2,
  Layers3,
  UsersRound,
  FileText,
  Settings,
  Lock,
  ChevronRight,
} from "lucide-react";

const navItems = [
  {
    label: "Command Center",
    href: "/dashboard",
    icon: Gauge,
  },
  {
    label: "Product Register",
    href: "/products",
    icon: Network,
  },
  {
    label: "Client Register",
    href: "/clients",
    icon: Building2,
  },
  {
    label: "Deployment Register",
    href: "/deployments",
    icon: Layers3,
  },
  {
    label: "People & Ownership",
    href: "/team",
    icon: UsersRound,
  },
  {
    label: "Reference Index",
    href: "/documents",
    icon: FileText,
  },
];

const settingsItems = [
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 min-h-screen bg-[#0F1419] border-r border-[#1F2937] flex flex-col">

      {/* Header Logo */}
      <div className="px-6 py-8 border-b border-[#1F2937]">
        <div className="flex items-end gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] rounded-lg flex items-center justify-center shadow-lg border border-[#3B82F6]/30">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="5" r="2" />
              <circle cx="6" cy="19" r="2" />
              <circle cx="18" cy="19" r="2" />
              <path d="M12 7v6M12 13l-6 4M12 13l6 4" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">NEXUS</h2>
            <p className="text-xs text-gray-400 font-semibold tracking-widest mt-0.5">IDS LEDGER</p>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1">
        <div className="px-3 mb-4">
          <p className="text-xs font-semibold text-gray-500 tracking-widest uppercase">Navigation</p>
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href ||
            (pathname === "/" && item.href === "/dashboard");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                active
                  ? "bg-[#2563EB] text-white shadow-lg shadow-blue-500/20"
                  : "text-gray-300 hover:bg-[#1F2937] hover:text-[#60A5FA]"
              }`}
            >
              <Icon
                size={18}
                strokeWidth={1.8}
                className={`transition-colors ${
                  active ? "text-white" : "text-gray-400 group-hover:text-[#60A5FA]"
                }`}
              />

              <span className="flex-1">{item.label}</span>

              {active && (
                <ChevronRight size={16} className="text-white" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="px-3 mb-2">
        <div className="h-px bg-[#1F2937]" />
      </div>

      {/* Settings Section */}
      <nav className="px-3 py-4 border-t border-[#1F2937]">
        <div className="px-3 mb-3">
          <p className="text-xs font-semibold text-gray-500 tracking-widest uppercase">Admin</p>
        </div>

        {settingsItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                active
                  ? "bg-[#2563EB] text-white shadow-lg shadow-blue-500/20"
                  : "text-gray-300 hover:bg-[#1F2937] hover:text-[#60A5FA]"
              }`}
            >
              <Icon
                size={18}
                strokeWidth={1.8}
                className={`transition-colors ${
                  active ? "text-white" : "text-gray-400 group-hover:text-[#60A5FA]"
                }`}
              />
              <span className="flex-1">{item.label}</span>
              {active && <ChevronRight size={16} className="text-white" />}
            </Link>
          );
        })}
      </nav>

      {/* Security Info Box */}
      <div className="mx-3 mb-6 p-4 bg-[#1F2937] border border-[#374151] rounded-lg backdrop-blur-sm">
        <div className="flex items-start gap-2.5">
          <Lock size={16} className="text-[#60A5FA] mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-xs font-semibold text-white">Private Workspace</p>
            <p className="text-xs text-gray-400 mt-1 leading-relaxed">
              Records visible to IDS Fintech employees only. All access is logged.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-[#1F2937]">
        <p className="text-xs text-gray-400 font-mono">BUILD 2.6.14</p>
        <p className="text-xs text-gray-500 mt-1 font-light">IDS Enterprise System</p>
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#1F2937]">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <p className="text-xs text-gray-400">All systems operational</p>
        </div>
      </div>
    </aside>
  );
}