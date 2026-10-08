import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { ConfirmationModal } from "./ConfirmationModal";
import { User, Role } from "../types";
import {
  ShieldCheck,
  UserCheck,
  Plus,
  Mail,
  User as UserIcon,
  X,
  Power,
  Trash2,
  CheckCircle2
} from "lucide-react";

export const StaffView: React.FC = () => {
  const { isAdmin, user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("password123");
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [role, setRole] = useState<Role>("STAFF");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/users");
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to load staff", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id: number) => {
    if (!isAdmin) return;
    try {
      await api.patch(`/users/${id}/toggle-status`);
      loadUsers();
    } catch (err) {
      console.error("Failed to toggle status", err);
    }
  };

  const handleDeleteStaff = (u: User) => {
    if (!isAdmin) return;
    setUserToDelete(u);
  };

  const handleConfirmDeleteStaff = async () => {
    if (!userToDelete) return;
    try {
      await api.delete(`/users/${userToDelete.id}`);
      setUserToDelete(null);
      loadUsers();
    } catch (err: any) {
      console.error("Failed to delete staff member", err);
      alert(err.response?.data?.message || "Failed to delete staff member");
    }
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      await api.post("/auth/register", {
        username,
        email,
        password,
        firstName,
        lastName,
        role
      });
      setIsModalOpen(false);
      loadUsers();
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || "Failed to create user account.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-stone-900">Salon Staff & Access Control (RBAC)</h1>
          <p className="text-sm text-stone-500">
            JWT Role-Based Security: Admins manage salon configuration and revenue; Staff manage bookings.
          </p>
        </div>
        {isAdmin && (
          <button
            id="btn-add-staff"
            onClick={() => {
              setUsername("");
              setEmail("");
              setPassword("password123");
              setFirstName("");
              setLastName("");
              setRole("STAFF");
              setErrorMessage(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Staff Member</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="p-12 text-center text-stone-400 text-sm">Loading user accounts...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map((u) => (
            <div
              key={u.id}
              className={`bg-white rounded-xl border p-5 shadow-xs transition-all flex flex-col justify-between ${
                u.enabled ? "border-stone-200" : "border-stone-200 opacity-60 bg-stone-50"
              }`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-teal-100 text-teal-700 font-bold text-sm flex items-center justify-center">
                      {u.firstName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-stone-900 text-sm">{u.fullName}</h3>
                      <span className="text-xs text-stone-400 font-mono">@{u.username}</span>
                    </div>
                  </div>

                  <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded ${
                    u.role === "ADMIN" ? "bg-purple-50 text-purple-700 border border-purple-200" : "bg-teal-50 text-teal-700 border border-teal-200"
                  }`}>
                    {u.role}
                  </span>
                </div>

                <div className="mt-4 space-y-1.5 text-xs text-stone-600">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-stone-400" />
                    <span>{u.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <UserIcon className="w-3.5 h-3.5 text-stone-400" />
                    <span>Status: {u.enabled ? "Active Account" : "Disabled"}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-stone-100 flex items-center justify-between">
                <span className={`text-[11px] font-semibold ${u.enabled ? "text-emerald-700" : "text-stone-400"}`}>
                  {u.enabled ? "Authorized for Login" : "Deactivated"}
                </span>

                {isAdmin ? (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleToggleStatus(u.id)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                        u.enabled
                          ? "text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200/60"
                          : "text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/60"
                      }`}
                      title={u.enabled ? "Disable Account" : "Enable Account"}
                    >
                      <Power className="w-3 h-3" />
                      <span>{u.enabled ? "Disable" : "Enable"}</span>
                    </button>

                    {u.username !== "admin" && (
                      <button
                        onClick={() => handleDeleteStaff(u)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/60 transition-colors"
                        title="Delete Staff Member"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete</span>
                      </button>
                    )}
                  </div>
                ) : (
                  <span className="text-[11px] text-stone-400 italic">View Only</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Staff Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-stone-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h2 className="font-bold text-stone-900 text-base">Add Staff Member</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMessage && (
              <div className="mt-3 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleCreateStaff} className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:bg-white text-stone-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:bg-white text-stone-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Username</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:bg-white text-stone-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:bg-white text-stone-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Temporary Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:bg-white text-stone-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Assigned Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as Role)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:bg-white text-stone-900"
                >
                  <option value="STAFF">STAFF (Groomer / Scheduler)</option>
                  <option value="ADMIN">ADMIN (Full Privileges & Revenue)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold disabled:opacity-50"
                >
                  {isSubmitting ? "Creating..." : "Create Staff Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Delete Staff Member Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!userToDelete}
        title="Delete Staff Member"
        message={
          userToDelete
            ? `Are you sure you want to delete ${userToDelete.fullName} (@${userToDelete.username})? This user will no longer be able to log in to the salon portal.`
            : ""
        }
        confirmLabel="Delete Staff"
        isDestructive={true}
        onConfirm={handleConfirmDeleteStaff}
        onClose={() => setUserToDelete(null)}
      />
    </div>
  );
};
