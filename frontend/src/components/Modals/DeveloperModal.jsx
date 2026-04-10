import React, { useEffect } from 'react'
import {  FiMail, FiX, FiFacebook } from 'react-icons/fi'
import Button from '../Buttons/Button.jsx'

/**
 * DeveloperModal - Shows developer information and contact options
 * 
 * @param {boolean} isOpen - Whether the modal is visible
 * @param {function} onClose - Function to close the modal
 */
const DeveloperModal = ({ isOpen, onClose }) => {
  // Disable scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.left = '0'
      document.body.style.right = '0'
      document.body.style.width = '100%'
      document.body.style.overflow = 'hidden'
    } else {
      const scrollY = document.body.style.top
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.left = ''
      document.body.style.right = ''
      document.body.style.width = ''
      document.body.style.overflow = ''
      window.scrollTo(0, parseInt(scrollY || '0') * -1)
    }
    return () => {
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.left = ''
      document.body.style.right = ''
      document.body.style.width = ''
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleContactDeveloper = () => {
    window.location.href = 'https://web.facebook.com/petergumiranjr'
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-600 to-green-600 rounded-t-2xl">
          <div className="flex items-center gap-3">
          
            <h2 className="text-lg font-semibold text-white">Developer</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors text-white/80 hover:text-white"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Developer Info */}
          <div className="text-center mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-green-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-3xl font-bold text-white">PG</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900">Pedro M. Gumiran Jr.</h3>
            <p className="text-sm text-gray-500 mt-1">Creator of QR-Attendance Keeper</p>
          </div>

          {/* Description */}
          <p className="text-gray-600 text-center mb-6 text-sm">
            Have questions about the system or need assistance? 
            Get in touch with the developer.
          </p>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              label="Contact Developer"
              onClick={handleContactDeveloper}
              icon={<FiMail className="w-4 h-4" />}
              variant="custom"
              customColor="#188b3e"
              size="md"
              className="w-full"
            />
          </div>

          {/* Social Links */}
          <div className="flex justify-center gap-4 mt-6 pt-6 border-t border-gray-200">
            <a 
              href="https://web.facebook.com/petergumiranjr" 
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
              title="Facebook"
            >
              <FiFacebook className="w-5 h-5" />
            </a>
            <a 
              href="mailto:gumiranpeter102816@gmail.com "
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
              title="Gmail"
            >
              <FiMail className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
      `}</style>
    </div>
  )
}

export default DeveloperModal
