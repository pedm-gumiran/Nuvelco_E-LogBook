import React, { useEffect, useState } from "react";
import {
  FiDownload,
  FiCalendar,
  FiZoomIn,
  FiZoomOut,
  FiMaximize,
  FiMinimize,
  FiMaximize2,
  FiInfo,
} from "react-icons/fi";
import Btn_X from "../Buttons/Btn_X.jsx";
import Button from "../Buttons/Button.jsx";

/**
 * PreviewDtrModal - Modal for previewing intern attendance in DTR format
 *
 * @param {boolean} isOpen - Whether the modal is visible
 * @param {function} onClose - Function to close the modal
 * @param {Object} selectedRecord - The selected intern's basic info
 * @param {Array} attendanceRecords - All attendance records for this intern
 */
const PreviewDtrModal = ({
  isOpen,
  onClose,
  onCloseParent,
  selectedRecord = {},
  attendanceRecords = [],
}) => {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return now.getMonth();
  });
  const [selectedYear, setSelectedYear] = useState(() => {
    const now = new Date();
    return now.getFullYear();
  });

  const [zoomScale, setZoomScale] = useState(80);
  const [isFullScreen, setIsFullScreen] = useState(true);

  // Disable body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = "0";
      document.body.style.right = "0";
      document.body.style.width = "100%";
      document.body.style.overflow = "hidden";
    } else {
      const scrollY = document.body.style.top;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.width = "";
      document.body.style.overflow = "";
      window.scrollTo(0, parseInt(scrollY || "0") * -1);
    }

    return () => {
      const scrollY = document.body.style.top;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.width = "";
      document.body.style.overflow = "";
      window.scrollTo(0, parseInt(scrollY || "0") * -1);
    };
  }, [isOpen]);

  const handleZoom = (type) => {
    if (type === "in") setZoomScale((prev) => Math.min(prev + 10, 150));
    else if (type === "out") setZoomScale((prev) => Math.max(prev - 10, 20));
    else setZoomScale(80);
  };

  // Parse date as local time
  const parseLocalDate = (dateStr) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? null : date;
  };

  // Format time to 12-hour format
  const formatTime = (timeStr) => {
    if (!timeStr) return "";
    const [hours, minutes] = timeStr.split(":");
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 || 12;
    return `${h12}:${minutes} ${ampm}`;
  };

  // Parse 12-hour time format (e.g., "10:35 AM") to minutes
  const parseTimeToMinutes = (timeStr) => {
    if (!timeStr || timeStr === "--") return null;
    const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) return null;
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const period = match[3].toUpperCase();
    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;
    return hours * 60 + minutes;
  };

  // Calculate hours between two times, excluding lunch break (12:00-1:59 PM)
  const calculateHours = (timeIn, timeOut) => {
    if (!timeIn || !timeOut || timeIn === "--" || timeOut === "--") return "";
    const inMinutes = parseTimeToMinutes(timeIn);
    const outMinutes = parseTimeToMinutes(timeOut);
    if (inMinutes === null || outMinutes === null) return "";

    const lunchStart = 12 * 60; // 12:00 PM = 720 minutes
    const lunchEnd = 13 * 60 + 59; // 1:59 PM = 839 minutes

    let totalMinutes = 0;

    // If time range overlaps with lunch, subtract lunch period
    if (inMinutes < lunchStart && outMinutes > lunchEnd) {
      // Worked through both AM and PM (crossed lunch)
      totalMinutes = lunchStart - inMinutes + (outMinutes - lunchEnd - 1);
    } else if (inMinutes >= lunchStart && inMinutes <= lunchEnd) {
      // Started during lunch, only count after lunch ends
      totalMinutes = Math.max(0, outMinutes - lunchEnd - 1);
    } else if (outMinutes >= lunchStart && outMinutes <= lunchEnd) {
      // Ended during lunch, only count before lunch starts
      totalMinutes = Math.max(0, lunchStart - inMinutes);
    } else if (outMinutes < lunchStart || inMinutes > lunchEnd) {
      // Entirely before or after lunch
      totalMinutes = outMinutes - inMinutes;
    }

    if (totalMinutes <= 0) return "";
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}.${minutes.toString().padStart(2, "0")}`;
  };

  // Get record for a specific day
  const getRecordForDay = (day) => {
    return attendanceRecords.find((record) => {
      const date = parseLocalDate(record.date);
      if (!date) return false;
      return (
        date.getDate() === day &&
        date.getMonth() === selectedMonth &&
        date.getFullYear() === selectedYear
      );
    });
  };

  // Generate DTR data for a specific day
  const getDayData = (day) => {
    const record = getRecordForDay(day);
    if (!record) {
      return { amIn: "", amOut: "", pmIn: "", pmOut: "", hours: "" };
    }
    const amHours = calculateHours(record.amIn, record.amOut);
    const pmHours = calculateHours(record.pmIn, record.pmOut);
    const totalHours =
      amHours || pmHours
        ? (parseFloat(amHours || 0) + parseFloat(pmHours || 0)).toFixed(2)
        : "0.00";

    return {
      amIn: record.amIn && record.amIn !== "--" ? record.amIn : "",
      amOut: record.amOut && record.amOut !== "--" ? record.amOut : "",
      pmIn: record.pmIn && record.pmIn !== "--" ? record.pmIn : "",
      pmOut: record.pmOut && record.pmOut !== "--" ? record.pmOut : "",
      hours: totalHours,
    };
  };

  // Get month name
  const getMonthName = () => {
    return new Date(selectedYear, selectedMonth).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  // Handle download/print - open clean window with only DTR
  const handleDownload = () => {
    const printContent = document.getElementById("dtr-paper");
    if (!printContent) return;

    const printWindow = window.open("", "_blank", "width=800,height=600");
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>DTR - ${selectedRecord.name}</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 10mm;
            }
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 10mm;
              font-size: 10pt;
            }
            .dtr-wrapper {
              width: 100%;
            }
            .header-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 10px;
              font-size: 9pt;
            }
            .header-left, .header-right {
              width: 30%;
            }
            .header-center {
              text-align: center;
              width: 40%;
            }
            .title {
              font-weight: bold;
              font-size: 12pt;
            }
            .subtitle {
              font-size: 8pt;
            }
            /* Support Tailwind classes for 2-column layout */
            .flex {
              display: flex;
            }
            .gap-4 {
              gap: 15px;
            }
            .flex-1 {
              flex: 1;
            }
            .justify-between {
              justify-content: space-between;
            }
            .items-start {
              align-items: flex-start;
            }
            .text-center {
              text-align: center;
            }
            .text-right {
              text-align: right;
            }
            .mb-2 {
              margin-bottom: 8px;
            }
            .mt-4 {
              margin-top: 15px;
            }
            .mt-1 {
              margin-top: 4px;
            }
            .w-40 {
              width: 160px;
            }
            .border-t {
              border-top: 1px solid black;
            }
            .font-semibold, .font-bold {
              font-weight: bold;
            }
            .text-xs {
              font-size: 9pt;
            }
            .text-sm {
              font-size: 10pt;
            }
            .text-\[10px\] {
              font-size: 8pt;
            }
            .h-5 {
              height: 14pt;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              font-size: 8pt;
            }
            th, td {
              border: 1px solid black;
              padding: 2px;
              text-align: center;
            }
            th {
              background-color: #f5f5f5;
            }
            .cert {
              margin-top: 10px;
              text-align: center;
              font-size: 8pt;
            }
            .sig-line {
              border-top: 1px solid black;
              width: 150px;
              margin: 15px auto 3px;
            }
            @media print {
              body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
            }
          </style>
        </head>
        <body>
          <div class="dtr-wrapper">
            ${printContent.innerHTML}
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                // Close after a small delay to ensure the print process is handled
                setTimeout(function() { window.close(); }, 500);
              }, 500);
              // Fallback for some browsers
              window.onafterprint = function() { window.close(); };
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();

    // Auto-close the modal after triggering print
    onClose();
    if (onCloseParent) onCloseParent();
  };

  // Disable body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = "0";
      document.body.style.right = "0";
      document.body.style.width = "100%";
      document.body.style.overflow = "hidden";
    } else {
      const scrollY = document.body.style.top;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.width = "";
      document.body.style.overflow = "";
      window.scrollTo(0, parseInt(scrollY || "0") * -1);
    }
    return () => {
      const scrollY = document.body.style.top;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.width = "";
      document.body.style.overflow = "";
      window.scrollTo(0, parseInt(scrollY || "0") * -1);
    };
  }, [isOpen]);

  if (!isOpen || !selectedRecord) return null;

  const monthName = getMonthName();

  // Generate rows for left side (days 1-15) and right side (days 16-31)
  const leftRows = Array.from({ length: 15 }, (_, i) => getDayData(i + 1));
  const rightRows = Array.from({ length: 16 }, (_, i) => getDayData(i + 16));

  const calculateTotalSum = (rows) => {
    let totalMinutes = 0;
    rows.forEach((row) => {
      if (row.hours) {
        const [hh, mm] = row.hours.toString().split(".");
        const h = parseInt(hh, 10) || 0;
        const mStr = (mm || "0").padEnd(2, "0");
        const m = parseInt(mStr, 10) || 0;
        totalMinutes += h * 60 + m;
      }
    });
    if (totalMinutes === 0) return "";
    const totalH = Math.floor(totalMinutes / 60);
    const totalM = totalMinutes % 60;
    return `${totalH}.${totalM.toString().padStart(2, "0")}`;
  };

  // Render DTR Table Column
  const renderDtrTable = (rows, startDay, isLastTable = false) => (
    <table className="w-full text-[12px] border-collapse table-fixed">
      <thead>
        <tr className="bg-gray-100 text-[11px]">
          <th
            className="border border-black px-0 py-0.5 text-center font-bold font-sans w-6"
            rowSpan="2"
          >
            Day
          </th>
          <th
            className="border border-black px-0 py-0.5 text-center font-bold font-sans"
            colSpan="2"
          >
            MORNING
          </th>
          <th
            className="border border-black px-0 py-0.5 text-center font-bold font-sans"
            colSpan="2"
          >
            AFTERNOON
          </th>
          <th
            className="border border-black px-0 py-0.5 text-center font-bold font-sans"
            colSpan="2"
          >
            OVERTIME
          </th>
          <th
            className="border border-black px-0 py-0.5 text-center font-bold font-sans w-10 leading-tight"
            rowSpan="2"
          >
            Daily
            <br />
            Total
          </th>
        </tr>
        <tr className="bg-gray-100 text-[10px]">
          <th className="border border-black px-0 py-0.5 text-center font-bold">
            IN
          </th>
          <th className="border border-black px-0 py-0.5 text-center font-bold">
            OUT
          </th>
          <th className="border border-black px-0 py-0.5 text-center font-bold">
            IN
          </th>
          <th className="border border-black px-0 py-0.5 text-center font-bold">
            OUT
          </th>
          <th className="border border-black px-0 py-0.5 text-center font-bold">
            IN
          </th>
          <th className="border border-black px-0 py-0.5 text-center font-bold">
            OUT
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, index) => {
          const day = startDay + index;
          return (
            <tr key={day} className="h-6">
              <td className="border border-black px-0 py-0 text-center font-medium font-sans">
                {day}
              </td>
              <td className="border border-black px-0 py-0 text-center text-[12px] whitespace-nowrap">
                {row.amIn}
              </td>
              <td className="border border-black px-0 py-0 text-center text-[12px] whitespace-nowrap">
                {row.amOut}
              </td>
              <td className="border border-black px-0 py-0 text-center text-[12px] whitespace-nowrap">
                {row.pmIn}
              </td>
              <td className="border border-black px-0 py-0 text-center text-[12px] whitespace-nowrap">
                {row.pmOut}
              </td>
              <td className="border border-black px-0 py-0 text-center text-[12px] whitespace-nowrap">
                {/* Overtime IN - placeholder */}
              </td>
              <td className="border border-black px-0 py-0 text-center text-[12px] whitespace-nowrap">
                {/* Overtime OUT - placeholder */}
              </td>
              <td className="border border-black px-0 py-0 text-center text-[12px] font-medium">
                {row.hours}
              </td>
            </tr>
          );
        })}
        {/* Total Sum Row - only on the right side block */}
        {isLastTable && (
          <tr className="h-6">
            <td
              colSpan="7"
              className="border border-black px-2 py-0 text-right font-bold text-[12px]"
            >
              GRAND TOTAL HOURS
            </td>
            <td className="border border-black px-0 py-0 text-center text-[12px] font-bold">
              {calculateTotalSum([...leftRows, ...rightRows])}
            </td>
          </tr>
        )}

        {/* Empty rows on the left side to perfectly match the height of the right side's extra rows */}
        {!isLastTable && (
          <>
            <tr className="h-6">
              <td className="border border-black px-0 py-0">&nbsp;</td>
              <td className="border border-black px-0 py-0">&nbsp;</td>
              <td className="border border-black px-0 py-0">&nbsp;</td>
              <td className="border border-black px-0 py-0">&nbsp;</td>
              <td className="border border-black px-0 py-0">&nbsp;</td>
              <td className="border border-black px-0 py-0">&nbsp;</td>
              <td className="border border-black px-0 py-0">&nbsp;</td>
              <td className="border border-black px-0 py-0">&nbsp;</td>
            </tr>
            <tr className="h-6">
              <td colSpan="8" className="border border-black px-0 py-0">
                &nbsp;
              </td>
            </tr>
          </>
        )}
      </tbody>
    </table>
  );

  return (
    <>
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm;
          }
          
          /* Hide everything by default */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          /* Hide the backdrop, modal wrapper, header, footer, and controls */
          .fixed.inset-0,
          .bg-black\/50,
          .backdrop-blur-sm,
          .print\\:hidden,
          .bg-gray-50,
          .bg-\\[\\#168e3f\\] {
            display: none !important;
          }
          
          /* Show only the print container */
          .print-container {
            display: block !important;
            position: static !important;
            width: 100% !important;
            max-width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
            background: white !important;
            box-shadow: none !important;
            border: none !important;
            overflow: visible !important;
          }
          
          /* Ensure 2-column layout stays side by side */
          .flex.gap-4 {
            display: flex !important;
            flex-direction: row !important;
            gap: 15px !important;
            width: 100% !important;
          }
          
          .flex-1 {
            flex: 1 1 48% !important;
            width: 48% !important;
            max-width: 48% !important;
          }
          
          /* Table styling */
          table {
            width: 100% !important;
            border-collapse: collapse !important;
            font-size: 8pt !important;
          }
          
          th, td {
            border: 1px solid black !important;
            padding: 2px !important;
            text-align: center !important;
          }
          
          /* Ensure all backgrounds are white for print */
          .bg-white, .bg-gray-100, .bg-gray-50 {
            background-color: white !important;
          }
          
          /* Text color */
          body {
            color: black !important;
          }
        }
      `}</style>
      <div
        className={`fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm transition-all duration-300 ${isFullScreen ? "p-0" : "p-4"}`}
      >
        <div
          className={`bg-white shadow-2xl flex flex-col overflow-hidden transition-all duration-500 ease-in-out ${
            isFullScreen
              ? "w-full h-full rounded-none"
              : "w-full max-w-6xl max-h-[95vh] rounded-t-3xl rounded-b-lg"
          }`}
        >
          {/* Header */}
          <div
            className={`flex items-center justify-between px-6 py-4 bg-[#168e3f] shrink-0 print:hidden ${isFullScreen ? "rounded-none" : "rounded-t-3xl"}`}
          >
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold text-white">
                DTR Preview - {selectedRecord.name}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsFullScreen(!isFullScreen)}
                className="p-2 hover:bg-white/20 rounded-full transition-colors text-white/80 hover:text-white"
                title={isFullScreen ? "Small Screen" : "Full Screen"}
              >
                {isFullScreen ? (
                  <FiMinimize size={22} />
                ) : (
                  <FiMaximize2 size={22} />
                )}
              </button>
              <Btn_X
                onClick={() => {
                  onClose();
                  if (onCloseParent) onCloseParent();
                }}
                className="p-2 hover:bg-white/20 rounded-full transition-colors text-white/80 hover:text-white"
              />
            </div>
          </div>

          {/* Content */}
          <div className="p-4 overflow-y-auto flex-1 bg-gray-50 relative">
            {/* Sticky Action Bar */}
            <div className="sticky top-0 z-40 flex justify-between items-start mb-4 print:hidden pointer-events-none">
              {/* Month/Year Selector (Left) */}
              <div className="bg-white/90 backdrop-blur rounded-lg p-3 w-max shadow-md border border-white pointer-events-auto">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <FiCalendar className="w-5 h-5 text-[#188b3e]" />
                    <select
                      value={selectedMonth}
                      onChange={(e) =>
                        setSelectedMonth(parseInt(e.target.value))
                      }
                      className="px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#188b3e] text-sm bg-white"
                    >
                      {Array.from({ length: 12 }, (_, i) => (
                        <option key={i} value={i}>
                          {new Date(2024, i).toLocaleDateString("en-US", {
                            month: "long",
                          })}
                        </option>
                      ))}
                    </select>
                    <select
                      value={selectedYear}
                      onChange={(e) =>
                        setSelectedYear(parseInt(e.target.value))
                      }
                      className="px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#188b3e] text-sm bg-white"
                    >
                      {Array.from({ length: 5 }, (_, i) => {
                        const year = new Date().getFullYear() - 2 + i;
                        return (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900">
                    {monthName}
                  </h4>

                  {/* Calculation Legend Tooltip */}
                  <div className="relative group ml-1">
                    <button className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-full transition-colors">
                      <FiInfo size={18} />
                    </button>
                    
                    {/* Tooltip Content */}
                    <div className="absolute left-0 top-full mt-2 hidden group-hover:block w-72 bg-white rounded-xl shadow-2xl border border-gray-100 p-4 z-[60] animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="space-y-3">
                        <h5 className="font-bold text-gray-900 text-sm border-b pb-2">Calculation Logic</h5>
                        <div className="space-y-2">
                          <div className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0"></div>
                            <p className="text-[11px] text-gray-600">
                              <span className="font-bold text-gray-800">Daily Total:</span> Calculated as (AM Hours) + (PM Hours).
                            </p>
                          </div>
                          <div className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5 shrink-0"></div>
                            <p className="text-[11px] text-gray-600">
                              <span className="font-bold text-gray-800">Lunch Break:</span> Time between 12:00 PM and 1:59 PM is automatically deducted.
                            </p>
                          </div>
                          <div className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0"></div>
                            <p className="text-[11px] text-gray-600">
                              <span className="font-bold text-gray-800">Incomplete:</span> Shows <span className="font-mono text-red-600 bg-red-50 px-1 rounded">0.00</span> if a Time In or Out is missing.
                            </p>
                          </div>
                          <div className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 shrink-0"></div>
                            <p className="text-[11px] text-gray-600">
                              <span className="font-bold text-gray-800">Grand Total:</span> Sum of all daily totals, formatted as Hours.Minutes.
                            </p>
                          </div>
                        </div>
                      </div>
                      {/* Arrow (Pointing Up) */}
                      <div className="absolute bottom-full left-3 -mb-1 border-8 border-transparent border-b-white"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Zoom Controls (Right) */}
              <div className="flex items-center gap-2 bg-white/90 backdrop-blur shadow-md rounded-full px-4 py-2 border border-white pointer-events-auto">
                <button
                  onClick={() => handleZoom("out")}
                  className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
                  title="Zoom Out"
                >
                  <FiZoomOut size={20} />
                </button>
                <span className="text-sm font-bold text-gray-700 w-12 text-center">
                  {zoomScale}%
                </span>
                <button
                  onClick={() => handleZoom("in")}
                  className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
                  title="Zoom In"
                >
                  <FiZoomIn size={20} />
                </button>
                <div className="w-px h-4 bg-gray-300 mx-1"></div>
                <button
                  onClick={() => handleZoom("reset")}
                  className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
                  title="Reset Zoom"
                >
                  <FiMaximize size={18} />
                </button>
              </div>
            </div>

            {/* DTR Form */}
            <div className="flex justify-center transition-transform duration-200 mt-8 mb-8 relative z-0">
              <div
                id="dtr-paper"
                className="bg-white rounded-lg p-4 print-container shadow-xl mx-auto"
                style={{
                  position: "relative",
                  width: "210mm",
                  minHeight: "1122px",
                  paddingBottom: "80px",
                  transform: `scale(${zoomScale / 100})`,
                  transformOrigin: "top center",
                  marginBottom: `-${1122 * (1 - zoomScale / 100)}px`,
                }}
              >
                {/* Nuvelco Paper Header */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    width: "auto",
                    marginBottom: "4px",
                    marginLeft: "-16px",
                    marginRight: "-16px",
                    paddingLeft: "16px",
                    paddingRight: "16px",
                  }}
                >
                  <img
                    src="/system_logo.png"
                    alt="Nuvelco Logo"
                    style={{
                      height: "80px",
                      objectFit: "contain",
                      flexShrink: 0,
                    }}
                  />

                  {/* Nuvelco Center Title Image */}
                  <div
                    style={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      padding: "0 8px",
                    }}
                  >
                    <img
                      src="/Nuvelco_title.png"
                      alt="Nuvelco Title"
                      style={{
                        height: "95%",
                        width: "95%",
                        objectFit: "contain",
                        objectPosition: "left center",
                      }}
                    />
                  </div>

                  <img
                    src="/nuvelco_establishment.png"
                    alt="Nuvelco Establishment"
                    style={{
                      height: "80px",
                      objectFit: "contain",
                      flexShrink: 0,
                    }}
                  />
                </div>

                {/* Motto and Green lines */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    width: "auto",
                    marginLeft: "-16px",
                    marginRight: "-16px",
                    marginBottom: "16px",
                  }}
                >
                  <div
                    style={{
                      flex: 1,
                      borderTop: "3px solid #168e3f",
                      borderBottom: "1px solid #168e3f",
                      height: "5px",
                      minWidth: "20px",
                    }}
                  ></div>
                  <div
                    style={{
                      padding: "0 12px",
                      color: "#74d3a6",
                      fontStyle: "italic",
                      fontFamily:
                        '"Brush Script MT", "Brush Script Std", "Lucida Calligraphy", "Lucida Handwriting", "Apple Chancery", cursive',
                      fontSize: "22px",
                      fontWeight: "500",
                      letterSpacing: "0.5px",
                      textShadow: "1px 1px 0px rgba(255,255,255,0.5)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    "Basta sama-sama, kaya."
                  </div>
                  <div
                    style={{
                      width: "40px",
                      borderTop: "3px solid #168e3f",
                      borderBottom: "1px solid #168e3f",
                      height: "5px",
                    }}
                  ></div>
                </div>

                {/* DTR Title - centered below header */}
                <div style={{ textAlign: "center", margin: "10px 0 8px" }}>
                  <div
                    style={{
                      fontWeight: "800",
                      fontSize: "20px",
                      letterSpacing: "0.5px",
                      textTransform: "uppercase",
                    }}
                  >
                    DAILY TIME RECORD
                  </div>
                  <div style={{ fontSize: "15px", marginTop: "2px" }}>
                    (On the Job Training)
                  </div>
                </div>

                {/* DTR Header Info */}
                <div
                  className="mb-2 text-xs space-y-0.5"
                  style={{ fontSize: "15px" }}
                >
                  <div>
                    <strong>Name:</strong> {selectedRecord.name}
                  </div>
                  <div>
                    <strong>School:</strong> {selectedRecord.school || "N/A"}
                  </div>
                  <div>
                    <strong>Course:</strong> {selectedRecord.course || "Intern"}
                  </div>
                  <div>
                    <strong>Month:</strong> {monthName}
                  </div>
                </div>

                {/* Two Column DTR Tables */}
                <div className="flex gap-4 mt-6">
                  {/* Left Side - Days 1-15 */}
                  <div className="flex-1">
                    {renderDtrTable(leftRows, 1, false)}
                  </div>

                  {/* Right Side - Days 16-31 */}
                  <div className="flex-1">
                    {renderDtrTable(rightRows, 16, true)}
                  </div>
                </div>

                {/* Centered Certification Statement */}
                <div
                  className="mt-30 text-center text-xs w-full relative"
                  style={{ marginTop: "20px" }}
                >
                  {/* Empty element to act as the requested empty row before the certification */}
                  <div className="h-6"></div>
                  <p
                    className="text-center"
                    style={{ fontSize: "15px", marginBottom: "20px" }}
                  >
                    I hereby certify that the above records are true and
                    correct.
                  </p>
                  <div className="mt-16 block w-full text-center ml-20">
                    <div
                      style={{
                        marginTop: "50px",
                        marginLeft: "100px",
                        borderTop: "1px solid black",
                        width: "450px",
                      }}
                    ></div>
                    <div
                      style={{
                        marginTop: "12px",
                        fontWeight: "600",
                        fontSize: "15px",
                        textAlign: "center",
                        marginRight: "25px",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        display: "block",
                      }}
                    >
                      EMPLOYEE'S SIGNATURE
                    </div>
                  </div>
                </div>

                {/* Document Footer - Contact Info */}
                <div
                  style={{
                    position: "absolute",
                    bottom: "0",
                    left: "0",
                    right: "0",
                  }}
                >
                  {/* Double green line */}
                  <div
                    style={{
                      borderTop: "3px solid #168e3f",
                      borderBottom: "1px solid #168e3f",
                      height: "5px",
                      width: "100%",
                    }}
                  ></div>
                  {/* Contact info row */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "32px",
                      padding: "10px 0",
                      flexWrap: "wrap",
                    }}
                  >
                    {/* Website */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        fontSize: "11px",
                        color: "#333",
                      }}
                    >
                      <img
                        src="/globe.png"
                        alt="Website"
                        style={{
                          width: "22px",
                          height: "22px",
                          objectFit: "contain",
                        }}
                      />
                      <span style={{ color: "#555" }}>|</span>
                      <span>www.nuvelco.com</span>
                    </div>
                    {/* Email */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        fontSize: "11px",
                      }}
                    >
                      <img
                        src="/email.png"
                        alt="Email"
                        style={{
                          width: "22px",
                          height: "22px",
                          objectFit: "contain",
                        }}
                      />
                      <span style={{ color: "#555" }}>|</span>
                      <a
                        href="mailto:hq@nuvelco.com"
                        style={{ color: "#1a56db", textDecoration: "none" }}
                      >
                        hq@nuvelco.com
                      </a>
                    </div>
                    {/* Phone */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        color: "#333",
                      }}
                    >
                      <img
                        src="/Telephone.png"
                        alt="Phone"
                        style={{
                          width: "22px",
                          height: "22px",
                          objectFit: "contain",
                        }}
                      />
                      <span style={{ color: "#555" }}>|</span>
                      <span>0917-312-5775</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 shrink-0 rounded-b-lg border-t border-gray-200 print:hidden">
            <div className="flex items-center justify-end gap-3">
              <Button
                variant="modal-secondary"
                onClick={() => {
                  onClose();
                  if (onCloseParent) onCloseParent();
                }}
                label="Close"
              />
              <Button
                variant="modal-primary"
                onClick={handleDownload}
                icon={<FiDownload className="w-4 h-4" />}
                label="Print DTR"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PreviewDtrModal;
