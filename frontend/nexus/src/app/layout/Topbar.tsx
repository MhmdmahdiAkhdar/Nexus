"use client";

import { Bell, Clock, MapPin, LogOut, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface StoredUser {
  fullName: string;
  roleName: string;
}

export default function Topbar() {
  const router = useRouter();
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");
  const [user, setUser] = useState<StoredUser | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
      setDate(now.toLocaleDateString("en-GB", { weekday: "short", month: "short", day: "numeric" }));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    const stored = localStorage.getItem("nexus_user");
    if (stored) {
      setUser(JSON.parse(stored));
    }

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setShowUserMenu(false);
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const initials = user?.fullName
    ? user.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?";

  const handleLogout = () => {
    localStorage.removeItem("nexus_token");
    localStorage.removeItem("nexus_user");
    window.location.href = "/login";
  };

  return (
    <header className="h-16 bg-[#0F1419] border-b border-[#1F2937] text-white flex items-center justify-between px-8">

      
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 text-sm">
          <MapPin size={16} className="text-[#60A5FA]" />
          <span className="text-gray-300 font-medium">Beirut HQ</span>
          <span className="text-gray-600">•</span>
          <span className="text-gray-500 text-xs">33.8938° N 35.5018° E</span>
        </div>

        <div className="h-6 w-px bg-[#1F2937]" />

        <div className="flex items-center gap-2 text-sm">
          <Clock size={16} className="text-[#60A5FA]" />
          <div className="flex flex-col gap-0.5">
            <span className="text-gray-300 font-medium">{time}</span>
            <span className="text-xs text-gray-500">{date}</span>
          </div>
        </div>
      </div>

      
      <div className="flex items-center gap-6">

        
        <div className="relative" ref={notificationsRef}>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-[#1F2937] border border-[#374151] rounded-lg shadow-2xl z-50">
              <div className="p-4 border-b border-[#374151]">
                <p className="text-sm font-semibold text-white">Notifications</p>
              </div>
              <div className="max-h-96 overflow-y-auto">
                <div className="p-6 text-center">
                  <p className="text-sm text-gray-400">You're all caught up.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="h-6 w-px bg-[#1F2937]" />

        
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu((v) => !v)}
            aria-haspopup="true"
            aria-expanded={showUserMenu}
            className="flex items-center gap-3 px-3 py-1.5 rounded-lg hover:bg-[#1F2937] transition-all duration-200 group"
          >
            <div className="text-right">
              <div className="text-sm font-semibold text-white leading-none">
                {user?.fullName ?? "Not logged in"}
              </div>
              <div className="text-xs text-gray-400 mt-1 tracking-wide group-hover:text-[#60A5FA] transition-colors">
                {user?.roleName?.toUpperCase() ?? "GUEST"}
              </div>
            </div>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] flex items-center justify-center text-xs font-bold text-white border border-[#3B82F6]/30">
              {initials}
            </div>
          </button>

          
          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-[#1F2937] border border-[#374151] rounded-lg shadow-2xl z-50">
              <div className="p-4 border-b border-[#374151]">
                <p className="text-sm font-semibold text-white">{user?.fullName ?? "User"}</p>
                <p className="text-xs text-gray-400 mt-1">{user?.roleName ?? "Role"}</p>
              </div>

              <div className="p-2 space-y-1">
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    router.push("/settings");
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-300 hover:bg-[#27303D] hover:text-white rounded-lg transition-colors"
                >
                  <User size={16} />
                  <span>Profile Settings</span>
                </button>
              </div>

              <div className="p-2 border-t border-[#374151]">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-400 hover:bg-red-900/20 hover:text-red-300 rounded-lg transition-colors"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}