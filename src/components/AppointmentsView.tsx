import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { ConfirmationModal } from "./ConfirmationModal";
import {
  Appointment,
  Customer,
  Pet,
  GroomingService,
  User,
  AppointmentStatus,
  PriceCalculationResponse
} from "../types";
import {
  Calendar,
  Clock,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  X,
  Trash2,
  Edit2,
  DollarSign,
  Sparkles,
  UserCheck,
  Scissors
} from "lucide-react";

interface AppointmentsViewProps {
  isBookingModalOpen: boolean;
  setIsBookingModalOpen: (open: boolean) => void;
}

export const AppointmentsView: React.FC<AppointmentsViewProps> = ({
  isBookingModalOpen,
  setIsBookingModalOpen
}) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [services, setServices] = useState<GroomingService[]>([]);
  const [groomers, setGroomers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterDate, setFilterDate] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterGroomer, setFilterGroomer] = useState<string>("");

  // Modal Form State
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | "">("");
  const [selectedPetId, setSelectedPetId] = useState<number | "">("");
  const [selectedGroomerId, setSelectedGroomerId] = useState<number | "">("");
  const [appointmentDate, setAppointmentDate] = useState<string>("2026-09-15");
  const [startTime, setStartTime] = useState<string>("09:00");
  const [endTime, setEndTime] = useState<string>("10:00");
  const [status, setStatus] = useState<AppointmentStatus>("SCHEDULED");
  const [selectedServiceIds, setSelectedServiceIds] = useState<number[]>([]);
  const [notes, setNotes] = useState<string>("");

  // Dynamic Pricing Calculation Preview
  const [priceEstimate, setPriceEstimate] = useState<PriceCalculationResponse | null>(null);
  const [isCalculatingPrice, setIsCalculatingPrice] = useState<boolean>(false);

  // Error / Conflict Alerts
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState<Appointment | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [apptsRes, custsRes, petsRes, servsRes, groomersRes] = await Promise.all([
        api.get("/appointments"),
        api.get("/customers"),
        api.get("/pets"),
        api.get("/services"),
        api.get("/users/staff")
      ]);
      setAppointments(apptsRes.data);
      setCustomers(custsRes.data);
      setPets(petsRes.data);
      setServices(servsRes.data);
      setGroomers(groomersRes.data);
    } catch (err) {
      console.error("Failed to load appointment data", err);
    } finally {
      setLoading(false);
    }
  };

  // Re-calculate dynamic pricing whenever selected pet or services change in the booking modal
  useEffect(() => {
    if (isBookingModalOpen && selectedServiceIds.length > 0 && selectedPetId) {
      calculatePricePreview();
    } else {
      setPriceEstimate(null);
    }
  }, [selectedPetId, selectedServiceIds, isBookingModalOpen]);

  const calculatePricePreview = async () => {
    setIsCalculatingPrice(true);
    try {
      const res = await api.post("/appointments/pricing/calculate", {
        petId: Number(selectedPetId),
        serviceIds: selectedServiceIds
      });
      setPriceEstimate(res.data);
    } catch (err) {
      console.error("Failed to calculate price preview", err);
    } finally {
      setIsCalculatingPrice(false);
    }
  };

  // Filtered customer pets
  const availablePets = pets.filter(p => selectedCustomerId === "" || p.customerId === Number(selectedCustomerId));

  const handleOpenNewModal = () => {
    setEditingAppointment(null);
    setSelectedCustomerId(customers[0]?.id || "");
    setSelectedPetId("");
    setSelectedGroomerId(groomers[0]?.id || "");
    setAppointmentDate("2026-09-15");
    setStartTime("10:00");
    setEndTime("11:00");
    setStatus("SCHEDULED");
    setSelectedServiceIds([1]);
    setNotes("");
    setErrorMessage(null);
    setConflictWarning(null);
    setIsBookingModalOpen(true);
  };

  const handleOpenEditModal = (appt: Appointment) => {
    setEditingAppointment(appt);
    setSelectedCustomerId(appt.customerId);
    setSelectedPetId(appt.petId);
    setSelectedGroomerId(appt.groomerId);
    setAppointmentDate(appt.appointmentDate);
    setStartTime(appt.startTime.substring(0, 5));
    setEndTime(appt.endTime.substring(0, 5));
    setStatus(appt.status);
    setSelectedServiceIds(appt.services.map(s => s.id));
    setNotes(appt.notes || "");
    setErrorMessage(null);
    setConflictWarning(null);
    setIsBookingModalOpen(true);
  };

  const handleToggleService = (id: number) => {
    setSelectedServiceIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSaveAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setConflictWarning(null);

    if (!selectedCustomerId || !selectedPetId || !selectedGroomerId) {
      setErrorMessage("Please select a Customer, Pet, and Groomer.");
      return;
    }
    if (selectedServiceIds.length === 0) {
      setErrorMessage("Please select at least one grooming service.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        customerId: Number(selectedCustomerId),
        petId: Number(selectedPetId),
        groomerId: Number(selectedGroomerId),
        appointmentDate,
        startTime,
        endTime,
        status,
        serviceIds: selectedServiceIds,
        notes
      };

      if (editingAppointment) {
        await api.put(`/appointments/${editingAppointment.id}`, payload);
      } else {
        await api.post("/appointments", payload);
      }

      setIsBookingModalOpen(false);
      loadAllData();
    } catch (err: any) {
      if (err.response?.status === 409) {
        // Double-booking conflict caught!
        setConflictWarning(err.response.data.message || "Conflict: Groomer already booked at this time.");
      } else {
        setErrorMessage(err.response?.data?.message || "Failed to save appointment.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id: number, newStatus: AppointmentStatus) => {
    try {
      await api.patch(`/appointments/${id}/status?status=${newStatus}`);
      loadAllData();
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  const handleDeleteAppointment = (appt: Appointment) => {
    setDeleteError(null);
    setAppointmentToDelete(appt);
  };

  const handleConfirmDelete = async () => {
    if (!appointmentToDelete) return;
    try {
      await api.delete(`/appointments/${appointmentToDelete.id}`);
      setAppointmentToDelete(null);
      await loadAllData();
    } catch (err: any) {
      console.error("Failed to delete appointment", err);
      setDeleteError(err.response?.data?.message || "Failed to delete appointment. Please try again.");
    }
  };

  // Filter appointments list
  const filteredAppointments = appointments.filter(a => {
    if (filterDate && a.appointmentDate !== filterDate) return false;
    if (filterStatus && a.status !== filterStatus) return false;
    if (filterGroomer && a.groomerId !== Number(filterGroomer)) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchCustomer = a.customerName.toLowerCase().includes(q);
      const matchPet = a.petName.toLowerCase().includes(q);
      const matchNotes = a.notes?.toLowerCase().includes(q);
      if (!matchCustomer && !matchPet && !matchNotes) return false;
    }
    return true;
  });

  const getStatusBadge = (st: AppointmentStatus) => {
    switch (st) {
      case "COMPLETED":
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">Completed</span>;
      case "IN_PROGRESS":
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">In Progress</span>;
      case "CONFIRMED":
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">Confirmed</span>;
      case "CANCELLED":
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">Cancelled</span>;
      case "NO_SHOW":
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-stone-100 text-stone-600 border border-stone-300">No Show</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200">Scheduled</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & New Booking Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-stone-900">Appointment Management</h1>
          <p className="text-sm text-stone-500">
            Salon appointment scheduling, client booking history, and staff assignments.
          </p>
        </div>
        <button
          id="btn-schedule-appointment"
          onClick={handleOpenNewModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-lg shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Appointment</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
          <input
            id="input-search-appointments"
            type="text"
            placeholder="Search pet, customer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-teal-600 text-stone-900"
          />
        </div>

        {/* Date Filter */}
        <div className="relative">
          <input
            id="input-filter-date"
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-teal-600 text-stone-900"
          />
        </div>

        {/* Status Filter */}
        <div>
          <select
            id="select-filter-status"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-teal-600 text-stone-900"
          >
            <option value="">All Statuses</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="NO_SHOW">No Show</option>
          </select>
        </div>

        {/* Groomer Filter */}
        <div>
          <select
            id="select-filter-groomer"
            value={filterGroomer}
            onChange={(e) => setFilterGroomer(e.target.value)}
            className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-teal-600 text-stone-900"
          >
            <option value="">All Groomers</option>
            {groomers.map(g => (
              <option key={g.id} value={g.id}>{g.fullName}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Appointments List */}
      {loading ? (
        <div className="p-12 text-center text-stone-500 text-sm">Loading appointments...</div>
      ) : filteredAppointments.length === 0 ? (
        <div className="bg-white rounded-xl border border-stone-200 p-12 text-center shadow-xs">
          <Calendar className="w-10 h-10 text-stone-300 mx-auto mb-3" />
          <p className="text-stone-800 font-semibold text-sm">No appointments found</p>
          <p className="text-stone-500 text-xs mt-1">Try adjusting your filters or create a new appointment.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-stone-50 text-stone-600 font-semibold border-b border-stone-200">
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Pet & Customer</th>
                  <th className="py-3 px-4">Groomer</th>
                  <th className="py-3 px-4">Selected Services</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredAppointments.map((appt) => (
                  <tr key={appt.id} className="hover:bg-stone-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-stone-900">{appt.appointmentDate}</div>
                      <div className="text-stone-500 text-[11px] font-mono">
                        {appt.startTime.substring(0, 5)} - {appt.endTime.substring(0, 5)}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-stone-900">{appt.petName}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-100 text-stone-600 font-medium">
                          {appt.petSpecies}
                        </span>
                      </div>
                      <div className="text-stone-500 text-[11px] mt-0.5">
                        Owner: <span className="text-stone-700">{appt.customerName}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-medium text-stone-800">{appt.groomerName}</div>
                      <span className="text-[10px] text-stone-400">Assigned Staff</span>
                    </td>

                    <td className="py-3 px-4 max-w-xs">
                      <div className="flex flex-wrap gap-1">
                        {appt.services.map(s => (
                          <span key={s.id} className="px-1.5 py-0.5 rounded text-[11px] bg-teal-50 text-teal-800 border border-teal-200/50">
                            {s.name}
                          </span>
                        ))}
                      </div>
                      {appt.notes && (
                        <p className="text-[11px] text-stone-400 italic mt-1 truncate">"{appt.notes}"</p>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-stone-900 text-sm">
                        ${appt.calculatedPrice.toFixed(2)}
                      </div>
                      <span className="text-[10px] text-emerald-600 font-medium">Verified</span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        <div>{getStatusBadge(appt.status)}</div>
                        {/* Quick status cycle buttons */}
                        <div className="flex items-center gap-1">
                          {appt.status !== "IN_PROGRESS" && appt.status !== "COMPLETED" && (
                            <button
                              onClick={() => handleUpdateStatus(appt.id, "IN_PROGRESS")}
                              className="text-[10px] text-amber-700 hover:underline font-medium"
                              title="Set In Progress"
                            >
                              Start
                            </button>
                          )}
                          {appt.status !== "COMPLETED" && (
                            <button
                              onClick={() => handleUpdateStatus(appt.id, "COMPLETED")}
                              className="text-[10px] text-emerald-700 hover:underline font-medium"
                              title="Mark Completed"
                            >
                              Complete
                            </button>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(appt)}
                          className="p-1 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded"
                          title="Edit Appointment"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteAppointment(appt)}
                          className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded"
                          title="Delete Appointment"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Appointment Booking / Edit Modal */}
      {isBookingModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-stone-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                  <Scissors className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-bold text-stone-900 text-base">
                    {editingAppointment ? "Edit Appointment" : "Schedule Grooming Appointment"}
                  </h2>
                  <p className="text-xs text-stone-500">Service scheduling & customized price estimate</p>
                </div>
              </div>
              <button
                onClick={() => setIsBookingModalOpen(false)}
                className="text-stone-400 hover:text-stone-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error or Conflict Alert Banner */}
            {conflictWarning && (
              <div className="mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-semibold block">Double-Booking Conflict Detected:</strong>
                  <span>{conflictWarning}</span>
                </div>
              </div>
            )}

            {errorMessage && (
              <div className="mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSaveAppointment} className="mt-4 space-y-4">
              {/* Row 1: Customer & Pet */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Select Customer</label>
                  <select
                    id="modal-select-customer"
                    value={selectedCustomerId}
                    onChange={(e) => {
                      const cid = Number(e.target.value);
                      setSelectedCustomerId(cid);
                      // Auto-select first pet of customer if available
                      const cPets = pets.filter(p => p.customerId === cid);
                      setSelectedPetId(cPets[0]?.id || "");
                    }}
                    required
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:bg-white focus:ring-1 focus:ring-teal-600 text-stone-900"
                  >
                    <option value="">-- Choose Customer --</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.fullName} ({c.phone})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Select Pet</label>
                  <select
                    id="modal-select-pet"
                    value={selectedPetId}
                    onChange={(e) => setSelectedPetId(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:bg-white focus:ring-1 focus:ring-teal-600 text-stone-900"
                  >
                    <option value="">-- Choose Pet --</option>
                    {availablePets.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.species} • {p.breed} • {p.weight} lbs)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 2: Groomer, Date & Times */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Groomer (Staff)</label>
                  <select
                    id="modal-select-groomer"
                    value={selectedGroomerId}
                    onChange={(e) => setSelectedGroomerId(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:bg-white focus:ring-1 focus:ring-teal-600 text-stone-900"
                  >
                    <option value="">-- Select Groomer --</option>
                    {groomers.map(g => (
                      <option key={g.id} value={g.id}>{g.fullName} ({g.role})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Date</label>
                  <input
                    id="modal-input-date"
                    type="date"
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:bg-white focus:ring-1 focus:ring-teal-600 text-stone-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Start</label>
                    <input
                      id="modal-input-start-time"
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      required
                      className="w-full px-2 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:bg-white focus:ring-1 focus:ring-teal-600 text-stone-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">End</label>
                    <input
                      id="modal-input-end-time"
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      required
                      className="w-full px-2 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:bg-white focus:ring-1 focus:ring-teal-600 text-stone-900"
                    />
                  </div>
                </div>
              </div>

              {/* Grooming Services Selection */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Select Grooming Services (Multiple Allowed)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-44 overflow-y-auto p-2 bg-stone-50 border border-stone-200 rounded-lg">
                  {services.map(s => {
                    const isSelected = selectedServiceIds.includes(s.id);
                    return (
                      <label
                        key={s.id}
                        className={`flex items-center justify-between p-2 rounded-md border text-xs cursor-pointer transition-all ${
                          isSelected
                            ? "bg-teal-50 border-teal-300 text-teal-900"
                            : "bg-white border-stone-200 text-stone-700 hover:bg-stone-100"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleService(s.id)}
                            className="rounded text-teal-600 focus:ring-teal-500"
                          />
                          <span className="font-medium">{s.name}</span>
                        </div>
                        <span className="font-mono text-stone-500">${s.basePrice.toFixed(2)}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Price Calculation Breakdown Panel */}
              {selectedPetId && selectedServiceIds.length > 0 && (
                <div className="bg-stone-900 text-white rounded-xl p-4 text-xs space-y-2">
                  <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                    <span className="font-bold flex items-center gap-1 text-teal-400">
                      <Scissors className="w-3.5 h-3.5" />
                      Grooming Price Summary
                    </span>
                    {isCalculatingPrice && (
                      <span className="text-stone-400 animate-pulse text-[11px]">Calculating...</span>
                    )}
                  </div>

                  {priceEstimate ? (
                    <div className="space-y-1.5 pt-1">
                      <div className="flex justify-between text-stone-300">
                        <span>Base Services Total:</span>
                        <span className="font-mono font-medium">${priceEstimate.baseServicesTotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-stone-300">
                        <span>Species Rate:</span>
                        <span className="font-mono font-medium">{priceEstimate.speciesMultiplier.toFixed(2)}x</span>
                      </div>
                      <div className="flex justify-between text-stone-300">
                        <span>Size / Weight Rate:</span>
                        <span className="font-mono font-medium">{priceEstimate.weightMultiplier.toFixed(2)}x</span>
                      </div>
                      {priceEstimate.handlingSurcharge > 0 && (
                        <div className="flex justify-between text-amber-300">
                          <span>Special Handling Surcharge:</span>
                          <span className="font-mono font-medium">+${priceEstimate.handlingSurcharge.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-teal-300 font-bold text-sm pt-2 border-t border-stone-800">
                        <span>Estimated Total:</span>
                        <span className="font-mono">${priceEstimate.finalEstimatedPrice.toFixed(2)}</span>
                      </div>
                      {priceEstimate.appliedAdjustments.length > 0 && (
                        <div className="text-[10px] text-stone-400 pt-1">
                          Applied: {priceEstimate.appliedAdjustments.join(" • ")}
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Appointment Notes / Instructions</label>
                <textarea
                  id="modal-input-notes"
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Special requests, sensitive skin, customer waiting..."
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:bg-white focus:ring-1 focus:ring-teal-600 text-stone-900"
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsBookingModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  id="btn-confirm-booking"
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <span>{editingAppointment ? "Update Appointment" : "Confirm Booking"}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!appointmentToDelete}
        title="Cancel & Delete Appointment"
        message={
          appointmentToDelete
            ? `Are you sure you want to permanently cancel and remove the appointment for ${appointmentToDelete.petName} (${appointmentToDelete.customerName}) on ${appointmentToDelete.appointmentDate} at ${appointmentToDelete.startTime.substring(0, 5)}? This will free the groomer's time slot.`
            : ""
        }
        confirmLabel="Delete Appointment"
        isDestructive={true}
        onConfirm={handleConfirmDelete}
        onClose={() => setAppointmentToDelete(null)}
      />
    </div>
  );
};
