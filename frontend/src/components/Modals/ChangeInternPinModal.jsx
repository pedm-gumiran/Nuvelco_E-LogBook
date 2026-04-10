import React, { useState } from 'react'
import Button from '../Buttons/Button.jsx'
import Btn_X from '../Buttons/Btn_X.jsx'
import Input_Password from '../Input_Fields/Input_Password.jsx'
import Input_Text from '../Input_Fields/Input_Text.jsx'
import { FiLock, FiShield } from 'react-icons/fi'
import axiosInstance from '../../api/axios.js'
import { toast } from 'react-toastify'

const ChangeInternPinModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    newPin: '',
    confirmPin: ''
  })
  const [currentPin, setCurrentPin] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Fetch current pin on mount
  React.useEffect(() => {
    const fetchCurrentPin = async () => {
      try {
        const response = await axiosInstance.get('/pincodes/faculty-pin')
        if (response.data.success && response.data.data) {
          setCurrentPin(response.data.data.pin)
        } else {
          setCurrentPin('123456') // Fallback default
        }
      } catch (err) {
        console.error('Error fetching current pin:', err)
        setCurrentPin('123456') // Fallback default
      }
    }

    if (isOpen) {
      fetchCurrentPin()
    }
  }, [isOpen])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
    setSuccess('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Basic validation
    if (formData.newPin.length !== 6 || !/^\d+$/.test(formData.newPin)) {
      setError('New PIN must be 6 digits')
      setIsLoading(false)
      return
    }

    if (formData.newPin !== formData.confirmPin) {
      setError('New PINs do not match')
      setIsLoading(false)
      return
    }

    try {
      const response = await axiosInstance.put('/pincodes/faculty-pin', {
        pinCode: formData.newPin
      })

      if (response.data.success) {
        setSuccess('Intern PIN updated successfully!')
        setCurrentPin(formData.newPin)
        setFormData({
          newPin: '',
          confirmPin: ''
        })
        setTimeout(() => {
          onClose()
          setSuccess('')
        }, 2000)
      } else {
        setError(response.data.message || 'Failed to update PIN')
      }
    } catch (err) {
      console.error('Error updating PIN:', err)
      setError(err.response?.data?.message || 'Failed to update PIN. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white font-semibold">
            <FiShield className="w-5 h-5" />
            <span>Change Intern PIN</span>
          </div>
          <Btn_X onClick={onClose} className="text-white/80 hover:text-white hover:bg-white/10 p-1 rounded-full transition-colors" />
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-2">
              <FiLock className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-sm text-gray-500">
              Update the security PIN used for intern self-registration.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input_Text
              label="Current PIN"
              value={currentPin}
              disabled
              placeholder="Current PIN"
            />
            <Input_Password
              label="New PIN"
              name="newPin"
              value={formData.newPin}
              onChange={handleChange}
              placeholder="Enter new 6-digit PIN"
              maxLength={6}
              required
            />
            <Input_Password
              label="Confirm New PIN"
              name="confirmPin"
              value={formData.confirmPin}
              onChange={handleChange}
              placeholder="Confirm new 6-digit PIN"
              maxLength={6}
              required
            />

            {error && (
              <div className="bg-red-50 text-red-600 text-xs py-2 px-3 rounded-md text-center font-medium animate-shake">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 text-green-600 text-xs py-2 px-3 rounded-md text-center font-medium">
                {success}
              </div>
            )}

            <div className="pt-2">
              <Button
                type="submit"
                label="Update PIN"
                variant="primary"
                className="w-full py-2.5 rounded-xl font-bold"
                isLoading={isLoading}
                loadingText="Updating..."
              />
            </div>
          </form>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-shake { animation: shake 0.2s ease-in-out 0s 2; }
      `}</style>
    </div>
  )
}

export default ChangeInternPinModal
