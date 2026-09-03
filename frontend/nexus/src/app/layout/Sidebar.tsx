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
  ShieldCheck,
  Settings,
} from "lucide-react";

const navItems = [
  {
    label: "Command center",
    href: "/dashboard",
    icon: Gauge,
  },
  {
    label: "Product register",
    href: "/products",
    icon: Network,
  },
  {
    label: "Client register",
    href: "/clients",
    icon: Building2,
  },
  {
    label: "Deployment register",
    href: "/deployments",
    icon: Layers3,
  },
  {
    label: "People & ownership",
    href: "/team",
    icon: UsersRound,
  },
  {
    label: "Reference index",
    href: "/documents",
    icon: FileText,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[261px] min-h-screen shrink-0 bg-[#0B2545] text-white flex flex-col">
      <div className="px-5 pt-5">
        <div className="flex items-start gap-3">
          <div className="relative flex h-[35px] w-[35px] items-center justify-center border border-[#5B83A5] bg-[#173B60]">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#D3E2ED"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="5" r="2" />
              <circle cx="6" cy="19" r="2" />
              <circle cx="18" cy="19" r="2" />
              <path d="M12 7v5" />
              <path d="M12 12H6v5" />
              <path d="M12 12h6v5" />
            </svg>

            <span className="absolute -right-[4px] -top-[5px] h-[8px] w-[8px] bg-[#C2762E]" />
          </div>

          <div className="pt-[1px]">
            <div className="text-[17px] font-semibold leading-none tracking-[-0.3px]">
              nexus
            </div>

            <div className="mt-[5px] text-[8px] font-mono tracking-[0.2em] text-[#87A8C2]">
              LEDGER / IDS
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 pt-[30px]">
        <div className="text-[9px] font-mono uppercase tracking-[0.17em] text-[#6F9ABE]">
          Command rail / Sections
        </div>
      </div>

      <nav className="mt-3 px-5">
        {navItems.map((item) => {
          const Icon = item.icon;

          const active =
            pathname === item.href ||
            (pathname === "/" && item.href === "/dashboard");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex h-[40px] items-center gap-[13px] pl-[11px] text-[11px] transition-colors ${
                active
                  ? "bg-[#123F69] text-white"
                  : "text-[#A5B9CA] hover:bg-[#123653] hover:text-white"
              }`}
            >
              {active && (
                <span className="absolute left-0 top-0 h-full w-[2px] bg-[#C2762E]" />
              )}

              <Icon
                size={17}
                strokeWidth={1.5}
                className={active ? "text-[#D0DFE9]" : "text-[#9CB2C5]"}
              />

              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mx-5 mt-[25px] border-t border-[#234967]" />

      <div className="px-5 pt-[27px]">
        <div className="text-[9px] font-mono uppercase tracking-[0.17em] text-[#6F9ABE]">
          Access boundary
        </div>
      </div>

      <div className="mx-5 mt-[14px] border border-[#285476] bg-[#102F51] px-3 py-3">
        <div className="flex items-center gap-2">
          <ShieldCheck
            size={16}
            strokeWidth={1.5}
            className="text-[#9FC88C]"
          />

          <span className="text-[11px] font-semibold text-white">
            Private workspace
          </span>
        </div>

        <p className="ml-[24px] mt-[3px] text-[8px] leading-[1.6] text-[#89A8BF]">
          Records are visible to IDS Fintech
          <br />
          employees only.
        </p>
      </div>

      <div className="mt-auto px-5 pb-7">
        <div className="text-[8px] font-mono text-[#6F94B2]">
          BUILD 2.6.14
        </div>

        <div className="mt-[4px] text-[9px] text-[#7F9EB6]">
          Internal operating system
        </div>
      </div>
    </aside>
  );
}