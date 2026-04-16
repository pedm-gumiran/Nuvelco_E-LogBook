import React, { useState, useEffect, useCallback } from "react";
import {
  FiUsers,
  FiUserPlus,
  FiDownload,
  FiTrash2,
  FiEye,
  FiRotateCcw,
  FiCalendar,
  FiRefreshCw,
  FiX,
  FiLoader,
  FiFileText,
} from "react-icons/fi";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { toast } from "react-toastify";
import axios from "../../api/axios.js";
import DateTimeHeader from "../../components/Dashboard_Components/DateTimeHeader.jsx";
import Card from "../../components/Cards/Card.jsx";
import SearchBar from "../../components/Input_Fields/SearchBar.jsx";
import DataTable from "../../components/DataTables/DataTable.jsx";
import Button from "../../components/Buttons/Button.jsx";
import Btn_X from "../../components/Buttons/Btn_X.jsx";
import ExportFilenameModal from "../../components/Modals/ExportFilenameModal.jsx";
import DeleteConfirmationModal from "../../components/Modals/DeleteConfirmationModal.jsx";
import ViewAttendanceModal from "../../components/Modals/ViewAttendanceModal.jsx";
import ViewModal from "../../components/Modals/ViewModal.jsx";
import PreviewDtrModal from "../../components/Modals/PreviewDtrModal.jsx";
import SchoolView from "../../components/Modals/SchoolView.jsx";
import CourseView from "../../components/Modals/CourseView.jsx";
import InternAttendanceModal from "../../components/Modals/InternAttendanceModal.jsx";
import CertificateOfAppearanceModal from "../../components/Modals/CertificateOfAppearanceModal.jsx";
import { formatDate } from "../../components/utility/dateFormatter.js";

