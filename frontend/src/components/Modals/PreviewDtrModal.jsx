import React, { useEffect, useState } from "react";
import { FiDownload, FiCalendar } from "react-icons/fi";
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

  // Parse date as local time
  const parseLocalDate = (dateStr) => {
    if (!dateStr) return null;
    const datePart = dateStr.split(/[ T]/)[0];
    const [year, month, day] = datePart.split("-").map(Number);
    if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
    return new Date(year, month - 1, day);
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
        : "";

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
                window.onafterprint = function() { window.close(); };
              }, 300);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
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

  // Render DTR Table Column
  const renderDtrTable = (rows, startDay) => (
    <table className="w-full text-[10px] border-collapse">
      <thead>
        <tr className="bg-gray-100">
          <th
            className="border border-black px-1 py-0.5 text-center font-bold w-6"
            rowSpan="2"
          >
            Day
          </th>
          <th
            className="border border-black px-1 py-0.5 text-center font-bold"
            colSpan="2"
          >
            MORNING
          </th>
          <th
            className="border border-black px-1 py-0.5 text-center font-bold"
            colSpan="2"
          >
            AFTERNOON
          </th>
          <th
            className="border border-black px-1 py-0.5 text-center font-bold"
            colSpan="2"
          >
            OVERTIME
          </th>
          <th
            className="border border-black px-1 py-0.5 text-center font-bold w-10"
            rowSpan="2"
          >
            Daily
            <br />
            Total
          </th>
        </tr>
        <tr className="bg-gray-100">
          <th className="border border-black px-1 py-0.5 text-center font-bold w-12">
            IN
          </th>
          <th className="border border-black px-1 py-0.5 text-center font-bold w-12">
            OUT
          </th>
          <th className="border border-black px-1 py-0.5 text-center font-bold w-12">
            IN
          </th>
          <th className="border border-black px-1 py-0.5 text-center font-bold w-12">
            OUT
          </th>
          <th className="border border-black px-1 py-0.5 text-center font-bold w-12">
            IN
          </th>
          <th className="border border-black px-1 py-0.5 text-center font-bold w-12">
            OUT
          </th>
        </tr>
      </thead>
      <tbody>
        {/* Empty row before day 1 (only for left side) */}
        {startDay === 1 && (
          <tr className="h-5">
            <td className="border border-black px-1 py-0"></td>
            <td className="border border-black px-1 py-0"></td>
            <td className="border border-black px-1 py-0"></td>
            <td className="border border-black px-1 py-0"></td>
            <td className="border border-black px-1 py-0"></td>
            <td className="border border-black px-1 py-0"></td>
            <td className="border border-black px-1 py-0"></td>
            <td className="border border-black px-1 py-0"></td>
          </tr>
        )}
        {rows.map((row, index) => {
          const day = startDay + index;
          return (
            <tr key={day} className="h-5">
              <td className="border border-black px-1 py-0 text-center font-medium">
                {day}
              </td>
              <td className="border border-black px-1 py-0 text-center text-[9px]">
                {row.amIn}
              </td>
              <td className="border border-black px-1 py-0 text-center text-[9px]">
                {row.amOut}
              </td>
              <td className="border border-black px-1 py-0 text-center text-[9px]">
                {row.pmIn}
              </td>
              <td className="border border-black px-1 py-0 text-center text-[9px]">
                {row.pmOut}
              </td>
              <td className="border border-black px-1 py-0 text-center text-[9px]">
                {/* Overtime IN - placeholder */}
              </td>
              <td className="border border-black px-1 py-0 text-center text-[9px]">
                {/* Overtime OUT - placeholder */}
              </td>
              <td className="border border-black px-1 py-0 text-center text-[9px] font-medium">
                {row.hours}
              </td>
            </tr>
          );
        })}
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
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="bg-white rounded-t-3xl rounded-b-lg max-w-6xl w-full max-h-[95vh] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 bg-[#168e3f] shrink-0 rounded-t-3xl print:hidden">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold text-white">
                DTR Preview - {selectedRecord.name}
              </h3>
            </div>
            <Btn_X
              onClick={() => {
                onClose();
                if (onCloseParent) onCloseParent();
              }}
              className="p-2 hover:bg-white/20 rounded-full transition-colors text-white/80 hover:text-white"
            />
          </div>

          {/* Content */}
          <div className="p-4 overflow-y-auto flex-1 bg-gray-50">
            {/* Month/Year Selector */}
            <div className="bg-white rounded-lg p-3 mb-4 print:hidden">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <FiCalendar className="w-5 h-5 text-[#188b3e]" />
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                    className="px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#188b3e] text-sm"
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
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    className="px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#188b3e] text-sm"
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
              </div>
            </div>

            {/* DTR Form */}
            <div
              id="dtr-paper"
              className="bg-white rounded-lg overflow-hidden p-4 print-container"
            >
              {/* DTR Header Info */}
              <div className="flex justify-between items-start mb-2 text-xs">
                <div className="space-y-0.5">
                  <div>
                    <strong>Name:</strong> {selectedRecord.name}
                  </div>
                  <div>
                    <strong>School:</strong> {selectedRecord.school || "N/A"}
                  </div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-sm">DAILY TIME RECORD</div>
                  <div className="text-[10px]">(On the job Training)</div>
                </div>
                <div className="space-y-0.5 text-right">
                  <div>
                    <strong>Course:</strong> {selectedRecord.course || "Intern"}
                  </div>
                  <div>
                    <strong>Month:</strong> {monthName}
                  </div>
                </div>
              </div>

              {/* Two Column DTR Tables */}
              <div className="flex gap-4">
                {/* Left Side - Days 1-15 */}
                <div className="flex-1">
                  {renderDtrTable(leftRows, 1)}
                  {/* Certification Statement for Left Side */}
                  <div className="mt-4 text-center text-xs">
                    <p>
                      I hereby certify that the above records are true and
                      correct.
                    </p>
                    <div className="mt-2 flex justify-center gap-4">
                      <div className="text-center">
                        <div className="border-t border-black w-40 mt-4"></div>
                        <div className="text-xs font-semibold mt-1">
                          EMPLOYEE'S SIGNATURE
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Side - Days 16-31 */}
                <div className="flex-1">
                  {renderDtrTable(rightRows, 16)}
                  {/* Certification Statement for Right Side */}
                  <div className="mt-4 text-center text-xs">
                    <p>
                      I hereby certify that the above records are true and
                      correct.
                    </p>
                    <div className="mt-2 flex justify-center gap-4">
                      <div className="text-center">
                        <div className="border-t border-black w-40 mt-4"></div>
                        <div className="text-xs font-semibold mt-1">
                          EMPLOYEE'S SIGNATURE
                        </div>
                      </div>
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
