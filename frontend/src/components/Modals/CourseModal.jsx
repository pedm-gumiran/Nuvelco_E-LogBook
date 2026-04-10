import React, { useState, useEffect } from 'react'
import { FiBook, FiPlus, FiRotateCcw, FiRefreshCw, FiUsers, FiX, FiLoader } from 'react-icons/fi'
import { toast } from 'react-toastify'
import axios from '../../api/axios.js'
import SearchBar from '../../components/Input_Fields/SearchBar.jsx'
import Button from '../../components/Buttons/Button.jsx'
import ItemCard from '../../components/Cards/ItemCard.jsx'
import AddModal from './AddModal.jsx'
import EditModal from './EditModal.jsx'
import ViewModal from './ViewModal.jsx'
import DeleteConfirmationModal from './DeleteConfirmationModal.jsx'
import InternModal from './InternModal.jsx'

export default function CourseModal({ isOpen, onClose, school }) {
  const [courseData, setCourseData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isResetModalOpen, setIsResetModalOpen] = useState(false)
  const [courseToDelete, setCourseToDelete] = useState(null)
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [isDeleteLoading, setIsDeleteLoading] = useState(false)
  const [isResetLoading, setIsResetLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [openMenuId, setOpenMenuId] = useState(null)
  const [isInternModalOpen, setIsInternModalOpen] = useState(false)
  const [selectedCourseForIntern, setSelectedCourseForIntern] = useState(null)

  // Fetch course data from backend - filter by school if provided
  const fetchCourseData = async (showLoading = true) => {
    if (showLoading) {
      setLoading(true)
    } else {
      setIsRefreshing(true)
    }
    setError(null)
    try {
      const params = school?.id ? `?schoolId=${school.id}` : ''
      const response = await axios.get(`/course${params}`)
      if (response.data.success) {
        // Format dates to readable format
        const formattedData = response.data.data.map(course => ({
          ...course,
          created_at: formatDate(course.created_at),
          updated_at: formatDate(course.updated_at)
        }))
        setCourseData(formattedData)
      }
    } catch (err) {
      console.error('Error fetching course data:', err)
      setError('Failed to load course data')
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

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  useEffect(() => {
    if (isOpen) {
      fetchCourseData()
    }
  }, [isOpen])

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null)
    if (openMenuId !== null) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [openMenuId])

  // Field configuration for AddModal - course name and abbreviation
  const courseFields = [
    { name: 'course_name', label: 'Course Name', type: 'text', required: true, placeholder: 'Enter course name' },
    { 
      name: 'abbreviation', 
      label: 'Abbreviation', 
      type: 'text', 
      required: false, 
      placeholder: 'e.g. BSIT, BSCS',
      tooltip: 'Abbreviation is used for simplifying the course name'
    }
  ]

  // Field configuration for EditModal - course name and abbreviation
  const courseEditFields = [
    { name: 'course_name', label: 'Course Name', type: 'text', required: true, placeholder: 'Enter course name' },
    { 
      name: 'abbreviation', 
      label: 'Abbreviation', 
      type: 'text', 
      required: false, 
      placeholder: 'e.g. BSIT, BSCS',
      tooltip: 'Abbreviation is used for simplifying the course name'
    }
  ]

  // Filter course data
  const filteredData = courseData.filter(course => {
    return course.course_name?.toLowerCase().includes(searchTerm.toLowerCase())
  })

  // Handle refresh data
  const handleRefresh = async () => {
    await fetchCourseData(false)
    toast.success('Course data refreshed successfully')
  }

  // Handle add new course
  const handleAdd = () => {
    setIsAddModalOpen(true)
  }

  // Handle card click to open intern modal
  const handleCardClick = (course) => {
    setSelectedCourseForIntern(course)
    setIsInternModalOpen(true)
  }

  // Handle edit course
  const handleEdit = (course) => {
    setSelectedCourse(course)
    setIsEditModalOpen(true)
  }

  // Handle view course
  const handleView = (course) => {
    setSelectedCourse(course)
    setIsViewModalOpen(true)
  }

  // Handle add submit
  const handleAddSubmit = async (formData) => {
    try {
      const newCourse = {
        courseName: formData.course_name,
        abbreviation: formData.abbreviation || null,
        schoolId: school?.id || null
      }

      const response = await axios.post('/course', newCourse)
      if (response.data.success) {
        await fetchCourseData(false)
        setIsAddModalOpen(false)
        toast.success('Course added successfully')
      } else {
        toast.error(response.data.message || 'Failed to add course')
        throw new Error(response.data.message || 'Failed to add course')
      }
    } catch (err) {
      console.error('Error adding course:', err)
      if (err.response?.status === 409) {
        toast.error(err.response.data.message || 'A course with this name already exists')
      } else {
        toast.error('Failed to add course')
      }
      throw err
    }
  }

  // Handle edit submit
  const handleEditSubmit = async (formData) => {
    try {
      if (selectedCourse) {
        const updatedCourse = {
          courseName: formData.course_name,
          abbreviation: formData.abbreviation || null
        }

        const response = await axios.put(`/course/${selectedCourse.id}`, updatedCourse)
        if (response.data.success) {
          setCourseData(prev => prev.map(c => c.id === selectedCourse.id ? { 
            ...c, 
            course_name: formData.course_name,
            abbreviation: formData.abbreviation || null,
            updated_at: formatDate(new Date().toISOString())
          } : c))
          toast.success('Course updated successfully')
        } else {
          toast.error(response.data.message || 'Failed to update course')
        }
      }
      setIsEditModalOpen(false)
      setSelectedCourse(null)
    } catch (err) {
      console.error('Error updating course:', err)
      if (err.response?.status === 409) {
        toast.error(err.response.data.message || 'A course with this name already exists')
      } else {
        toast.error('Failed to update course')
      }
    }
  }

  // Handle delete course - open confirmation modal
  const handleDelete = (id) => {
    setCourseToDelete(id)
    setIsDeleteModalOpen(true)
  }

  // Handle confirm delete
  const handleConfirmDelete = async () => {
    setIsDeleteLoading(true)
    try {
      if (courseToDelete) {
        const response = await axios.delete(`/course/${courseToDelete}`)
        if (response.data.success) {
          setCourseData(prev => prev.filter(c => c.id !== courseToDelete))
          toast.success('Course deleted successfully')
        }
      }
    } catch (err) {
      console.error('Error deleting course:', err)
      toast.error('Failed to delete course')
    } finally {
      setIsDeleteModalOpen(false)
      setCourseToDelete(null)
      setIsDeleteLoading(false)
    }
  }

  // Handle reset all - open confirmation modal
  const handleReset = () => {
    setIsResetModalOpen(true)
  }

  // Handle confirm reset
  const handleConfirmReset = async () => {
    setIsResetLoading(true)
    try {
      for (const course of courseData) {
        await axios.delete(`/course/${course.id}`)
      }
      setCourseData([])
      toast.success('All course records have been reset')
    } catch (err) {
      console.error('Error resetting course data:', err)
      toast.error('Failed to reset course records')
    } finally {
      setIsResetModalOpen(false)
      setIsResetLoading(false)
    }
  }

  // Handle reset filters only
  const handleResetFilters = () => {
    setSearchTerm('')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full h-full max-w-7xl mx-auto overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between z-10">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {school ? `${school.school_name} - Courses` : 'Courses'}
            </h1>
            <p className="text-gray-600 mt-1">Manage course information</p>
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
              <FiBook className="w-5 h-5 text-[#188b3e]" />
              Course Management
            </h2>

            <div className="flex flex-col lg:flex-row gap-3 mb-4">
              <div className="flex-1">
                <SearchBar
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by course name..."
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
                  label="Add Course"
                  onClick={handleAdd}
                  icon={<FiPlus className="w-3 h-3 sm:w-4 sm:h-4" />}
                  variant="primary"
                  size="sm"
                  title="Add Course"
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
                No course records found
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredData.map((course) => (
                  <ItemCard
                    key={course.id}
                    item={course}
                    displayTitle={course.abbreviation || course.course_name}
                    displaySubtitle={course.abbreviation ? course.course_name : null}
                    count={course.intern_count || 0}
                    countLabel={course.intern_count === 1 ? 'student' : 'students'}
                    onClick={() => handleCardClick(course)}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    isMenuOpen={openMenuId === course.id}
                    onMenuToggle={(id) => setOpenMenuId(openMenuId === id ? null : id)}
                    onMenuClose={() => setOpenMenuId(null)}
                  />
                ))}
              </div>
            )}
          </div>
        </main>

        <AddModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSubmit={handleAddSubmit}
          itemName="Course"
          fields={courseFields}
          size="md"
        />

        <EditModal
          isOpen={isEditModalOpen}
          onClose={() => { setIsEditModalOpen(false); setSelectedCourse(null) }}
          onSubmit={handleEditSubmit}
          data={selectedCourse}
          itemName="Course"
          fields={courseEditFields}
          size="md"
        />

        <ViewModal
          isOpen={isViewModalOpen}
          onClose={() => { setIsViewModalOpen(false); setSelectedCourse(null) }}
          data={selectedCourse}
          itemName="Course"
          fields={courseFields}
          size="md"
        />

        <DeleteConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={() => { setIsDeleteModalOpen(false); setCourseToDelete(null) }}
          onConfirm={handleConfirmDelete}
          title="Delete Course"
          type="delete"
          itemName="Course"
          isLoading={isDeleteLoading}
        />

        <DeleteConfirmationModal
          isOpen={isResetModalOpen}
          onClose={() => setIsResetModalOpen(false)}
          onConfirm={handleConfirmReset}
          title="Reset All Course Records"
          message="Are you sure you want to reset all course records? This will clear all data and cannot be undone."
          type="reset"
          itemName="Course Data"
          isLoading={isResetLoading}
        />

        <InternModal
          isOpen={isInternModalOpen}
          onClose={() => {
            setIsInternModalOpen(false)
            setSelectedCourseForIntern(null)
          }}
          school={school}
          course={selectedCourseForIntern}
          onInternAdded={fetchCourseData}
        />
      </div>
    </div>
  )
}
