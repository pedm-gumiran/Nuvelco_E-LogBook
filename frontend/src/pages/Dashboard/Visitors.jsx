import React, { useState, useEffect } from 'react'
import { FiUser, FiPlus, FiFilter, FiDownload, FiTrash2, FiEdit2, FiRotateCcw, FiEye, FiRefreshCw, FiLoader } from 'react-icons/fi'
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

export default function Visitors() {
  const [visitorData, setVisitorData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isResetModalOpen, setIsResetModalOpen] = useState(false)
  const [visitorToDelete, setVisitorToDelete] = useState(null)
  const [selectedVisitor, setSelectedVisitor] = useState(null)
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false)
  const [newlyAddedVisitor, setNewlyAddedVisitor] = useState(null)
  const [isDeleteLoading, setIsDeleteLoading] = useState(false)
  const [isResetLoading, setIsResetLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Fetch visitor data from backend
  const fetchVisitorData = async (showLoading = true) => {
    if (showLoading) {
      setLoading(true)
    } else {
      setIsRefreshing(true)
    }
    setError(null)
    try {
      const response = await axios.get('/visitors')
      if (response.data.success) {
        // Map backend data to frontend format
        const mappedData = response.data.data.map(visitor => ({
          id: visitor.id,
          visitor_id: visitor.id, // The varchar(50) ID
          firstname: visitor.first_name,
          middle_initial: visitor.middle_initial,
          lastname: visitor.last_name,
          suffix: visitor.suffix,
          address: visitor.address
        }))
        setVisitorData(mappedData)
      }
    } catch (err) {
      console.error('Error fetching visitor data:', err)
      setError('Failed to load visitor data')
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
    fetchVisitorData()
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
  const visitorFields = [
    { name: 'visitor_id', label: 'Visitor ID', type: 'text', required: false, placeholder: 'Auto-generated', disabled: true },
    { name: 'firstname', label: 'First Name', type: 'text', required: true, placeholder: 'Enter first name' },
    { name: 'middle_initial', label: 'Middle Initial', type: 'text', required: false, placeholder: 'M.I.' },
    { name: 'lastname', label: 'Last Name', type: 'text', required: true, placeholder: 'Enter last name' },
    { name: 'suffix', label: 'Suffix', type: 'text', required: false, placeholder: 'Jr., Sr., III' },
    { name: 'address', label: 'Address', type: 'text', required: true, placeholder: 'Enter address' }
  ]

  // Field configuration for EditModal
  const visitorEditFields = [
    { name: 'visitor_id', label: 'Visitor ID', type: 'text', required: false, disabled: true },
    { name: 'firstname', label: 'First Name', type: 'text', required: true, placeholder: 'Enter first name' },
    { name: 'middle_initial', label: 'Middle Initial', type: 'text', required: false, placeholder: 'M.I.' },
    { name: 'lastname', label: 'Last Name', type: 'text', required: true, placeholder: 'Enter last name' },
    { name: 'suffix', label: 'Suffix', type: 'text', required: false, placeholder: 'Jr., Sr., III' },
    { name: 'address', label: 'Address', type: 'text', required: false, placeholder: 'Enter address' }
  ]

  // Filter visitor data
  const filteredData = visitorData.filter(visitor => {
    const fullName = `${visitor.firstname} ${visitor.middle_initial ? visitor.middle_initial + '. ' : ''}${visitor.lastname} ${visitor.suffix}`.trim()
    const matchesSearch = visitor.visitor_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (visitor.address && visitor.address.toLowerCase().includes(searchTerm.toLowerCase()))
    return matchesSearch
  })

  // Generate random alphanumeric visitor ID (e.g., V8X2K9M1)
  const generateVisitorId = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    const length = 8
    let result = 'V'
    for (let i = 0; i < length - 1; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length))
    }
    return result
  }

  // Handle refresh data
  const handleRefresh = async () => {
    await fetchVisitorData(false)
    toast.success('Visitor data refreshed successfully')
  }

  // Handle add new visitor
  const handleAdd = () => {
    const randomVisitorId = generateVisitorId()
    setNewlyAddedVisitor({ visitor_id: randomVisitorId })
    setIsAddModalOpen(true)
  }

  // Handle view visitor
  const handleView = (visitor) => {
    setSelectedVisitor(visitor)
    setIsViewModalOpen(true)
  }

  // Handle edit visitor
  const handleEdit = (visitor) => {
    setSelectedVisitor(visitor)
    setIsEditModalOpen(true)
  }

  // Handle add submit
  const handleAddSubmit = async (formData) => {
    try {
      // Generate random visitor ID
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
      const length = 8
      let newVisitorId = 'V'
      for (let i = 0; i < length - 1; i++) {
        newVisitorId += characters.charAt(Math.floor(Math.random() * characters.length))
      }

      const newVisitor = {
        id: newVisitorId,
        firstName: formData.firstname,
        middleInitial: formData.middle_initial || '',
        lastName: formData.lastname,
        suffix: formData.suffix || '',
        address: formData.address || ''
      }

      const response = await axios.post('/visitors', newVisitor)
      if (response.data.success) {
        // Add to local state
        const addedVisitor = {
          id: newVisitorId,
          visitor_id: newVisitorId,
          firstname: formData.firstname,
          middle_initial: formData.middle_initial || '',
          lastname: formData.lastname,
          suffix: formData.suffix || '',
          address: formData.address || ''
        }
        setVisitorData(prev => [...prev, addedVisitor])
        setIsAddModalOpen(false)
        setNewlyAddedVisitor(addedVisitor)
        setIsSummaryModalOpen(true)
        toast.success('Visitor added successfully')
      } else {
        toast.error(response.data.message || 'Failed to add visitor')
        // Don't close modal on server error either
        throw new Error(response.data.message || 'Failed to add visitor')
      }
    } catch (err) {
      console.error('Error adding visitor:', err)
      if (err.response?.status === 409) {
        toast.error(err.response.data.message || 'A visitor with this name already exists')
        // Don't close modal on duplicate error - let user fix the data
      } else {
        toast.error('Failed to add visitor')
        // Don't close modal on other errors either
      }
      // Re-throw error to prevent modal from closing
      throw err
    }
  }

  // Handle edit submit
  const handleEditSubmit = async (formData) => {
    try {
      if (selectedVisitor) {
        const updatedVisitor = {
          firstName: formData.firstname,
          middleInitial: formData.middle_initial || '',
          lastName: formData.lastname,
          suffix: formData.suffix || '',
          address: formData.address || ''
        }

        const response = await axios.put(`/visitors/${selectedVisitor.id}`, updatedVisitor)
        if (response.data.success) {
          setVisitorData(prev => prev.map(v => v.id === selectedVisitor.id ? { ...formData, id: selectedVisitor.id, visitor_id: selectedVisitor.visitor_id } : v))
          toast.success('Visitor updated successfully')
        } else {
          toast.error(response.data.message || 'Failed to update visitor')
        }
      }
      setIsEditModalOpen(false)
      setSelectedVisitor(null)
    } catch (err) {
      console.error('Error updating visitor:', err)
      if (err.response?.status === 409) {
        toast.error(err.response.data.message || 'A visitor with this name already exists')
      } else {
        toast.error('Failed to update visitor')
      }
    }
  }

  // Handle delete visitor - open confirmation modal
  const handleDelete = (id) => {
    setVisitorToDelete(id)
    setIsDeleteModalOpen(true)
  }

  // Handle confirm delete
  const handleConfirmDelete = async () => {
    setIsDeleteLoading(true)
    try {
      if (visitorToDelete) {
        const response = await axios.delete(`/visitors/${visitorToDelete}`)
        if (response.data.success) {
          setVisitorData(prev => prev.filter(v => v.id !== visitorToDelete))
          toast.success('Visitor deleted successfully')
        }
      }
    } catch (err) {
      console.error('Error deleting visitor:', err)
      toast.error('Failed to delete visitor')
    } finally {
      setIsDeleteModalOpen(false)
      setVisitorToDelete(null)
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
    const worksheet = workbook.addWorksheet('Visitors')

    // Define columns
    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Visitor ID', key: 'visitor_id', width: 15 },
      { header: 'First Name', key: 'firstname', width: 20 },
      { header: 'Middle Initial', key: 'middle_initial', width: 15 },
      { header: 'Last Name', key: 'lastname', width: 20 },
      { header: 'Suffix', key: 'suffix', width: 10 },
      { header: 'Address', key: 'address', width: 30 }
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
        visitor_id: row.visitor_id,
        firstname: row.firstname,
        middle_initial: row.middle_initial,
        lastname: row.lastname,
        suffix: row.suffix,
        address: row.address
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
      // Delete all visitor records from backend
      for (const visitor of visitorData) {
        await axios.delete(`/visitors/${visitor.id}`)
      }
      setVisitorData([])
      toast.success('All visitor records have been reset')
    } catch (err) {
      console.error('Error resetting visitor data:', err)
      toast.error('Failed to reset visitor records')
    } finally {
      setIsResetModalOpen(false)
      setIsResetLoading(false)
    }
  }

  // Handle reset filters only
  const handleResetFilters = () => {
    setSearchTerm('')
  }

  const columns = [
    { key: 'visitor_id', label: 'Visitor ID' },
    { key: 'firstname', label: 'First Name' },
    { key: 'middle_initial', label: 'M.I.' },
    { key: 'lastname', label: 'Last Name' },
    { key: 'suffix', label: 'Suffix' },
    { key: 'address', label: 'Address' },
  ]

  const renderActions = (row) => (
    <div className="flex items-center justify-center gap-2">
      <button
        onClick={() => handleView(row)}
        className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        title="View Visitor"
      >
        <FiEye className="w-4 h-4" />
      </button>
      <button
        onClick={() => handleEdit(row)}
        className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
        title="Edit Visitor"
      >
        <FiEdit2 className="w-4 h-4" />
      </button>
      <button
        onClick={() => handleDelete(row.id)}
        className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
        title="Delete Visitor"
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
          <h1 className="text-3xl font-bold text-gray-900">Visitors</h1>
          <p className="text-gray-600 mt-2">Manage visitor accounts and information</p>
        </div>

        <Card
          title="Visitor Management"
          icon={<FiUser className="w-6 h-6 text-[#0172f6]" />}
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
                placeholder="Search by visitor ID or name..."
                width="w-full"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
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
                label="Add Visitor"
                onClick={handleAdd}
                icon={<FiPlus className="w-3 h-3 sm:w-4 sm:h-4" />}
                variant="primary"
                size="sm"
                title="Add Visitor"
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
            emptyMessage="No visitor records found"
            keyField="id"
            itemLabel='visitor'
            loading={loading}
          />
        </Card>
      </main>

      <AddModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddSubmit}
        itemName="Visitor"
        fields={visitorFields}
        size="md"
        initialData={newlyAddedVisitor}
      />

      <EditModal
        isOpen={isEditModalOpen}
        onClose={() => { setIsEditModalOpen(false); setSelectedVisitor(null) }}
        onSubmit={handleEditSubmit}
        data={selectedVisitor}
        itemName="Visitor"
        fields={visitorEditFields}
        size="md"
      />

      <ViewModal
        isOpen={isViewModalOpen}
        onClose={() => { setIsViewModalOpen(false); setSelectedVisitor(null) }}
        data={selectedVisitor}
        itemName="Visitor"
        fields={visitorFields}
        size="md"
      />

      <ExportFilenameModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onConfirm={handleExportConfirm}
        defaultName={`visitors_${new Date().toISOString().split('T')[0]}`}
        itemName="Visitors"
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => { setIsDeleteModalOpen(false); setVisitorToDelete(null) }}
        onConfirm={handleConfirmDelete}
        title="Delete Visitor"
        type="delete"
        itemName="Visitor Record"
        isLoading={isDeleteLoading}
      />

      <DeleteConfirmationModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={handleConfirmReset}
        title="Reset All Visitor Records"
        message="Are you sure you want to reset all visitor records? This will clear all data and cannot be undone."
        type="reset"
        itemName="Visitor Data"
        isLoading={isResetLoading}
      />

      <SummaryModal
        isOpen={isSummaryModalOpen}
        onClose={() => { setIsSummaryModalOpen(false); setNewlyAddedVisitor(null) }}
        data={newlyAddedVisitor}
        autoCloseSeconds={30}
        itemName="Visitor"
      />
    </div>
  )
}
