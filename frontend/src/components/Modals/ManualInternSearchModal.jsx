import React, { useState, useEffect, useRef } from "react";
import { FiSearch, FiX } from "react-icons/fi";
import Input_Text from "../Input_Fields/Input_Text.jsx";
import Button from "../Buttons/Button.jsx";
import axiosInstance from "../../api/axios.js";

const ManualInternSearchModal = ({
  isOpen,
  onClose,
  onSelectIntern,
  loading = false,
}) => {
  const [internSearchQuery, setInternSearchQuery] = useState("");
  const [internsList, setInternsList] = useState([]);
  const [selectedIntern, setSelectedIntern] = useState(null);
  const [showInternDropdown, setShowInternDropdown] = useState(false);
  const internDropdownRef = useRef(null);

  // Fetch interns list on mount and handle scroll lock
  useEffect(() => {
    if (isOpen) {
      fetchInternsList();
      // Reset state when modal opens
      setInternSearchQuery("");
      setSelectedIntern(null);
      setShowInternDropdown(false);

      // Disable background scrolling
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = "0";
      document.body.style.right = "0";
      document.body.style.width = "100%";
      document.body.style.overflow = "hidden";

      return () => {
        // Re-enable scrolling when modal closes
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.left = "";
        document.body.style.right = "";
        document.body.style.width = "";
        document.body.style.overflow = "";
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        internDropdownRef.current &&
        !internDropdownRef.current.contains(event.target)
      ) {
        setShowInternDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch interns list for manual search
  const fetchInternsList = async () => {
    try {
      const response = await axiosInstance.get("/intern?limit=100&order=asc");
      if (response.data.success && response.data.data) {
        setInternsList(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching interns list:", error);
    }
  };

  // Handle search input change
  const handleInternSearchChange = (e) => {
    const value = e.target.value;
    setInternSearchQuery(value);
    setSelectedIntern(null);
    setShowInternDropdown(value.length > 0);
  };

  // Build full intern name with middle initial and suffix
  const buildInternName = (intern) => {
    let name = intern.first_name || "";
    if (intern.middle_initial && intern.middle_initial.trim()) {
      name += ` ${intern.middle_initial.trim()}`;
    }
    name += ` ${intern.last_name || ""}`;
    if (intern.suffix && intern.suffix.trim()) {
      name += ` ${intern.suffix.trim()}`;
    }
    return name.trim();
  };

  // Handle intern selection
  const handleInternSelect = (intern) => {
    setSelectedIntern(intern);
    setInternSearchQuery(buildInternName(intern));
    setShowInternDropdown(false);
  };

  // Handle attendance recording
  const handleRecordAttendance = () => {
    if (!selectedIntern) return;
    onSelectIntern(selectedIntern);
  };

  // Clear search
  const clearSearch = () => {
    setInternSearchQuery("");
    setSelectedIntern(null);
    setShowInternDropdown(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop - no click handler to prevent auto-close */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 bg-white rounded-3xl shadow-2xl animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#188b3e] rounded-t-3xl">
          <div className="flex items-center gap-3">
            <FiSearch className="text-white" size={20} />
            <h2 className="text-lg font-semibold text-white">Manual Search</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors text-white/80 hover:text-white"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6" ref={internDropdownRef}>
          <p className="text-sm text-gray-600 mb-4">
            If QR scanner doesn't work, search for your name manually.
          </p>

          {/* Search Input */}
          <div className="mb-4">
            <Input_Text
              name="internSearch"
              placeholder="Type your first name or last name"
              value={internSearchQuery}
              onChange={handleInternSearchChange}
              text_ClassName="w-full"
            />
          </div>

          {/* Dropdown Results */}
          {showInternDropdown && (
            <div className="mb-4 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
              {internsList
                .filter((intern) => {
                  const fullName = buildInternName(intern).toLowerCase();
                  const internId = (intern.intern_id || "").toLowerCase();
                  const query = internSearchQuery.toLowerCase();
                  return fullName.includes(query) || internId.includes(query);
                })
                .slice(0, 10)
                .map((intern) => (
                  <button
                    key={intern.id}
                    onClick={() => handleInternSelect(intern)}
                    className={`w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-0 transition-colors ${
                      selectedIntern?.id === intern.id
                        ? "bg-green-50 border-l-4 border-l-[#188b3e]"
                        : ""
                    }`}
                  >
                    <div className="font-semibold text-sm text-gray-800">
                      {buildInternName(intern) || "Unknown"}
                    </div>
                  </button>
                ))}
              {internsList.filter((intern) => {
                const fullName = buildInternName(intern).toLowerCase();
                const internId = (intern.intern_id || "").toLowerCase();
                const query = internSearchQuery.toLowerCase();
                return fullName.includes(query) || internId.includes(query);
              }).length === 0 && (
                <div className="px-4 py-4 text-sm text-gray-500 text-center">
                  No interns found
                </div>
              )}
            </div>
          )}

          {/* Selected Intern Display */}
          {selectedIntern && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl">
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                Selected
              </div>
              <div className="font-semibold text-gray-800">
                {buildInternName(selectedIntern)}
              </div>
            </div>
          )}

          {/* Record Attendance Button */}
          <Button
            onClick={handleRecordAttendance}
            disabled={loading || !selectedIntern}
            isLoading={loading}
            loadingText="Processing..."
            label="Proceed to Attendance"
            variant="modal-primary"
            size="lg"
            icon={null}
            className="w-full shadow-lg shadow-green-200"
          />

          {/* Cancel Button */}
          <button
            onClick={onClose}
            className="w-full mt-3 py-3 bg-gray-100 text-gray-700 font-semibold text-sm rounded-xl hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
      `}</style>
    </div>
  );
};

export default ManualInternSearchModal;
