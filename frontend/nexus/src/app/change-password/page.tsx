"use client";

import { useState } from "react";
import { Lock, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const token = localStorage.getItem("nexus_token");
    if (!token) {
      setError("You're not logged in. Please log in again.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data?.message ?? "Failed to change password.");
        return;
      }

      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(()=>{
        window.location.href = "/dashboard";
      },1200)
    } catch (err) {
      console.error(err);
      setError("Could not reach the server. Is the API running?");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen bg-gray-50 flex items-center justify-center p-6"
      style={{
        backgroundImage:
          "linear-gradient(to right, #e5e7eb 1px, transparent 1px), linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)",
        backgroundSize: "32px 32px",
      }}
    >
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-10">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Change password</h2>

        <form onSubmit={handleSubmit}>
          <label className="block text-[11px] font-semibold tracking-wide text-gray-500 mb-1.5">
            CURRENT PASSWORD
          </label>
          <div className="relative mb-4">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Your current password"
              className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3F84E5]/30 focus:border-[#3F84E5]"
            />
          </div>

          <label className="block text-[11px] font-semibold tracking-wide text-gray-500 mb-1.5">
            NEW PASSWORD
          </label>
          <div className="relative mb-4">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 8 characters"
              className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3F84E5]/30 focus:border-[#3F84E5]"
            />
          </div>

          <label className="block text-[11px] font-semibold tracking-wide text-gray-500 mb-1.5">
            CONFIRM NEW PASSWORD
          </label>
          <div className="relative mb-2">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3F84E5]/30 focus:border-[#3F84E5]"
            />
          </div>

          {error && (
            <div className="flex items-center gap-1.5 text-xs text-red-600 mb-2 mt-2">
              <AlertCircle size={14} />
              {error}
            </div>
          )}

          {success && (
            <div className="flex items-center gap-1.5 text-xs text-green-600 mb-2 mt-2">
              <CheckCircle2 size={14} />
              Password updated successfully.
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#3F84E5] hover:bg-[#2E6FCB] disabled:opacity-60 text-white text-sm font-semibold rounded-lg py-2.5 flex items-center justify-center gap-2 transition-colors mt-4"
          >
            <ArrowRight size={16} />
            {loading ? "Updating..." : "Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}