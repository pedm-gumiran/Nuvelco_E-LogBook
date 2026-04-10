import React, { useEffect, useState, useRef } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { FiCheckCircle, FiDownload, FiUser, FiX } from 'react-icons/fi'

const SummaryModal = ({
  isOpen,
  onClose,
  data,
  autoCloseSeconds = 30,
  itemName = 'Faculty'
}) => {
  const [countdown, setCountdown] = useState(autoCloseSeconds)
  const qrRef = useRef(null)

  useEffect(() => {
    if (!isOpen) {
      setCountdown(autoCloseSeconds)
      return
    }
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          onClose()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [isOpen, onClose, autoCloseSeconds])

  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY
      document.body.style.overflow = 'hidden'
      document.body.style.position = 'fixed'
      document.body.style.width = '100%'
      document.body.style.top = `-${scrollY}px`
      return () => {
        document.body.style.overflow = ''
        document.body.style.position = ''
        document.body.style.width = ''
        document.body.style.top = ''
        window.scrollTo(0, scrollY)
      }
    }
  }, [isOpen])

  if (!isOpen || !data) return null

  const recordId = data.visitor_id || data.faculty_id || data.id || ''
  const fullName = `${data.firstname || ''} ${data.middle_initial ? data.middle_initial + '. ' : ''}${data.lastname || ''} ${data.suffix || ''}`.trim()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-sm bg-white rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Top Progress Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gray-100">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-1000 ease-linear"
            style={{ width: `${(countdown / autoCloseSeconds) * 100}%` }}
          />
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all z-10"
        >
          <FiX className="w-5 h-5" />
        </button>

        {/* Success Header */}
        <div className="px-6 pt-6 pb-3 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-3">
            <FiCheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <h2 className="text-lg font-bold text-gray-900">
            {fullName}
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            ID: <span className="font-mono">{recordId}</span>
          </p>
        </div>

        {/* Main Content */}
        <div className="px-6 pb-6">
          {/* QR Code */}
          <div className="flex flex-col items-center">
            <div 
              className="bg-white p-3 rounded-lg shadow-sm border border-gray-200" 
              ref={qrRef}
            >
              <QRCodeSVG 
                value={recordId} 
                size={140}
                level="H"
                includeMargin={false}
                bgColor="#ffffff"
                fgColor="#000000"
              />
            </div>
            
            <button
              onClick={() => {
                const svg = qrRef.current?.querySelector('svg')
                if (svg) {
                  const svgData = new XMLSerializer().serializeToString(svg)
                  
                  // Create canvas with white background and padding
                  const canvas = document.createElement('canvas')
                  const ctx = canvas.getContext('2d')
                  const qrSize = 140
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
                  
                  // Convert SVG to image and draw with padding
                  const img = new Image()
                  img.onload = () => {
                    ctx.drawImage(img, padding + borderWidth, padding + borderWidth, qrSize, qrSize)
                    
                    // Download the canvas as image
                    const pngFile = canvas.toDataURL('image/png')
                    const downloadLink = document.createElement('a')
                    downloadLink.download = `QR-${recordId}.png`
                    downloadLink.href = pngFile
                    downloadLink.click()
                  }
                  img.src = 'data:image/svg+xml;base64,' + btoa(svgData)
                }
              }}
              className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105"
              title="Download QR"
            >
              <FiDownload className="w-4 h-4" />
              <span className="text-sm font-medium">Download QR</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SummaryModal
