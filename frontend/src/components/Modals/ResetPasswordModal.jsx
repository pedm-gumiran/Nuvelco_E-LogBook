import React, { useState, useEffect } from "react";
import Input_Password from "../Input_Fields/Input_Password.jsx";
import Btn_X from "../Buttons/Btn_X.jsx";
import Button from "../Buttons/Button.jsx";
import School_Logo from "../Logo/Client_Logo.jsx";
import axiosInstance from "../../api/axios.js";
import { toast } from "react-toastify";

const ResetPasswordModal = ({ isOpen, onClose, onSwitchToLogin, username }) => {
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Clear form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        newPassword: "",
        confirmPassword: "",
      });
      setError("");
      setSuccess(false);
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
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    // Validation
    if (formData.newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      setIsSubmitting(false);
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError("Passwords do not match. Please try again.");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await axiosInstance.post("/admin/reset-password", {
        username: username,
        newPassword: formData.newPassword,
      });

      if (response.data.success) {
        toast.success("Password reset successfully!");
        setSuccess(true);

        // Auto redirect to login after 2 seconds
        setTimeout(() => {
          onSwitchToLogin();
        }, 2000);
      } else {
        setError(response.data.message || "Failed to reset password");
      }
    } catch (error) {
      console.error("Password reset error:", error);
      setError(
        error.response?.data?.message ||
          "Failed to reset password. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[320px] sm:max-w-[340px] relative flex flex-col items-center p-3 sm:p-4 animate-in zoom-in-95 duration-300">
        {/* Close Button */}
        <div className="absolute top-4 right-4 z-10">
          <Btn_X
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
          />
        </div>

        {/* Logo and Header Section */}
        <div className="flex flex-col items-center text-center mb-3 w-full">
          <School_Logo size={window.innerWidth < 640 ? 35 : 45} />

          <h1 className="text-[#188b3e] text-xs sm:text-sm font-black leading-tight mt-1 px-1">
            Nueva Vizcaya Electric Cooperative
          </h1>
        </div>

        {success ? (
          <div className="w-full text-center py-4">
            <div className="bg-green-100 border border-green-300 rounded-lg p-3 mb-3">
              <p className="text-green-800 text-sm font-bold">
                Password Reset Successful!
              </p>
              <p className="text-green-700 text-xs mt-1">
                Your password has been updated.
              </p>
            </div>
            <p className="text-gray-500 text-xs">Redirecting to login...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="w-full space-y-2 text-left">
            <h2 className="text-gray-800 text-sm font-bold uppercase tracking-tight text-center mb-2">
              Reset Password
            </h2>

            <p className="text-gray-500 text-[10px] text-center mb-2">
              Create a new password for{" "}
              <span className="font-semibold">{username}</span>
            </p>

            <Input_Password
              label="New Password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              placeholder="Enter new password"
              required
              disabled={isSubmitting}
            />

            <Input_Password
              label="Confirm Password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm new password"
              required
              disabled={isSubmitting}
            />

            {error && (
              <div className="bg-red-100 border border-red-300 rounded p-1 text-center">
                <p className="text-red-800 text-[10px]">{error}</p>
              </div>
            )}

            <div className="pt-1">
              <Button
                type="submit"
                label="Reset Password"
                variant="custom"
                customColor="#188b3e"
                size="sm"
                className="w-full rounded-md font-bold text-sm py-1.5 shadow shadow-blue-600/20 active:scale-[0.98]"
                isLoading={isSubmitting}
                loadingText="Resetting..."
              />
            </div>

            <div className="text-center pt-1">
              <p className="text-gray-500 text-[10px]">
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
        )}
      </div>
    </div>
  );
};

export default ResetPasswordModal;
