import React, { useState, useEffect } from "react";
import Input_Text from "../Input_Fields/Input_Text.jsx";
import Input_Password from "../Input_Fields/Input_Password.jsx";
import Btn_X from "../Buttons/Btn_X.jsx";
import Button from "../Buttons/Button.jsx";
import School_Logo from "../Logo/Client_Logo.jsx";
import { FiHelpCircle } from "react-icons/fi";
import axiosInstance from "../../api/axios.js";
import { toast } from "react-toastify";

const RegisterModal = ({ isOpen, onClose, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    password: "",
    pinCode: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  // Clear form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        firstName: "",
        lastName: "",
        username: "",
        password: "",
        pinCode: "",
      });
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = "0";
      document.body.style.right = "0";
      document.body.style.overflow = "hidden";
      document.body.style.width = "100%";
    } else {
      const scrollY = document.body.style.top;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.overflow = "";
      document.body.style.width = "";
      window.scrollTo(0, parseInt(scrollY || "0") * -1);
    }

    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.overflow = "";
      document.body.style.width = "";
    };
  }, [isOpen]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Create admin account
      const adminData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        username: formData.username,
        password: formData.password,
        pin_code: formData.pinCode,
      };

      const adminResponse = await axiosInstance.post(
        "/admin/register",
        adminData,
      );

      if (adminResponse.data.success) {
        toast.success("Account registered successfully!");
        setFormData({
          firstName: "",
          lastName: "",
          username: "",
          password: "",
          pinCode: "",
        });
        onClose();
        onSwitchToLogin && onSwitchToLogin();
      } else {
        toast.error(adminResponse.data.message || "Failed to register account");
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[400px] sm:max-w-[450px] relative flex flex-col items-center p-4 sm:p-5 animate-in zoom-in-95 duration-300">
        {/* Close Button */}
        <div className="absolute top-3 right-3 z-10">
          <Btn_X
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
          />
        </div>

        {/* Body */}
        <div className="p-4 sm:p-5">
          <div className="flex flex-col items-center text-center mb-3 w-full">
            <div className="mb-1">
              <School_Logo size={window.innerWidth < 640 ? 30 : 40} />
            </div>

            <h1 className="text-[#188b3e] text-sm sm:text-base font-black leading-tight mt-1 px-1">
              Nueva Vizcaya Electric Cooperative
            </h1>

            <h2 className="text-gray-800 text-sm font-bold uppercase tracking-tight mt-1">
              Register Account
            </h2>
          </div>

          <form
            onSubmit={handleSubmit}
            className="w-full space-y-0.5 text-left"
          >
            <div className="grid grid-cols-2 gap-3">
              <Input_Text
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="First name"
                required
                disabled={isLoading}
              />

              <Input_Text
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Last name"
                required
                disabled={isLoading}
              />
            </div>

            <Input_Text
              label="Username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              placeholder="Create a username"
              required
              disabled={isLoading}
            />

            <div className="grid grid-cols-1 gap-3">
              <Input_Password
                label="Password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="New password"
                required
                disabled={isLoading}
              />
            </div>

            <div className="grid grid-cols-1 gap-3">
              <div className="relative">
                <div className="flex items-center gap-1">
                  <div className="flex-1">
                    <Input_Text
                      label="PIN Code"
                      name="pinCode"
                      type="text"
                      maxLength={6}
                      value={formData.pinCode}
                      onChange={handleChange}
                      placeholder="6-digit PIN"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="relative group">
                    <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center cursor-help mt-6 hover:bg-blue-200 transition-colors">
                      <span className="text-blue-600 text-xs font-bold">?</span>
                    </div>
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                      <p>
                        Keep you PIN secure and remember it. This will be used
                        in updating your password.
                      </p>
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-0.5">
              <Button
                type="submit"
                label="Register"
                variant="custom"
                customColor="#188b3e"
                size="sm"
                className="w-full rounded-md font-bold text-sm py-1.5 shadow shadow-blue-600/20 active:scale-[0.98]"
                isLoading={isLoading}
                loadingText="Registering..."
              />
            </div>

            <div className="text-center pt-0.5">
              <p className="text-gray-500 text-[10px]">
                Have an account?{" "}
                <button
                  type="button"
                  onClick={onSwitchToLogin}
                  className="text-[#188b3e] font-bold hover:underline underline-offset-4 transition-all"
                >
                  Back to Login
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterModal;
