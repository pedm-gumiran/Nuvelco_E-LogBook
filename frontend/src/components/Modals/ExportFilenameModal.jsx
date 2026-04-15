import React, { useState, useEffect } from 'react'
import { FiX, FiDownload } from 'react-icons/fi'
import Button from '../Buttons/Button.jsx'

/**
 * ExportFilenameModal - A modal for entering export filename
 * 
 * @param {boolean} isOpen - Whether the modal is visible
 * @param {function} onClose - Function to close the modal
 * @param {function} onConfirm - Function called with the filename when confirmed
 * @param {string} defaultName - Default filename suggestion
 * @param {string} itemName - Name of the item being exported (e.g., 'Faculty', 'Attendance')
 */
const ExportFilenameModal = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  defaultName = '',
  itemName = 'Data'
}) => {
  const [filename, setFilename] = useState('')

  useEffect(() => {
    if (isOpen) {
      setFilename(defaultName)
    }
  }, [isOpen, defaultName])

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => (document.body.style.overflow = '')
  }, [isOpen])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (filename.trim()) {
      onConfirm(filename.trim())
      // Don't close immediately here, the parent will handle it after the async export finishes
      // or if we want to close it here, we should check isLoading.
      // But since we want the MODAL to show loading, we shouldn't onClose() here.
    }
  }

  const handleClose = () => {
    if (isLoading) return;
    setFilename('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />

      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <FiDownload className="w-5 h-5 text-green-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800">Export {itemName}</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">
              Filename
            </label>
            <input
              type="text"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              placeholder="Enter filename..."
              className={`w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-[#188b3e] focus:ring-2 focus:ring-blue-200 bg-white outline-none transition-all ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
              autoFocus
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500">
              The file will be saved as: <span className="font-medium text-gray-700">{filename || 'export'}.xlsx</span>
            </p>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 rounded-b-2xl">
          <div className="flex items-center justify-end gap-3">
            <Button
              variant="modal-secondary"
              onClick={handleClose}
              disabled={isLoading}
              label="Cancel"
            />
            <Button
              variant="modal-primary"
              onClick={handleSubmit}
              label="Export"
              isLoading={isLoading}
              loadingText="Exporting..."
              icon={<FiDownload className="w-4 h-4" />}
            />
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

export default ExportFilenameModal
