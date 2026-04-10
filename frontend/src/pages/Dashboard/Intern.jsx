import React, { useState, useEffect } from 'react'
import { FiUsers, FiPlus, FiFilter, FiDownload, FiTrash2, FiEdit2, FiRotateCcw, FiEye, FiRefreshCw, FiLoader } from 'react-icons/fi'
import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'
import { toast } from 'react-toastify'
import axios from '../../api/axios.js'
import DateTimeHeader from '../../components/Dashboard_Components/DateTimeHeader.jsx'
import Card from '../../components/Cards/Card.jsx'
import SearchBar from '../../components/Input_Fields/SearchBar.jsx'
import DataTable from '../../components/DataTables/DataTable.jsx'
import Button from '../../components/Buttons/Button.jsx'
import AddModal from '../../components/Modals/AddModal.jsx'
import EditModal from '../../components/Modals/EditModal.jsx'
import ViewModal from '../../components/Modals/ViewModal.jsx'
import ExportFilenameModal from '../../components/Modals/ExportFilenameModal.jsx'
import DeleteConfirmationModal from '../../components/Modals/DeleteConfirmationModal.jsx'
import SummaryModal from '../../components/Modals/SummaryModal.jsx'

export default function Intern() {
  const [facultyData, setFacultyData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('All')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isResetModalOpen, setIsResetModalOpen] = useState(false)
  const [facultyToDelete, setFacultyToDelete] = useState(null)
  const [selectedFaculty, setSelectedFaculty] = useState(null)
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false)
  const [newlyAddedFaculty, setNewlyAddedFaculty] = useState(null)
  const [isDeleteLoading, setIsDeleteLoading] = useState(false)
  const [isResetLoading, setIsResetLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Fetch faculty data from backend
  const fetchFacultyData = async (showLoading = true) => {
    if (showLoading) {
      setLoading(true)
    } else {
      setIsRefreshing(true)
    }
    setError(null)
    try {
      const response = await axios.get('/intern')
      if (response.data.success) {
        // Map backend data to frontend format
        const mappedData = response.data.data.map(faculty => ({
          id: faculty.id,
          faculty_id: faculty.id, // The varchar(50) ID
          firstname: faculty.first_name,
          middle_initial: faculty.middle_initial,
          lastname: faculty.last_name,
          suffix: faculty.suffix,
          status: faculty.status
        }))
        setFacultyData(mappedData)
      }
    } catch (err) {
      console.error('Error fetching faculty data:', err)
      setError('Failed to load faculty data')
      if (!showLoading) {
        toast.error('Failed to refresh data')
      }
    } finally {
      if (showLoading) {
        setLoading(false)
      } else {
        setIsRefreshing(false)
      }
    }
  }

  useEffect(() => {
    fetchFacultyData()
  }, [])

  // Hide scrollbar styles
  useEffect(() => {
    const style = document.createElement('style')
    style.setAttribute('data-scrollbar-hide', 'true')
    style.textContent = `
      /* Hide all scrollbars */
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
    `
    document.head.appendChild(style)

    return () => {
      const existingStyle = document.querySelector('style[data-scrollbar-hide]')
      if (existingStyle) {
        existingStyle.remove()
      }
    }
  }, [])

  // Field configuration for AddModal
  const facultyFields = [
    { name: 'faculty_id', label: 'Intern ID', type: 'text', required: false, placeholder: 'Auto-generated', disabled: true },
    { name: 'firstname', label: 'First Name', type: 'text', required: true, placeholder: 'Enter first name' },
    { name: 'middle_initial', label: 'Middle Initial', type: 'text', required: false, placeholder: 'Enter middle initial' },
    { name: 'lastname', label: 'Last Name', type: 'text', required: true, placeholder: 'Enter last name' },
    { name: 'suffix', label: 'Suffix', type: 'text', required: false, placeholder: 'Enter suffix (e.g., Jr., Sr., III)' }
  ]

  // Field configuration for EditModal (includes status, faculty_id disabled)
  const facultyEditFields = [
    { name: 'faculty_id', label: 'Intern ID', type: 'text', required: false, disabled: true },
    { name: 'firstname', label: 'First Name', type: 'text', required: true, placeholder: 'Enter first name' },
    { name: 'middle_initial', label: 'Middle Initial', type: 'text', required: false, placeholder: 'Enter middle initial' },
    { name: 'lastname', label: 'Last Name', type: 'text', required: true, placeholder: 'Enter last name' },
    { name: 'suffix', label: 'Suffix', type: 'text', required: false, placeholder: 'Enter suffix (e.g., Jr., Sr., III)' },
    { name: 'status', label: 'Status', type: 'select', required: false, options: ['Active', 'On Leave', 'Inactive'] }
  ]

  // Filter faculty data
  const filteredData = facultyData.filter(faculty => {
    const fullName = `${faculty.firstname} ${faculty.middle_initial ? faculty.middle_initial + '. ' : ''}${faculty.lastname} ${faculty.suffix}`.trim()
    const matchesSearch = faculty.faculty_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         fullName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'All' || faculty.status === filterStatus
    return matchesSearch && matchesStatus
  })

  // Get unique departments for filter
  const departments = [...new Set(facultyData.map(f => f.department))]

  // Generate random alphanumeric faculty ID (e.g., F8X2K9M1)
  const generateFacultyId = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    const length = 8
    let result = 'F'
    for (let i = 0; i < length - 1; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length))
    }
    return result
  }

  // Handle refresh data
  const handleRefresh = async () => {
    await fetchFacultyData(false)
    toast.success('Intern data refreshed successfully')
  }

  // Handle add new faculty
  const handleAdd = () => {
    // Generate random faculty ID
    const randomFacultyId = generateFacultyId()
    setNewlyAddedFaculty({ faculty_id: randomFacultyId })
    setIsAddModalOpen(true)
  }

  // Handle view faculty
  const handleView = (faculty) => {
    setSelectedFaculty(faculty)
    setIsViewModalOpen(true)
  }

  // Handle edit faculty
  const handleEdit = (faculty) => {
    setSelectedFaculty(faculty)
    setIsEditModalOpen(true)
  }

  // Handle add submit
  const handleAddSubmit = async (formData) => {
    try {
      // Generate random faculty ID
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
      const length = 8
      let newFacultyId = 'F'
      for (let i = 0; i < length - 1; i++) {
        newFacultyId += characters.charAt(Math.floor(Math.random() * characters.length))
      }

      const newFaculty = {
        id: newFacultyId,
        firstName: formData.firstname,
        middleInitial: formData.middle_initial || '',
        lastName: formData.lastname,
        suffix: formData.suffix || '',
        status: 'Active'
      }

      const response = await axios.post('/intern', newFaculty)
      if (response.data.success) {
        // Add to local state
        const addedFaculty = {
          id: newFacultyId,
          faculty_id: newFacultyId,
          firstname: formData.firstname,
          middle_initial: formData.middle_initial || '',
          lastname: formData.lastname,
          suffix: formData.suffix || '',
          status: 'Active'
        }
        setFacultyData(prev => [...prev, addedFaculty])
        setIsAddModalOpen(false)
        setNewlyAddedFaculty(addedFaculty)
        setIsSummaryModalOpen(true)
        toast.success('Intern member added successfully')
      } else {
        toast.error(response.data.message || 'Failed to add intern member')
        // Don't close modal on server error either
        throw new Error(response.data.message || 'Failed to add intern member')
      }
    } catch (err) {
      console.error('Error adding faculty:', err)
      if (err.response?.status === 409) {
        toast.error(err.response.data.message || 'An intern member with this name already exists')
        // Don't close modal on duplicate error - let user fix the data
      } else {
        toast.error('Failed to add intern member')
        // Don't close modal on other errors either
      }
      // Re-throw error to prevent modal from closing
      throw err
    }
  }

  // Handle edit submit
  const handleEditSubmit = async (formData) => {
    try {
      if (selectedFaculty) {
        const updatedFaculty = {
          firstName: formData.firstname,
          middleInitial: formData.middle_initial || '',
          lastName: formData.lastname,
          suffix: formData.suffix || '',
          status: formData.status
        }

        const response = await axios.put(`/intern/${selectedFaculty.id}`, updatedFaculty)
        if (response.data.success) {
          setFacultyData(prev => prev.map(f => f.id === selectedFaculty.id ? { ...formData, id: selectedFaculty.id, faculty_id: selectedFaculty.faculty_id } : f))
          toast.success('Intern member updated successfully')
        } else {
          toast.error(response.data.message || 'Failed to update intern member')
        }
      }
      setIsEditModalOpen(false)
      setSelectedFaculty(null)
    } catch (err) {
      console.error('Error updating faculty:', err)
      if (err.response?.status === 409) {
        toast.error(err.response.data.message || 'An intern member with this name already exists')
      } else {
        toast.error('Failed to update intern member')
      }
    }
  }

  // Handle delete faculty - open confirmation modal
  const handleDelete = (id) => {
    setFacultyToDelete(id)
    setIsDeleteModalOpen(true)
  }

  // Handle confirm delete
  const handleConfirmDelete = async () => {
    setIsDeleteLoading(true)
    try {
      if (facultyToDelete) {
        const response = await axios.delete(`/intern/${facultyToDelete}`)
        if (response.data.success) {
          setFacultyData(prev => prev.filter(f => f.id !== facultyToDelete))
          toast.success('Intern member deleted successfully')
        }
      }
    } catch (err) {
      console.error('Error deleting faculty:', err)
      toast.error('Failed to delete intern member')
    } finally {
      setIsDeleteModalOpen(false)
      setFacultyToDelete(null)
      setIsDeleteLoading(false)
    }
  }

  // Handle export click - open filename modal
  const handleExport = () => {
    setIsExportModalOpen(true)
  }

  // Handle actual export to Excel with custom filename
  const handleExportConfirm = async (filename) => {
    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Interns')

    // Define columns
    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Intern ID', key: 'faculty_id', width: 15 },
      { header: 'First Name', key: 'firstname', width: 20 },
      { header: 'Middle Initial', key: 'middle_initial', width: 15 },
      { header: 'Last Name', key: 'lastname', width: 20 },
      { header: 'Suffix', key: 'suffix', width: 10 },
      { header: 'Status', key: 'status', width: 15 }
    ]

    // Style header row
    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true }
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      }
    })

    // Add data rows
    filteredData.forEach((row) => {
      worksheet.addRow({
        id: row.id,
        faculty_id: row.faculty_id,
        firstname: row.firstname,
        middle_initial: row.middle_initial,
        lastname: row.lastname,
        suffix: row.suffix,
        status: row.status
      })
    })

    // Generate Excel file
    const buffer = await workbook.xlsx.writeBuffer()
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    saveAs(blob, `${filename}.xlsx`)
  }

  // Handle reset all - open confirmation modal
  const handleReset = () => {
    setIsResetModalOpen(true)
  }

  // Handle confirm reset
  const handleConfirmReset = async () => {
    setIsResetLoading(true)
    try {
      // Delete all faculty records from backend
      for (const faculty of facultyData) {
        await axios.delete(`/intern/${faculty.id}`)
      }
      setFacultyData([])
      toast.success('All intern records have been reset')
    } catch (err) {
      console.error('Error resetting faculty data:', err)
      toast.error('Failed to reset intern records')
    } finally {
      setIsResetModalOpen(false)
      setIsResetLoading(false)
    }
  }

  // Handle reset filters only
  const handleResetFilters = () => {
    setSearchTerm('')
    setFilterStatus('All')
  }

  const columns = [
    { key: 'faculty_id', label: 'Intern ID' },
    { key: 'firstname', label: 'First Name' },
    { key: 'middle_initial', label: 'M.I.' },
    { key: 'lastname', label: 'Last Name' },
    { key: 'suffix', label: 'Suffix' },
    { key: 'status', label: 'Status' },
  ]

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
  )

  return (
    <div className="bg-gradient-to-br from-blue-50 to-yellow-50">
      <DateTimeHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Interns</h1>
          <p className="text-gray-600 mt-2">Manage intern information</p>
        </div>

        <Card
          title="Intern Management"
          icon={<FiUsers className="w-6 h-6 text-[#188b3e]" />}
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
                placeholder="Search by intern ID or name..."
                width="w-full"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-2 py-1.5 border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-[#188b3e] bg-white text-xs sm:text-sm w-24 sm:w-32"
              >
                <option value="All">All</option>
                <option value="Active">Active</option>
                <option value="On Leave">On Leave</option>
                <option value="Inactive">Inactive</option>
              </select>

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
            itemLabel='intern'
            loading={loading}
          />
        </Card>
      </main>

      <AddModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddSubmit}
        itemName="Intern"
        fields={facultyFields}
        size="md"
        initialData={newlyAddedFaculty}
      />

      <EditModal
        isOpen={isEditModalOpen}
        onClose={() => { setIsEditModalOpen(false); setSelectedFaculty(null) }}
        onSubmit={handleEditSubmit}
        data={selectedFaculty}
        itemName="Intern"
        fields={facultyEditFields}
        size="md"
      />

      <ViewModal
        isOpen={isViewModalOpen}
        onClose={() => { setIsViewModalOpen(false); setSelectedFaculty(null) }}
        data={selectedFaculty}
        itemName="Intern"
        fields={facultyFields}
        size="md"
      />

      <ExportFilenameModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onConfirm={handleExportConfirm}
        defaultName={`intern_${new Date().toISOString().split('T')[0]}`}
        itemName="Intern"
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => { setIsDeleteModalOpen(false); setFacultyToDelete(null) }}
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
        onClose={() => { setIsSummaryModalOpen(false); setNewlyAddedFaculty(null) }}
        data={newlyAddedFaculty}
        autoCloseSeconds={30}
      />
    </div>
  )
}
