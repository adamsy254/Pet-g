import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { DashboardSummary, Appointment, AppointmentStatus } from "../types";
import {
  Calendar,
  Clock,
  Users,
  Dog,
  DollarSign,
  TrendingUp,
  Scissors,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  UserCheck,
  Sparkles
} from "lucide-react";

interface DashboardViewProps {
  onNavigateTab: (tab: string) => void;
  onOpenBookingModal: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigateTab,
  onOpenBookingModal
}) => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/reports/dashboard");
      setSummary(res.data);
    } catch (err: any) {
      console.error("Failed to load dashboard data", err);
      setError("Unable to load salon dashboard metrics. Please refresh.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case "COMPLETED":
        return (
          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Completed
          </span>
        );
      case "IN_PROGRESS":
        return (
          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            In Progress
          </span>
        );
      case "CONFIRMED":
        return (
          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            Confirmed
          </span>
        );
      case "CANCELLED":
        return (
          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            Cancelled
          </span>
        );
      case "NO_SHOW":
        return (
          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-stone-100 text-stone-600 border border-stone-300">
            No Show
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200">
            Scheduled
          </span>
        );
    }
  };

  const getSpeciesBadge = (species: string) => {
    switch (species) {
      case "CAT":
        return <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-medium">Cat</span>;
      case "BIRD":
        return <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800 font-medium">Bird</span>;
      default:
        return <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-100 text-teal-800 font-medium">Dog</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-16">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-stone-500 text-sm">Loading salon dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
        <button
          onClick={loadDashboardData}
          className="px-3 py-1 bg-rose-600 text-white rounded-md text-xs font-semibold hover:bg-rose-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Welcome & Quick Actions banner */}
      <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-stone-900">Salon Operations Dashboard</h1>
          <p className="text-sm text-stone-500 mt-1">
            Daily appointments, client activity, and grooming service schedule.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            id="btn-quick-book"
            onClick={onOpenBookingModal}
            className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-lg shadow-xs transition-colors"
          >
            <Scissors className="w-4 h-4" />
            <span>Book Appointment</span>
          </button>
          <button
            id="btn-view-reports"
            onClick={() => onNavigateTab("reports")}
            className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-sm font-semibold rounded-lg transition-colors"
          >
            <TrendingUp className="w-4 h-4 text-stone-600" />
            <span>View Reports</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Appointments */}
        <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-stone-500 uppercase tracking-wider">Today's Schedule</span>
            <div className="text-2xl font-bold text-stone-900 mt-1">
              {summary?.todayAppointmentsCount ?? 0}
            </div>
            <p className="text-xs text-stone-500 mt-1">Appointments booked today</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        {/* Monthly Revenue */}
        <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-stone-500 uppercase tracking-wider">Completed Revenue</span>
            <div className="text-2xl font-bold text-stone-900 mt-1">
              ${(summary?.monthlyRevenue ?? 0).toFixed(2)}
            </div>
            <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1 font-medium">
              <TrendingUp className="w-3.5 h-3.5" />
              Completed salon services
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Total Customers */}
        <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-stone-500 uppercase tracking-wider">Customer Base</span>
            <div className="text-2xl font-bold text-stone-900 mt-1">
              {summary?.totalCustomersCount ?? 0}
            </div>
            <p className="text-xs text-stone-500 mt-1">Registered salon clients</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Total Pets */}
        <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-stone-500 uppercase tracking-wider">Registered Pets</span>
            <div className="text-2xl font-bold text-stone-900 mt-1">
              {summary?.totalPetsCount ?? 0}
            </div>
            <p className="text-xs text-stone-500 mt-1">Dogs, Cats, and Birds</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Dog className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Grid: Today's Appointments Table & Grooming Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Salon Schedule (Left 2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-teal-600" />
              <h2 className="font-bold text-stone-900 text-sm">Today's Appointment Schedule</h2>
            </div>
            <button
              onClick={() => onNavigateTab("appointments")}
              className="text-xs font-semibold text-teal-600 hover:text-teal-800 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-stone-100">
            {(!summary?.todayAppointments || summary.todayAppointments.length === 0) ? (
              <div className="p-8 text-center text-stone-400 text-sm">
                No appointments booked for today. Click "Book Appointment" to add one.
              </div>
            ) : (
              summary.todayAppointments.map((appt) => (
                <div key={appt.id} className="p-4 hover:bg-stone-50 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="px-2.5 py-1.5 rounded-lg bg-stone-100 text-stone-800 font-mono text-xs font-bold text-center">
                      <div>{appt.startTime.substring(0, 5)}</div>
                      <div className="text-[10px] text-stone-500 font-normal">to {appt.endTime.substring(0, 5)}</div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-stone-900 text-sm">{appt.petName}</span>
                        {getSpeciesBadge(appt.petSpecies)}
                        <span className="text-xs text-stone-500">({appt.customerName})</span>
                      </div>
                      <div className="text-xs text-stone-500 mt-0.5 flex items-center gap-2">
                        <span>Groomer: <strong className="text-stone-700">{appt.groomerName}</strong></span>
                        <span>•</span>
                        <span>{appt.services.map(s => s.name).join(", ")}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="text-right">
                      <div className="font-bold text-stone-900 text-sm">${appt.calculatedPrice.toFixed(2)}</div>
                      <span className="text-[10px] text-stone-400">service total</span>
                    </div>
                    <div>{getStatusBadge(appt.status)}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Salon Staff on Duty & Quick Services */}
        <div className="space-y-4">
          {/* Grooming Staff on Duty */}
          <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2 text-stone-900 text-xs font-bold uppercase tracking-wider">
                <UserCheck className="w-4 h-4 text-teal-600" />
                <span>Groomers on Duty</span>
              </div>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium">
                Active Staff
              </span>
            </div>

            <div className="mt-3 space-y-2.5">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-stone-50 border border-stone-100">
                <div>
                  <div className="font-semibold text-xs text-stone-900">Michael Ross</div>
                  <span className="text-[11px] text-stone-500">Senior Stylist (Dogs & Cats)</span>
                </div>
                <span className="text-xs font-bold text-teal-700 font-mono">2 Bookings</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-stone-50 border border-stone-100">
                <div>
                  <div className="font-semibold text-xs text-stone-900">Emily Clark</div>
                  <span className="text-[11px] text-stone-500">Grooming Specialist (All Pets)</span>
                </div>
                <span className="text-xs font-bold text-teal-700 font-mono">2 Bookings</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-stone-50 border border-stone-100">
                <div>
                  <div className="font-semibold text-xs text-stone-900">David Tanner</div>
                  <span className="text-[11px] text-stone-500">Store Owner & Master Groomer</span>
                </div>
                <span className="text-xs font-medium text-stone-400">Available</span>
              </div>
            </div>
          </div>

          {/* Featured Grooming Packages */}
          <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2 text-stone-900 text-xs font-bold uppercase tracking-wider">
                <Scissors className="w-4 h-4 text-teal-600" />
                <span>Popular Grooming Packages</span>
              </div>
              <button
                onClick={() => onNavigateTab("services")}
                className="text-[11px] text-teal-600 hover:text-teal-800 font-semibold"
              >
                View Menu
              </button>
            </div>

            <div className="mt-3 space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-stone-50">
                <div>
                  <span className="font-semibold text-stone-800 block">Full Groom Package</span>
                  <span className="text-[10px] text-stone-500">Bath, styling, ears & glands (90 min)</span>
                </div>
                <span className="font-bold text-stone-900 font-mono">$75.00</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-stone-50">
                <div>
                  <span className="font-semibold text-stone-800 block">Basic Bath & Brush</span>
                  <span className="text-[10px] text-stone-500">Hydro-bath, blow-out & brush (45 min)</span>
                </div>
                <span className="font-bold text-stone-900 font-mono">$45.00</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-stone-50">
                <div>
                  <span className="font-semibold text-stone-800 block">Nail Trim & Paw Care</span>
                  <span className="text-[10px] text-stone-500">Claw clip, filing & soothing balm (20 min)</span>
                </div>
                <span className="font-bold text-stone-900 font-mono">$20.00</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
