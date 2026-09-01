import Sidebar from "../../app/layout/Sidebar";
import Topbar from "../../app/layout/Topbar";

import {
  Plus,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

const stats = [
  {
    label: "Active products",
    value: "24",
    sub: "+2 this quarter",
  },
  {
    label: "Client companies",
    value: "18",
    sub: "3 onboarding",
  },
  {
    label: "Live deployments",
    value: "47",
    sub: "9 active markets",
  },
  {
    label: "Pending items",
    value: "06",
    sub: "2 assigned to you",
  },
];

const recentProducts = [
  {
    code: "PRD-ATL-001",
    name: "Atlas Reconciliation",
    status: "LIVE",
    version: "v4.12.0",
    category: "Payments Platform",
    updated: "18 min ago",
  },
  {
    code: "PRD-CLR-014",
    name: "ClearLedger",
    status: "ROLLOUT",
    version: "v2.8.3",
    category: "Core Banking",
    updated: "2 hours ago",
  },
  {
    code: "PRD-MOS-008",
    name: "Mosaic Risk Engine",
    status: "REVIEW",
    version: "v1.9.0",
    category: "Risk & Treasury",
    updated: "Yesterday",
  },
];

const queueItems = [
  {
    border: "border-l-amber-600",
    icon: AlertCircle,
    tint: "text-amber-600",
    title: "Review 2 pending documents",
    sub: "Due Tuesday · Documentation",
  },
  {
    border: "border-l-blue-500",
    icon: ShieldCheck,
    tint: "text-blue-600",
    title: "Confirm Atlas ownership",
    sub: "Requested by Rami Haddad",
  },
  {
    border: "border-l-emerald-600",
    icon: CheckCircle2,
    tint: "text-emerald-600",
    title: "Quarterly review ready",
    sub: "Portfolio snapshot · 30 Aug",
  },
];

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    LIVE: "border-[#6EAA99] text-[#267B67]",
    ROLLOUT: "border-[#82A7C4] text-[#36719C]",
    REVIEW: "border-[#C2762E] text-[#A15F25]",
  };

  return (
    <span
      className={`
        text-[9px]
        font-mono
        tracking-wide
        px-1.5
        py-[3px]
        border
        ${styles[status]}
      `}
    >
      {status}
    </span>
  );
}

export default function DashboardPage() {
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
                Command center
              </h1>

              <p className="text-[11px] text-[#7A8FA4] mt-5">
                A working index of what is live, changing, and waiting for an
                accountable owner.
              </p>
            </div>

            <button
              className="
                flex
                items-center
                gap-2
                bg-[#0B1E3A]
                hover:bg-[#152C50]
                text-white
                text-[13px]
                font-medium
                px-4
                h-[39px]
                transition-colors
              "
            >
              <Plus size={16} strokeWidth={1.8} />
              Quick record
            </button>
          </div>

          <div className="border-t border-[#D3D3CF] mt-6 mb-6" />

          <div className="grid grid-cols-4 mb-7">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="border-l-2 border-[#C2762E] pl-3 min-h-[63px]"
              >
                <div className="text-[9px] uppercase tracking-[0.14em] font-mono text-[#698097] mb-2">
                  {stat.label}
                </div>

                <div className="text-[22px] leading-none font-semibold text-[#0B1E3A]">
                  {stat.value}
                </div>

                <div className="text-[8px] text-[#8494A4] mt-2">
                  {stat.sub}
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-5">
            <section className="col-span-2 bg-[#FAFAF8] border border-[#D2D5D3]">
              <div className="flex items-center justify-between px-[18px] py-[15px] border-b border-[#D8D9D7]">
                <div>
                  <div className="text-[9px] uppercase tracking-[0.15em] font-mono text-[#698097]">
                    Register activity / Last 24h
                  </div>

                  <h2 className="text-[16px] font-semibold text-[#0B1E3A] mt-1">
                    Recently updated products
                  </h2>
                </div>

                <a
                  href="/products"
                  className="text-[11px] text-[#2874B6] hover:text-[#0B1E3A]"
                >
                  View register ↗
                </a>
              </div>

              <div>
                {recentProducts.map((product) => (
                  <div
                    key={product.code}
                    className="grid grid-cols-[115px_1fr_80px] items-center min-h-[78px] px-[18px] border-b border-[#E0E1DE] last:border-b-0"
                  >
                    <span className="text-[8px] font-mono text-[#8294A5]">
                      {product.code}
                    </span>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-medium text-[#0B1E3A]">
                          {product.name}
                        </span>

                        <StatusBadge status={product.status} />
                      </div>

                      <div className="text-[8px] text-[#8A99A7] mt-1">
                        release {product.version} · {product.category}
                      </div>
                    </div>

                    <div className="text-[8px] text-[#8193A4] text-right">
                      {product.updated}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <div className="flex flex-col gap-5">
              <section className="bg-[#FAFAF8] border border-[#D2D5D3] p-[18px]">
                <div className="text-[9px] uppercase tracking-[0.15em] font-mono text-[#698097]">
                  Operations queue / 03 open
                </div>

                <h2 className="text-[16px] font-semibold text-[#0B1E3A] mt-1 mb-4">
                  Needs attention
                </h2>

                <div className="space-y-2">
                  {queueItems.map((item) => {
                    const Icon = item.icon;

                    return (
                      <div
                        key={item.title}
                        className={`flex gap-2.5 py-2 pl-2.5 border-l-2 ${item.border}`}
                      >
                        <Icon
                          size={16}
                          strokeWidth={1.6}
                          className={`${item.tint} shrink-0 mt-[1px]`}
                        />

                        <div>
                          <div className="text-[9px] font-medium text-[#0B1E3A]">
                            {item.title}
                          </div>

                          <div className="text-[8px] text-[#8A99A7] mt-1">
                            {item.sub}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className="bg-[#FAFAF8] border border-[#D2D5D3] p-[18px]">
                <div className="text-[9px] uppercase tracking-[0.15em] font-mono text-[#698097] mb-3">
                  Live signal / Beirut
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60 animate-ping" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                  </span>

                  <span className="text-[10px] font-medium text-[#0B1E3A]">
                    All systems operational
                  </span>

                  <span className="text-[8px] font-mono text-[#8193A4] ml-auto">
                    08:42
                  </span>
                </div>

                <div className="w-full h-[4px] bg-[#DCE5E1] overflow-hidden mb-2">
                  <div
                    className="h-full bg-[#4A947E]"
                    style={{ width: "86%" }}
                  />
                </div>

                <p className="text-[8px] text-[#8494A4]">
                  86% of active deployments checked in within 15 min.
                </p>
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}