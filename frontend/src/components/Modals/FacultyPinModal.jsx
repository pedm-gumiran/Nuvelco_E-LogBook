import React, { useState, useEffect } from 'react';
import Input_Password from '../Input_Fields/Input_Password.jsx';
import Button from '../Buttons/Button.jsx';
import Button_Cancel from '../Buttons/Button_Cancel.jsx';
import Btn_X from '../Buttons/Btn_X.jsx';
import School_Logo from '../Logo/Client_Logo.jsx';
import { FiLock } from 'react-icons/fi';
import axiosInstance from '../../api/axios';

const FacultyPinModal = ({ isOpen, onClose, onVerify }) => {
  const [facultyPin, setFacultyPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [isVerifyingPin, setIsVerifyingPin] = useState(false);

  // Clear PIN input when modal opens
  useEffect(() => {
    if (isOpen) {
      setFacultyPin('');
      setPinError('');
    }
  }, [isOpen]);

  const handleClose = () => {
    setFacultyPin('');
    setPinError('');
    onClose();
  };

  const handleVerifyPin = async (e) => {
    e.preventDefault();
    setIsVerifyingPin(true);
    setPinError('');

    try {
      const response = await axiosInstance.post('/pincodes/verify-faculty', {
        pinCode: facultyPin
      });

      if (response.data.success) {
        setIsVerifyingPin(false);
        onVerify && onVerify();
      } else {
        setPinError('Invalid Faculty PIN');
        setIsVerifyingPin(false);
      }
    } catch (err) {
      console.error('Error verifying PIN:', err);
      setPinError('Invalid Faculty PIN');
      setIsVerifyingPin(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[320px] sm:max-w-[360px] relative flex flex-col items-center p-3 sm:p-4 animate-in zoom-in-95 duration-300">
        {/* Close Button */}
        <div className="absolute top-3 right-3 z-10">
          <Btn_X onClick={handleClose} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600" />
        </div>

        {/* Logo and Header Section */}
        <div className="flex flex-col items-center text-center mb-3 w-full">
          <div className="mb-1">
            <School_Logo size={window.innerWidth < 640 ? 30 : 40} />
          </div>

          <h1 className="text-[#188b3e] text-xs sm:text-sm font-black leading-tight mt-1 px-1">
            Nueva Vizcaya Electric Cooperative
          </h1>
        </div>

        <div className="w-full py-4 px-2">
          <div className="flex flex-col items-center text-center mb-4">
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-2">
              <FiLock className="w-6 h-6 text-[#188b3e]" />
            </div>
            <h3 className="text-sm font-bold text-gray-800">Faculty Authorization</h3>
            <p className="text-xs text-gray-500 mt-1">Please enter the Faculty PIN to continue</p>
          </div>

          <form onSubmit={handleVerifyPin} className="space-y-4">
            <div className="relative">
              <Input_Password
                label="Faculty PIN"
                name="facultyPin"
                value={facultyPin}
                onChange={(e) => {
                  setFacultyPin(e.target.value);
                  setPinError('');
                }}
                placeholder="Enter 6-digit PIN"
  
              />
              {pinError && (
                <p className="text-[10px] text-red-500 mt-1 text-center font-medium animate-shake">
                  {pinError}
                </p>
              )}
            </div>

            <Button
              type="submit"
              label="Verify PIN"
              variant="custom"
              customColor="#188b3e"
              size="sm"
              className="w-full rounded-md font-bold text-sm py-2"
              disabled={facultyPin.length < 6 || isVerifyingPin}
              isLoading={isVerifyingPin}
              loadingText="Verifying..."
            />
            <Button_Cancel onClick={handleClose} className="w-full" />
          </form>
        </div>
      </div>
    </div>
  );
};

export default FacultyPinModal;
