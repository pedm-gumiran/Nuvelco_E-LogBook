import React, { useState, useEffect } from "react";
import {
  FiUsers,
  FiPlus,
  FiFilter,
  FiDownload,
  FiTrash2,
  FiEdit2,
  FiRotateCcw,
  FiEye,
  FiRefreshCw,
  FiX,
  FiLoader,
} from "react-icons/fi";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { toast } from "react-toastify";
import axios from "../../api/axios.js";
import SearchBar from "../../components/Input_Fields/SearchBar.jsx";
import DataTable from "../../components/DataTables/DataTable.jsx";
import Button from "../../components/Buttons/Button.jsx";
import AddModal from "../../components/Modals/AddModal.jsx";
import EditModal from "../../components/Modals/EditModal.jsx";
import ViewModal from "../../components/Modals/ViewModal.jsx";
import ExportFilenameModal from "../../components/Modals/ExportFilenameModal.jsx";
import DeleteConfirmationModal from "../../components/Modals/DeleteConfirmationModal.jsx";
import SummaryModal from "../../components/Modals/SummaryModal.jsx";

export default function InternModal({
  isOpen,
  onClose,
  school,
  course,
  onInternAdded,
}) {
  const [internData, setInternData] = useState([]);
  const [coursesList, setCoursesList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [internToDelete, setInternToDelete] = useState(null);
  const [selectedIntern, setSelectedIntern] = useState(null);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [newlyAddedIntern, setNewlyAddedIntern] = useState(null);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [isResetLoading, setIsResetLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch intern data from backend
  const fetchInternData = async (showLoading = true) => {
    if (showLoading) {
      setLoading(true);
    } else {
      setIsRefreshing(true);
    }
    setError(null);
    try {
      const response = await axios.get("/intern");
      if (response.data.success) {
        const mappedData = response.data.data.map((intern) => ({
          id: intern.id,
          intern_id: intern.id,
          firstname: intern.first_name,
          middle_initial: intern.middle_initial,
          lastname: intern.last_name,
          suffix: intern.suffix,
          school_id: intern.school_id,
          course_id: intern.course_id,
        }));
        setInternData(mappedData);
      }
    } catch (err) {
      console.error("Error fetching intern data:", err);
      setError("Failed to load intern data");
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

  // Fetch courses for the selected school
  const fetchCourses = async () => {
    if (!school?.id) return;
    try {
      const response = await axios.get(`/course?schoolId=${school.id}`);
      if (response.data.success) {
        setCoursesList(response.data.data);
      }
    } catch (err) {
      console.error("Error fetching courses:", err);
    }
  };

  useEffect(() => {
    if (isOpen && school?.id) {
      fetchCourses();
    }
  }, [isOpen, school]);

  // Fetch intern data when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchInternData();
    }
  }, [isOpen]);

  // Hide scrollbar styles
  useEffect(() => {
    const style = document.createElement("style");
    style.setAttribute("data-scrollbar-hide", "true");
    style.textContent = `
      *::-webkit-scrollbar { display: none !important; }
      * { -ms-overflow-style: none !important; scrollbar-width: none !important; }
    `;
    document.head.appendChild(style);
    return () => {
      const existing = document.querySelector("style[data-scrollbar-hide]");
      if (existing) existing.remove();
    };
  }, []);

  // Field configuration for AddModal - course is auto-set since adding intern inside course
  const internFields = [
    {
      name: "intern_id",
      label: "Intern ID",
      type: "text",
      required: false,
      placeholder: "Auto-generated",
      disabled: true,
    },
    {
      name: "firstname",
      label: "First Name",
      type: "text",
      required: true,
      placeholder: "Enter first name",
    },
    {
      name: "middle_initial",
      label: "Middle Initial",
      type: "text",
      required: false,
      placeholder: "Enter middle initial",
    },
    {
      name: "lastname",
      label: "Last Name",
      type: "text",
      required: true,
      placeholder: "Enter last name",
    },
    {
      name: "suffix",
      label: "Suffix",
      type: "text",
      required: false,
      placeholder: "Enter suffix (e.g., Jr., Sr., III)",
    },
    {
      name: "school_id",
      label: "School ID",
      type: "text",
      required: false,
      disabled: true,
      hidden: true,
    },
    {
      name: "course_id",
      label: "Course ID",
      type: "text",
      required: false,
      disabled: true,
      hidden: true,
    },
  ];

  // Field configuration for EditModal - course is auto-set since editing intern inside course
  const internEditFields = [
    {
      name: "intern_id",
      label: "Intern ID",
      type: "text",
      required: false,
      disabled: true,
    },
    {
      name: "firstname",
      label: "First Name",
      type: "text",
      required: true,
      placeholder: "Enter first name",
    },
    {
      name: "middle_initial",
      label: "Middle Initial",
      type: "text",
      required: false,
      placeholder: "Enter middle initial",
    },
    {
      name: "lastname",
      label: "Last Name",
      type: "text",
      required: true,
      placeholder: "Enter last name",
    },
    {
      name: "suffix",
      label: "Suffix",
      type: "text",
      required: false,
      placeholder: "Enter suffix (e.g., Jr., Sr., III)",
    },
    {
      name: "school_id",
      label: "School ID",
      type: "text",
      required: false,
      disabled: true,
      hidden: true,
    },
    {
      name: "course_id",
      label: "Course ID",
      type: "text",
      required: false,
      disabled: true,
      hidden: true,
    },
  ];

  // Filter intern data by school and course, plus search term
  const filteredData = internData.filter((intern) => {
    const fullName =
      `${intern.firstname} ${intern.middle_initial ? intern.middle_initial + ". " : ""}${intern.lastname} ${intern.suffix}`.trim();
    const matchesSearch =
      intern.intern_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fullName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSchool = !school || intern.school_id === school.id;
    const matchesCourse = !course || intern.course_id === course.id;
    return matchesSearch && matchesSchool && matchesCourse;
  });

  // Generate random alphanumeric intern ID (e.g., I8X2K9M1)
  const generateInternId = () => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const length = 8;
    let result = "I";
    for (let i = 0; i < length - 1; i++) {
      result += characters.charAt(
        Math.floor(Math.random() * characters.length),
      );
    }
    return result;
  };

  // Handle refresh data
  const handleRefresh = async () => {
    await fetchInternData(false);
    toast.success("Intern data refreshed successfully");
  };

  // Handle add new intern
  const handleAdd = () => {
    const randomInternId = generateInternId();
    setNewlyAddedIntern({
      intern_id: randomInternId,
      school_id: school?.id || null,
      course_id: course?.id || null,
    });
    setIsAddModalOpen(true);
  };

  // Handle view intern
  const handleView = (intern) => {
    setSelectedIntern(intern);
    setIsViewModalOpen(true);
  };

  // Handle edit intern
  const handleEdit = (intern) => {
    setSelectedIntern(intern);
    setIsEditModalOpen(true);
  };

  // Handle add submit
  const handleAddSubmit = async (formData) => {
    try {
      const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      const length = 8;
      let newInternId = "I";
      for (let i = 0; i < length - 1; i++) {
        newInternId += characters.charAt(
          Math.floor(Math.random() * characters.length),
        );
      }

      const newIntern = {
        id: newInternId,
        firstName: formData.firstname,
        middleInitial: formData.middle_initial || "",
        lastName: formData.lastname,
        suffix: formData.suffix || "",
        schoolId: school?.id || formData.school_id || null,
        courseId: course?.id || formData.course_id || null,
      };

      const response = await axios.post("/intern", newIntern);
      if (response.data.success) {
        const addedIntern = {
          id: newInternId,
          intern_id: newInternId,
          firstname: formData.firstname,
          middle_initial: formData.middle_initial || "",
          lastname: formData.lastname,
          suffix: formData.suffix || "",
          school_id: school?.id || formData.school_id || null,
          course_id: course?.id || formData.course_id || null,
        };
        setInternData((prev) => [...prev, addedIntern]);
        setIsAddModalOpen(false);
        setNewlyAddedIntern(addedIntern);
        setIsSummaryModalOpen(true);
        toast.success("Intern member added successfully");
        // Notify parent component that an intern was added
        if (onInternAdded) {
          onInternAdded();
        }
      } else {
        throw new Error(response.data.message || "Failed to add intern member");
      }
    } catch (err) {
      console.error("Error adding intern:", err);
      if (err.response?.status === 409) {
        toast.error(
          err.response.data.message ||
            "An intern member with this name already exists",
        );
      } else {
        toast.error("Failed to add intern member");
      }
      throw err;
    }
  };

  // Handle edit submit
  const handleEditSubmit = async (formData) => {
    try {
      if (selectedIntern) {
        const updatedIntern = {
          firstName: formData.firstname,
          middleInitial: formData.middle_initial || "",
          lastName: formData.lastname,
          suffix: formData.suffix || "",
          schoolId: formData.school_id || selectedIntern?.school_id || null,
          courseId: formData.course_id || selectedIntern?.course_id || null,
        };

        const response = await axios.put(
          `/intern/${selectedIntern.id}`,
          updatedIntern,
        );
        if (response.data.success) {
          setInternData((prev) =>
            prev.map((f) =>
              f.id === selectedIntern.id
                ? {
                    ...formData,
                    id: selectedIntern.id,
                    intern_id: selectedIntern.intern_id,
                  }
                : f,
            ),
          );
          toast.success("Intern member updated successfully");
        } else {
          toast.error(
            response.data.message || "Failed to update intern member",
          );
        }
      }
      setIsEditModalOpen(false);
      setSelectedIntern(null);
    } catch (err) {
      console.error("Error updating intern:", err);
      if (err.response?.status === 409) {
        toast.error(
          err.response.data.message ||
            "An intern member with this name already exists",
        );
      } else {
        toast.error("Failed to update intern member");
      }
    }
  };

  // Handle delete intern - open confirmation modal
  const handleDelete = (id) => {
    setInternToDelete(id);
    setIsDeleteModalOpen(true);
  };

  // Handle confirm delete
  const handleConfirmDelete = async () => {
    setIsDeleteLoading(true);
    try {
      if (internToDelete) {
        const response = await axios.delete(`/intern/${internToDelete}`);
        if (response.data.success) {
          setInternData((prev) => prev.filter((f) => f.id !== internToDelete));
          toast.success("Intern member deleted successfully");
          // Notify parent component that an intern was deleted
          if (onInternAdded) {
            onInternAdded();
          }
        }
      }
    } catch (err) {
      console.error("Error deleting intern:", err);
      toast.error("Failed to delete intern member");
    } finally {
      setIsDeleteModalOpen(false);
      setInternToDelete(null);
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
    const worksheet = workbook.addWorksheet("Interns");

    worksheet.columns = [
      { header: "ID", key: "id", width: 10 },
      { header: "Intern ID", key: "intern_id", width: 15 },
      { header: "First Name", key: "firstname", width: 20 },
      { header: "Middle Initial", key: "middle_initial", width: 15 },
      { header: "Last Name", key: "lastname", width: 20 },
      { header: "Suffix", key: "suffix", width: 15 },
      { header: "School ID", key: "school_id", width: 15 },
      { header: "Course ID", key: "course_id", width: 15 },
    ];

    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFE0E0E0" },
      };
    });

    filteredData.forEach((row) => {
      worksheet.addRow({
        id: row.id,
        intern_id: row.intern_id,
        firstname: row.firstname,
        middle_initial: row.middle_initial,
        lastname: row.lastname,
        suffix: row.suffix,
        school_id: row.school_id,
        course_id: row.course_id,
      });
    });

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
      for (const intern of internData) {
        await axios.delete(`/intern/${intern.id}`);
      }
      setInternData([]);
      toast.success("All intern records have been reset");
    } catch (err) {
      console.error("Error resetting intern data:", err);
      toast.error("Failed to reset intern records");
    } finally {
      setIsResetModalOpen(false);
      setIsResetLoading(false);
    }
  };

  // Handle reset filters only
  const handleResetFilters = () => {
    setSearchTerm("");
  };

  const columns = [
    { key: "intern_id", label: "Intern ID" },
    { key: "firstname", label: "First Name" },
    { key: "middle_initial", label: "M.I." },
    { key: "lastname", label: "Last Name" },
    { key: "suffix", label: "Suffix" },
  ];

  const renderActions = (row) => (
    <div className="flex items-center justify-center gap-2">
      <button
        onClick={() => handleView(row)}
        className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        title="View Intern"
      >
        <FiEye className="w-4 h-4" />
      </button>
      <button
        onClick={() => handleEdit(row)}
        className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
        title="Edit Intern"
      >
        <FiEdit2 className="w-4 h-4" />
      </button>
      <button
        onClick={() => handleDelete(row.id)}
        className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
        title="Delete Intern"
      >
        <FiTrash2 className="w-4 h-4" />
      </button>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/15">
      <div className="bg-white w-full h-full max-w-7xl mx-auto overflow-y-auto backdrop-blur-sm">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between z-10">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {course && school
                ? `${course.abbreviation || course.course_name} - ${school.school_name}`
                : "Interns"}
            </h1>
            <p className="text-gray-600 mt-1">Manage intern information</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
            title="Close"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        <main className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FiUsers className="w-5 h-5 text-[#188b3e]" />
              Intern Management
            </h2>

            <div className="flex flex-col lg:flex-row gap-3 mb-4">
              <div className="flex-1">
                <SearchBar
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by intern ID or name..."
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
                  label="Add Intern"
                  onClick={handleAdd}
                  icon={<FiPlus className="w-3 h-3 sm:w-4 sm:h-4" />}
                  variant="primary"
                  size="sm"
                  title="Add Intern"
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

            <DataTable
              columns={columns}
              data={filteredData}
              actions={renderActions}
              emptyMessage="No intern records found"
              keyField="id"
              itemLabel="intern"
              loading={loading}
            />
          </div>
        </main>

        <AddModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSubmit={handleAddSubmit}
          itemName="Intern"
          fields={internFields}
          size="md"
          initialData={newlyAddedIntern}
          submitLabel={"Save Intern"}
        />

        <EditModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedIntern(null);
          }}
          onSubmit={handleEditSubmit}
          data={selectedIntern}
          itemName="Intern"
          fields={internEditFields}
          size="md"
          submitLabel={"Update Intern"}
        />

        <ViewModal
          isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false);
            setSelectedIntern(null);
          }}
          data={selectedIntern}
          itemName="Intern"
          fields={internFields}
          size="md"
        />

        <ExportFilenameModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          onConfirm={handleExportConfirm}
          defaultName={`intern_${new Date().toISOString().split("T")[0]}`}
          itemName="Intern"
        />

        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setInternToDelete(null);
          }}
          onConfirm={handleConfirmDelete}
          title="Delete Intern Member"
          type="delete"
          itemName="Intern Member"
          isLoading={isDeleteLoading}
        />

        <DeleteConfirmationModal
          isOpen={isResetModalOpen}
          onClose={() => setIsResetModalOpen(false)}
          onConfirm={handleConfirmReset}
          title="Reset All Intern Records"
          message="Are you sure you want to reset all intern records? This will clear all data and cannot be undone."
          type="reset"
          itemName="Intern Data"
          isLoading={isResetLoading}
        />

        <SummaryModal
          isOpen={isSummaryModalOpen}
          onClose={() => {
            setIsSummaryModalOpen(false);
            setNewlyAddedIntern(null);
          }}
          data={newlyAddedIntern}
          autoCloseSeconds={30}
        />
      </div>
    </div>
  );
}
