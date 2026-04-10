import React, { useRef, useState, useEffect } from 'react'
import { FiCamera, FiRefreshCw, FiSave, FiUser, FiLoader } from 'react-icons/fi'

const CameraCaptureModal = ({ isOpen, internName, onSave, onRetry, isLoading = false }) => {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [capturedImage, setCapturedImage] = useState(null)
  const [isCapturing, setIsCapturing] = useState(false)
  const [retakeCount, setRetakeCount] = useState(0)
  const MAX_RETAKES = 2
  const streamRef = useRef(null)

  // Start camera when modal opens
  useEffect(() => {
    if (isOpen) {
      startCamera()
      setRetakeCount(0) // Reset retake count when modal opens
    } else {
      stopCamera()
      setCapturedImage(null)
      setRetakeCount(0)
    }

    return () => {
      stopCamera()
    }
  }, [isOpen])

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 }
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
      }
    } catch (err) {
      console.error('Failed to start camera:', err)
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    
    canvas.width = video.videoWidth || 640
    canvas.height = video.videoHeight || 480
    
    const ctx = canvas.getContext('2d')
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    
    // Convert to base64 (compressed)
    const base64Image = canvas.toDataURL('image/jpeg', 0.7)
    setCapturedImage(base64Image)
  }

  const handleRetry = () => {
    if (retakeCount >= MAX_RETAKES) {
      return // Don't allow more retakes
    }
    setRetakeCount(prev => prev + 1)
    setCapturedImage(null)
    // Restart camera for unlimited retakes
    startCamera()
    if (onRetry) onRetry()
  }

  const handleSave = () => {
    if (capturedImage) {
      stopCamera()
      onSave(capturedImage)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-[#188b3e] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <FiUser className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg">Verify Attendance</h2>
              <p className="text-white/80 text-sm">{internName || 'Intern'}</p>
            </div>
          </div>
        </div>

        {/* Camera Preview or Captured Image */}
        <div className="p-6 relative">
          {/* Loading Overlay */}
          {isLoading && (
            <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm rounded-2xl">
              <div className="flex items-center gap-3">
                <FiLoader className="w-6 h-6 text-white animate-spin" />
                <p className="text-white font-bold text-lg">Saving Attendance...</p>
              </div>
              <p className="text-white/80 text-sm mt-2">Please wait</p>
            </div>
          )}
          <div className="relative aspect-[4/3] bg-gray-900 rounded-xl overflow-hidden mb-6">
            {!capturedImage ? (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                {/* Face Guide Overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-48 h-56 border-2 border-white/50 rounded-full">
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/70 text-xs font-medium">
                      Position face here
                    </div>
                  </div>
                </div>
                {/* Capture Button Overlay */}
                <button
                  onClick={captureImage}
                  disabled={isCapturing || isLoading}
                  className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white text-gray-900 px-4 py-2 rounded-full font-bold text-sm flex items-center gap-2 hover:bg-gray-100 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiCamera className="w-4 h-4" />
                  Capture Photo
                </button>
              </>
            ) : (
              <img
                src={capturedImage}
                alt="Captured"
                className="w-full h-full object-cover"
              />
            )}
          </div>

          {/* Hidden Canvas */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Action Buttons */}
          <div className="flex gap-3">
            {!capturedImage ? (
              <button
                onClick={handleRetry}
                disabled={isLoading}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiRefreshCw className="w-4 h-4" />
                Retry
              </button>
            ) : (
              <>
                {retakeCount < MAX_RETAKES ? (
                  <button
                    onClick={handleRetry}
                    disabled={isLoading}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiRefreshCw className="w-4 h-4" />
                    {retakeCount === 0 ? 'Retake (2 remaining)' : 'Retake (1 remaining)'}
                  </button>
                ) : (
                  <div className="flex-1 bg-[#188b3e]/10 border border-[#188b3e]/30 text-[#188b3e] font-semibold py-3 px-4 rounded-xl flex items-center justify-center">
                    This image will be saved
                  </div>
                )}
                <button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="flex-1 bg-[#188b3e] hover:bg-[#147a35] text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <FiLoader className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <FiSave className="w-4 h-4" />
                      Save Attendance
                    </>
                  )}
                </button>
              </>
            )}
          </div>

          {/* Instructions */}
          <p className="text-center text-gray-500 text-xs mt-4">
            {!capturedImage 
              ? 'Please capture a clear photo of the intern for attendance verification'
              : 'Review the photo and click Save to record attendance'
            }
          </p>
        </div>
      </div>
    </div>
  )
}

export default CameraCaptureModal
