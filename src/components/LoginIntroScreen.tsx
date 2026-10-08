import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  Scissors,
  ShieldCheck,
  UserCheck,
  Lock,
  ArrowRight,
  AlertCircle,
  AlertTriangle,
  Sparkles,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

export const LoginIntroScreen: React.FC = () => {
  const { login } = useAuth();
  const [selectedRole, setSelectedRole] = useState<"ADMIN" | "STAFF">("ADMIN");
  const [username, setUsername] = useState<string>("admin");
  const [password, setPassword] = useState<string>("password123");
  const [error, setError] = useState<string | null>(null);
  const [roleWarning, setRoleWarning] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentBgIndex, setCurrentBgIndex] = useState<number>(0);

  // 4 alternating animal background images with partial blue overlay
  const backgroundImages = [
    "/image1.svg", // Dog grooming
    "/image2.svg", // Cat grooming
    "/image3.svg", // Playful paw prints & pup
    "/image4.svg"  // Avian & salon care
  ];

  // Rotate background every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBgIndex((prev) => (prev + 1) % backgroundImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [backgroundImages.length]);

  const handleRoleTabClick = (role: "ADMIN" | "STAFF") => {
    setSelectedRole(role);
    setRoleWarning(null);
    setError(null);
    if (role === "ADMIN") {
      setUsername("admin");
      setPassword("password123");
    } else {
      setUsername("staff");
      setPassword("password123");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setRoleWarning(null);

    // Cross-role credential check and warning
    const cleanUser = username.trim().toLowerCase();
    if (selectedRole === "ADMIN" && (cleanUser === "staff" || cleanUser.startsWith("staff") || cleanUser.startsWith("groomer_"))) {
      setRoleWarning("Role Warning: You selected 'Admin' tab, but are attempting to log in with a Staff account ('" + username + "'). Please switch to the Staff tab or enter Admin credentials.");
      return;
    }
    if (selectedRole === "STAFF" && (cleanUser === "admin" || cleanUser === "david.tanner@petgrooming.com")) {
      setRoleWarning("Role Warning: You selected 'Staff' tab, but are attempting to log in with the Administrator account ('" + username + "'). Please switch to the Admin tab.");
      return;
    }

    setIsLoading(true);
    try {
      await login(username, password);
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid username or password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 overflow-hidden">
      {/* Dynamic 4 Alternating Animal Background Images with Partial Blue Tint */}
      <div className="absolute inset-0 z-0 pointer-events-none transition-all duration-1000 ease-in-out">
        {backgroundImages.map((bgUrl, idx) => (
          <div
            key={bgUrl}
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
              idx === currentBgIndex ? "opacity-100" : "opacity-0"
            }`}
            style={{
              backgroundImage: `url(${bgUrl})`
            }}
          />
        ))}
        {/* Partially Blue Translucent Overlay */}
        <div className="absolute inset-0 bg-linear-to-tr from-slate-950/80 via-blue-950/65 to-sky-900/50 backdrop-blur-[2px]" />
      </div>

      {/* Header & Logo */}
      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex w-16 h-16 rounded-2xl bg-teal-600 text-white items-center justify-center shadow-xl shadow-teal-900/40 mb-3 border border-teal-400/30">
          <Scissors className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white drop-shadow-sm">
          Paws & Groom Pet Salon
        </h1>
        <p className="mt-1 text-xs text-blue-100/90 font-medium">
          Salon Management Portal • David Tanner, Store Owner
        </p>
      </div>

      <div className="relative z-10 mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white/95 backdrop-blur-md py-8 px-6 shadow-2xl rounded-2xl sm:px-10 border border-white/60">
          {/* Role Choice Cards / Selector */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-600">
                Choose Role to Log In
              </span>
              <span className="text-[11px] text-teal-700 font-semibold flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Select Role
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* ADMIN TAB */}
              <button
                type="button"
                id="btn-login-as-admin"
                onClick={() => handleRoleTabClick("ADMIN")}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  selectedRole === "ADMIN"
                    ? "border-purple-500 bg-purple-50/70 ring-2 ring-purple-500 shadow-xs"
                    : "border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50/80"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded-md bg-purple-100 text-purple-700 flex items-center justify-center">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-bold text-xs text-stone-900">Admin</span>
                </div>
                <p className="text-[11px] text-stone-600 leading-tight">
                  Full salon access, manage & delete staff, reports & revenue
                </p>
              </button>

              {/* STAFF TAB */}
              <button
                type="button"
                id="btn-login-as-staff"
                onClick={() => handleRoleTabClick("STAFF")}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                  selectedRole === "STAFF"
                    ? "border-teal-500 bg-teal-50/70 ring-2 ring-teal-500 shadow-xs"
                    : "border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50/80"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded-md bg-teal-100 text-teal-700 flex items-center justify-center">
                    <UserCheck className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-bold text-xs text-stone-900">Staff</span>
                </div>
                <p className="text-[11px] text-stone-600 leading-tight">
                  Customer & pet records, bookings (view-only staff directory)
                </p>
              </button>
            </div>
          </div>

          {/* Role Mismatch Warning Banner */}
          {roleWarning && (
            <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-start gap-2.5 animate-fadeIn">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
              <div className="leading-snug">
                <span className="font-bold block mb-0.5">Role Mismatch Detected</span>
                <span>{roleWarning}</span>
              </div>
            </div>
          )}

          {/* Authentication Error Banner */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs flex items-center gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          <div className="relative mb-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-stone-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-stone-400 font-medium">
                {selectedRole === "ADMIN" ? "Admin Credentials" : "Staff Credentials"}
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Username or Email
              </label>
              <div className="relative rounded-lg shadow-2xs">
                <input
                  id="login-username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setRoleWarning(null);
                  }}
                  placeholder={selectedRole === "ADMIN" ? "admin" : "staff"}
                  className="block w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-600 text-stone-900 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Password
              </label>
              <div className="relative rounded-lg shadow-2xs">
                <input
                  id="login-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setRoleWarning(null);
                  }}
                  placeholder="••••••••"
                  className="block w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-600 text-stone-900"
                />
              </div>
            </div>

            <button
              id="btn-login-submit"
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-lg shadow-xs text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 transition-colors cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In as {selectedRole === "ADMIN" ? "Admin" : "Staff"}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Background switcher indicator dots */}
          <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
            <span className="flex items-center gap-1 font-medium">
              <Lock className="w-3 h-3 text-stone-400" /> Secure Role-Based Access
            </span>
            <div className="flex items-center gap-1.5" title="Background animal image alternating">
              {backgroundImages.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setCurrentBgIndex(i)}
                  className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                    i === currentBgIndex ? "bg-teal-600 w-4" : "bg-stone-300 hover:bg-stone-400"
                  }`}
                  aria-label={`Animal background image ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
