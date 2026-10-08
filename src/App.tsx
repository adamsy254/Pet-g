import React, { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Navbar } from "./components/Navbar";
import { DashboardView } from "./components/DashboardView";
import { AppointmentsView } from "./components/AppointmentsView";
import { CustomersView } from "./components/CustomersView";
import { PetsView } from "./components/PetsView";
import { ServicesView } from "./components/ServicesView";
import { ReportsView } from "./components/ReportsView";
import { StaffView } from "./components/StaffView";
import { LoginModal } from "./components/LoginModal";
import { LoginIntroScreen } from "./components/LoginIntroScreen";

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [isBookingModalOpen, setIsBookingModalOpen] = useState<boolean>(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const { user, isLoading } = useAuth();

  const handleOpenBooking = () => {
    setActiveTab("appointments");
    setIsBookingModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-stone-500 text-sm font-medium">Loading salon management portal...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginIntroScreen />;
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col font-sans antialiased">
      {/* Navbar Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === "dashboard" && (
          <DashboardView
            onNavigateTab={setActiveTab}
            onOpenBookingModal={handleOpenBooking}
          />
        )}

        {activeTab === "appointments" && (
          <AppointmentsView
            isBookingModalOpen={isBookingModalOpen}
            setIsBookingModalOpen={setIsBookingModalOpen}
          />
        )}

        {activeTab === "customers" && <CustomersView />}

        {activeTab === "pets" && <PetsView />}

        {activeTab === "services" && <ServicesView />}

        {activeTab === "reports" && <ReportsView />}

        {activeTab === "staff" && <StaffView />}
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-white py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="font-semibold text-stone-700">Paws & Groom Pet Salon</span>
            <span>•</span>
            <span>Salon Management System</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="text-stone-600 hover:text-stone-900 hover:underline"
            >
              Logged in as: <strong className="text-stone-800">{user?.fullName || "Staff"}</strong> ({user?.role || "GUEST"})
            </button>
          </div>
        </div>
      </footer>

      {/* Authentication Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
