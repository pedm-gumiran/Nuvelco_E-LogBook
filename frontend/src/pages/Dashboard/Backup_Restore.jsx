import React, { useState, useRef, useEffect } from 'react'
import DateTimeHeader from '../../components/Dashboard_Components/DateTimeHeader.jsx'
import Card from '../../components/Cards/Card.jsx'
import Button from '../../components/Buttons/Button.jsx'
import { FiDownload, FiUpload, FiDatabase, FiAlertCircle } from 'react-icons/fi'
import { toast } from 'react-toastify'
import ExcelJS from 'exceljs'
import { saveAs } from 'file-saver'

export default function Backup_Restore() {
  const [isBackingUp, setIsBackingUp] = useState(false)
  const [isRestoring, setIsRestoring] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef(null)

  // Hide scrollbar styles
  useEffect(() => {
    const style = document.createElement('style')
    style.setAttribute('data-scrollbar-hide', 'true')
    style.textContent = `
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
      const existing = document.querySelector('style[data-scrollbar-hide]')
      if (existing) existing.remove()
    }
  }, [])

  const handleBackup = async () => {
    setIsBackingUp(true)
    
    try {
      const response = await fetch('/api/backup/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      if (!response.ok) {
        throw new Error('Backup failed')
      }

      const data = await response.json()
      
      // Download the backup file
      const blob = new Blob([JSON.stringify(data.backup, null, 2)], { type: 'application/json' })
      const timestamp = new Date().toISOString().split('T')[0]
      saveAs(blob, `system_backup_${timestamp}.json`)
      
      toast.success('System backup created successfully!')
    } catch (error) {
      toast.error('Backup failed. Please try again.')
      console.error('Backup error:', error)
    } finally {
      setIsBackingUp(false)
    }
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0])
    }
  }

  const handleFileUpload = async (file) => {
    setIsRestoring(true)
    
    try {
      const formData = new FormData()
      formData.append('backupFile', file)

      const response = await fetch('/api/backup/restore', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Restore failed')
      }

      toast.success('System data restored successfully!')
    } catch (error) {
      toast.error('Restore failed. Please try again.')
      console.error('Restore error:', error)
    } finally {
      setIsRestoring(false)
    }
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-yellow-50 min-h-screen">
      <DateTimeHeader />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Backup & Restore</h1>
          <p className="text-gray-600 mt-2">Backup and restore your entire system data</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Backup Section */}
          <Card accentColor="border-blue-500">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue-100 rounded-xl">
                <FiDatabase className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Backup Data</h2>
                <p className="text-sm text-gray-600">Create a full system backup</p>
              </div>
            </div>

            <Button
              label={isBackingUp ? 'Creating Backup...' : 'Backup System Data'}
              onClick={handleBackup}
              icon={<FiDownload className="w-5 h-5" />}
              variant="modal-primary"
              size="lg"
              isLoading={isBackingUp}
              loadingText="Creating Backup..."
              disabled={isBackingUp}
              className="w-full"
            />
          </Card>

          {/* Restore Section */}
          <Card accentColor="border-green-500">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-green-100 rounded-xl">
                <FiUpload className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Restore Data</h2>
                <p className="text-sm text-gray-600">Restore from a backup file</p>
              </div>
            </div>

            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all mb-4 ${
                dragActive 
                  ? 'border-green-500 bg-green-50' 
                  : 'border-gray-300 hover:border-green-400 hover:bg-gray-50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="flex flex-col items-center gap-2">
                <FiUpload className={`w-8 h-8 ${dragActive ? 'text-green-600' : 'text-gray-400'}`} />
                <p className="text-sm font-medium text-gray-700">
                  {dragActive ? 'Drop file here' : 'Click or drag backup file here'}
                </p>
                <p className="text-xs text-gray-500">Supported: .json</p>
              </div>
            </div>

            {isRestoring && (
              <p className="text-center text-sm text-green-600">Restoring system data...</p>
            )}
          </Card>
        </div>

        {/* Warning */}
        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <FiAlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-medium mb-1">Important Warning</p>
              <p>Restoring from a backup will replace all current data. This action cannot be undone. Make sure to create a backup of your current data before proceeding.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
