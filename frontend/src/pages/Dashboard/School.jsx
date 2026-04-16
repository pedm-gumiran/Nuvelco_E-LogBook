import React, { useState, useEffect } from "react";
import {
  FiPlus,
  FiDownload,
  FiRotateCcw,
  FiRefreshCw,
  FiLoader,
} from "react-icons/fi";
import { FaSchool } from "react-icons/fa";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { toast } from "react-toastify";
import axios from "../../api/axios.js";
import DateTimeHeader from "../../components/Dashboard_Components/DateTimeHeader.jsx";
import Card from "../../components/Cards/Card.jsx";
import ItemCard from "../../components/Cards/ItemCard.jsx";
import SearchBar from "../../components/Input_Fields/SearchBar.jsx";
import Button from "../../components/Buttons/Button.jsx";
import AddModal from "../../components/Modals/AddModal.jsx";
import EditModal from "../../components/Modals/EditModal.jsx";
import ViewModal from "../../components/Modals/ViewModal.jsx";
import ExportFilenameModal from "../../components/Modals/ExportFilenameModal.jsx";
import DeleteConfirmationModal from "../../components/Modals/DeleteConfirmationModal.jsx";
import CourseModal from "../../components/Modals/CourseModal.jsx";

export default function School() {
  const [schoolData, setSchoolData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [schoolToDelete, setSchoolToDelete] = useState(null);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [isResetLoading, setIsResetLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [selectedSchoolForCourse, setSelectedSchoolForCourse] = useState(null);

  // Hide scrollbar styles
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
      const existing = document.querySelector("style[data-scrollbar-hide]");
      if (existing) existing.remove();
    };
  }, []);

  // Fetch school data from backend
  const fetchSchoolData = async (showLoading = true) => {
    if (showLoading) {
      setLoading(true);
    } else {
      setIsRefreshing(true);
    }
    setError(null);
    try {
      const response = await axios.get("/school");
      if (response.data.success) {
        // Format dates to readable format
        const formattedData = response.data.data.map((school) => ({
          ...school,
          created_at: formatDate(school.created_at),
          updated_at: formatDate(school.updated_at),
        }));
        setSchoolData(formattedData);
      }
    } catch (err) {
      console.error("Error fetching school data:", err);
      setError("Failed to load school data");
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
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  useEffect(() => {
    fetchSchoolData();
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    if (openMenuId !== null) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [openMenuId]);

  // Field configuration for AddModal - only school name
  const schoolFields = [
    {
      name: "school_name",
      label: "School Name",
      type: "text",
      required: true,
      placeholder: "Enter school name",
    },
  ];

  // Field configuration for EditModal - only school name
  const schoolEditFields = [
    {
      name: "school_name",
      label: "School Name",
      type: "text",
      required: true,
      placeholder: "Enter school name",
    },
  ];

  // Filter school data
  const filteredData = schoolData.filter((school) => {
    return school.school_name?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Handle refresh data
  const handleRefresh = async () => {
    await fetchSchoolData(false);
    toast.success("School data refreshed successfully");
  };

  // Handle add new school
  const handleAdd = () => {
    setIsAddModalOpen(true);
  };

  // Handle card click to open course modal
  const handleCardClick = (school) => {
    setSelectedSchoolForCourse(school);
    setIsCourseModalOpen(true);
  };

  // Handle edit school
  const handleEdit = (school) => {
    setSelectedSchool(school);
    setIsEditModalOpen(true);
  };

  // Handle add submit
  const handleAddSubmit = async (formData) => {
    try {
      const newSchool = {
        schoolName: formData.school_name,
      };

      const response = await axios.post("/school", newSchool);
      if (response.data.success) {
        await fetchSchoolData(false);
        setIsAddModalOpen(false);
        toast.success("School added successfully");
      } else {
        toast.error(response.data.message || "Failed to add school");
        throw new Error(response.data.message || "Failed to add school");
      }
    } catch (err) {
      console.error("Error adding school:", err);
      if (err.response?.status === 409) {
        toast.error(
          err.response.data.message || "A school with this name already exists",
        );
      } else {
        toast.error("Failed to add school");
      }
      throw err;
    }
  };

  // Handle edit submit
  const handleEditSubmit = async (formData) => {
    try {
      if (selectedSchool) {
        const updatedSchool = {
          schoolName: formData.school_name,
        };

        const response = await axios.put(
          `/school/${selectedSchool.id}`,
          updatedSchool,
        );
        if (response.data.success) {
          // Update local state with new school name and current timestamp
          setSchoolData((prev) =>
            prev.map((s) =>
              s.id === selectedSchool.id
                ? {
                    ...s,
                    school_name: formData.school_name,
                    updated_at: formatDate(new Date().toISOString()),
                  }
                : s,
            ),
          );
          toast.success("School updated successfully");
        } else {
          toast.error(response.data.message || "Failed to update school");
        }
      }
      setIsEditModalOpen(false);
      setSelectedSchool(null);
    } catch (err) {
      console.error("Error updating school:", err);
      if (err.response?.status === 409) {
        toast.error(
          err.response.data.message || "A school with this name already exists",
        );
      } else {
        toast.error("Failed to update school");
      }
    }
  };

  // Handle delete school - open confirmation modal
  const handleDelete = (id) => {
    setSchoolToDelete(id);
    setIsDeleteModalOpen(true);
  };

  // Handle confirm delete
  const handleConfirmDelete = async () => {
    setIsDeleteLoading(true);
    try {
      if (schoolToDelete) {
        const response = await axios.delete(`/school/${schoolToDelete}`);
        if (response.data.success) {
          setSchoolData((prev) => prev.filter((s) => s.id !== schoolToDelete));
          toast.success("School deleted successfully");
        }
      }
    } catch (err) {
      console.error("Error deleting school:", err);
      toast.error("Failed to delete school");
    } finally {
      setIsDeleteModalOpen(false);
      setSchoolToDelete(null);
      setIsDeleteLoading(false);
    }
  };

  // Handle export click - open filename modal
  const handleExport = () => {
    setIsExportModalOpen(true);
  };

  // Handle actual export to Excel with custom filename
  const handleExportConfirm = async (filename) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Schools");

    // Define columns
    worksheet.columns = [
      { header: "ID", key: "id", width: 10 },
      { header: "School Name", key: "school_name", width: 40 },
      { header: "Created At", key: "created_at", width: 20 },
      { header: "Updated At", key: "updated_at", width: 20 },
    ];

    // Style header row
    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFE0E0E0" },
      };
    });

    // Add data rows
    filteredData.forEach((row) => {
      worksheet.addRow({
        id: row.id,
        school_name: row.school_name,
        created_at: row.created_at,
        updated_at: row.updated_at,
      });
    });

    // Generate Excel file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, `${filename}.xlsx`);
  };

  // Handle reset all - open confirmation modal
  const handleReset = () => {
    setIsResetModalOpen(true);
  };

  // Handle confirm reset
  const handleConfirmReset = async () => {
    setIsResetLoading(true);
    try {
      for (const school of schoolData) {
        await axios.delete(`/school/${school.id}`);
      }
      setSchoolData([]);
      toast.success("All school records have been reset");
    } catch (err) {
      console.error("Error resetting school data:", err);
      toast.error("Failed to reset school records");
    } finally {
      setIsResetModalOpen(false);
      setIsResetLoading(false);
    }
  };

  // Handle reset filters only
  const handleResetFilters = () => {
    setSearchTerm("");
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-yellow-50">
      <DateTimeHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Schools</h1>
          <p className="text-gray-600 mt-2">
            Manage school information, courses and interns account
          </p>
        </div>

        <Card
          title="School Management"
          icon={<FaSchool className="w-6 h-6 text-[#188b3e]" />}
          hoverScale=""
          hoverShadow=""
          transition=""
          accentColor={"border-gray-100"}
        >
          <div className="flex flex-col lg:flex-row gap-3 mb-4">
            <div className="flex-1">
              <SearchBar
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by school name..."
                width="w-full"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Button
                label="Refresh"
                onClick={handleRefresh}
                icon={
                  isRefreshing ? (
                    <FiLoader className="w-3 h-3 sm:w-4 sm:h-4 animate-spin text-blue-600" />
                  ) : (
                    <FiRefreshCw className="w-3 h-3 sm:w-4 sm:h-4" />
                  )
                }
                variant="secondary"
                size="sm"
                disabled={isRefreshing}
                title="Refresh"
                hideLabelOnSmall
              />
              <Button
                label="Add School"
                onClick={handleAdd}
                icon={<FiPlus className="w-3 h-3 sm:w-4 sm:h-4" />}
                variant="primary"
                size="sm"
                title="Add School"
                hideLabelOnSmall
              />
              <Button
                label="Export"
                onClick={handleExport}
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

          {/* Card Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <FiLoader className="w-8 h-8 animate-spin text-[#188b3e]" />
            </div>
          ) : filteredData.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No school records found
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredData.map((school) => (
                <ItemCard
                  key={school.id}
                  item={school}
                  titleKey="school_name"
                  onClick={() => handleCardClick(school)}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  isMenuOpen={openMenuId === school.id}
                  onMenuToggle={(id) =>
                    setOpenMenuId(openMenuId === id ? null : id)
                  }
                  onMenuClose={() => setOpenMenuId(null)}
                />
              ))}
            </div>
          )}
        </Card>
      </main>

      <AddModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddSubmit}
        itemName="School"
        fields={schoolFields}
        size="md"
        submitLabel={"Save School"}
      />

      <EditModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedSchool(null);
        }}
        onSubmit={handleEditSubmit}
        data={selectedSchool}
        itemName="School"
        fields={schoolEditFields}
        size="md"
        submitLabel={"Update School"}
      />

      <ViewModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedSchool(null);
        }}
        data={selectedSchool}
        itemName="School"
        fields={schoolFields}
        size="md"
      />

      <ExportFilenameModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onConfirm={handleExportConfirm}
        defaultName={`school_${new Date().toISOString().split("T")[0]}`}
        itemName="School"
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSchoolToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete School"
        type="delete"
        itemName="School"
        isLoading={isDeleteLoading}
      />

      <DeleteConfirmationModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={handleConfirmReset}
        title="Reset All School Records"
        message="Are you sure you want to reset all school records? This will clear all data and cannot be undone."
        type="reset"
        itemName="School Data"
        isLoading={isResetLoading}
      />
      <CourseModal
        isOpen={isCourseModalOpen}
        onClose={() => {
          setIsCourseModalOpen(false);
          setSelectedSchoolForCourse(null);
        }}
        school={selectedSchoolForCourse}
      />
    </div>
  );
}
