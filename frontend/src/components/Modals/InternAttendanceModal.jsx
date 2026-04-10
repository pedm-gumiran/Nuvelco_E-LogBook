import React, { useState, useEffect } from 'react';
import { FiUsers, FiRefreshCw, FiDownload, FiRotateCcw, FiEye, FiTrash2, FiX, FiLoader } from 'react-icons/fi';
import axios from '../../api/axios.js';
import { toast } from 'react-toastify';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import SearchBar from '../Input_Fields/SearchBar.jsx';
import ItemCard from '../Cards/ItemCard.jsx';
import Button from '../Buttons/Button.jsx';
import ExportFilenameModal from './ExportFilenameModal.jsx';
import DeleteConfirmationModal from './DeleteConfirmationModal.jsx';

const InternAttendanceModal = ({
  isOpen,
  onClose,
  school,
  course,
  interns,
  onRefresh,
  onView,
  onDelete,
  to12HourFormat,
  internColumns
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedInternName, setSelectedInternName] = useState(null);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [isResetLoading, setIsResetLoading] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (openMenuId !== null && !e.target.closest('.relative.ml-4')) {
        setOpenMenuId(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [openMenuId])

  // Hide scrollbar styles like InternModal
  useEffect(() => {
    const style = document.createElement('style')
    style.setAttribute('data-scrollbar-hide', 'true')
    style.textContent = `
      *::-webkit-scrollbar { display: none !important; }
      * { -ms-overflow-style: none !important; scrollbar-width: none !important; }
    `
    document.head.appendChild(style)
    return () => {
      const existing = document.querySelector('style[data-scrollbar-hide]')
      if (existing) existing.remove()
    }
  }, [])


  if (!isOpen) return null;

  // Group interns by name and aggregate their records
  const groupedInterns = interns.reduce((acc, record) => {
    const name = record.intern_name
    if (!acc[name]) {
      acc[name] = {
        intern_name: name,
        school_name: record.school_name,
        course_name: record.course_name,
        records: []
      }
    }
    acc[name].records.push(record)
    return acc
  }, {})

  // Convert to array and filter by search term
  const filteredInterns = Object.values(groupedInterns).filter(intern => {
    const matchesName = intern.intern_name?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesName
  })

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      if (onRefresh) {
        await onRefresh(false) // false = don't show loading spinner
        toast.success('Data refreshed successfully')
      }
    } catch (err) {
      console.error('Error refreshing data:', err)
      toast.error('Failed to refresh data')
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleExport = () => {
    setIsExportModalOpen(true)
  }

  const handleExportConfirm = async (filename) => {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Intern Attendance')

    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Name', key: 'name', width: 25 },
      { header: 'School', key: 'school', width: 25 },
      { header: 'Course', key: 'course', width: 25 },
      { header: 'Date', key: 'date', width: 15 },
      { header: 'AM In', key: 'amIn', width: 15 },
      { header: 'AM Out', key: 'amOut', width: 15 },
      { header: 'PM In', key: 'pmIn', width: 15 },
      { header: 'PM Out', key: 'pmOut', width: 15 }
    ]

    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true }
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      }
    })

    displayData.forEach((row) => {
      worksheet.addRow({
        id: row.id,
        name: row.name,
        school: row.school,
        course: row.course,
        date: row.date,
        amIn: row.amIn,
        amOut: row.amOut,
        pmIn: row.pmIn,
        pmOut: row.pmOut
      })
    })

    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    saveAs(blob, `${filename}.xlsx`)
    toast.success('Attendance data exported successfully')
    setIsExportModalOpen(false)
  }

  const handleReset = () => {
    setIsResetModalOpen(true)
  }

  const handleConfirmReset = async () => {
    setIsResetLoading(true)
    try {
      // Delete all attendance records for this course
      if (course?.course_name) {
        await axios.delete(`/intern-attendance/course/${encodeURIComponent(course.course_name)}`)
        toast.success(`Attendance records for ${course.course_name} have been reset`)
      } else {
        toast.error('Course information not available')
      }
      setIsResetModalOpen(false)
      if (onRefresh) await onRefresh()
    } catch (err) {
      console.error('Error resetting records:', err)
      toast.error('Failed to reset attendance records')
    } finally {
      setIsResetLoading(false)
    }
  }

  const handleDeleteClick = (internName) => {
    if (internName) {
      setSelectedInternName(internName)
      setIsDeleteModalOpen(true)
    }
  }

  const handleConfirmDelete = async () => {
    if (!selectedInternName) {
      toast.error('No intern selected')
      return
    }
    setIsDeleteLoading(true)
    try {
      await axios.delete(`/intern-attendance/intern/${encodeURIComponent(selectedInternName)}`)
      toast.success(`Attendance records for ${selectedInternName} have been deleted`)
      setIsDeleteModalOpen(false)
      setSelectedInternName(null)
      if (onRefresh) await onRefresh()
    } catch (err) {
      console.error('Error deleting record:', err)
      toast.error('Failed to delete attendance record')
    } finally {
      setIsDeleteLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/15">
      <div className="bg-white w-full h-full max-w-7xl mx-auto overflow-y-auto backdrop-blur-sm">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between z-10">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {course && school ? `${course.abbreviation || course.course_name} - ${school.school_name}` : 'Intern Attendance'}
            </h1>
            <p className="text-gray-600 mt-1">View and manage attendance records</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
            title="Close"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        <main className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FiUsers className="w-5 h-5 text-[#188b3e]" />
              Attendance Records
            </h2>

            {/* Toolbar */}
            <div className="flex flex-col lg:flex-row gap-3 mb-4">
              <div className="flex-1">
                <SearchBar
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name..."
                  width="w-full"
                />
              </div>

              <div className="flex items-center gap-2">
                <Button
                  label="Refresh"
                  onClick={handleRefresh}
                  icon={isRefreshing ? <FiLoader className="w-3 h-3 sm:w-4 sm:h-4 animate-spin text-blue-600" /> : <FiRefreshCw className="w-3 h-3 sm:w-4 sm:h-4" />}
                  variant="secondary"
                  size="sm"
                  disabled={isRefreshing}
                  title="Refresh"
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

            {/* Intern Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredInterns.map(intern => (
                <ItemCard
                  key={intern.intern_name}
                  item={intern}
                  displayTitle={intern.intern_name || '--'}
                  count={intern.records.length}
                  countLabel="records"
                  onClick={() => onView({
                    name: intern.intern_name,
                    school: intern.school_name,
                    course: intern.course_name,
                    allRecords: intern.records.map(r => ({
                      id: r.id,
                      date: r.date,
                      amIn: to12HourFormat(r.am_in),
                      amInImage: r.am_in_image,
                      amOut: to12HourFormat(r.am_out),
                      amOutImage: r.am_out_image,
                      pmIn: to12HourFormat(r.pm_in),
                      pmInImage: r.pm_in_image,
                      pmOut: to12HourFormat(r.pm_out),
                      pmOutImage: r.pm_out_image
                    }))
                  })}
                  onDelete={() => handleDeleteClick(intern.intern_name)}
                  isMenuOpen={openMenuId === intern.intern_name}
                  onMenuToggle={() => setOpenMenuId(prev => prev === intern.intern_name ? null : intern.intern_name)}
                  onMenuClose={() => setOpenMenuId(null)}
                  menuActions={(item, onMenuClose) => (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onMenuClose();
                        handleDeleteClick(item.intern_name);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 text-left"
                    >
                      <FiTrash2 className="w-4 h-4" />
                      Delete All Records
                    </button>
                  )}
                  hideActions={false}
                  hideTimestamps={true}
                />
              ))}
            </div>
            {filteredInterns.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No intern records found
              </div>
            )}
          </div>
        </main>

        {/* Export Filename Modal */}
        <ExportFilenameModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          onConfirm={handleExportConfirm}
          defaultName={`intern_attendance_${school?.school_name?.replace(/\s+/g, '_')}_${course?.course_name?.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}`}
          itemName="Intern Attendance"
        />

        {/* Reset Confirmation Modal */}
        <DeleteConfirmationModal
          isOpen={isResetModalOpen}
          onClose={() => setIsResetModalOpen(false)}
          onConfirm={handleConfirmReset}
          title="Reset Attendance Records"
          message={`Are you sure you want to reset all attendance records for ${course?.course_name}? This action cannot be undone.`}
          type="reset"
          itemName="Attendance Records"
          isLoading={isResetLoading}
        />

        {/* Delete Individual Record Modal */}
        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false)
            setSelectedInternName(null)
          }}
          onConfirm={handleConfirmDelete}
          title="Delete Attendance Record"
          message={selectedInternName ? `Are you sure you want to delete attendance records for ${selectedInternName}? This action cannot be undone.` : 'Are you sure you want to delete this attendance record? This action cannot be undone.'}
          type="delete"
          itemName="Attendance Record"
          isLoading={isDeleteLoading}
        />
      </div>
    </div>
  )
};

export default InternAttendanceModal;
