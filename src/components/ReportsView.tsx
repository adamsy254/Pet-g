import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  DailyScheduleReport,
  MonthlyRevenueReport,
  ServicePopularityReport,
  CustomerRetentionReport
} from "../types";
import {
  Calendar,
  DollarSign,
  TrendingUp,
  Award,
  Users,
  Printer,
  ChevronRight,
  Filter,
  Download,
  FileText
} from "lucide-react";

export const ReportsView: React.FC = () => {
  const [activeReport, setActiveReport] = useState<"daily" | "revenue" | "services" | "customers">("daily");

  const [selectedDate, setSelectedDate] = useState<string>(
      new Date().toISOString().substring(0, 10)
  );
  const [dailyReport, setDailyReport] = useState<DailyScheduleReport | null>(null);

  const [selectedMonth, setSelectedMonth] = useState<string>(
      new Date().toISOString().substring(0, 7)
  );
  const [revenueReport, setRevenueReport] = useState<MonthlyRevenueReport | null>(null);

  const [servicesReport, setServicesReport] = useState<ServicePopularityReport | null>(null);

  const [retentionReport, setRetentionReport] = useState<CustomerRetentionReport | null>(null);

  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (activeReport === "daily") loadDailyReport();
    else if (activeReport === "revenue") loadRevenueReport();
    else if (activeReport === "services") loadServicesReport();
    else if (activeReport === "customers") loadRetentionReport();
  }, [activeReport, selectedDate, selectedMonth]);

  const loadDailyReport = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/reports/daily?date=${selectedDate}`);
      setDailyReport(res.data);
    } catch (err) {
      console.error("Failed to load daily report", err);
    } finally {
      setLoading(false);
    }
  };

  const loadRevenueReport = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/reports/revenue?month=${selectedMonth}`);
      setRevenueReport(res.data);
    } catch (err) {
      console.error("Failed to load revenue report", err);
    } finally {
      setLoading(false);
    }
  };

  const loadServicesReport = async () => {
    setLoading(true);
    try {
      const res = await api.get("/reports/services");
      setServicesReport(res.data);
    } catch (err) {
      console.error("Failed to load services report", err);
    } finally {
      setLoading(false);
    }
  };

  const loadRetentionReport = async () => {
    setLoading(true);
    try {
      const res = await api.get("/reports/customers");
      setRetentionReport(res.data);
    } catch (err) {
      console.error("Failed to load retention report", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrintReport = () => {
    try {
      const doc = new jsPDF();
      const primaryColor: [number, number, number] = [13, 148, 136];
      const darkColor: [number, number, number] = [28, 25, 23];
      const grayColor: [number, number, number] = [120, 113, 108];

      doc.setFillColor(...primaryColor);
      doc.rect(0, 0, 210, 24, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(255, 255, 255);
      doc.text("Paws & Groom Pet Salon", 14, 15);

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text("Store Owner: David Tanner • Salon Management Portal", 120, 15);

      let reportTitle = "";
      let reportSubtitle = "";
      let fileName = `paws_groom_report_${Date.now()}.pdf`;

      if (activeReport === "daily") {
        reportTitle = `Daily Schedule Manifest - ${selectedDate}`;
        reportSubtitle = `Total Appointments: ${dailyReport?.totalAppointments || 0} | Estimated Day Revenue: $${(dailyReport?.expectedRevenue || 0).toFixed(2)}`;
        fileName = `daily_manifest_${selectedDate}.pdf`;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(13);
        doc.setTextColor(...darkColor);
        doc.text(reportTitle, 14, 34);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(...grayColor);
        doc.text(reportSubtitle, 14, 40);
        doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 45);

        const tableRows = dailyReport?.items.map((item) => [
          `${item.startTime.substring(0, 5)} - ${item.endTime.substring(0, 5)}`,
          `${item.petName} (${item.petSpecies})`,
          `${item.customerName}\n${item.customerPhone}`,
          item.groomerName,
          item.services.join(", "),
          item.status,
          `$${item.price.toFixed(2)}`
        ]) || [];

        autoTable(doc, {
          startY: 50,
          head: [["Time", "Pet", "Customer Contact", "Groomer", "Services", "Status", "Price"]],
          body: tableRows,
          theme: "striped",
          headStyles: { fillColor: primaryColor, textColor: [255, 255, 255], fontStyle: "bold", fontSize: 9 },
          bodyStyles: { fontSize: 8, textColor: darkColor },
          styles: { overflow: "linebreak", cellPadding: 3 }
        });
      } else if (activeReport === "revenue") {
        reportTitle = `Monthly Revenue Audit - ${selectedMonth}`;
        reportSubtitle = `Total Gross Revenue: $${(revenueReport?.totalRevenue || 0).toFixed(2)} | Completed: ${revenueReport?.completedAppointments || 0} | Avg Ticket: $${(revenueReport?.averageTicketSize || 0).toFixed(2)}`;
        fileName = `monthly_revenue_${selectedMonth}.pdf`;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(13);
        doc.setTextColor(...darkColor);
        doc.text(reportTitle, 14, 34);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(...grayColor);
        doc.text(reportSubtitle, 14, 40);
        doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 45);

        const tableRows = revenueReport?.dailyBreakdown.map((item) => [
          item.date,
          item.dayOfWeek,
          String(item.count),
          String(item.completedCount),
          String(item.cancelledCount),
          `$${item.revenue.toFixed(2)}`
        ]) || [];

        autoTable(doc, {
          startY: 50,
          head: [["Date", "Day", "Total Bookings", "Completed", "Cancelled", "Gross Revenue"]],
          body: tableRows,
          theme: "striped",
          headStyles: { fillColor: primaryColor, textColor: [255, 255, 255], fontStyle: "bold", fontSize: 9 },
          bodyStyles: { fontSize: 8, textColor: darkColor },
          columnStyles: { 5: { halign: "right", fontStyle: "bold" } },
          styles: { cellPadding: 3 }
        });
      } else if (activeReport === "services") {
        reportTitle = "Service Popularity & Utilization Report";
        reportSubtitle = `Total Salon Revenue Generated: $${(servicesReport?.totalServicesRevenue || 0).toFixed(2)}`;
        fileName = `services_popularity_report.pdf`;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(13);
        doc.setTextColor(...darkColor);
        doc.text(reportTitle, 14, 34);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(...grayColor);
        doc.text(reportSubtitle, 14, 40);
        doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 45);

        const tableRows = servicesReport?.serviceStats.map((s) => [
          s.serviceName,
          s.category,
          `$${s.basePrice.toFixed(2)}`,
          String(s.bookingCount),
          `$${s.revenueGenerated.toFixed(2)}`,
          `${s.percentageOfTotalBookings.toFixed(1)}%`
        ]) || [];

        autoTable(doc, {
          startY: 50,
          head: [["Service Name", "Category", "Base Price", "Times Booked", "Revenue Generated", "Share %"]],
          body: tableRows,
          theme: "striped",
          headStyles: { fillColor: primaryColor, textColor: [255, 255, 255], fontStyle: "bold", fontSize: 9 },
          bodyStyles: { fontSize: 8, textColor: darkColor },
          styles: { cellPadding: 3 }
        });
      } else if (activeReport === "customers") {
        reportTitle = "Customer Retention & Lifetime Value Report";
        reportSubtitle = `Active Clients: ${retentionReport?.activeCustomersWithAppointments || 0} | Lapsed Clients: ${retentionReport?.lapsedCount || 0} | Retention Rate: ${(retentionReport?.retentionRate || 0).toFixed(1)}%`;
        fileName = `customer_retention_report.pdf`;

        doc.setFont("helvetica", "bold");
        doc.setFontSize(13);
        doc.setTextColor(...darkColor);
        doc.text(reportTitle, 14, 34);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(...grayColor);
        doc.text(reportSubtitle, 14, 40);
        doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 45);

        const tableRows = retentionReport?.customerStats.map((c) => [
          c.customerName,
          `${c.email}\n${c.phone}`,
          String(c.petCount),
          String(c.appointmentCount),
          c.lastAppointmentDate || "Never",
          `$${c.totalAmountSpent.toFixed(2)}`,
          c.status
        ]) || [];

        autoTable(doc, {
          startY: 50,
          head: [["Customer Name", "Contact Details", "Pets", "Bookings", "Last Visit", "Total Spend", "Status"]],
          body: tableRows,
          theme: "striped",
          headStyles: { fillColor: primaryColor, textColor: [255, 255, 255], fontStyle: "bold", fontSize: 9 },
          bodyStyles: { fontSize: 8, textColor: darkColor },
          columnStyles: { 5: { halign: "right", fontStyle: "bold" } },
          styles: { cellPadding: 3 }
        });
      }

      doc.save(fileName);
    } catch (pdfErr) {
      console.error("PDF generation error:", pdfErr);
      window.print();
    }
  };

  const handleExportCSV = () => {
    let csvContent = "";
    let fileName = `paws_groom_${activeReport}_report.csv`;

    if (activeReport === "daily" && dailyReport) {
      csvContent = "Time,Pet,Species,Customer,Phone,Groomer,Services,Status,Price\n";
      dailyReport.items.forEach((item) => {
        csvContent += `"${item.startTime.substring(0, 5)} - ${item.endTime.substring(0, 5)}","${item.petName}","${item.petSpecies}","${item.customerName}","${item.customerPhone}","${item.groomerName}","${item.services.join("; ")}","${item.status}","${item.price.toFixed(2)}"\n`;
      });
      fileName = `daily_schedule_${selectedDate}.csv`;
    } else if (activeReport === "revenue" && revenueReport) {
      csvContent = "Date,Day,Appointments,Revenue,Completed,Cancelled\n";
      revenueReport.dailyBreakdown.forEach((item) => {
        csvContent += `"${item.date}","${item.dayOfWeek}","${item.count}","${item.revenue.toFixed(2)}","${item.completedCount}","${item.cancelledCount}"\n`;
      });
      fileName = `monthly_revenue_${selectedMonth}.csv`;
    } else if (activeReport === "services" && servicesReport) {
      csvContent = "Service,Category,Base Price,Booking Count,Total Revenue,Percentage\n";
      servicesReport.serviceStats.forEach((s) => {
        csvContent += `"${s.serviceName}","${s.category}","${s.basePrice.toFixed(2)}","${s.bookingCount}","${s.revenueGenerated.toFixed(2)}","${s.percentageOfTotalBookings.toFixed(1)}%"\n`;
      });
      fileName = `services_popularity_report.csv`;
    } else if (activeReport === "customers" && retentionReport) {
      csvContent = "Customer,Email,Phone,Pets,Bookings,Last Visit,Total Spend,Status\n";
      retentionReport.customerStats.forEach((c) => {
        csvContent += `"${c.customerName}","${c.email}","${c.phone}","${c.petCount}","${c.appointmentCount}","${c.lastAppointmentDate || "Never"}","${c.totalAmountSpent.toFixed(2)}","${c.status}"\n`;
      });
      fileName = `customer_retention_report.csv`;
    }

    if (!csvContent) return;

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-stone-900">Salon Analytics & Reports</h1>
            <p className="text-sm text-stone-500">
              Daily schedule manifests, monthly revenue audits, service utilization, and customer retention.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
                id="btn-print-report"
                onClick={handlePrintReport}
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-lg border border-stone-200 transition-colors cursor-pointer shadow-2xs"
            >
              <FileText className="w-4 h-4 text-teal-700" />
              <span>Print / PDF Report</span>
            </button>
            <button
                id="btn-export-csv"
                onClick={handleExportCSV}
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
              id="tab-report-daily"
              onClick={() => setActiveReport("daily")}
              className={`p-3 rounded-xl border text-left transition-all ${
                  activeReport === "daily"
                      ? "bg-teal-50 border-teal-300 text-teal-900 shadow-xs"
                      : "bg-white border-stone-200 text-stone-600 hover:bg-stone-50"
              }`}
          >
            <Calendar className="w-5 h-5 text-teal-600 mb-1" />
            <div className="font-bold text-xs">Daily Schedule</div>
            <p className="text-[11px] text-stone-400 mt-0.5">Manifest & timeline</p>
          </button>

          <button
              id="tab-report-revenue"
              onClick={() => setActiveReport("revenue")}
              className={`p-3 rounded-xl border text-left transition-all ${
                  activeReport === "revenue"
                      ? "bg-teal-50 border-teal-300 text-teal-900 shadow-xs"
                      : "bg-white border-stone-200 text-stone-600 hover:bg-stone-50"
              }`}
          >
            <DollarSign className="w-5 h-5 text-emerald-600 mb-1" />
            <div className="font-bold text-xs">Monthly Revenue</div>
            <p className="text-[11px] text-stone-400 mt-0.5">Tickets & daily gross</p>
          </button>

          <button
              id="tab-report-services"
              onClick={() => setActiveReport("services")}
              className={`p-3 rounded-xl border text-left transition-all ${
                  activeReport === "services"
                      ? "bg-teal-50 border-teal-300 text-teal-900 shadow-xs"
                      : "bg-white border-stone-200 text-stone-600 hover:bg-stone-50"
              }`}
          >
            <Award className="w-5 h-5 text-amber-600 mb-1" />
            <div className="font-bold text-xs">Service Popularity</div>
            <p className="text-[11px] text-stone-400 mt-0.5">Booking volume & share</p>
          </button>

          <button
              id="tab-report-customers"
              onClick={() => setActiveReport("customers")}
              className={`p-3 rounded-xl border text-left transition-all ${
                  activeReport === "customers"
                      ? "bg-teal-50 border-teal-300 text-teal-900 shadow-xs"
                      : "bg-white border-stone-200 text-stone-600 hover:bg-stone-50"
              }`}
          >
            <Users className="w-5 h-5 text-blue-600 mb-1" />
            <div className="font-bold text-xs">Customer Retention</div>
            <p className="text-[11px] text-stone-400 mt-0.5">Lifetime value & churn</p>
          </button>
        </div>

        {activeReport === "daily" && (
            <div className="bg-white rounded-xl border border-stone-200 shadow-xs p-5 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-stone-200">
                <div>
                  <h2 className="font-bold text-stone-900 text-base">Daily Salon Schedule Manifest</h2>
                  <span className="text-xs text-stone-500">Chronological appointment log with groomer assignments</span>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-stone-500 font-medium">Select Date:</label>
                  <input
                      id="input-report-date"
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs font-semibold text-stone-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-stone-50 rounded-lg border border-stone-200 text-xs">
                  <span className="text-stone-500 font-medium">Booked Appointments</span>
                  <div className="text-xl font-bold text-stone-900 mt-0.5">
                    {dailyReport?.totalAppointments ?? 0}
                  </div>
                </div>
                <div className="p-3 bg-stone-50 rounded-lg border border-stone-200 text-xs">
                  <span className="text-stone-500 font-medium">Projected Revenue</span>
                  <div className="text-xl font-bold text-teal-700 mt-0.5 font-mono">
                    ${(dailyReport?.expectedRevenue ?? 0).toFixed(2)}
                  </div>
                </div>
              </div>

              {loading ? (
                  <div className="p-8 text-center text-stone-400 text-xs">Loading report...</div>
              ) : !dailyReport || dailyReport.items.length === 0 ? (
                  <div className="p-8 text-center text-stone-400 text-xs">No appointments scheduled for {selectedDate}.</div>
              ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                      <tr className="bg-stone-50 text-stone-600 font-semibold border-b border-stone-200">
                        <th className="py-2.5 px-3">Time</th>
                        <th className="py-2.5 px-3">Pet & Species</th>
                        <th className="py-2.5 px-3">Customer & Phone</th>
                        <th className="py-2.5 px-3">Groomer</th>
                        <th className="py-2.5 px-3">Services</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3 text-right">Price</th>
                      </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                      {dailyReport.items.map((item) => (
                          <tr key={item.appointmentId} className="hover:bg-stone-50">
                            <td className="py-2.5 px-3 font-mono font-semibold text-stone-900">
                              {item.startTime.substring(0, 5)} - {item.endTime.substring(0, 5)}
                            </td>
                            <td className="py-2.5 px-3">
                              <span className="font-bold text-stone-900">{item.petName}</span>{" "}
                              <span className="text-[10px] text-stone-500">({item.petSpecies})</span>
                            </td>
                            <td className="py-2.5 px-3">
                              <div className="text-stone-800">{item.customerName}</div>
                              <div className="text-[10px] text-stone-400">{item.customerPhone}</div>
                            </td>
                            <td className="py-2.5 px-3 font-medium text-stone-700">{item.groomerName}</td>
                            <td className="py-2.5 px-3 text-stone-600">{item.services.join(", ")}</td>
                            <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-stone-100 text-stone-700">
                          {item.status}
                        </span>
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-stone-900">
                              ${item.price.toFixed(2)}
                            </td>
                          </tr>
                      ))}
                      </tbody>
                    </table>
                  </div>
              )}
            </div>
        )}

        {activeReport === "revenue" && (
            <div className="bg-white rounded-xl border border-stone-200 shadow-xs p-5 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-stone-200">
                <div>
                  <h2 className="font-bold text-stone-900 text-base">Monthly Revenue Breakdown</h2>
                  <span className="text-xs text-stone-500">Gross completed sales, cancellation audits, and ticket size</span>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-stone-500 font-medium">Select Month:</label>
                  <input
                      id="input-report-month"
                      type="month"
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      className="px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs font-semibold text-stone-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-xs">
                  <span className="text-emerald-700 font-medium">Total Completed Revenue</span>
                  <div className="text-xl font-bold text-emerald-900 mt-0.5 font-mono">
                    ${(revenueReport?.totalRevenue ?? 0).toFixed(2)}
                  </div>
                </div>
                <div className="p-3 bg-stone-50 rounded-lg border border-stone-200 text-xs">
                  <span className="text-stone-500 font-medium">Avg Ticket Size</span>
                  <div className="text-xl font-bold text-stone-900 mt-0.5 font-mono">
                    ${(revenueReport?.averageTicketSize ?? 0).toFixed(2)}
                  </div>
                </div>
                <div className="p-3 bg-stone-50 rounded-lg border border-stone-200 text-xs">
                  <span className="text-stone-500 font-medium">Completed / Total</span>
                  <div className="text-xl font-bold text-stone-900 mt-0.5">
                    {revenueReport?.completedAppointments ?? 0} / {revenueReport?.totalAppointments ?? 0}
                  </div>
                </div>
                <div className="p-3 bg-stone-50 rounded-lg border border-stone-200 text-xs">
                  <span className="text-stone-500 font-medium">Cancellations / No-Shows</span>
                  <div className="text-xl font-bold text-rose-700 mt-0.5">
                    {revenueReport?.cancelledAppointments ?? 0} / {revenueReport?.noShowAppointments ?? 0}
                  </div>
                </div>
              </div>

              <h3 className="font-bold text-xs uppercase tracking-wider text-stone-500 pt-2">Daily Revenue Ledger</h3>
              {!revenueReport || revenueReport.dailyBreakdown.length === 0 ? (
                  <div className="p-8 text-center text-stone-400 text-xs">No completed revenue records for this month.</div>
              ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                      <tr className="bg-stone-50 text-stone-600 font-semibold border-b border-stone-200">
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Day</th>
                        <th className="py-2.5 px-3">Appointments</th>
                        <th className="py-2.5 px-3">Completed</th>
                        <th className="py-2.5 px-3">Cancelled</th>
                        <th className="py-2.5 px-3 text-right">Daily Revenue</th>
                      </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                      {revenueReport.dailyBreakdown.map((item) => (
                          <tr key={item.date} className="hover:bg-stone-50">
                            <td className="py-2.5 px-3 font-semibold text-stone-900">{item.date}</td>
                            <td className="py-2.5 px-3 text-stone-500">{item.dayOfWeek}</td>
                            <td className="py-2.5 px-3 text-stone-700">{item.count}</td>
                            <td className="py-2.5 px-3 text-emerald-700 font-semibold">{item.completedCount}</td>
                            <td className="py-2.5 px-3 text-rose-600 font-semibold">{item.cancelledCount}</td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">
                              ${item.revenue.toFixed(2)}
                            </td>
                          </tr>
                      ))}
                      </tbody>
                    </table>
                  </div>
              )}
            </div>
        )}

        {activeReport === "services" && (
            <div className="bg-white rounded-xl border border-stone-200 shadow-xs p-5 space-y-4">
              <div className="pb-3 border-b border-stone-200">
                <h2 className="font-bold text-stone-900 text-base">Service Popularity & Utilization</h2>
                <span className="text-xs text-stone-500">Most requested grooming treatments and revenue contributions</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-stone-50 rounded-lg border border-stone-200 text-xs">
                  <span className="text-stone-500 font-medium">Total Treatment Services Delivered</span>
                  <div className="text-xl font-bold text-stone-900 mt-0.5">
                    {servicesReport?.totalServiceBookings ?? 0}
                  </div>
                </div>
                <div className="p-3 bg-stone-50 rounded-lg border border-stone-200 text-xs">
                  <span className="text-stone-500 font-medium">Gross Catalog Services Value</span>
                  <div className="text-xl font-bold text-teal-700 mt-0.5 font-mono">
                    ${(servicesReport?.totalServicesRevenue ?? 0).toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                {servicesReport?.serviceStats.map((item) => (
                    <div key={item.serviceId} className="p-3 rounded-lg border border-stone-200 bg-stone-50/50 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-stone-900">{item.serviceName}</span>
                          <span className="text-stone-400 ml-2 font-mono">(${item.basePrice.toFixed(2)} base)</span>
                        </div>
                        <div className="text-right">
                          <strong className="text-stone-900">{item.bookingCount} bookings</strong>
                          <span className="text-stone-400 ml-2">({item.percentageOfTotalBookings}%)</span>
                        </div>
                      </div>

                      <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-teal-600 rounded-full"
                            style={{ width: `${Math.min(100, Math.max(5, item.percentageOfTotalBookings))}%` }}
                        ></div>
                      </div>

                      <div className="text-[11px] text-stone-500 flex justify-between">
                        <span>Revenue generated:</span>
                        <strong className="text-teal-800 font-mono">${item.revenueGenerated.toFixed(2)}</strong>
                      </div>
                    </div>
                ))}
              </div>
            </div>
        )}

        {activeReport === "customers" && (
            <div className="bg-white rounded-xl border border-stone-200 shadow-xs p-5 space-y-4">
              <div className="pb-3 border-b border-stone-200">
                <h2 className="font-bold text-stone-900 text-base">Customer Retention & Lifetime Value (LTV)</h2>
                <span className="text-xs text-stone-500">Client visit frequencies, total spend, and account activity tiers</span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-stone-50 rounded-lg border border-stone-200 text-xs">
                  <span className="text-stone-500 font-medium">Total Registered Clients</span>
                  <div className="text-xl font-bold text-stone-900 mt-0.5">
                    {retentionReport?.totalCustomers ?? 0}
                  </div>
                </div>
                <div className="p-3 bg-stone-50 rounded-lg border border-stone-200 text-xs">
                  <span className="text-stone-500 font-medium">Active with Bookings</span>
                  <div className="text-xl font-bold text-emerald-700 mt-0.5">
                    {retentionReport?.activeCustomersWithAppointments ?? 0}
                  </div>
                </div>
                <div className="p-3 bg-stone-50 rounded-lg border border-stone-200 text-xs">
                  <span className="text-stone-500 font-medium">Average Customer LTV</span>
                  <div className="text-xl font-bold text-teal-700 mt-0.5 font-mono">
                    ${(retentionReport?.averageCustomerLifetimeValue ?? 0).toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                  <tr className="bg-stone-50 text-stone-600 font-semibold border-b border-stone-200">
                    <th className="py-2.5 px-3">Customer</th>
                    <th className="py-2.5 px-3">Contact</th>
                    <th className="py-2.5 px-3">Pets</th>
                    <th className="py-2.5 px-3">Bookings</th>
                    <th className="py-2.5 px-3">Last Visit</th>
                    <th className="py-2.5 px-3">Total Spend</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                  {retentionReport?.customerStats.map((c) => (
                      <tr key={c.customerId} className="hover:bg-stone-50">
                        <td className="py-2.5 px-3 font-semibold text-stone-900">{c.customerName}</td>
                        <td className="py-2.5 px-3 text-stone-500">
                          <div>{c.email}</div>
                          <div className="text-[10px] text-stone-400">{c.phone}</div>
                        </td>
                        <td className="py-2.5 px-3">{c.petCount}</td>
                        <td className="py-2.5 px-3 font-bold text-stone-800">{c.appointmentCount}</td>
                        <td className="py-2.5 px-3 text-stone-500 font-mono">
                          {c.lastAppointmentDate || "Never"}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-emerald-700">
                          ${c.totalAmountSpent.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          c.status === "Active"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : c.status === "Lapsed"
                                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                                  : "bg-stone-100 text-stone-600"
                      }`}>
                        {c.status}
                      </span>
                        </td>
                      </tr>
                  ))}
                  </tbody>
                </table>
              </div>
            </div>
        )}
      </div>
  );
};