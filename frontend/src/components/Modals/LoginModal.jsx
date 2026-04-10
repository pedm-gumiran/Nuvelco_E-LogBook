import React, { useState, useEffect } from 'react'
import Input_Text from '../Input_Fields/Input_Text.jsx'
import Input_Password from '../Input_Fields/Input_Password.jsx'
import Btn_X from '../Buttons/Btn_X.jsx'
import Button from '../Buttons/Button.jsx'
import Client_Logo from '../Logo/System_Logo.jsx'
import RegisterModal from './RegisterModal.jsx'
import ForgotPasswordModal from './ForgotPasswordModal.jsx'
import ResetPasswordModal from './ResetPasswordModal.jsx'
import { useNavigate } from 'react-router-dom'
import { FiUser, FiLock, FiEye } from 'react-icons/fi'
import axiosInstance from '../../api/axios.js'
import { toast } from 'react-toastify'
import historyManager from '../../utils/historyManager.js'

const LoginModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate()
  const [showRegister, setShowRegister] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [showResetPassword, setShowResetPassword] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [adminExists, setAdminExists] = useState(false)
  const [checkingAdmin, setCheckingAdmin] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [isLoading, setIsLoading] = useState(false)

  // Clear form when modal closes or when switching to other modals
  useEffect(() => {
    if (!isOpen || showRegister || showForgotPassword || showResetPassword) {
      setFormData({
        email: '',
        password: ''
      })
    }
  }, [isOpen, showRegister, showForgotPassword, showResetPassword])

  // Clear form when component unmounts (navigation away)
  useEffect(() => {
    return () => {
      setFormData({
        email: '',
        password: ''
      })
    }
  }, [])

  // Check if admin account exists when modal opens
  useEffect(() => {
    if (isOpen) {
      checkAdminExists()
    }
  }, [isOpen])

  const checkAdminExists = async () => {
    setCheckingAdmin(true)
    try {
      const response = await axiosInstance.get('/admin/exists')
      if (response.data.success) {
        setAdminExists(response.data.exists)
      }
    } catch (error) {
      console.error('Error checking admin existence:', error)
      // Default to showing register link if check fails
      setAdminExists(false)
    } finally {
      setCheckingAdmin(false)
    }
  }

  const handleSwitchToRegister = () => {
    setShowRegister(true)
  }

  const handleSwitchToForgotPassword = () => {
    setShowForgotPassword(true)
  }

  const handleForgotPasswordClose = () => {
    setShowForgotPassword(false)
    onClose()
  }

  const handleResetPasswordClose = () => {
    setShowResetPassword(false)
    setShowForgotPassword(false)
    onClose()
  }

  const handleVerified = (email) => {
    setResetEmail(email)
    setShowForgotPassword(false)
    setShowResetPassword(true)
  }

  const handleRegisterClose = () => {
    setShowRegister(false)
    onClose()
  }
  useEffect(() => {
    if (isOpen || showRegister || showForgotPassword || showResetPassword) {
      const scrollY = window.scrollY
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.left = '0'
      document.body.style.right = '0'
      document.body.style.overflow = 'hidden'
      document.body.style.width = '100%'
      document.body.style.height = '100vh'
      document.body.style.touchAction = 'none'
    } else {
      const scrollY = document.body.style.top
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.left = ''
      document.body.style.right = ''
      document.body.style.overflow = ''
      document.body.style.width = ''
      document.body.style.height = ''
      document.body.style.touchAction = ''
      window.scrollTo(0, parseInt(scrollY || '0') * -1)
    }

    return () => {
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.left = ''
      document.body.style.right = ''
      document.body.style.overflow = ''
      document.body.style.width = ''
      document.body.style.height = ''
      document.body.style.touchAction = ''
    }
  }, [isOpen, showRegister, showForgotPassword, showResetPassword])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      // Call login API with email and password
      const response = await axiosInstance.post('/admin/login', {
        email: formData.email,
        password: formData.password
      })
      
      if (response.data.success) {
        toast.success('Login successful!')
        setIsLoading(false)
        
        // Handle login history management
        historyManager.handleLogin()
        
        onClose()
        navigate('/home')
      } else {
        toast.error(response.data.message || 'Login failed')
      }
    } catch (error) {
      console.error('Login error:', error)
      toast.error(error.response?.data?.message || 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen && !showRegister && !showForgotPassword && !showResetPassword) return null

  return (
    <>
      {isOpen && !showRegister && !showForgotPassword && !showResetPassword && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-[360px] sm:max-w-[380px] relative overflow-hidden flex flex-col items-center p-4 sm:p-5 animate-in zoom-in-95 duration-300">
            {/* Close Button */}
            <div className="absolute top-3 right-3 z-10">
              <Btn_X onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600" />
            </div>

            {/* Logo and Header Section */}
            <div className="flex flex-col items-center text-center mb-2 w-full">
              <div className="mb-1">
                <Client_Logo size={window.innerWidth < 640 ? 40 : 55} />
              </div>
              
              <h1 className="text-[#188b3e] text-sm sm:text-base font-black leading-tight mb-1 px-1">
                Nueva Vizcaya Electric Cooperative
              </h1>

              <div>
                <h2 className="text-gray-800 text-xs  sm:text-sm font-bold uppercase tracking-tight">Welcome Back</h2>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="w-full space-y-1.5 text-left">
              <Input_Text
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="e.g. admin@institution.edu"
                required
              />

              <Input_Password
                label="Password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••••••"
                required
              />

              <div className="flex justify-between items-center">
                <div></div>
                <button 
                  type="button" 
                  onClick={handleSwitchToForgotPassword}
                  className="text-[#188b3e] text-xs font-bold hover:underline underline-offset-4 transition-all"
                >
                  Forgot Password?
                </button>
              </div>

              <div className="pt-0.5">
                <Button
                  type="submit"
                  label="Login"
                  variant="custom"
                  customColor="#168e3f
"
                  size="md"
                  className="w-full rounded-xl font-bold shadow-lg shadow-blue-600/20 active:scale-[0.98]"
                  isLoading={isLoading}
                  loadingText="Logging in..."
                />
              </div>

              <div className="text-center mt-1.5">
                {!checkingAdmin && !adminExists && (
                  <p className="text-gray-500 text-xs">
                    Don't have an account?{' '}
                    <button 
                      type="button" 
                      onClick={handleSwitchToRegister}
                      className="text-[#188b3e] font-bold hover:underline underline-offset-4 transition-all"
                    >
                      Register here
                    </button>
                  </p>
                )}
                {checkingAdmin && (
                  <p className="text-gray-400 text-xs">
                    Checking...
                  </p>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      <RegisterModal
        isOpen={showRegister}
        onClose={handleRegisterClose}
        onSwitchToLogin={() => setShowRegister(false)}
      />

      <ForgotPasswordModal
        isOpen={showForgotPassword}
        onClose={handleForgotPasswordClose}
        onSwitchToLogin={() => setShowForgotPassword(false)}
        onVerified={handleVerified}
      />

      <ResetPasswordModal
        isOpen={showResetPassword}
        onClose={handleResetPasswordClose}
        onSwitchToLogin={() => {
          setShowResetPassword(false)
          setShowForgotPassword(false)
        }}
        email={resetEmail}
      />
    </>
  )
}

export default LoginModal