export default function Home_Page() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [internAttendance, setInternAttendance] = useState([]);
  const [visitorAttendance, setVisitorAttendance] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(-1);
  const [selectedDay, setSelectedDay] = useState("All");
  const [selectedYear, setSelectedYear] = useState(-1);
  const [selectedSchool, setSelectedSchool] = useState("All");
  const [selectedCourse, setSelectedCourse] = useState("All");
  const [schoolsList, setSchoolsList] = useState([]);
  const [coursesList, setCoursesList] = useState([]);
  const [todayInternCount, setTodayInternCount] = useState(0);
  const [todayVisitorCount, setTodayVisitorCount] = useState(0);
  const allDays = Array.from({ length: 31 }, (_, i) => i + 1);
  const allYears = Array.from({ length: 11 }, (_, i) => 2020 + i);
  const [activeTab, setActiveTab] = useState("intern");

  const parseLocalDate = (dateStr) => {
    if (!dateStr || typeof dateStr !== "string") return null;
    // Handle both "2026-04-07 08:24:08" and "2026-04-07T08:24:08.000Z" formats
    const datePart = dateStr.split(/[ T]/)[0];
    const [year, month, day] = datePart.split("-").map(Number);
    if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
    return new Date(year, month - 1, day);
  };

  const actualDaysWithData = [
    ...new Set(
      (activeTab === "intern" ? internAttendance : visitorAttendance)
        .filter((record) => {
          const recordDate = parseLocalDate(record.date);
          const matchesMonth =
            selectedMonth === -1 ||
            (recordDate ? recordDate.getMonth() === selectedMonth : false);
          const matchesYear =
            selectedYear === -1 ||
            (recordDate ? recordDate.getFullYear() === selectedYear : false);
          return matchesMonth && matchesYear;
        })
        .map((record) => {
          const d = parseLocalDate(record.date);
          return d ? d.getDate() : null;
        })
        .filter((day) => day !== null)
        .sort((a, b) => a - b),
    ),
  ];

  const dataYears = [
    ...new Set(
      (activeTab === "intern" ? internAttendance : visitorAttendance)
        .map((record) => {
          const d = parseLocalDate(record.date);
          const year = d ? d.getFullYear() : null;
          return year && !isNaN(year) ? year : null;
        })
        .filter((year) => year !== null),
    ),
  ];

  const actualYearsWithData =
    dataYears.length > 0
      ? dataYears.sort((a, b) => a - b)
      : [new Date().getFullYear()];

  const fetchSchoolsAndCourses = async () => {
    try {
      const [schoolsResponse, coursesResponse] = await Promise.all([
        axios.get("/school"),
        axios.get("/course"),
      ]);
      if (schoolsResponse.data.success) {
        setSchoolsList(schoolsResponse.data.data);
      }
      if (coursesResponse.data.success) {
        setCoursesList(coursesResponse.data.data);
      }
    } catch (err) {
      console.error("Error fetching schools/courses:", err);
    }
  };

  useEffect(() => {
    fetchSchoolsAndCourses();
  }, []);

  const [selectedRows, setSelectedRows] = useState([]);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isVisitorViewModalOpen, setIsVisitorViewModalOpen] = useState(false);
  const [isPreviewDtrModalOpen, setIsPreviewDtrModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isResetExportModalOpen, setIsResetExportModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null);
  const [internViewLevel, setInternViewLevel] = useState("schools");
  const [selectedInternSchool, setSelectedInternSchool] = useState(null);
  const [selectedInternCourse, setSelectedInternCourse] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false);
  const [certificateVisitorData, setCertificateVisitorData] = useState(null);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [isResetLoading, setIsResetLoading] = useState(false);
  const [isExportLoading, setIsExportLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCourseViewOpen, setIsCourseViewOpen] = useState(false);
  const [isInternAttendanceModalOpen, setIsInternAttendanceModalOpen] =
    useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchTodayCounts = useCallback(async () => {
    try {
      const [internCountRes, visitorCountRes] = await Promise.all([
        axios.get("/intern-attendance/today-count"),
        axios.get("/visitor-attendance/today-count"),
      ]);
      if (internCountRes.data.success) {
        setTodayInternCount(internCountRes.data.count);
      }
      if (visitorCountRes.data.success) {
        setTodayVisitorCount(visitorCountRes.data.count);
      }
    } catch (err) {
      console.error("Error fetching today counts:", err);
    }
  }, []);

  const fetchAttendanceData = useCallback(
    async (showLoading = true) => {
      if (showLoading) {
        setLoading(true);
      } else {
        setIsRefreshing(true);
      }
      setError(null);
      try {
        // Cache-busting timestamp to ensure fresh data
        const timestamp = Date.now();
        const internResponse = await axios.get(
          `/intern-attendance?_t=${timestamp}`,
        );
        if (internResponse.data.success) {
          setInternAttendance(internResponse.data.data);
        }
        const visitorResponse = await axios.get(
          `/visitor-attendance?_t=${timestamp}`,
        );
        if (visitorResponse.data.success) {
          console.log(
            "Visitor data refreshed:",
            visitorResponse.data.data.length,
            "records",
          );
          setVisitorAttendance(visitorResponse.data.data);
        }
        await fetchTodayCounts();
      } catch (err) {
        console.error("Error fetching attendance data:", err);
        setError("Failed to load attendance data");
        if (!showLoading) {
          toast.error("Failed to refresh data");
        }
      } finally {
        if (showLoading) {
          setLoading(false);
        } else {
          setIsRefreshing(false);
        }
      }
    },
    [fetchTodayCounts],
  );

  useEffect(() => {
    fetchAttendanceData();
  }, []);

  // Listen for attendance-recorded event to update counters and refresh tables
  useEffect(() => {
    const handleAttendanceRecorded = () => {
      console.log("Attendance recorded event received - refreshing data");
      fetchTodayCounts();
      // Small delay to ensure database has finished writing
      setTimeout(() => {
        fetchAttendanceData(false); // Refresh all data including weekly/monthly/yearly stats
      }, 500);
    };
    window.addEventListener("attendance-recorded", handleAttendanceRecorded);
    return () => {
      window.removeEventListener(
        "attendance-recorded",
        handleAttendanceRecorded,
      );
    };
  }, [fetchTodayCounts, fetchAttendanceData]);

  // Listen for storage changes (when attendance is recorded from another page/modal)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "attendanceUpdated") {
        fetchTodayCounts();
        fetchAttendanceData(false);
        localStorage.removeItem("attendanceUpdated");
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // Refresh data when page becomes visible (user returns from attendance modal)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        // Check if attendance was updated while away
        const lastUpdate = localStorage.getItem("attendanceUpdated");
        if (lastUpdate) {
          fetchTodayCounts();
          fetchAttendanceData(false);
          localStorage.removeItem("attendanceUpdated");
        }
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    // Check on mount as well
    const lastUpdate = localStorage.getItem("attendanceUpdated");
    if (lastUpdate) {
      fetchTodayCounts();
      fetchAttendanceData(false);
      localStorage.removeItem("attendanceUpdated");
    }
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      const activeElement = document.activeElement;
      if (
        activeElement &&
        activeElement.tagName === "SELECT" &&
        !e.target.closest("select")
      ) {
        activeElement.blur();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const style = document.createElement("style");
    style.setAttribute("data-scrollbar-hide", "true");
    style.textContent = `
      *::-webkit-scrollbar {
        display: none !important;
      }
      * {
        -ms-overflow-style: none !important;
        scrollbar-width: none !important;
      }
      html, body {
        overflow-x: hidden !important;
        scrollbar-width: none !important;
        -ms-overflow-style: none !important;
      }
      .hide-scrollbar::-webkit-scrollbar {
        display: none !important;
      }
      .hide-scrollbar {
        -ms-overflow-style: none !important;
        scrollbar-width: none !important;
      }
    `;
    document.head.appendChild(style);
    return () => {
      const existingStyle = document.querySelector(
        "style[data-scrollbar-hide]",
      );
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, []);

  const to12HourFormat = (time24) => {
    if (!time24) return "";
    const [hours, minutes] = time24.split(":");
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 || 12;
    return `${h12}:${minutes} ${ampm}`;
  };

  const mappedInternData = internAttendance.map((record) => ({
    id: record.id,
    name: record.intern_name || "--",
    school: record.school_name || "--",
    course: record.course_name || "--",
    date: record.date || "--",
    displayDate: formatDate(record.date) || "--",
    amIn: to12HourFormat(record.am_in) || "--",
    amInImage: record.am_in_image,
    amOut: to12HourFormat(record.am_out) || "--",
    amOutImage: record.am_out_image,
    pmIn: to12HourFormat(record.pm_in) || "--",
    pmInImage: record.pm_in_image,
    pmOut: to12HourFormat(record.pm_out) || "--",
    pmOutImage: record.pm_out_image,
  }));

  const mappedVisitorData = visitorAttendance.map((record) => ({
    id: record.id,
    name: record.visitor_name || "--",
    date: record.date || "--",
    displayDate: formatDate(record.date) || "--",
    timeIn: to12HourFormat(record.time_in) || "--",
    purpose: record.purpose || "--",
    address: record.address || "--",
    companyName: record.company_name || "--",
  }));

  const filteredInternData = mappedInternData.filter((record) => {
    const matchesName = record.name
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const recordDate = parseLocalDate(record.date);
    const matchesMonth =
      selectedMonth === -1 ||
      (recordDate ? recordDate.getMonth() === selectedMonth : false);
    const matchesYear =
      selectedYear === -1 ||
      (recordDate ? recordDate.getFullYear() === selectedYear : false);
    const matchesSchool =
      selectedSchool === "All" || record.school === selectedSchool;
    const matchesCourse =
      selectedCourse === "All" || record.course === selectedCourse;
    return (
      matchesName &&
      matchesMonth &&
      matchesYear &&
      matchesSchool &&
      matchesCourse
    );
  });

  const filteredVisitorData = mappedVisitorData.filter((record) => {
    const matchesName = record.name
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
    const recordDate = parseLocalDate(record.date);
    const matchesMonth =
      selectedMonth === -1 ||
      (recordDate ? recordDate.getMonth() === selectedMonth : false);
    const matchesYear =
      selectedYear === -1 ||
      (recordDate ? recordDate.getFullYear() === selectedYear : false);
    const recordDayOfMonth = recordDate ? recordDate.getDate() : null;
    const matchesDay =
      selectedDay === "All" || recordDayOfMonth === parseInt(selectedDay);
    return matchesName && matchesMonth && matchesYear && matchesDay;
  });

  const displayData =
    activeTab === "intern" ? filteredInternData : filteredVisitorData;

  const handleView = (record) => {
    setSelectedRecord(record);
    setIsViewModalOpen(true);
  };

  const getPersonAttendanceRecords = () => {
    if (!selectedRecord) return [];
    if (selectedRecord.allRecords) {
      return selectedRecord.allRecords;
    }
    if (activeTab === "intern") {
      return filteredInternData.filter((r) => r.name === selectedRecord.name);
    } else {
      return filteredVisitorData.filter((r) => r.name === selectedRecord.name);
    }
  };

  const handleDelete = (id) => {
    setRecordToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleteLoading(true);
    try {
      if (recordToDelete) {
        const endpoint =
          activeTab === "intern"
            ? `/intern-attendance/${recordToDelete}`
            : `/visitor-attendance/${recordToDelete}`;
        const response = await axios.delete(endpoint);
        if (response.data.success) {
          if (activeTab === "intern") {
            setInternAttendance((prev) =>
              prev.filter((record) => record.id !== recordToDelete),
            );
          } else {
            setVisitorAttendance((prev) =>
              prev.filter((record) => record.id !== recordToDelete),
            );
          }
          toast.success("Attendance record deleted successfully");
          // Set flag to update counters on homepage
          localStorage.setItem("attendanceUpdated", Date.now().toString());
          // Dispatch event to update counters immediately
          window.dispatchEvent(new CustomEvent("attendance-recorded"));
        }
      }
    } catch (err) {
      console.error("Error deleting record:", err);
      toast.error("Failed to delete attendance record");
    } finally {
      setIsDeleteModalOpen(false);
      setRecordToDelete(null);
      setIsDeleteLoading(false);
    }
  };

  const handleVisitorRefresh = async () => {
    setIsRefreshing(true);
    try {
      const visitorResponse = await axios.get("/visitor-attendance");
      if (visitorResponse.data.success) {
        setVisitorAttendance(visitorResponse.data.data);
        toast.success("Visitor data refreshed successfully");
      }
    } catch (err) {
      console.error("Error refreshing visitor data:", err);
      toast.error("Failed to refresh visitor data");
    } finally {
      setIsRefreshing(false);
      // Reset dropdown filters
      setSelectedMonth(-1);
      setSelectedDay("All");
      setSelectedYear(-1);
    }
  };

  const handleInternRefresh = async () => {
    setIsRefreshing(true);
    try {
      const internResponse = await axios.get("/intern-attendance");
      if (internResponse.data.success) {
        setInternAttendance(internResponse.data.data);
        toast.success("Intern data refreshed successfully");
      }
    } catch (err) {
      console.error("Error refreshing intern data:", err);
      toast.error("Failed to refresh intern data");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    await fetchAttendanceData(false);
    setSelectedDate("");
    toast.success("Data refreshed successfully");
  };

  const handleReset = () => {
    setIsResetModalOpen(true);
  };

  const handleConfirmReset = async () => {
    setIsResetLoading(true);
    try {
      for (const record of internAttendance) {
        await axios.delete(`/intern-attendance/${record.id}`);
      }
      for (const record of visitorAttendance) {
        await axios.delete(`/visitor-attendance/${record.id}`);
      }
      setInternAttendance([]);
      setVisitorAttendance([]);
      toast.success("All attendance records have been reset");
      // Set flag to update counters on homepage
      localStorage.setItem("attendanceUpdated", Date.now().toString());
      // Dispatch event to update counters immediately
      window.dispatchEvent(new CustomEvent("attendance-recorded"));
    } catch (err) {
      console.error("Error clearing attendance data:", err);
      toast.error("Failed to reset attendance records");
    } finally {
      setIsResetModalOpen(false);
      setIsResetLoading(false);
    }
  };

  const handleResetExportConfirm = async (filename) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Attendance Backup");
    worksheet.columns = [
      { header: "ID", key: "id", width: 10 },
      { header: "Name", key: "name", width: 25 },
      { header: "School", key: "school", width: 25 },
      { header: "Course", key: "course", width: 25 },
      { header: "Date", key: "date", width: 15 },
      { header: "AM In", key: "amIn", width: 15 },
      { header: "AM Out", key: "amOut", width: 15 },
      { header: "PM In", key: "pmIn", width: 15 },
      { header: "PM Out", key: "pmOut", width: 15 },
      { header: "Time In", key: "timeIn", width: 15 },
      { header: "Time Out", key: "timeOut", width: 15 },
      { header: "Purpose", key: "purpose", width: 25 },
      { header: "Address", key: "address", width: 25 },
    ];
    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFE0E0E0" },
      };
    });
    mappedInternData.forEach((row) => {
      worksheet.addRow({
        id: row.id,
        name: row.name,
        school: row.school,
        course: row.course,
        date: row.date,
        amIn: row.amIn,
        amOut: row.amOut,
        pmIn: row.pmIn,
        pmOut: row.pmOut,
        timeIn: "",
        timeOut: "",
        purpose: "",
        address: "",
      });
    });
    mappedVisitorData.forEach((row) => {
      worksheet.addRow({
        id: row.id,
        name: row.name,
        school: "",
        course: "",
        date: row.date,
        amIn: "",
        amOut: "",
        pmIn: "",
        pmOut: "",
        timeIn: row.timeIn,
        timeOut: "",
        purpose: row.purpose,
        address: row.address,
      });
    });
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, `${filename}.xlsx`);
    setIsResetExportModalOpen(false);
    toast.success("Attendance data exported successfully");
    setIsResetModalOpen(true);
  };

  const handleSchoolClick = (school) => {
    setSelectedInternSchool(school);
    setIsCourseViewOpen(true);
  };

  const handleCourseClick = (course) => {
    setSelectedInternCourse(course);
    setIsInternAttendanceModalOpen(true);
  };

  const handleCloseCourseView = () => {
    setIsCourseViewOpen(false);
    setSelectedInternSchool(null);
    setSelectedInternCourse(null);
  };

  const getSchoolsWithAttendance = () => {
    // Get unique school names from attendance records (preserved even if school is deleted)
    const uniqueSchoolNames = [
      ...new Set(
        internAttendance.map((record) => record.school_name).filter(Boolean),
      ),
    ];

    // Create school objects from attendance data
    // This preserves attendance visibility even after school deletion
    return uniqueSchoolNames.map((schoolName) => {
      // Try to find matching school in schoolsList for additional data
      const schoolInfo = schoolsList.find((s) => s.school_name === schoolName);
      return {
        id: schoolInfo?.id || null,
        school_name: schoolName,
        created_at: schoolInfo?.created_at || null,
        updated_at: schoolInfo?.updated_at || null,
      };
    });
  };

  const getCoursesForSchool = () => {
    if (!selectedInternSchool) return [];
    const coursesWithData = [
      ...new Set(
        internAttendance
          .filter(
            (record) => record.school_name === selectedInternSchool.school_name,
          )
          .map((record) => record.course_name)
          .filter(Boolean),
      ),
    ];

    // Create course objects from attendance data
    // This preserves attendance visibility even after course deletion
    return coursesWithData.map((courseName) => {
      // Try to find matching course in coursesList for additional data
      const courseInfo = coursesList.find((c) => c.course_name === courseName);
      return {
        id: courseInfo?.id || null,
        course_name: courseName,
        abbreviation: courseInfo?.abbreviation || null,
        school_id: courseInfo?.school_id || null,
        created_at: courseInfo?.created_at || null,
        updated_at: courseInfo?.updated_at || null,
        intern_count: courseInfo?.intern_count || 0,
      };
    });
  };

  const getInternsForCourse = () => {
    if (!selectedInternSchool || !selectedInternCourse) return [];
    return internAttendance.filter(
      (record) =>
        record.school_name === selectedInternSchool.school_name &&
        record.course_name === selectedInternCourse.course_name,
    );
  };

  const handleExport = () => {
    setIsExportModalOpen(true);
  };

  const handleExportConfirm = async (filename) => {
    setIsExportLoading(true);
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Attendance");
      worksheet.columns = [
        { header: "ID", key: "id", width: 10 },
        { header: "Name", key: "name", width: 25 },
        { header: "School", key: "school", width: 25 },
        { header: "Course", key: "course", width: 25 },
        { header: "Date", key: "date", width: 15 },
        { header: "AM In", key: "amIn", width: 15 },
        { header: "AM Out", key: "amOut", width: 15 },
        { header: "PM In", key: "pmIn", width: 15 },
        { header: "PM Out", key: "pmOut", width: 15 },
        { header: "Time In", key: "timeIn", width: 15 },
        { header: "Time Out", key: "timeOut", width: 15 },
        { header: "Purpose", key: "purpose", width: 25 },
        { header: "Address", key: "address", width: 25 },
      ];
      worksheet.getRow(1).eachCell((cell) => {
        cell.font = { bold: true };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFE0E0E0" },
        };
      });
      filteredInternData.forEach((row) => {
        worksheet.addRow({
          id: row.id,
          name: row.name,
          school: row.school,
          course: row.course,
          date: row.date,
          amIn: row.amIn,
          amOut: row.amOut,
          pmIn: row.pmIn,
          pmOut: row.pmOut,
          timeIn: "",
          timeOut: "",
          purpose: "",
          address: "",
        });
      });
      filteredVisitorData.forEach((row) => {
        worksheet.addRow({
          id: row.id,
          name: row.name,
          date: row.date,
          amIn: "",
          amOut: "",
          pmIn: "",
          pmOut: "",
          timeIn: row.timeIn,
          timeOut: "",
          purpose: row.purpose,
          address: row.address,
        });
      });
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      saveAs(blob, `${filename}.xlsx`);
      toast.success("Attendance data exported successfully");
      setIsExportModalOpen(false);
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export attendance data");
    } finally {
      setIsExportLoading(false);
    }
  };

  const internColumns = [
    { key: "name", label: "Name" },
    { key: "school", label: "School" },
    { key: "course", label: "Course" },
    { key: "displayDate", label: "Date" },
    {
      key: "amIn",
      label: "AM In",
      render: (value, row) => (
        <div className="flex items-center gap-2">
          <span>{value}</span>
          {row.amInImage && (
            <button
              onClick={() => handleViewImage(row.amInImage, "AM In")}
              className="text-blue-600 hover:text-blue-800"
              title="View AM In Photo"
            >
              <FiEye className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
    {
      key: "amOut",
      label: "AM Out",
      render: (value, row) => (
        <div className="flex items-center gap-2">
          <span>{value}</span>
          {row.amOutImage && (
            <button
              onClick={() => handleViewImage(row.amOutImage, "AM Out")}
              className="text-blue-600 hover:text-blue-800"
              title="View AM Out Photo"
            >
              <FiEye className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
    {
      key: "pmIn",
      label: "PM In",
      render: (value, row) => (
        <div className="flex items-center gap-2">
          <span>{value}</span>
          {row.pmInImage && (
            <button
              onClick={() => handleViewImage(row.pmInImage, "PM In")}
              className="text-blue-600 hover:text-blue-800"
              title="View PM In Photo"
            >
              <FiEye className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
    {
      key: "pmOut",
      label: "PM Out",
      render: (value, row) => (
        <div className="flex items-center gap-2">
          <span>{value}</span>
          {row.pmOutImage && (
            <button
              onClick={() => handleViewImage(row.pmOutImage, "PM Out")}
              className="text-blue-600 hover:text-blue-800"
              title="View PM Out Photo"
            >
              <FiEye className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  const visitorColumns = [
    { key: "name", label: "Name" },
    { key: "displayDate", label: "Date" },
    { key: "timeIn", label: "Time In" },
    { key: "purpose", label: "Purpose" },
    { key: "address", label: "Address" },
    { key: "companyName", label: "Company Name" },
  ];

  const columns = activeTab === "intern" ? internColumns : visitorColumns;

  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedImageTitle, setSelectedImageTitle] = useState("");

  const handleViewImage = (imageBlob, title) => {
    console.log(
      "handleViewImage input:",
      typeof imageBlob,
      imageBlob ? imageBlob.toString().slice(0, 50) : "null",
    );
    setSelectedImage(imageBlob);
    setSelectedImageTitle(title);
    setIsImageModalOpen(true);
  };

  const blobToBase64 = (blob) => {
    if (!blob) return null;
    if (typeof blob === "string") {
      if (blob.startsWith("data:image/")) return blob;
      if (blob.startsWith("/9j/") || blob.length > 100) {
        return `data:image/jpeg;base64,${blob}`;
      }
      return blob;
    }
    try {
      let uint8Array;
      if (blob.data && Array.isArray(blob.data)) {
        uint8Array = new Uint8Array(blob.data);
      } else if (Array.isArray(blob)) {
        uint8Array = new Uint8Array(blob);
      } else if (blob instanceof Uint8Array) {
        uint8Array = blob;
      } else {
        return null;
      }
      let binary = "";
      uint8Array.forEach((byte) => (binary += String.fromCharCode(byte)));
      if (binary.startsWith("data:image/")) {
        return binary;
      }
      return `data:image/jpeg;base64,${btoa(binary)}`;
    } catch (err) {
      console.error("Error converting blob to base64:", err);
      return null;
    }
  };

  const handleViewVisitor = (record) => {
    setSelectedRecord(record);
    setIsVisitorViewModalOpen(true);
  };

  const handlePreviewDtr = () => {
    setIsPreviewDtrModalOpen(true);
  };

  const handleGenerateCertificate = (record) => {
    setCertificateVisitorData(record);
    setIsCertificateModalOpen(true);
  };

  const handleCloseCertificateModal = () => {
    setIsCertificateModalOpen(false);
    setCertificateVisitorData(null);
  };

  const handleGenerateCertificateConfirm = async (visitorData, template) => {
    // TODO: Implement actual certificate generation with selected template
    toast.info(
      `Generating certificate for ${visitorData.name} using ${template}...`,
    );
    // Add actual certificate generation logic here
    console.log("Generating certificate:", { visitorData, template });
  };

  const renderActions = (row) => (
    <div className="flex items-center justify-center gap-2">
      {activeTab === "visitors" && (
        <button
          onClick={() => handleGenerateCertificate(row)}
          className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
          title="Generate Certificate of Appearance"
        >
          <FiFileText className="w-4 h-4" />
        </button>
      )}
      <button
        onClick={() =>
          activeTab === "intern" ? handleView(row) : handleViewVisitor(row)
        }
        className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        title="View Details"
      >
        <FiEye className="w-4 h-4" />
      </button>
      <button
        onClick={() => handleDelete(row.id)}
        className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
        title="Delete Record"
      >
        <FiTrash2 className="w-4 h-4" />
      </button>
    </div>
  );

  return (
    <div className="bg-gradient-to-br from-blue-50 to-yellow-50">
      <DateTimeHeader />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Home</h1>
          <p className="text-gray-600 mt-2">
            Monitor attendance records and visitor logs
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card
            title="No. of Logged Persons TODAY"
            icon={<FiUsers className="w-5 h-5 text-blue-600" />}
            accentColor="border-blue-500"
          >
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">INTERN</span>
                <span className="text-2xl font-bold text-blue-600">
                  {todayInternCount}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">VISITORS</span>
                <span className="text-2xl font-bold text-yellow-600">
                  {todayVisitorCount}
                </span>
              </div>
            </div>
          </Card>
          <Card
            title="VISITORS THIS WEEK"
            icon={<FiUserPlus className="w-5 h-5 text-yellow-600" />}
            accentColor="border-yellow-500"
          >
            <div className="text-3xl font-bold text-yellow-600">
              {visitorAttendance.length}
            </div>
          </Card>
          <Card
            title="VISITORS THIS MONTH"
            icon={<FiUserPlus className="w-5 h-5 text-green-600" />}
            accentColor="border-green-500"
          >
            <div className="text-3xl font-bold text-green-600">
              {visitorAttendance.length}
            </div>
          </Card>
          <Card
            title="VISITORS THIS YEAR"
            icon={<FiUserPlus className="w-5 h-5 text-purple-600" />}
            accentColor="border-purple-500"
          >
            <div className="text-3xl font-bold text-purple-600">
              {visitorAttendance.length}
            </div>
          </Card>
        </div>
        <Card
          title="Attendance Management"
          icon={<FiCalendar className="w-6 h-6 text-[#0172f6]" />}
          hoverScale=""
          hoverShadow=""
          transition=""
          accentColor={"border-gray-100"}
        >
          <div className="flex border-b border-gray-200 mb-4">
            <button
              onClick={() => setActiveTab("intern")}
              className={`flex-1 py-3 px-4 text-xs font-black uppercase tracking-widest transition-colors ${
                activeTab === "intern"
                  ? " bg-[#188b3e] text-white border-b-2 border-[#188b3e]"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100 border-b-2 border-transparent"
              }`}
            >
              Intern
            </button>
            <button
              onClick={() => setActiveTab("visitors")}
              className={`flex-1 py-3 px-4 text-xs font-black uppercase tracking-widest transition-colors ${
                activeTab === "visitors"
                  ? "bg-orange-600 text-white border-b-2 border-orange-600"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100 border-b-2 border-transparent"
              }`}
            >
              Visitors
            </button>
          </div>
          {activeTab === "visitors" && (
            <div className="flex flex-col lg:flex-row gap-3 mb-4">
              <div className="flex-1">
                <SearchBar
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name only"
                  width="w-full"
                />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={String(selectedMonth)}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  onMouseDown={(e) => {
                    setTimeout(() => {
                      document.querySelectorAll("select").forEach((s) => {
                        if (s !== e.target) s.blur();
                      });
                    }, 0);
                  }}
                  className="px-2 py-1.5 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-[#188b3e] bg-white text-xs sm:text-sm w-20 sm:w-24"
                >
                  <option value="-1">Filter by Month</option>
                  <option value="0">Jan</option>
                  <option value="1">Feb</option>
                  <option value="2">Mar</option>
                  <option value="3">Apr</option>
                  <option value="4">May</option>
                  <option value="5">Jun</option>
                  <option value="6">Jul</option>
                  <option value="7">Aug</option>
                  <option value="8">Sep</option>
                  <option value="9">Oct</option>
                  <option value="10">Nov</option>
                  <option value="11">Dec</option>
                </select>
                <select
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(e.target.value)}
                  onMouseDown={(e) => {
                    setTimeout(() => {
                      document.querySelectorAll("select").forEach((s) => {
                        if (s !== e.target) s.blur();
                      });
                    }, 0);
                  }}
                  className="px-2 py-1.5 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-[#188b3e] bg-white text-xs sm:text-sm w-14 sm:w-16"
                >
                  <option value="All">Filter by Day</option>
                  {allDays.map((day) => (
                    <option key={String(day)} value={String(day)}>
                      {String(day)}
                    </option>
                  ))}
                </select>
                <select
                  value={String(selectedYear)}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  onMouseDown={(e) => {
                    setTimeout(() => {
                      document.querySelectorAll("select").forEach((s) => {
                        if (s !== e.target) s.blur();
                      });
                    }, 0);
                  }}
                  className="px-2 py-1.5 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-[#188b3e] bg-white text-xs sm:text-sm w-16 sm:w-20"
                >
                  <option value="-1">Filter by Year</option>
                  {allYears.map((year) => (
                    <option key={String(year)} value={String(year)}>
                      {String(year)}
                    </option>
                  ))}
                </select>
                <Button
                  label="Refresh"
                  onClick={handleVisitorRefresh}
                  isLoading={isRefreshing}
                  variant="secondary"
                  size="sm"
                  disabled={isRefreshing}
                  title="Refresh"
                  loadingText="Refreshing..."
                  hideLabelOnSmall
                />
                <Button
                  label="Export"
                  onClick={handleExport}
                  isLoading={isExportLoading}
                  loadingText="Exporting..."
                  icon={<FiDownload className="w-3 h-3 sm:w-4 sm:h-4" />}
                  variant="modal-primary"
                  size="sm"
                  title="Export"
                  hideLabelOnSmall
                />
                <Button
                  label="Reset"
                  onClick={handleReset}
                  icon={<FiRotateCcw className="w-3 h-3 sm:w-4 sm:h-4" />}
                  variant="custom"
                  customColor="#dc2626"
                  size="sm"
                  title="Reset"
                  hideLabelOnSmall
                />
              </div>
            </div>
          )}
          {activeTab === "intern" ? (
            <div className="space-y-4">
              <SchoolView
                schools={getSchoolsWithAttendance()}
                internAttendance={internAttendance}
                onSchoolClick={handleSchoolClick}
                onRefresh={fetchAttendanceData}
              />
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={displayData}
              actions={renderActions}
              emptyMessage={`No ${activeTab} records found`}
              keyField="id"
              itemLabel="record"
            />
          )}
        </Card>
      </main>
      <ViewAttendanceModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedRecord(null);
        }}
        selectedRecord={selectedRecord}
        attendanceRecords={getPersonAttendanceRecords()}
        activeTab={activeTab}
        blobToBase64={blobToBase64}
        handleViewImage={handleViewImage}
        onPreviewDtr={handlePreviewDtr}
      />
      <ViewModal
        isOpen={isVisitorViewModalOpen}
        onClose={() => {
          setIsVisitorViewModalOpen(false);
          setSelectedRecord(null);
        }}
        data={selectedRecord || {}}
        itemName="Visitor Attendance"
        fields={[
          { name: "name", label: "Name" },
          { name: "displayDate", label: "Date" },
          { name: "timeIn", label: "Time In" },
          { name: "purpose", label: "Purpose" },
          { name: "address", label: "Address" },
        ]}
        size="md"
      />
      <ExportFilenameModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onConfirm={handleExportConfirm}
        isLoading={isExportLoading}
        defaultName={`attendance_${new Date().toISOString().split("T")[0]}`}
        itemName="Attendance Data"
      />
      <ExportFilenameModal
        isOpen={isResetExportModalOpen}
        onClose={() => setIsResetExportModalOpen(false)}
        onConfirm={handleResetExportConfirm}
        defaultName={`attendance_backup_${new Date().toISOString().split("T")[0]}`}
        itemName="Attendance Backup"
      />
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setRecordToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Attendance Record"
        type="delete"
        itemName="Attendance Record"
        isLoading={isDeleteLoading}
      />
      <DeleteConfirmationModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={handleConfirmReset}
        title="Reset All Attendance Records"
        message="Are you sure you want to reset all attendance records? You will be asked to save a backup before clearing all data."
        type="reset"
        itemName="Attendance Data"
        isLoading={isResetLoading}
      />
      {isImageModalOpen && selectedImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedImageTitle} Photo
              </h3>
              <button
                onClick={() => setIsImageModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="p-4 flex items-center justify-center bg-gray-100 min-h-[300px]">
              {(() => {
                const imgSrc = blobToBase64(selectedImage);
                console.log(
                  "Modal rendering image src:",
                  imgSrc?.substring(0, 100),
                );
                return imgSrc ? (
                  <img
                    src={imgSrc}
                    alt={selectedImageTitle}
                    className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-md"
                    onError={(e) => {
                      console.error(
                        "Image failed to load, src:",
                        e.target.src?.substring(0, 50),
                      );
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "block";
                    }}
                  />
                ) : (
                  <div className="text-red-500 text-center">
                    <p>Failed to convert image data</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Check console for details
                    </p>
                  </div>
                );
              })()}
              <div
                style={{ display: "none" }}
                className="text-red-500 text-center"
              >
                <p>Image failed to load</p>
                <p className="text-sm text-gray-500 mt-2">
                  The image data may be corrupted
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      <CourseView
        isOpen={isCourseViewOpen}
        onClose={handleCloseCourseView}
        school={selectedInternSchool}
        courses={getCoursesForSchool()}
        internAttendance={internAttendance}
        onCourseClick={handleCourseClick}
      />
      <InternAttendanceModal
        isOpen={isInternAttendanceModalOpen}
        onClose={() => setIsInternAttendanceModalOpen(false)}
        school={selectedInternSchool}
        course={selectedInternCourse}
        interns={getInternsForCourse()}
        internAttendance={internAttendance}
        coursesList={coursesList}
        onBack={() => setIsInternAttendanceModalOpen(false)}
        onView={handleView}
        onDelete={handleDelete}
        onRefresh={fetchAttendanceData}
        to12HourFormat={to12HourFormat}
        internColumns={internColumns}
      />
      <PreviewDtrModal
        isOpen={isPreviewDtrModalOpen}
        onClose={() => setIsPreviewDtrModalOpen(false)}
        onCloseParent={() => {
          setIsViewModalOpen(false);
          setSelectedRecord(null);
        }}
        selectedRecord={selectedRecord}
        attendanceRecords={getPersonAttendanceRecords()}
      />
      <CertificateOfAppearanceModal
        isOpen={isCertificateModalOpen}
        onClose={handleCloseCertificateModal}
        visitorData={certificateVisitorData}
        onGenerate={handleGenerateCertificateConfirm}
      />
    </div>
  );
}
