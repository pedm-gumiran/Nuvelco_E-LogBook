import React, { useEffect, useState } from "react";
import {
  FiChevronDown,
  FiChevronRight,
  FiCalendar,
  FiClock,
  FiFileText,
} from "react-icons/fi";
import Btn_X from "../Buttons/Btn_X.jsx";

/**
 * ViewAttendanceModal - Modal for viewing all attendance records grouped by month
 *
 * @param {boolean} isOpen - Whether the modal is visible
 * @param {function} onClose - Function to close the modal
 * @param {Object} selectedRecord - The selected person's basic info (name, school, course)
 * @param {Array} attendanceRecords - All attendance records for this person
 * @param {string} activeTab - Current tab ('intern' or 'visitors')
 * @param {function} blobToBase64 - Function to convert blob to base64 image
 * @param {function} handleViewImage - Function to handle image click for zoom view
 */
const ViewAttendanceModal = ({
  isOpen,
  onClose,
  selectedRecord,
  attendanceRecords = [],
  activeTab,
  blobToBase64,
  handleViewImage,
  onPreviewDtr,
}) => {
  const [expandedMonths, setExpandedMonths] = useState({});
  const [expandedDates, setExpandedDates] = useState({});
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

  // Parse date as local time (avoids UTC timezone shift issues)
  const parseLocalDate = (dateStr) => {
    if (!dateStr) return null;
    // Handle ISO format like "2026-04-07T08:24:08.000Z" by extracting date portion
    const datePart = dateStr.split("T")[0];
    const [year, month, day] = datePart.split("-").map(Number);
    return new Date(year, month - 1, day);
  };

  // Group records by month
  const groupByMonth = (records) => {
    const grouped = {};
    records.forEach((record) => {
      const date = parseLocalDate(record.date);
      if (!date || isNaN(date.getTime())) {
        console.warn("Invalid date in record:", record.date, record);
        return; // Skip records with invalid dates
      }
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const monthName = date.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });

      if (!grouped[monthKey]) {
        grouped[monthKey] = { name: monthName, records: [] };
      }
      grouped[monthKey].records.push(record);
    });
    return grouped;
  };

  const toggleMonth = (monthKey) => {
    setExpandedMonths((prev) => {
      const isExpanding = !prev[monthKey];
      // Close all other months when expanding this one
      return isExpanding ? { [monthKey]: true } : {};
    });
    // Also close all date sections when switching months
    setExpandedDates({});
  };

  const toggleDate = (dateKey) => {
    setExpandedDates((prev) => {
      const isExpanding = !prev[dateKey];
      // Close all other dates when expanding this one
      return isExpanding ? { [dateKey]: true } : {};
    });
  };

  const renderAttendancePhotos = (record) => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
      {/* AM In */}
      <div className="text-center">
        <p className="text-sm font-medium text-gray-600 mb-1">AM In</p>
        <p className="text-xs text-gray-500 mb-2">{record.amIn || "-"}</p>
        {record.amInImage ? (
          <img
            src={blobToBase64(record.amInImage)}
            alt="AM In"
            className="w-full h-28 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => handleViewImage(record.amInImage, "AM In")}
          />
        ) : (
          <div className="w-full h-28 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-sm">
            No Photo
          </div>
        )}
      </div>
      {/* AM Out */}
      <div className="text-center">
        <p className="text-sm font-medium text-gray-600 mb-1">AM Out</p>
        <p className="text-xs text-gray-500 mb-2">{record.amOut || "-"}</p>
        {record.amOutImage ? (
          <img
            src={blobToBase64(record.amOutImage)}
            alt="AM Out"
            className="w-full h-28 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => handleViewImage(record.amOutImage, "AM Out")}
          />
        ) : (
          <div className="w-full h-28 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-sm">
            No Photo
          </div>
        )}
      </div>
      {/* PM In */}
      <div className="text-center">
        <p className="text-sm font-medium text-gray-600 mb-1">PM In</p>
        <p className="text-xs text-gray-500 mb-2">{record.pmIn || "-"}</p>
        {record.pmInImage ? (
          <img
            src={blobToBase64(record.pmInImage)}
            alt="PM In"
            className="w-full h-28 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => handleViewImage(record.pmInImage, "PM In")}
          />
        ) : (
          <div className="w-full h-28 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-sm">
            No Photo
          </div>
        )}
      </div>
      {/* PM Out */}
      <div className="text-center">
        <p className="text-sm font-medium text-gray-600 mb-1">PM Out</p>
        <p className="text-xs text-gray-500 mb-2">{record.pmOut || "-"}</p>
        {record.pmOutImage ? (
          <img
            src={blobToBase64(record.pmOutImage)}
            alt="PM Out"
            className="w-full h-28 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => handleViewImage(record.pmOutImage, "PM Out")}
          />
        ) : (
          <div className="w-full h-28 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-sm">
            No Photo
          </div>
        )}
      </div>
    </div>
  );

  if (!isOpen || !selectedRecord) return null;

  const monthlyData = groupByMonth(attendanceRecords);
  const sortedMonths = Object.keys(monthlyData).sort().reverse();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-[#168e3f] rounded-t-3xl rounded-b-lg shadow-xl max-w-5xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 shrink-0">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-white">
              {selectedRecord.name} - Attendance History
            </h3>
          </div>
          <Btn_X
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors text-white/80 hover:text-white"
          />
        </div>

        {/* Content */}
        <div className="bg-white p-6 overflow-y-auto flex-1">
          {/* Person Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Name
                </label>
                <p className="text-sm font-semibold text-gray-900">
                  {selectedRecord.name}
                </p>
              </div>
              {activeTab === "intern" && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      School
                    </label>
                    <p className="text-sm text-gray-900">
                      {selectedRecord.school}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Course
                    </label>
                    <p className="text-sm text-gray-900">
                      {selectedRecord.course}
                    </p>
                  </div>
                </>
              )}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Total Records
                </label>
                <p className="text-sm font-semibold text-blue-600">
                  {attendanceRecords.length} days
                </p>
              </div>
            </div>
          </div>

          {/* Monthly Grouped Attendance */}
          <div className="space-y-4">
            {sortedMonths.map((monthKey) => {
              const monthData = monthlyData[monthKey];
              const isMonthExpanded = expandedMonths[monthKey];

              return (
                <div
                  key={monthKey}
                  className="border border-gray-200 rounded-lg overflow-hidden"
                >
                  {/* Month Header */}
                  <button
                    onClick={() => toggleMonth(monthKey)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <FiCalendar className="w-5 h-5 text-[#188b3e]" />
                      <span className="font-semibold text-gray-900">
                        {monthData.name}
                      </span>
                      <span className="text-sm text-gray-500">
                        ({monthData.records.length} days)
                      </span>
                    </div>
                    {isMonthExpanded ? (
                      <FiChevronDown className="w-5 h-5 text-gray-500" />
                    ) : (
                      <FiChevronRight className="w-5 h-5 text-gray-500" />
                    )}
                  </button>

                  {/* Month Content - Dates */}
                  {isMonthExpanded && (
                    <div className="divide-y divide-gray-100">
                      {monthData.records.map((record, index) => {
                        const dateKey = `${monthKey}-${record.date}`;
                        const isDateExpanded = expandedDates[dateKey];

                        return (
                          <div key={dateKey} className="bg-white">
                            {/* Date Header */}
                            <button
                              onClick={() => toggleDate(dateKey)}
                              className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
                            >
                              <div className="flex items-center gap-2">
                                <FiClock className="w-4 h-4 text-gray-400" />
                                <span className="font-medium text-gray-800">
                                  {(() => {
                                    try {
                                      const datePart =
                                        record.date.split("T")[0];
                                      const [year, month, day] = datePart
                                        .split("-")
                                        .map(Number);
                                      if (!year || !month || !day)
                                        return "Invalid Date";
                                      const d = new Date(year, month - 1, day);
                                      if (isNaN(d.getTime()))
                                        return "Invalid Date";
                                      return d.toLocaleDateString("en-US", {
                                        weekday: "long",
                                        month: "short",
                                        day: "numeric",
                                      });
                                    } catch (e) {
                                      return "Invalid Date";
                                    }
                                  })()}
                                </span>
                              </div>
                              {isDateExpanded ? (
                                <FiChevronDown className="w-4 h-4 text-gray-500" />
                              ) : (
                                <FiChevronRight className="w-4 h-4 text-gray-500" />
                              )}
                            </button>

                            {/* Date Content - Photos */}
                            {isDateExpanded && (
                              <div className="px-4 pb-4">
                                {renderAttendancePhotos(record)}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            {sortedMonths.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No attendance records found for this person.
              </div>
            )}
          </div>

          {/* Footer */}
          {activeTab === "intern" && onPreviewDtr && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-end">
                <button
                  onClick={onPreviewDtr}
                  className="flex items-center gap-2 px-4 py-2 bg-[#188b3e] hover:bg-[#147a35] text-white rounded-lg transition-colors text-sm font-medium"
                  title="Preview in DTR"
                >
                  <FiFileText className="w-4 h-4" />
                  Preview in DTR
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewAttendanceModal;
