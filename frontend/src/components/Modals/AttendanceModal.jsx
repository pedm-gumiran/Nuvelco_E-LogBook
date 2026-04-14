import React, { useState, useEffect, useRef } from "react";
import QRScanner from "../Input_Fields/QRScanner.jsx";
import RegisterUserModal from "./RegisterUserModal.jsx";
import SummaryModal from "./SummaryModal.jsx";
import CameraCaptureModal from "./CameraCaptureModal.jsx";
import ManualInternSearchModal from "./ManualInternSearchModal.jsx";
import Input_Text from "../Input_Fields/Input_Text.jsx";
import { speak } from "../utility/speechSynthesizer.js";
import {
  FiCalendar,
  FiClock,
  FiUsers,
  FiTrendingUp,
  FiUserPlus,
  FiAlertCircle,
  FiSearch,
  FiX,
} from "react-icons/fi";
import { toast } from "react-toastify";
import Btn_X from "../Buttons/Btn_X.jsx";
import axiosInstance from "../../api/axios.js";

const AttendanceModal = ({ isOpen, onClose }) => {
  const [scannedData, setScannedData] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showRegisterUser, setShowRegisterUser] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [newlyRegisteredVisitor, setNewlyRegisteredVisitor] = useState(null);
  const [activeTab, setActiveTab] = useState("faculty"); // 'faculty' or 'visitors'
  const [visitorForm, setVisitorForm] = useState({
    visitor_name: "",
    purpose: "",
    address: "",
    company_name: "",
  });

  // Manual intern search modal state
  const [showManualSearchModal, setShowManualSearchModal] = useState(false);

  const [attendanceData, setAttendanceData] = useState({
    todayStats: { total: 0, faculty: 0, visitors: 0 },
    weeklyStats: { visitors: 0 },
    monthlyStats: { visitors: 0 },
    yearlyStats: { visitors: 0 },
    facultyToday: [],
    visitorsToday: [],
  });
  const [loading, setLoading] = useState(false);
  const scannedEntriesRef = useRef(new Set());
  const speechTimeoutRef = useRef(null);

  // Camera capture modal state
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [pendingIntern, setPendingIntern] = useState(null);
  const [pendingScanData, setPendingScanData] = useState(null);
  const [isCameraSaving, setIsCameraSaving] = useState(false);

  // Open manual search modal
  const openManualSearchModal = () => {
    setShowManualSearchModal(true);
  };

  // Close manual search modal
  const closeManualSearchModal = () => {
    setShowManualSearchModal(false);
  };

  // Handle intern selection from manual search modal
  const handleManualInternSelect = async (intern) => {
    setLoading(true);
    const personName = `${intern.first_name} ${intern.last_name}`;

    try {
      // Check if intern can record attendance
      const checkResult = await checkInternAttendanceStatus(intern.id);
      if (checkResult && !checkResult.canRecord) {
        // Show the same toast card overlay as QR scan for completed attendance
        setScannedData({
          originalData: intern.id,
          message: `Attendance is already completed for ${personName}`,
          isValid: false,
          personType: "completed",
          personName: personName,
        });

        // Cancel any previous speech before starting new one
        cancelPreviousSpeech();

        // Speak the message
        speechTimeoutRef.current = setTimeout(() => {
          speak("Attendance Already completed", {
            rate: 0.8,
            pitch: 1,
            volume: 5,
          });
        }, 500);

        // Clear after 5 seconds
        setTimeout(() => {
          setScannedData("");
        }, 5000);

        setShowManualSearchModal(false);
        return;
      }

      // Show camera capture modal for manual entry
      setPendingIntern({
        id: intern.id,
        name: personName,
      });
      setPendingScanData({
        originalData: intern.id,
        personName,
        personType: "intern",
        isManual: true,
      });
      setShowCameraModal(true);
      setShowManualSearchModal(false);
    } catch (error) {
      console.error("Manual attendance error:", error);

      // Show error toast card overlay
      setScannedData({
        originalData: intern.id,
        message: error.message || "Failed to process attendance",
        isValid: false,
        personType: "error",
        personName: personName,
      });

      // Cancel any previous speech before starting new one
      cancelPreviousSpeech();

      // Speak the message
      speechTimeoutRef.current = setTimeout(() => {
        speak("Attendance Unsuccessful", {
          rate: 0.8,
          pitch: 1,
          volume: 5,
        });
      }, 500);

      // Clear after 5 seconds
      setTimeout(() => {
        setScannedData("");
      }, 5000);

      setShowManualSearchModal(false);
    } finally {
      setLoading(false);
    }
  };

  // Cancel any ongoing speech synthesis
  const cancelPreviousSpeech = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (speechTimeoutRef.current) {
      clearTimeout(speechTimeoutRef.current);
      speechTimeoutRef.current = null;
    }
  };

  // Fetch attendance data from backend
  const fetchAttendanceData = async () => {
    setLoading(true);
    try {
      // Fetch today's statistics
      const [internResponse, visitorResponse] = await Promise.all([
        axiosInstance.get("/intern-attendance/today/all"),
        axiosInstance.get("/visitor-attendance/today/all"),
      ]);

      const internData = internResponse.data.success
        ? internResponse.data.data
        : [];
      const visitorData = visitorResponse.data.success
        ? visitorResponse.data.data
        : [];

      setAttendanceData({
        todayStats: {
          total: internData.length + visitorData.length,
          faculty: internData.length,
          visitors: visitorData.length,
        },
        weeklyStats: { visitors: visitorData.length }, // Will be updated with real weekly stats
        monthlyStats: { visitors: visitorData.length }, // Will be updated with real monthly stats
        yearlyStats: { visitors: visitorData.length }, // Will be updated with real yearly stats
        facultyToday: internData,
        visitorsToday: visitorData,
      });
    } catch (error) {
      console.error("Error fetching attendance data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Clear scanned entries on mount (refresh clears data)
  useEffect(() => {
    localStorage.removeItem("scannedEntries");
    scannedEntriesRef.current = new Set();
  }, []);

  // Save scanned entries to localStorage
  const saveEntries = (entries) => {
    localStorage.setItem("scannedEntries", JSON.stringify([...entries]));
  };

  useEffect(() => {
    fetchAttendanceData();
    const interval = setInterval(fetchAttendanceData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchAttendanceData();
      document.body.style.overflow = "hidden";
      const style = document.createElement("style");
      style.textContent = `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `;
      document.head.appendChild(style);
    } else {
      document.body.style.overflow = "unset";
      setScannedData("");
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleQRScan = async (data) => {
    setScannedData(data);
    console.log("Scanned Data:", data);

    let message = "";
    let isValid = false;
    let personType = "";
    let personName = null;

    try {
      // Parse QR code data to get the ID and determine type
      let id = data;
      let searchType = null;

      if (data.toLowerCase().startsWith("intern_id:")) {
        id = data.replace(/^[^:]+:/i, ""); // Remove everything before and including first colon
        searchType = "intern";
      } else {
        // If no prefix, assume it's a raw intern ID (alphanumeric like I4BKC2RN)
        searchType = "intern";
      }

      // Search in the appropriate table based on QR code prefix
      const personFound = await searchPersonInTables(id, searchType);

      if (personFound.type !== "not_found") {
        personName =
          personFound.data.first_name + " " + personFound.data.last_name;
      }

      if (personFound.type === "intern") {
        // For interns: verify first, then show camera capture modal
        // Check if intern already has complete attendance
        const checkResult = await checkInternAttendanceStatus(id);
        if (checkResult && !checkResult.canRecord) {
          throw new Error(
            checkResult.message || "Attendance already completed",
          );
        }

        // Show camera capture modal
        setPendingIntern({ id, name: personName });
        setPendingScanData({
          originalData: data,
          personName,
          personType: "intern",
        });
        setShowCameraModal(true);
        return; // Don't show overlay yet, wait for photo capture
      } else {
        // ID not found in either table
        message = "Unknown QR Code ID";
        isValid = false;
        personType = "not_found";
      }
    } catch (error) {
      console.error("Attendance error:", error);
      const errorMsg = error.message || "";
      if (
        errorMsg.includes("already has complete attendance") ||
        errorMsg.includes("Attendance already completed")
      ) {
        const personDisplayName = personName || data;
        message = `Attendance is already completed for ${personDisplayName}`;
        personType = "completed";
      } else {
        message = "Unknown QR Code ID";
        personType = "error";
      }
      isValid = false;
    }

    // Track scanned entry to prevent duplicates
    const scanKey = `${data}_${new Date().toDateString()}`;
    if (isValid && !scannedEntriesRef.current.has(scanKey)) {
      scannedEntriesRef.current.add(scanKey);
      saveEntries(scannedEntriesRef.current);
    }

    // Store scan result for overlay display
    setScannedData({
      originalData: data,
      message,
      isValid,
      personType,
      personName: personName,
    });

    // Cancel any previous speech before starting new one
    cancelPreviousSpeech();

    // Speak the message with half second delay
    let speakMessage = message;
    if (isValid) {
      speakMessage = "Attendance Saved. Thank You very much";
    } else if (personType === "completed") {
      speakMessage = "Attendance Already completed";
    } else if (personType === "not_found" || personType === "error") {
      speakMessage = "Attendance Unsuccessful. Please Register";
    }

    speechTimeoutRef.current = setTimeout(() => {
      speak(speakMessage, {
        rate: 0.8,
        pitch: 1,
        volume: 5,
      });
    }, 500);

    setTimeout(() => {
      setScannedData("");
    }, 5000);

    // Refresh attendance data after recording
    if (isValid) {
      setTimeout(() => {
        fetchAttendanceData();
      }, 1000);
    }
  };

  // Check if intern can record attendance (not already completed)
  const checkInternAttendanceStatus = async (internId) => {
    try {
      const response = await axiosInstance.get(`/intern/${internId}`);
      if (!response.data.success || !response.data.data) {
        return { canRecord: false, message: "Intern not found" };
      }

      const intern = response.data.data;
      const internName = `${intern.first_name} ${intern.last_name}`;

      // Check today's attendance
      const today = new Date().toISOString().slice(0, 10);
      const attendanceRes = await axiosInstance.get(
        "/intern-attendance/today/all",
      );

      if (attendanceRes.data.success) {
        const todayRecords = attendanceRes.data.data.filter(
          (record) =>
            record.intern_name === internName &&
            record.am_in &&
            record.am_out &&
            record.pm_in &&
            record.pm_out,
        );

        if (todayRecords.length > 0) {
          return { canRecord: false, message: "Attendance already completed" };
        }
      }

      return { canRecord: true };
    } catch (error) {
      console.error("Error checking attendance status:", error);
      return { canRecord: false, message: "Failed to check attendance status" };
    }
  };

  // Handle save from camera capture modal
  const handleCameraSave = async (capturedImage) => {
    if (!pendingIntern) return;

    setIsCameraSaving(true);

    let message = "";
    let isValid = false;

    try {
      // Now save attendance with the captured image
      const result = await handleInternAttendance(
        pendingIntern.id,
        capturedImage,
      );
      if (result && !result.success) {
        throw new Error(result.message);
      }

      message = "Attendance saved successfully";
      isValid = true;

      // Show success overlay
      setScannedData({
        originalData: pendingScanData?.originalData,
        message,
        isValid: true,
        personType: "intern",
        personName: pendingIntern.name,
      });
    } catch (error) {
      console.error("Attendance save error:", error);
      message = error.message || "Failed to save attendance";
      isValid = false;

      setScannedData({
        originalData: pendingScanData?.originalData,
        message,
        isValid: false,
        personType: "error",
        personName: pendingIntern.name,
      });
    } finally {
      setIsCameraSaving(false);
      setShowCameraModal(false);
    }

    // Track and speak
    if (isValid) {
      const scanKey = `${pendingScanData?.originalData}_${new Date().toDateString()}`;
      scannedEntriesRef.current.add(scanKey);
      saveEntries(scannedEntriesRef.current);
    }

    cancelPreviousSpeech();
    speechTimeoutRef.current = setTimeout(() => {
      speak(
        isValid
          ? "Attendance Saved. Thank You very much"
          : "Attendance Unsuccessful",
        {
          rate: 0.8,
          pitch: 1,
          volume: 5,
        },
      );
    }, 500);

    setTimeout(() => {
      setScannedData("");
      setPendingIntern(null);
      setPendingScanData(null);
    }, 5000);

    if (isValid) {
      setTimeout(() => fetchAttendanceData(), 1000);
    }
  };

  // Handle retry from camera capture modal
  const handleCameraRetry = () => {
    // Modal will handle retry internally, just reset pending
    console.log("Retrying photo capture for:", pendingIntern?.name);
  };

  // Search for person in intern table only
  const searchPersonInTables = async (id, searchType = null) => {
    try {
      // Only search intern table for QR scans
      if (searchType === "intern") {
        const internResponse = await axiosInstance.get(`/intern/${id}`);
        if (internResponse.data.success && internResponse.data.data) {
          return { type: "intern", data: internResponse.data.data };
        }
      }

      // Not found
      return { type: "not_found", data: null };
    } catch (error) {
      console.error("Error searching for intern:", error);
      return { type: "not_found", data: null };
    }
  };

  // Handle intern attendance (AM/PM in/out) with image
  const handleInternAttendance = async (internId, photo) => {
    try {
      const response = await axiosInstance.post("/intern-attendance/record", {
        intern_id: internId,
        photo: photo, // Base64 image
      });

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to record attendance");
      }

      console.log("Intern attendance recorded:", response.data);
      return { success: true };
    } catch (error) {
      console.error("Intern attendance error:", error);
      return {
        success: false,
        message: error.response?.data?.message || error.message,
      };
    }
  };

  // Handle visitor attendance (single time in/out per day) - NO image for visitors
  const handleVisitorAttendance = async (visitorId) => {
    try {
      const response = await axiosInstance.post("/visitor-attendance/record", {
        visitor_id: visitorId,
        // No photo for visitors
      });

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to record attendance");
      }

      console.log("Visitor attendance recorded:", response.data);

      // Dispatch notification event for visitor attendance
      if (response.data.data) {
        window.dispatchEvent(
          new CustomEvent("add-notification", {
            detail: {
              type: "visitor",
              title: "New Visitor Today",
              message: `${response.data.data.visitor_name || "A visitor"} checked in.`,
            },
          }),
        );
      }
    } catch (error) {
      console.error("Visitor attendance error:", error);
      // Don't throw error here, let the main handleQRScan handle it
      return {
        success: false,
        message: error.response?.data?.message || error.message,
      };
    }
  };

  // Handle visitor form submission (manual entry without QR)
  const handleVisitorFormSubmit = async (e) => {
    e.preventDefault();

    if (!visitorForm.visitor_name.trim()) {
      toast.error("Please enter visitor name");
      return;
    }

    setLoading(true);
    try {
      const now = new Date();
      const timeIn = now.toTimeString().slice(0, 8); // HH:MM:SS format

      const response = await axiosInstance.post("/visitor-attendance", {
        visitor_name: visitorForm.visitor_name,
        time_in: timeIn,
        purpose: visitorForm.purpose,
        address: visitorForm.address,
        company_name: visitorForm.company_name,
        date: new Date().toISOString().slice(0, 10), // YYYY-MM-DD
      });

      if (response.data.success) {
        // Reset form
        setVisitorForm({
          visitor_name: "",
          purpose: "",
          address: "",
          company_name: "",
        });
        // Refresh data
        fetchAttendanceData();
        // Show success message
        toast.success("Visitor attendance recorded successfully!");

        // Dispatch notification event
        window.dispatchEvent(
          new CustomEvent("add-notification", {
            detail: {
              type: "visitor",
              title: "New Visitor Today",
              message: `${response.data.data?.visitor_name || visitorForm.visitor_name} checked in.`,
            },
          }),
        );
      }
    } catch (error) {
      console.error("Error recording visitor:", error);
      toast.error("Failed to record visitor attendance");
    } finally {
      setLoading(false);
    }
  };

  // Generate random alphanumeric visitor ID (e.g., V8X2K9M1)
  const generateVisitorId = () => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const length = 8;
    let result = "V";
    for (let i = 0; i < length - 1; i++) {
      result += characters.charAt(
        Math.floor(Math.random() * characters.length),
      );
    }
    return result;
  };

  // Handle register button click
  const handleRegisterClick = () => {
    const visitorId = generateVisitorId();
    setNewlyRegisteredVisitor({ visitorId });
    setShowRegisterUser(true);
  };

  // Handle visitor registration completion
  const handleRegister = (formData) => {
    const visitorData = {
      ...formData,
      visitor_id: formData.visitorId,
      firstname: formData.firstName,
      lastname: formData.lastName,
      status: "Active",
    };
    setNewlyRegisteredVisitor(visitorData);
    setShowSummary(true);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (date) => {
    return date
      .toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })
      .toUpperCase();
  };

  // Helper function to convert 24-hour time to 12-hour format
  const to12HourFormat = (time24) => {
    if (!time24) return "--";
    const [hours, minutes] = time24.split(":");
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 || 12;
    return `${h12}:${minutes} ${ampm}`;
  };

  // Helper function to get initials
  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Helper function to format time with AM/PM
  const formatTimeWithPeriod = (timeString) => {
    if (!timeString || timeString === "--") return "--";

    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours);
    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;

    return `${displayHour.toString().padStart(2, "0")}:${minutes.padStart(2, "0")} ${period}`;
  };

  // Helper function to get current time with AM/PM
  const getCurrentTimeWithPeriod = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const period = hours >= 12 ? "PM" : "AM";
    const displayHour = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;

    return `${displayHour.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")} ${period}`;
  };
  const getAvatarColor = (index) => {
    const colors = [
      "bg-[#188b3e]",
      "bg-purple-500",
      "bg-orange-500",
      "bg-green-500",
      "bg-red-500",
      "bg-indigo-500",
    ];
    return colors[index % colors.length];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-50 z-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-none flex items-center justify-between p-4 md:p-3 border-b border-gray-200 bg-white shadow-sm z-10">
        <div className="flex items-center gap-4 text-sm md:text-xl font-bold tracking-tight text-gray-700">
          <div className="flex items-center gap-2">
            <FiCalendar className="text-[#188b3e]" />
            <span className="uppercase tracking-widest text-[10px] md:text-sm">
              {formatDate(currentTime)}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4 md:gap-6">
          <div className="flex items-center gap-2 font-bold text-gray-700">
            <FiClock className="text-[#188b3e]" />
            <span className="tabular-nums uppercase tracking-widest text-[10px] md:text-sm">
              {formatTime(currentTime)}
            </span>
          </div>
          <Btn_X
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          />
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex-none flex border-b border-gray-200 bg-white">
        <button
          onClick={() => setActiveTab("faculty")}
          className={`flex-1 py-3 px-4 text-xs font-black uppercase tracking-widest transition-colors ${
            activeTab === "faculty"
              ? "bg-[#188b3e] text-white"
              : "bg-gray-50 text-gray-600 hover:bg-gray-100"
          }`}
        >
          Intern
        </button>
        <button
          onClick={() => setActiveTab("visitors")}
          className={`flex-1 py-3 px-4 text-xs font-black uppercase tracking-widest transition-colors ${
            activeTab === "visitors"
              ? "bg-orange-600 text-white"
              : "bg-gray-50 text-gray-600 hover:bg-gray-100"
          }`}
        >
          Visitor
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto hide-scrollbar bg-gray-50">
        <div className="flex flex-col lg:flex-row p-4 md:p-8 gap-6 md:gap-8 max-w-[1600px] mx-auto w-full">
          {/* Visitor Form or QR Scanner */}
          <div className="lg:w-5/12 w-full flex flex-col items-center">
            {activeTab === "visitors" ? (
              /* Visitor Form - No QR for visitors */
              <div className="w-full max-w-md bg-white rounded-2xl p-6 border border-gray-200 shadow-xl">
                <h3 className="text-lg font-black text-gray-800 uppercase tracking-widest mb-4">
                  Visitor Attendance
                </h3>
                <form onSubmit={handleVisitorFormSubmit} className="space-y-4">
                  <Input_Text
                    label="Name *"
                    id="visitor_name"
                    name="visitor_name"
                    placeholder="Enter visitor name"
                    value={visitorForm.visitor_name}
                    onChange={(e) =>
                      setVisitorForm({
                        ...visitorForm,
                        visitor_name: e.target.value,
                      })
                    }
                    required
                  />
                  <Input_Text
                    label="Purpose"
                    id="purpose"
                    name="purpose"
                    placeholder="Enter purpose of visit"
                    value={visitorForm.purpose}
                    onChange={(e) =>
                      setVisitorForm({
                        ...visitorForm,
                        purpose: e.target.value,
                      })
                    }
                  />
                  <Input_Text
                    label="Address"
                    id="address"
                    name="address"
                    placeholder="Enter address"
                    value={visitorForm.address}
                    onChange={(e) =>
                      setVisitorForm({
                        ...visitorForm,
                        address: e.target.value,
                      })
                    }
                  />
                  <Input_Text
                    label="Company Name"
                    id="company_name"
                    name="company_name"
                    placeholder="Enter company name"
                    value={visitorForm.company_name}
                    onChange={(e) =>
                      setVisitorForm({
                        ...visitorForm,
                        company_name: e.target.value,
                      })
                    }
                  />
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 bg-orange-600 text-white font-bold uppercase tracking-widest rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
                    >
                      {loading ? "Recording..." : "Record Attendance"}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              /* QR Scanner - Only for interns */
              <>
                {/* Register User Link Button - Above QR Scanner */}
                <button
                  onClick={handleRegisterClick}
                  className="mb-4 flex items-center gap-2 text-[#188b3e] font-bold hover:underline underline-offset-4 transition-all text-sm"
                >
                  <FiUserPlus size={16} />
                  Register New Intern
                </button>
                <div className="relative group w-full max-w-md">
                  <div className="aspect-square w-full rounded-2xl overflow-hidden bg-[#1a2b4b] shadow-xl flex items-center justify-center p-2 sm:p-4 border border-gray-300">
                    <div className="relative w-full h-full rounded-xl overflow-hidden">
                      <QRScanner
                        onScanComplete={handleQRScan}
                        onManualSearch={openManualSearchModal}
                        className="w-full h-full"
                        isOpen={isOpen}
                        disabled={
                          showRegisterUser ||
                          showSummary ||
                          showCameraModal ||
                          showManualSearchModal ||
                          isCameraSaving ||
                          (scannedData && typeof scannedData === "object")
                        }
                      />
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 bg-[#188b3e]/20 rounded-full mix-blend-screen filter blur-xl animate-pulse-slow"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Statistics */}
          <div className="lg:w-7/12 w-full space-y-4">
            {/* Total Today - Shows based on active tab */}
            <div className="bg-white rounded-xl p-4 sm:p-6 border-2 border-gray-200 shadow-xl">
              <h2 className="text-xs uppercase tracking-[0.2em] text-gray-600 font-black mb-3">
                {activeTab === "faculty"
                  ? "TOTAL INTERNS TODAY"
                  : "TOTAL VISITORS TODAY"}
              </h2>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span
                      className="text-3xl sm:text-4xl font-black tracking-tighter"
                      style={{
                        color: activeTab === "faculty" ? "#188b3e" : "#ea580c",
                      }}
                    >
                      {activeTab === "faculty"
                        ? attendanceData.todayStats.faculty
                        : attendanceData.todayStats.visitors}
                    </span>
                    <span className="text-gray-500 font-bold text-xs uppercase tracking-widest">
                      Active Records
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Grid - Shows based on active tab */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-[10px] uppercase tracking-widest text-gray-500 font-black">
                    THIS WEEK
                  </h2>
                  <span
                    className="text-[8px] px-1.5 py-0.5 rounded font-bold uppercase tracking-tighter"
                    style={{
                      backgroundColor:
                        activeTab === "faculty" ? "#dcfce7" : "#ffedd5",
                      color: activeTab === "faculty" ? "#188b3e" : "#ea580c",
                    }}
                  >
                    {activeTab === "faculty" ? "Intern" : "Visitor"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <FiUsers
                    style={{
                      color: activeTab === "faculty" ? "#188b3e" : "#ea580c",
                    }}
                  />
                  <span className="text-xl font-black text-gray-800 tracking-tight">
                    {activeTab === "faculty"
                      ? attendanceData.todayStats.faculty
                      : attendanceData.weeklyStats.visitors}
                  </span>
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-[10px] uppercase tracking-widest text-gray-500 font-black">
                    THIS MONTH
                  </h2>
                  <span
                    className="text-[8px] px-1.5 py-0.5 rounded font-bold uppercase tracking-tighter"
                    style={{
                      backgroundColor:
                        activeTab === "faculty" ? "#dcfce7" : "#ffedd5",
                      color: activeTab === "faculty" ? "#188b3e" : "#ea580c",
                    }}
                  >
                    {activeTab === "faculty" ? "Intern" : "Visitor"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <FiUsers
                    style={{
                      color: activeTab === "faculty" ? "#188b3e" : "#ea580c",
                    }}
                  />
                  <span className="text-xl font-black text-gray-800 tracking-tight">
                    {activeTab === "faculty"
                      ? attendanceData.todayStats.faculty
                      : attendanceData.monthlyStats.visitors}
                  </span>
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-[10px] uppercase tracking-widest text-gray-500 font-black">
                    YEARLY TOTAL
                  </h2>
                  <span
                    className="text-[8px] px-1.5 py-0.5 rounded font-bold uppercase tracking-tighter"
                    style={{
                      backgroundColor:
                        activeTab === "faculty" ? "#dcfce7" : "#ffedd5",
                      color: activeTab === "faculty" ? "#188b3e" : "#ea580c",
                    }}
                  >
                    {activeTab === "faculty" ? "Intern" : "Visitor"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <FiUsers
                    style={{
                      color: activeTab === "faculty" ? "#188b3e" : "#ea580c",
                    }}
                  />
                  <span className="text-xl font-black text-gray-800 tracking-tight">
                    {activeTab === "faculty"
                      ? attendanceData.todayStats.faculty
                      : attendanceData.yearlyStats.visitors}
                  </span>
                </div>
              </div>
            </div>

            {/* Attendance List - Shows based on active tab */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-4">
                {activeTab === "faculty" ? (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xs uppercase tracking-widest text-gray-600 font-black">
                        Recent Attendance - Interns
                      </h2>
                      <span className="text-[10px] text-gray-500 font-medium">
                        {formatDate(currentTime)}
                      </span>
                    </div>
                    <div className="grid grid-cols-[1fr_60px_60px_60px_60px] gap-2 text-[10px] text-gray-500 font-medium mb-2 px-2">
                      <div>Name</div>
                      <div className="text-center">AM In</div>
                      <div className="text-center">AM Out</div>
                      <div className="text-center">PM In</div>
                      <div className="text-center">PM Out</div>
                    </div>
                    <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                      {attendanceData.facultyToday.length > 0 ? (
                        attendanceData.facultyToday.map((intern, index) => (
                          <div
                            key={intern.id}
                            className="grid grid-cols-[1fr_60px_60px_60px_60px] gap-2 items-center p-2 hover:bg-gray-50 rounded-lg transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <div className="relative">
                                <div
                                  className={`w-8 h-8 rounded-full ${getAvatarColor(index)} flex items-center justify-center text-white font-bold text-xs`}
                                >
                                  {getInitials(intern.intern_name)}
                                </div>
                                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></span>
                              </div>
                              <div>
                                <p className="text-sm font-bold text-gray-800 leading-tight">
                                  {intern.intern_name}
                                </p>
                                <p className="text-[9px] text-gray-500">
                                  Intern
                                </p>
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-xs text-gray-700">
                                {to12HourFormat(intern.am_in)}
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-xs text-gray-700">
                                {to12HourFormat(intern.am_out)}
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-xs text-gray-700">
                                {to12HourFormat(intern.pm_in)}
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-xs text-gray-700">
                                {to12HourFormat(intern.pm_out)}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-4 text-gray-400 text-sm">
                          No intern records today
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xs uppercase tracking-widest text-gray-600 font-black">
                        Recent Attendance - Visitors
                      </h2>
                      <span className="text-[10px] text-gray-500 font-medium">
                        {formatDate(currentTime)}
                      </span>
                    </div>
                    <div className="grid grid-cols-[1fr_80px_80px] gap-2 text-[10px] text-gray-500 font-medium mb-2 px-2">
                      <div>Name</div>
                      <div className="text-center">Time In</div>
                      <div className="text-center">Purpose</div>
                    </div>
                    <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                      {attendanceData.visitorsToday.length > 0 ? (
                        attendanceData.visitorsToday.map((visitor, index) => (
                          <div
                            key={visitor.id}
                            className="grid grid-cols-[1fr_80px_80px] gap-2 items-center p-2 hover:bg-gray-50 rounded-lg transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <div className="relative">
                                <div
                                  className={`w-8 h-8 rounded-full ${getAvatarColor(index)} flex items-center justify-center text-white font-bold text-xs`}
                                >
                                  {getInitials(visitor.visitor_name)}
                                </div>
                                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></span>
                              </div>
                              <div>
                                <p className="text-sm font-bold text-gray-800 leading-tight">
                                  {visitor.visitor_name}
                                </p>
                                <p className="text-[9px] text-gray-500">
                                  Visitor
                                </p>
                              </div>
                            </div>
                            <div className="text-center text-xs text-gray-700">
                              {formatTimeWithPeriod(visitor.time_in)}
                            </div>
                            <div className="text-center text-xs text-gray-700 truncate">
                              {visitor.purpose || "--"}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-4 text-gray-400 text-sm">
                          No visitor records today
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scanned Data Overlay */}
      {scannedData && typeof scannedData === "object" && (
        <div
          className={`fixed bottom-0 left-0 right-0 p-4 md:p-8 border-t shadow-2xl z-50 animate-in fade-in slide-in-from-bottom duration-500 ${
            scannedData.isValid
              ? scannedData.personType === "faculty"
                ? "bg-green-600 border-green-400"
                : "bg-green-600 border-green-400"
              : scannedData.personType === "completed"
                ? "bg-orange-500 border-orange-300"
                : "bg-red-600 border-red-400"
          }`}
        >
          <div className="max-w-md mx-auto text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-white rounded-full mb-2 md:mb-4 shadow-lg">
              {scannedData.personType === "faculty" ? (
                <FiUsers className="w-6 h-6 md:w-8 md:h-8 text-green-600" />
              ) : scannedData.personType === "visitor" ? (
                <FiUsers className="w-6 h-6 md:w-8 md:h-8 text-green-600" />
              ) : scannedData.personType === "completed" ? (
                <FiAlertCircle className="w-6 h-6 md:w-8 md:h-8 text-orange-500" />
              ) : (
                <FiUserPlus className="w-6 h-6 md:w-8 md:h-8 text-red-600" />
              )}
            </div>
            <h3 className="text-xl md:text-3xl font-black text-white mb-1 md:mb-2 tracking-tight uppercase">
              {scannedData.isValid
                ? "Welcome!"
                : scannedData.personType === "completed"
                  ? "Warning"
                  : "Please Register"}
            </h3>
            <div className="bg-white/10 backdrop-blur-md rounded-xl md:rounded-2xl p-4 md:p-6 border border-white/20">
              <p className="text-white text-lg md:text-2xl font-bold tracking-wide break-words">
                {scannedData.isValid
                  ? scannedData.personName || scannedData.originalData
                  : scannedData.personName || scannedData.originalData}
              </p>
              <div className="mt-2 md:mt-4 flex items-center justify-center gap-2 text-white/80 font-medium uppercase tracking-widest text-[10px] md:text-xs">
                {scannedData.isValid ? (
                  <>
                    <FiClock className="animate-pulse" />
                    <span>
                      {scannedData.personType === "faculty"
                        ? "Intern Attendance Recorded"
                        : "Visitor Attendance Recorded"}
                    </span>
                  </>
                ) : scannedData.personType === "not_found" ||
                  scannedData.personType === "error" ? (
                  <div className="flex flex-col items-center gap-2">
                    <span>{scannedData.message}</span>
                    <button
                      onClick={() => setShowRegisterUser(true)}
                      className="px-4 py-2 bg-white text-red-600 rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-gray-100 transition-colors"
                    >
                      Please Register
                    </button>
                  </div>
                ) : (
                  <span>{scannedData.message}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <RegisterUserModal
        isOpen={showRegisterUser}
        onClose={() => setShowRegisterUser(false)}
        initialData={newlyRegisteredVisitor}
        onRegister={handleRegister}
      />

      <CameraCaptureModal
        isOpen={showCameraModal}
        internName={pendingIntern?.name || ""}
        onSave={handleCameraSave}
        onRetry={handleCameraRetry}
        isLoading={isCameraSaving}
      />

      <SummaryModal
        isOpen={showSummary}
        onClose={() => {
          setShowSummary(false);
          setNewlyRegisteredVisitor(null);
        }}
        data={newlyRegisteredVisitor}
        autoCloseSeconds={30}
      />

      {/* Manual Intern Search Modal */}
      <ManualInternSearchModal
        isOpen={showManualSearchModal}
        onClose={closeManualSearchModal}
        onSelectIntern={handleManualInternSelect}
        loading={loading}
      />
    </div>
  );
};

export default AttendanceModal;
