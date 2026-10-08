import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { GroomingService } from "../types";
import { useAuth } from "../context/AuthContext";
import {
  Sparkles,
  Search,
  Plus,
  Clock,
  DollarSign,
  Edit2,
  Trash2,
  X,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

export const ServicesView: React.FC = () => {
  const { isAdmin } = useAuth();
  const [services, setServices] = useState<GroomingService[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeOnly, setActiveOnly] = useState<boolean>(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingService, setEditingService] = useState<GroomingService | null>(null);
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [basePrice, setBasePrice] = useState<number>(45);
  const [durationMinutes, setDurationMinutes] = useState<number>(60);
  const [active, setActive] = useState<boolean>(true);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    loadServices();
  }, [activeOnly]);

  const loadServices = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/services?activeOnly=${activeOnly}`);
      setServices(res.data);
    } catch (err) {
      console.error("Failed to load services", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenNewModal = () => {
    setEditingService(null);
    setName("");
    setDescription("");
    setBasePrice(45);
    setDurationMinutes(45);
    setActive(true);
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (s: GroomingService) => {
    setEditingService(s);
    setName(s.name);
    setDescription(s.description);
    setBasePrice(s.basePrice);
    setDurationMinutes(s.durationMinutes);
    setActive(s.active);
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      const payload = {
        name,
        description,
        basePrice: Number(basePrice),
        durationMinutes: Number(durationMinutes),
        active
      };

      if (editingService) {
        await api.put(`/services/${editingService.id}`, payload);
      } else {
        await api.post("/services", payload);
      }

      setIsModalOpen(false);
      loadServices();
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || "Failed to save service.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteService = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this grooming service?")) return;
    try {
      await api.delete(`/services/${id}`);
      loadServices();
    } catch (err) {
      console.error("Failed to delete service", err);
    }
  };

  const filteredServices = services.filter(s => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-stone-900">Grooming Service Menu</h1>
          <p className="text-sm text-stone-500">
            Base rates, treatment durations, and catalog configuration for the pricing engine.
          </p>
        </div>
        {isAdmin && (
          <button
            id="btn-add-service"
            onClick={handleOpenNewModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Service</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-xs">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
          <input
            id="input-search-services"
            type="text"
            placeholder="Search services..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:bg-white text-stone-900"
          />
        </div>

        <label className="flex items-center gap-2 text-xs text-stone-600 cursor-pointer self-start sm:self-auto">
          <input
            type="checkbox"
            checked={activeOnly}
            onChange={(e) => setActiveOnly(e.target.checked)}
            className="rounded text-teal-600"
          />
          <span className="font-medium">Show Active Services Only</span>
        </label>
      </div>

      {/* Services Grid */}
      {loading ? (
        <div className="p-12 text-center text-stone-500 text-sm">Loading service menu...</div>
      ) : filteredServices.length === 0 ? (
        <div className="bg-white rounded-xl border border-stone-200 p-12 text-center shadow-xs">
          <Sparkles className="w-10 h-10 text-stone-300 mx-auto mb-3" />
          <p className="text-stone-800 font-semibold text-sm">No services found</p>
          <p className="text-stone-500 text-xs mt-1">Add a new service to start offering treatments.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredServices.map((s) => (
            <div
              key={s.id}
              className={`bg-white rounded-xl border p-5 shadow-xs transition-all flex flex-col justify-between ${
                s.active ? "border-stone-200 hover:border-teal-400" : "border-stone-200 opacity-60 bg-stone-50"
              }`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-stone-900 text-base">{s.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        s.active ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-stone-200 text-stone-600"
                      }`}>
                        {s.active ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>

                  {isAdmin && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditModal(s)}
                        className="p-1 text-stone-400 hover:text-stone-800 rounded"
                        title="Edit Service"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteService(s.id)}
                        className="p-1 text-stone-400 hover:text-rose-600 rounded"
                        title="Delete Service"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                <p className="text-xs text-stone-500 mt-3 leading-relaxed">
                  {s.description}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-stone-100 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-stone-600">
                  <Clock className="w-3.5 h-3.5 text-teal-600" />
                  <span>{s.durationMinutes} minutes</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-stone-400 block uppercase">Base Price</span>
                  <span className="font-bold text-stone-900 text-base font-mono">
                    ${s.basePrice.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Service Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-stone-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h2 className="font-bold text-stone-900 text-base">
                {editingService ? "Edit Service" : "Add Grooming Service"}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMessage && (
              <div className="mt-3 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSaveService} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Service Name</label>
                <input
                  id="input-service-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:bg-white text-stone-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Description</label>
                <textarea
                  id="input-service-description"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Details of what's included in this grooming package..."
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:bg-white text-stone-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Base Price ($)</label>
                  <input
                    id="input-service-price"
                    type="number"
                    step="0.5"
                    required
                    value={basePrice}
                    onChange={(e) => setBasePrice(parseFloat(e.target.value))}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:bg-white text-stone-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Duration (Min)</label>
                  <input
                    id="input-service-duration"
                    type="number"
                    step="5"
                    required
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:bg-white text-stone-900"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 text-xs text-stone-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={(e) => setActive(e.target.checked)}
                    className="rounded text-teal-600"
                  />
                  <span className="font-medium">Active (Available for appointment booking)</span>
                </label>
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
                  id="btn-save-service"
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : (editingService ? "Update" : "Create")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
