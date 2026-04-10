import React, { useState, useEffect, useRef } from 'react'
import { FiCamera, FiCameraOff } from 'react-icons/fi'
import QrScanner from 'qr-scanner'

const QRScanner = ({ onScanComplete, className = '', disabled = false, isOpen = false }) => {
  const [isScanning, setIsScanning] = useState(false)
  const [scannedData, setScannedData] = useState('')
  const videoRef = useRef(null)
  const qrScannerRef = useRef(null)
  const bufferRef = useRef('')
  const lastKeyTimeRef = useRef(0)
  const scanTimeoutRef = useRef(null)
  const lastScanRef = useRef({ data: null, time: 0 })

  const [cameras, setCameras] = useState([])
  const [selectedCamera, setSelectedCamera] = useState('')
  const [isInsecureContext, setIsInsecureContext] = useState(false)

  // Check for secure context and list devices
  useEffect(() => {
    if (window.isSecureContext === false) {
      console.error('Camera access requires a secure context (HTTPS or localhost).')
      setIsInsecureContext(true)
    } else {
      const getDevices = async () => {
        try {
          const devices = await QrScanner.listCameras(true)
          setCameras(devices)
          if (devices.length > 0) {
            // Prefer non-virtual cameras if possible
            const physicalCamera = devices.find(d => !d.label.toLowerCase().includes('virtual') && !d.label.toLowerCase().includes('obs'))
            setSelectedCamera(physicalCamera ? physicalCamera.id : devices[0].id)
          }
        } catch (err) {
          console.error('Error listing cameras:', err)
        }
      }
      getDevices()
    }
  }, [])

  // Auto-start/stop camera based on isOpen prop
  useEffect(() => {
    if (isOpen && !disabled && !isInsecureContext && selectedCamera) {
      const timer = setTimeout(() => {
        startCamera(selectedCamera)
      }, 500)
      
      return () => {
        clearTimeout(timer)
        stopCamera()
      }
    } else if (!isOpen) {
      // Always stop camera when modal closes
      stopCamera()
    }
    
    return () => {
      stopCamera()
    }
  }, [isOpen, disabled, selectedCamera, isInsecureContext])

  // Handle physical barcode scanner input (keyboard emulation)
  useEffect(() => {
    if (disabled) return

    const handleKeyDown = (event) => {
      const currentTime = Date.now()
      const timeDiff = currentTime - lastKeyTimeRef.current
      
      // Barcode scanners send characters rapidly (usually < 50ms between keys)
      // If time between keys is > 100ms, it's likely manual typing, not a scanner
      if (timeDiff > 100 && bufferRef.current.length > 0) {
        bufferRef.current = ''
      }
      
      lastKeyTimeRef.current = currentTime
      
      // Check for Enter key (barcode scanners typically end with Enter)
      if (event.key === 'Enter') {
        if (bufferRef.current.length > 0) {
          const scannedCode = bufferRef.current.trim()
          console.log('Physical scanner detected:', scannedCode)
          handleScanSuccess(scannedCode)
          bufferRef.current = ''
          
          // Prevent Enter from propagating
          event.preventDefault()
          event.stopPropagation()
        }
      } else if (event.key.length === 1) {
        // Single character - likely from scanner
        bufferRef.current += event.key
      }
    }

    window.addEventListener('keydown', handleKeyDown, true)
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true)
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current)
      }
    }
  }, [disabled, onScanComplete])

  const startCamera = async (cameraId) => {
    if (qrScannerRef.current && isScanning) {
      stopCamera()
    }
    
    try {
      console.log('Starting QR scanner with device:', cameraId)
      
      if (!videoRef.current) {
        throw new Error('Video ref is not available')
      }

      // Initialize QR Scanner
      const scanner = new QrScanner(
        videoRef.current,
        (result) => {
          console.log('QR Code detected:', result.data)
          handleScanSuccess(result.data)
        },
        {
          highlightScanRegion: false,
          highlightCodeOutline: false,
          preferredCamera: cameraId || 'environment',
          maxScansPerSecond: 5
        }
      )

      // Workaround for 'willReadFrequently' warning
      const canvas = scanner.$canvas;
      if (canvas) {
        canvas.getContext('2d', { willReadFrequently: true });
      }

      qrScannerRef.current = scanner;
      await qrScannerRef.current.start()
      setIsScanning(true)

    } catch (err) {
      console.error('Failed to start QR scanner:', err)
      setIsScanning(false)
    }
  }

  const stopCamera = () => {
    // Stop the QR scanner
    if (qrScannerRef.current) {
      qrScannerRef.current.stop()
      qrScannerRef.current.destroy()
      qrScannerRef.current = null
    }
    
    // Also stop all video tracks to fully release the camera
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks()
      tracks.forEach(track => track.stop())
      videoRef.current.srcObject = null
    }
    
    setIsScanning(false)
  }

  const handleScanSuccess = (data) => {
    // Don't process scans if disabled
    if (disabled) {
      return
    }
    
    // Prevent duplicate scans within 5 seconds
    const now = Date.now()
    if (data === lastScanRef.current.data && now - lastScanRef.current.time < 5000) {
      return // Ignore duplicate scan
    }
    
    lastScanRef.current = { data, time: now }
    setScannedData(data)
    
    // Just pass the QR data, no image capture here
    if (onScanComplete) {
      onScanComplete(data)
    }
    
    // Automatically clear scanned data after 2 seconds to allow new scans
    setTimeout(() => {
      setScannedData('')
    }, 2000)
  }

  return (
    <div className={`relative ${className}`}>
      {/* Add custom CSS for scan line animation */}
      <style>{`
        @keyframes scan-line {
          0%, 100% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .animate-scan-line {
          animation: scan-line 2s linear infinite;
        }
      `}</style>
      
      {/* Camera View - Only show when modal is open */}
      {isOpen ? (
        <div className="relative bg-gray-900 rounded-lg overflow-hidden" style={{ minHeight: '150px' }}>
          <div className="relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover rounded-lg bg-black"
              onPlay={() => setIsScanning(true)}
            />
            
            {/* QR Code Scanning Guide - Only show when actually scanning */}
            {isScanning && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-20">
                <div className="relative">
                  {/* Main scanning frame - Much larger */}
                  <div className="w-48 h-48 border-2 border-white/30 rounded-xl">
                    {/* Scanning laser line - Animated moving line */}
                  <div className="absolute top-0 left-0 w-full h-0.5 bg-[#00ff00] shadow-[0_0_8px_rgba(0,255,0,0.8)] animate-scan-line z-10"></div>
                  
                  {/* Corner brackets with glow */}
                  <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-[#0172f6] rounded-tl-xl shadow-[0_0_10px_rgba(1,114,246,0.5)]"></div>
                  <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-[#0172f6] rounded-tr-xl shadow-[0_0_10px_rgba(1,114,246,0.5)]"></div>
                  <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-[#0172f6] rounded-bl-xl shadow-[0_0_10px_rgba(1,114,246,0.5)]"></div>
                  <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-[#0172f6] rounded-br-xl shadow-[0_0_10px_rgba(1,114,246,0.5)]"></div>
                    
                    {/* Guide text - Larger */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-white text-lg font-bold mb-2 drop-shadow-lg">Position QR</div>
                        <div className="text-white/80 text-sm drop-shadow-md">Align here</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Static frame border with glow */}
                  <div className="absolute inset-0 border-2 border-white/20 rounded-xl shadow-[inset_0_0_20px_rgba(1,114,246,0.3)]"></div>
                </div>
              </div>
            )}
            
            {/* Camera off overlay */}
            {(!isScanning || isInsecureContext) && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-30">
                <div className="text-center p-4 max-w-[80%]">
                  <FiCameraOff className="w-12 h-12 mx-auto mb-4 text-white/50" />
                  {isInsecureContext ? (
                    <>
                      <p className="text-sm font-bold text-red-400 mb-2">
                        HTTPS REQUIRED
                      </p>
                      <p className="text-xs text-white/80 mb-4">
                        Camera access is blocked because this page is not using HTTPS.
                      </p>
                      <button
                        onClick={() => window.location.protocol = 'https:'}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-full font-bold text-xs transition-all"
                      >
                        Switch to HTTPS
                      </button>
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-medium text-white mb-4">
                        {disabled ? 'Scanner disabled' : 'Camera is off'}
                      </p>
                      {!disabled && (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            startCamera(selectedCamera);
                          }}
                          className="#188b3ehover:bg-blue-700 text-white px-6 py-2 rounded-full font-bold transition-all transform hover:scale-105 active:scale-95"
                        >
                          Start Camera
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Placeholder when modal is closed */
        <div className="relative bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center" style={{ minHeight: '150px' }}>
          <div className="text-center p-4">
            <FiCameraOff className="w-12 h-12 mx-auto mb-2 text-gray-500" />
            <p className="text-gray-400 text-sm">Scanner inactive</p>
          </div>
        </div>
      )}

      {/* Control Buttons and Camera Selection - Only show when modal is open */}
      {isOpen && !isInsecureContext && !isScanning && (
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => startCamera(selectedCamera)}
            className="flex-1 #188b3ehover:bg-blue-700 text-white py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors"
          >
            <FiCamera /> Enable Camera
          </button>
        </div>
      )}

      {/* Scan Here Label - Only show when modal is open and scanning */}
      {isOpen && isScanning && (
        <div className="mt-4 text-center">
          <div className="inline-block px-8 py-2 bg-[#188b3e] rounded-full shadow-lg transform transition-all duration-300">
             <h1 className="font-bold text-lg sm:text-xl tracking-tight text-white uppercase">
                Scan here
              </h1>
          </div>
          <div className="h-1 w-16 #188b3emx-auto rounded-full mt-2 animate-pulse"></div>
        </div>
      )}

      {/* Scanned Data Display */}
    </div>
  )
}

export default QRScanner
