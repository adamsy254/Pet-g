import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { ConfirmationModal } from "./ConfirmationModal";
import { Customer, Pet, Appointment } from "../types";
import {
  Users,
  Search,
  Plus,
  Phone,
  Mail,
  MapPin,
  Dog,
  Calendar,
  Edit2,
  Trash2,
  X,
  ChevronRight,
  UserCheck
} from "lucide-react";

export const CustomersView: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Customer Detail Drawer / Modal
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);
  const [customerPets, setCustomerPets] = useState<Pet[]>([]);
  const [customerAppointments, setCustomerAppointments] = useState<Appointment[]>([]);
  const [loadingDetails, setLoadingDetails] = useState<boolean>(false);

  // Add / Edit Modal
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/customers");
      setCustomers(res.data);
    } catch (err) {
      console.error("Failed to load customers", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenNewModal = () => {
    setEditingCustomer(null);
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhone("");
    setAddress("");
    setNotes("");
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (c: Customer, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingCustomer(c);
    setFirstName(c.firstName);
    setLastName(c.lastName);
    setEmail(c.email);
    setPhone(c.phone);
    setAddress(c.address || "");
    setNotes(c.notes || "");
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const handleViewCustomer = async (c: Customer) => {
    setViewingCustomer(c);
    setLoadingDetails(true);
    try {
      const [petsRes, apptsRes] = await Promise.all([
        api.get(`/pets/customer/${c.id}`),
        api.get("/appointments")
      ]);
      setCustomerPets(petsRes.data);
      const userAppts = apptsRes.data.filter((a: Appointment) => a.customerId === c.id);
      setCustomerAppointments(userAppts);
    } catch (err) {
      console.error("Failed to load customer profile details", err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      const payload = { firstName, lastName, email, phone, address, notes };
      if (editingCustomer) {
        await api.put(`/customers/${editingCustomer.id}`, payload);
      } else {
        await api.post("/customers", payload);
      }
      setIsModalOpen(false);
      loadCustomers();
      if (viewingCustomer && editingCustomer?.id === viewingCustomer.id) {
        setViewingCustomer({ ...viewingCustomer, ...payload, fullName: `${firstName} ${lastName}` });
      }
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || "Failed to save customer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCustomer = (c: Customer, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCustomerToDelete(c);
  };

  const handleConfirmDeleteCustomer = async () => {
    if (!customerToDelete) return;
    try {
      await api.delete(`/customers/${customerToDelete.id}`);
      if (viewingCustomer?.id === customerToDelete.id) setViewingCustomer(null);
      setCustomerToDelete(null);
      loadCustomers();
    } catch (err) {
      console.error("Failed to delete customer", err);
    }
  };

  const filteredCustomers = customers.filter(c => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.fullName.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      c.address.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-stone-900">Customer Directory</h1>
          <p className="text-sm text-stone-500">
            Client profiles, pet associations, contact data, and appointment history.
          </p>
        </div>
        <button
          id="btn-add-customer"
          onClick={handleOpenNewModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-lg shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Customer</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-xs">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
          <input
            id="input-search-customers"
            type="text"
            placeholder="Search by name, email, phone, or address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:bg-white focus:ring-1 focus:ring-teal-600 text-stone-900"
          />
        </div>
      </div>

      {/* Customers Grid / Table */}
      {loading ? (
        <div className="p-12 text-center text-stone-500 text-sm">Loading customers...</div>
      ) : filteredCustomers.length === 0 ? (
        <div className="bg-white rounded-xl border border-stone-200 p-12 text-center shadow-xs">
          <Users className="w-10 h-10 text-stone-300 mx-auto mb-3" />
          <p className="text-stone-800 font-semibold text-sm">No customers found</p>
          <p className="text-stone-500 text-xs mt-1">Add a new customer to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCustomers.map((c) => (
            <div
              key={c.id}
              onClick={() => handleViewCustomer(c)}
              className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs hover:border-teal-400 transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-stone-900 text-base">{c.fullName}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs px-2 py-0.5 rounded bg-teal-50 text-teal-800 font-medium">
                        {c.petCount || 0} Pets
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded bg-stone-100 text-stone-600">
                        {c.appointmentCount || 0} Bookings
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => handleOpenEditModal(c, e)}
                      className="p-1 text-stone-400 hover:text-stone-800 rounded"
                      title="Edit Customer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteCustomer(c, e)}
                      className="p-1 text-stone-400 hover:text-rose-600 rounded"
                      title="Delete Customer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="mt-4 space-y-1.5 text-xs text-stone-600">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-stone-400" />
                    <span>{c.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 truncate">
                    <Mail className="w-3.5 h-3.5 text-stone-400" />
                    <span className="truncate">{c.email}</span>
                  </div>
                  {c.address && (
                    <div className="flex items-center gap-2 truncate">
                      <MapPin className="w-3.5 h-3.5 text-stone-400" />
                      <span className="truncate">{c.address}</span>
                    </div>
                  )}
                </div>

                {c.notes && (
                  <p className="text-[11px] text-stone-500 bg-stone-50 p-2 rounded-md mt-3 line-clamp-2 italic">
                    "{c.notes}"
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-teal-600 font-semibold">
                <span>View Full Profile & Pets</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Customer Detail Drawer Modal */}
      {viewingCustomer && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-stone-200 my-8">
            <div className="flex items-start justify-between pb-4 border-b border-stone-100">
              <div>
                <span className="text-xs font-semibold text-teal-600 uppercase tracking-wider">Customer Profile</span>
                <h2 className="text-xl font-bold text-stone-900 mt-0.5">{viewingCustomer.fullName}</h2>
                <div className="flex flex-wrap gap-4 text-xs text-stone-500 mt-2">
                  <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> {viewingCustomer.phone}</span>
                  <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> {viewingCustomer.email}</span>
                </div>
              </div>
              <button
                onClick={() => setViewingCustomer(null)}
                className="text-stone-400 hover:text-stone-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingDetails ? (
              <div className="p-8 text-center text-stone-500 text-xs">Loading customer details...</div>
            ) : (
              <div className="mt-4 space-y-6">
                {/* Pets Section */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5 mb-2">
                    <Dog className="w-4 h-4 text-teal-600" />
                    Registered Pets ({customerPets.length})
                  </h3>
                  {customerPets.length === 0 ? (
                    <p className="text-xs text-stone-400 italic">No pets registered under this customer yet.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {customerPets.map(p => (
                        <div key={p.id} className="p-3 rounded-lg border border-stone-200 bg-stone-50 text-xs space-y-1">
                          <div className="flex items-center justify-between font-bold text-stone-900">
                            <span>{p.name}</span>
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-white border border-stone-200 text-stone-700">
                              {p.species}
                            </span>
                          </div>
                          <div className="text-stone-500">
                            {p.breed} • {p.weight} lbs • {p.age} yrs
                          </div>
                          {p.specialCareInstructions && (
                            <div className="text-[10px] text-teal-800 font-medium mt-1">
                              {p.specialCareInstructions}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Appointment History */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5 mb-2">
                    <Calendar className="w-4 h-4 text-teal-600" />
                    Appointment History ({customerAppointments.length})
                  </h3>
                  {customerAppointments.length === 0 ? (
                    <p className="text-xs text-stone-400 italic">No past appointments recorded.</p>
                  ) : (
                    <div className="divide-y divide-stone-100 border border-stone-200 rounded-lg max-h-48 overflow-y-auto">
                      {customerAppointments.map(a => (
                        <div key={a.id} className="p-2.5 flex items-center justify-between text-xs hover:bg-stone-50">
                          <div>
                            <div className="font-semibold text-stone-900">{a.appointmentDate} ({a.startTime.substring(0, 5)})</div>
                            <div className="text-[11px] text-stone-500">{a.petName} • Groomer: {a.groomerName}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-stone-900">${a.calculatedPrice.toFixed(2)}</div>
                            <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-stone-100 text-stone-700">
                              {a.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-stone-100 flex justify-end">
              <button
                onClick={() => setViewingCustomer(null)}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Customer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-stone-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h2 className="font-bold text-stone-900 text-base">
                {editingCustomer ? "Edit Customer" : "Add New Customer"}
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

            <form onSubmit={handleSaveCustomer} className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">First Name</label>
                  <input
                    id="input-customer-firstname"
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
                    id="input-customer-lastname"
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:bg-white text-stone-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Email</label>
                <input
                  id="input-customer-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:bg-white text-stone-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Phone</label>
                <input
                  id="input-customer-phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:bg-white text-stone-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Address</label>
                <input
                  id="input-customer-address"
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:bg-white text-stone-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Customer Notes</label>
                <textarea
                  id="input-customer-notes"
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Preferences, preferred groomer, behavior..."
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:bg-white text-stone-900"
                />
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
                  id="btn-save-customer"
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : (editingCustomer ? "Update" : "Create")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Delete Customer Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!customerToDelete}
        title="Delete Customer Profile"
        message={
          customerToDelete
            ? `Are you sure you want to delete ${customerToDelete.fullName}? This will also delete their registered pets and cancel any associated appointments.`
            : ""
        }
        confirmLabel="Delete Customer"
        isDestructive={true}
        onConfirm={handleConfirmDeleteCustomer}
        onClose={() => setCustomerToDelete(null)}
      />
    </div>
  );
};
