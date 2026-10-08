import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Lock, User as UserIcon, Shield, X, Sparkles, CheckCircle2, AlertCircle } from "lucide-react";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { login, user } = useAuth();
  const [username, setUsername] = useState<string>("admin");
  const [password, setPassword] = useState<string>("password123");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await login(username, password);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid username or password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async (u: string, p: string) => {
    setError(null);
    setIsLoading(true);
    try {
      await login(u, p);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-stone-200">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-stone-900 text-base">JWT Authentication (RBAC)</h2>
              <p className="text-[11px] text-stone-500">Sign in with Admin or Staff role</p>
            </div>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-3 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* 1-Click Demo Accounts */}
        <div className="mt-4 p-3 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block">
            1-Click Demo Credentials
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin("admin", "password123")}
              className="p-2 rounded-lg bg-white border border-stone-200 hover:border-teal-400 text-left transition-all"
            >
              <div className="font-bold text-xs text-stone-900">Admin Account</div>
              <div className="text-[11px] text-purple-700 font-semibold">ROLE_ADMIN</div>
              <div className="text-[10px] text-stone-400">Full salon & revenue access</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin("staff", "password123")}
              className="p-2 rounded-lg bg-white border border-stone-200 hover:border-teal-400 text-left transition-all"
            >
              <div className="font-bold text-xs text-stone-900">Staff Account</div>
              <div className="text-[11px] text-teal-700 font-semibold">ROLE_STAFF</div>
              <div className="text-[10px] text-stone-400">Grooming schedule operator</div>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Username</label>
            <input
              id="login-input-username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:bg-white text-stone-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Password</label>
            <input
              id="login-input-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:bg-white text-stone-900"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              id="btn-submit-login"
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold disabled:opacity-50"
            >
              {isLoading ? "Authenticating..." : "Sign In"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
