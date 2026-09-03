"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, LogOut } from "lucide-react";
import Sidebar from "../layout/Sidebar";
import Topbar from "../layout/Topbar";

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
    <div className="flex min-h-screen bg-[#F4F0E8]">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />

        <main
          className="flex-1 flex items-center justify-center px-[30px]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #e5e7eb 1px, transparent 1px), linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)",
            backgroundSize: "32px 32px",
            backgroundColor: "#f9fafb",
          }}
        >
          <div className="flex flex-col items-center gap-8">
            {/* <h1 className="text-[20px] font-semibold text-[#0B1E3A]">Settings</h1> */}

            <div className="flex items-center gap-6">
              <button
                onClick={() => router.push("/change-password")}
                className="w-36 h-36 flex flex-col items-center justify-center gap-3 rounded-2xl bg-white border border-gray-200 shadow-sm text-gray-700 transition-colors hover:bg-[#3F84E5] hover:border-[#3F84E5] hover:text-white"
              >
                <KeyRound size={26} />
                <span className="text-sm font-medium">Change password</span>
              </button>

              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="w-36 h-36 flex flex-col items-center justify-center gap-3 rounded-2xl bg-white border border-red-300 shadow-sm text-red-500 transition-colors hover:bg-red-500 hover:border-red-500 hover:text-white"
              >
                <LogOut size={26} />
                <span className="text-sm font-medium">Log out</span>
              </button>
            </div>
          </div>
        </main>
      </div>

        {showLogoutConfirm && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={() => setShowLogoutConfirm(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Log out?</h2>
            <p className="text-sm text-gray-500 mb-6">Are you sure you want to log out?</p>

            <div className="flex gap-3">
              <button
                onClick={confirmLogout}
                className="flex-1 rounded-lg bg-red-500 text-white text-sm font-medium py-2.5 hover:bg-red-600 transition-colors"
              >
                Yes
              </button>  
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium py-2.5 hover:bg-gray-50 transition-colors"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}