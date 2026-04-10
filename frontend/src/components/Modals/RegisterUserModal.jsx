import React, { useState, useEffect } from 'react'
import Input_Text from '../Input_Fields/Input_Text.jsx'
import Button from '../Buttons/Button.jsx'
import Btn_X from '../Buttons/Btn_X.jsx'
import School_Logo from '../Logo/Client_Logo.jsx'
import Dropdown from '../Input_Fields/Dropdown.jsx'
import axiosInstance from '../../api/axios.js'
import { toast } from 'react-toastify'

const RegisterUserModal = ({ isOpen, onClose, onRegister }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [schools, setSchools] = useState([])
  const [courses, setCourses] = useState([])

  const [formData, setFormData] = useState({
    intern_id: '',
    firstName: '',
    middleInitial: '',
    lastName: '',
    suffix: '',
    school: '',
    course: ''
  })

  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.left = '0'
      document.body.style.right = '0'
      document.body.style.overflow = 'hidden'
      document.body.style.width = '100%'
    } else {
      const scrollY = document.body.style.top
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.left = ''
      document.body.style.right = ''
      document.body.style.overflow = ''
      document.body.style.width = ''
      window.scrollTo(0, parseInt(scrollY || '0') * -1)
    }

    return () => {
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.left = ''
      document.body.style.right = ''
      document.body.style.overflow = ''
      document.body.style.width = ''
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) {
      resetForm()
    }
  }, [isOpen])

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const response = await axiosInstance.get('/school')
        if (response.data.success) {
          setSchools(response.data.data.map(s => ({ value: s.id, label: s.school_name })))
        }
      } catch (error) {
        console.error('Error fetching schools:', error)
      }
    }
    fetchSchools()
  }, [])

  // Fetch courses when school is selected
  useEffect(() => {
    const fetchCourses = async () => {
      if (!formData.school) {
        setCourses([])
        return
      }
      try {
        const response = await axiosInstance.get(`/course?schoolId=${formData.school}`)
        if (response.data.success) {
          setCourses(response.data.data.map(c => ({ value: c.id, label: c.abbreviation || c.course_name })))
        }
      } catch (error) {
        console.error('Error fetching courses:', error)
      }
    }
    fetchCourses()
  }, [formData.school])

  const generateInternId = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    const length = 8
    let result = 'I'
    for (let i = 0; i < length - 1; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length))
    }
    return result
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
      // Clear course when school changes
      ...(name === 'school' ? { course: '' } : {})
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      const response = await axiosInstance.post('/intern', {
        id: formData.intern_id,
        firstName: formData.firstName,
        middleInitial: formData.middleInitial,
        lastName: formData.lastName,
        suffix: formData.suffix,
        schoolId: formData.school,
        courseId: formData.course
      })
      
      if (response.data.success) {
        toast.success('Intern registered successfully!')
        const submissionData = {
          ...formData,
          id: response.data.data.id,
          status: 'Active',
          type: 'faculty'
        }
        onRegister && onRegister(submissionData)
        resetForm()
        onClose()
      }
    } catch (error) {
      console.error('Error registering intern:', error)
      
      // Handle duplicate name error specifically
      if (error.response?.status === 409) {
        toast.error(error.response.data.message || 'An intern with this name already exists')
      } else {
        toast.error(error.response?.data?.message || 'Failed to register intern')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      intern_id: generateInternId(),
      firstName: '',
      middleInitial: '',
      lastName: '',
      suffix: '',
      school: '',
      course: ''
    })
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[400px] sm:max-w-[450px] relative flex flex-col items-center p-4 sm:p-5 animate-in zoom-in-95 duration-300">
        {/* Close Button */}
        <div className="absolute top-3 right-3 z-10">
          <Btn_X onClick={handleClose} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600" />
        </div>

        {/* Body */}
        <div className="p-4 sm:p-5 w-full">
          <div className="flex flex-col items-center text-center mb-3 w-full">
            <div className="mb-1">
              <School_Logo size={window.innerWidth < 640 ? 30 : 40} />
            </div>

            <h1 className="text-[#188b3e] text-sm sm:text-base font-black leading-tight mt-1 px-1">
              Nueva Vizcaya Electric Cooperative
            </h1>

            <h2 className="text-gray-800 text-sm font-bold uppercase tracking-tight mt-1">Register New Intern</h2>
          </div>

          {isOpen && (
            <form onSubmit={handleSubmit} className="w-full space-y-0.5 text-left">
              <div className="grid grid-cols-2 gap-3">
                <Input_Text
                  label="First Name"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="First name"
                  required
                />

              <Input_Text
                label="Middle Initial"
                name="middleInitial"
                value={formData.middleInitial}
                onChange={handleChange}
                placeholder="Middle initial"
              />
              </div>

               <Input_Text
                  label="Last Name"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Last name"
                  required
                />
              
              <Input_Text
                label="Suffix"
                name="suffix"
                value={formData.suffix}
                onChange={handleChange}
                placeholder="Suffix (e.g., Jr., Sr.)"
              />

              <Dropdown
                label="School"
                id="school"
                name="school"
                value={formData.school}
                onChange={handleChange}
                options={schools}
                placeholder="Select school"
                required
              />

              <Dropdown
                label="Course"
                id="course"
                name="course"
                value={formData.course}
                onChange={handleChange}
                options={courses}
                placeholder="Select course"
                required
              />

              <div className="pt-0.5">
                <Button
                  type="submit"
                  label="Register Intern"
                  variant="custom"
                  customColor="#188b3e"
                  size="sm"
                  className="w-full rounded-md font-bold text-sm py-1.5 shadow shadow-blue-600/20 active:scale-[0.98]"
                  isLoading={isLoading}
                  loadingText="Registering..."
                />
              </div>

              <div className="text-center pt-0.5">
                <p className="text-gray-500 text-xs">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="text-[#188b3e] font-bold hover:underline underline-offset-4 transition-all"
                  >
                    Cancel
                  </button>
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default RegisterUserModal
