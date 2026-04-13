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
    <table className="w-full text-[20px] border-collapse">
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
        {rows.map((row, index) => {
          const day = startDay + index;
          return (
            <tr key={day} className="h-6">
              <td className="border border-black px-1 py-0 text-center font-medium">
                {day}
              </td>
              <td className="border border-black px-1 py-0 text-center text-[15px]">
                {row.amIn}
              </td>
              <td className="border border-black px-1 py-0 text-center text-[15px]">
                {row.amOut}
              </td>
              <td className="border border-black px-1 py-0 text-center text-[15px]">
                {row.pmIn}
              </td>
              <td className="border border-black px-1 py-0 text-center text-[15px]">
                {row.pmOut}
              </td>
              <td className="border border-black px-1 py-0 text-center text-[15px]">
                {/* Overtime IN - placeholder */}
              </td>
              <td className="border border-black px-1 py-0 text-center text-[15px]">
                {/* Overtime OUT - placeholder */}
              </td>
              <td className="border border-black px-1 py-0 text-center text-[15px] font-medium">
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
              className="border border-black px-2 py-0 text-right font-bold text-[15px]"
            >
              GRAND TOTAL HOURS
            </td>
            <td className="border border-black px-1 py-0 text-center text-[15px] font-bold">
              {calculateTotalSum([...leftRows, ...rightRows])}
            </td>
          </tr>
        )}

        {/* Empty rows on the left side to perfectly match the height of the right side's extra rows */}
        {!isLastTable && (
          <>
            <tr className="h-6">
              <td className="border border-black px-1 py-0">&nbsp;</td>
              <td className="border border-black px-1 py-0">&nbsp;</td>
              <td className="border border-black px-1 py-0">&nbsp;</td>
              <td className="border border-black px-1 py-0">&nbsp;</td>
              <td className="border border-black px-1 py-0">&nbsp;</td>
              <td className="border border-black px-1 py-0">&nbsp;</td>
              <td className="border border-black px-1 py-0">&nbsp;</td>
              <td className="border border-black px-1 py-0">&nbsp;</td>
            </tr>
            <tr className="h-6">
              <td colSpan="8" className="border border-black px-1 py-0">
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
              className="bg-white rounded-lg p-4 print-container"
              style={{
                position: "relative",
                minHeight: "1122px",
                paddingBottom: "80px",
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
                      height: "80px",
                      width: "100%",
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
                style={{ marginTop: "30px" }}
              >
                {/* Empty element to act as the requested empty row before the certification */}
                <div className="h-6"></div>
                <p className="text-center" style={{ fontSize: "15px" }}>
                  I hereby certify that the above records are true and correct.
                </p>
                <div className="mt-16 block w-full text-center">
                  <div
                    style={{
                      marginTop: "60px",
                      borderTop: "1px solid black",
                      width: "300px",
                      margin: "0 auto",
                    }}
                  ></div>
                  <div
                    style={{
                      marginTop: "12px",
                      fontWeight: "600",
                      fontSize: "15px",
                      textAlign: "center",
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
                      fontSize: "11px",
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
