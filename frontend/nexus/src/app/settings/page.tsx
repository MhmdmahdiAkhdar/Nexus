"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, LogOut, Shield, ChevronRight } from "lucide-react";
import Sidebar from "../layout/Sidebar";
import Topbar from "../layout/Topbar";

const SETTINGS_ITEMS = [
  {
    key: "password",
    label: "Change password",
    description: "Update the password you use to sign in",
    icon: KeyRound,
    path: "/change-password",
  },
  {
    key: "access",
    label: "Access control",
    description: "Manage who can view and edit this workspace",
    icon: Shield,
    path: "/access-control",
  },
];

export default function SettingsPage() {
  const router = useRouter();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("nexus_token");
    if (!token) {
      router.push("/login");
    }
  }, [router]);

  function confirmLogout() {
    localStorage.removeItem("nexus_token");
    localStorage.removeItem("nexus_user");
    window.location.href = "/login";
  }

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />

        <main className="flex-1 px-8 py-12">
          <div className="max-w-xl mx-auto">
            {/* Header */}
            <div className="mb-10">
              <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
              <p className="text-sm text-gray-500 mt-1">
                Manage your account and workspace preferences
              </p>
            </div>

            {/* Account section */}
            <div>
              <h2 className="text-xs font-medium text-gray-400 mb-3 px-1">Account</h2>
              <div className="rounded-xl border border-gray-200 divide-y divide-gray-200 overflow-hidden">
                {SETTINGS_ITEMS.map(({ key, label, description, icon: Icon, path }) => (
                  <button
                    key={key}
                    onClick={() => router.push(path)}
                    className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-9 h-9 shrink-0 rounded-lg bg-gray-100 flex items-center justify-center">
                      <Icon size={17} className="text-gray-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900">{label}</div>
                      <div className="text-sm text-gray-500 truncate">{description}</div>
                    </div>
                    <ChevronRight size={16} className="text-gray-300 shrink-0" />
                  </button>
                ))}
              </div>
            </div>

            {/* Session section */}
            <div className="mt-8">
              <h2 className="text-xs font-medium text-gray-400 mb-3 px-1">Session</h2>
              <div className="rounded-xl border border-gray-200 overflow-hidden">
                <button
                  onClick={() => setShowLogoutConfirm(true)}
                  className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-red-50 transition-colors group"
                >
                  <div className="w-9 h-9 shrink-0 rounded-lg bg-red-50 flex items-center justify-center group-hover:bg-red-100 transition-colors">
                    <LogOut size={17} className="text-red-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-red-600">Log out</div>
                    <div className="text-sm text-gray-500">
                      End your session on this device
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={() => setShowLogoutConfirm(false)}
        >
          <div
            className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Log out?</h2>
            <p className="text-sm text-gray-500 mb-6">
              You'll need to sign in again to access your account.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}