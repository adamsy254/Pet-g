import React from "react";
import { useAuth } from "../context/AuthContext";
import {
  Scissors,
  Calendar,
  Users,
  Dog,
  Sparkles,
  BarChart3,
  ShieldCheck,
  LogOut
} from "lucide-react";

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const { user, isAdmin, logout } = useAuth();

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "appointments", label: "Appointments", icon: Calendar },
    { id: "customers", label: "Customers", icon: Users },
    { id: "pets", label: "Pets", icon: Dog },
    { id: "services", label: "Services", icon: Sparkles },
    { id: "reports", label: "Reports", icon: BarChart3 },
    { id: "staff", label: "Staff & Roles", icon: ShieldCheck }
  ];

  return (
      <header className="bg-white border-b border-stone-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Brand */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-sm">
                <Scissors className="w-5 h-5" />
              </div>
              <div>
              <span className="font-bold text-stone-900 tracking-tight text-lg block leading-tight">
                Paws & Groom
              </span>
                <p className="text-xs text-stone-500">Pet Grooming Salon</p>
              </div>
            </div>

            {/* Center Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                    <button
                        key={item.id}
                        id={`nav-tab-${item.id}`}
                        onClick={() => setActiveTab(item.id)}
                        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                            isActive
                                ? "bg-teal-50 text-teal-700 border border-teal-200/60 shadow-xs"
                                : "text-stone-600 hover:text-stone-900 hover:bg-stone-50"
                        }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? "text-teal-600" : "text-stone-400"}`} />
                      <span>{item.label}</span>
                    </button>
                );
              })}
            </nav>

            {/* Right Actions: User profile & logout */}
            <div className="flex items-center gap-3">
              {/* User Profile */}
              <div className="flex items-center gap-2 pl-2 border-l border-stone-200">
                <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-xs">
                  {user ? user.firstName.charAt(0) : "U"}
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-xs font-semibold text-stone-800 leading-tight">{user?.fullName}</p>
                  <span className="text-[10px] font-medium text-teal-600 uppercase tracking-wider">
                  {user?.role}
                </span>
                </div>
              </div>

              {/* Logout Button */}
              <button
                  id="btn-logout"
                  onClick={logout}
                  title="Sign Out"
                  className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors ml-1"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Mobile Navigation Row */}
          <div className="md:hidden flex items-center gap-1 py-2 overflow-x-auto border-t border-stone-100">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                  <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs whitespace-nowrap font-medium ${
                          isActive
                              ? "bg-teal-50 text-teal-700 font-semibold"
                              : "text-stone-600 hover:bg-stone-50"
                      }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </button>
              );
            })}
          </div>
        </div>
      </header>
  );
};