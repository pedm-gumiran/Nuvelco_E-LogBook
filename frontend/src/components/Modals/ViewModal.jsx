import React, { useEffect, useState, useRef } from 'react'
import Button from '../Buttons/Button.jsx'
import Btn_X from '../Buttons/Btn_X.jsx'
import Input_Text from '../Input_Fields/Input_Text.jsx'
import Input_Password from '../Input_Fields/Input_Password.jsx'
import Dropdown from '../Input_Fields/Dropdown.jsx'
import TextArea from '../Input_Fields/TextArea.jsx'
import QRCode from 'qrcode'
import { FiDownload } from 'react-icons/fi'

/**
 * ViewModal - A dedicated modal for viewing record details
 * 
 * @param {boolean} isOpen - Whether the modal is visible
 * @param {function} onClose - Function to close the modal
 * @param {Object} data - The record data to display
 * @param {string} itemName - Name of the item (e.g., 'Faculty', 'Attendance Record')
 * @param {Array} fields - Array of field configurations to display
 *   Each field: { name, label, type }
 * @param {string} size - Modal size: 'sm', 'md', 'lg', 'xl'
 */
const ViewModal = ({
  isOpen,
  onClose,
  data = {},
  itemName = 'Item',
  fields = [],
  size = 'md'
}) => {
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const qrRef = useRef(null)

  // Generate QR code when modal opens or data changes
  useEffect(() => {
    if (isOpen && data && (data.intern_id || data.visitor_id)) {
      const id = data.intern_id || data.visitor_id
      generateQRCode(id)
    }
  }, [isOpen, data])

  // Generate QR code for ID
  const generateQRCode = async (id) => {
    try {
      const qrData = `${itemName.toLowerCase()}_id:${id}`
      const url = await QRCode.toDataURL(qrData, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })
      setQrCodeUrl(url)
    } catch (error) {
      console.error('Error generating QR code:', error)
    }
  }

  // Download QR code
  const downloadQRCode = () => {
    if (qrCodeUrl) {
      const recordId = data.intern_id || data.visitor_id || ''
      
      // Create canvas with white background and padding
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const qrSize = 200
      const padding = 20
      const borderWidth = 2
      const totalSize = qrSize + (padding * 2) + (borderWidth * 2)
      
      canvas.width = totalSize
      canvas.height = totalSize
      
      // Fill white background
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(0, 0, totalSize, totalSize)
      
      // Draw border
      ctx.strokeStyle = '#000000'
      ctx.lineWidth = borderWidth
      ctx.strokeRect(borderWidth, borderWidth, totalSize - (borderWidth * 2), totalSize - (borderWidth * 2))
      
      // Draw QR code with padding
      const img = new Image()
      img.onload = () => {
        ctx.drawImage(img, padding + borderWidth, padding + borderWidth, qrSize, qrSize)
        
        // Download the canvas as image
        const downloadLink = document.createElement('a')
        downloadLink.download = `QR-${itemName}-${recordId}.png`
        downloadLink.href = canvas.toDataURL('image/png')
        downloadLink.click()
      }
      img.src = qrCodeUrl
    }
  }
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
      const scrollY = document.body.style.top
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.left = ''
      document.body.style.right = ''
      document.body.style.width = ''
      document.body.style.overflow = ''
      window.scrollTo(0, parseInt(scrollY || '0') * -1)
    }
  }, [isOpen])

  // Size classes mapping
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  }

  // Render field using pre-built components in disabled mode
  const renderField = (field) => {
    const { name, label, type = 'text', options = [] } = field
    const value = data[name]
    const fieldLabel = label || name

    switch (type) {
      case 'select':
        return (
          <div className="flex flex-col gap-1" key={name}>
            <Dropdown
              id={name}
              name={name}
              label={fieldLabel}
              value={value || ''}
              onChange={() => {}}
              options={options.map(opt => ({
                value: typeof opt === 'object' ? opt.value : opt,
                label: typeof opt === 'object' ? opt.label : opt
              }))}
              placeholder="Not selected"
              disabled={true}
              className="bg-gray-50"
            />
          </div>
        )

      case 'textarea':
        return (
          <div className="flex flex-col gap-1" key={name}>
            <TextArea
              id={name}
              name={name}
              label={fieldLabel}
              value={value || ''}
              onChange={() => {}}
              placeholder="Not provided"
              disabled={true}
              rows={4}
              resize="none"
              text_ClassName="bg-gray-50"
            />
          </div>
        )

      case 'password':
        return (
          <div className="flex flex-col gap-1" key={name}>
            <Input_Password
              name={name}
              label={fieldLabel}
              value={value || ''}
              onChange={() => {}}
              placeholder="Not provided"
              disabled={true}
              password_className="bg-gray-50"
            />
          </div>
        )

      default:
        return (
          <div className="flex flex-col gap-1" key={name}>
            <Input_Text
              id={name}
              name={name}
              label={fieldLabel}
              type={type}
              value={value || ''}
              onChange={() => {}}
              placeholder="Not provided"
              disabled={true}
              text_ClassName="bg-gray-50 cursor-not-allowed"
            />
          </div>
        )
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal */}
      <div className={`relative w-full ${sizeClasses[size]} mx-4 bg-white rounded-3xl shadow-2xl animate-fadeIn`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#168e3f] rounded-t-3xl">
          <div className="flex items-center gap-3">
     
            <h2 className="text-lg font-semibold text-white">{itemName} Details</h2>
          </div>
          <Btn_X onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors text-white/80 hover:text-white" />
        </div>

        {/* Body */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          <div className={`grid gap-4 ${fields.length > 6 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
            {fields.map(field => renderField(field))}
          </div>
          
          {/* QR Code Section */}
          {(data.intern_id || data.visitor_id) && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex flex-col items-center">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  {itemName} ID QR Code
                </h3>
                <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200 relative">
                  {qrCodeUrl ? (
                    <img 
                      src={qrCodeUrl} 
                      alt={`${itemName} QR Code`} 
                      className="w-48 h-48 object-contain"
                    />
                  ) : (
                    <div className="w-48 h-48 flex items-center justify-center bg-gray-100 rounded-lg">
                      <span className="text-gray-500 text-sm">Generating QR Code...</span>
                    </div>
                  )}
                </div>
                
                {/* Download Button */}
                <button
                  onClick={downloadQRCode}
                  disabled={!qrCodeUrl}
                  className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105"
                  title="Download QR Code"
                >
                  <FiDownload className="w-4 h-4" />
                  <span className="text-sm font-medium">Download QR</span>
                </button>
                
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Scan this QR code to quickly access {itemName.toLowerCase()} information
                </p>
              </div>
            </div>
          )}
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

export default ViewModal
