import React, { useState, useEffect } from "react";
import { FiCheckCircle, FiShield, FiLock } from "react-icons/fi";
import { toast } from "react-toastify";
import axiosInstance from "../../api/axios";
import Input_Password from "../Input_Fields/Input_Password.jsx";
import Button from "../Buttons/Button.jsx";
import Btn_X from "../Buttons/Btn_X.jsx";
import { useUser } from "../context/UserContext.jsx";

export default function ChangePasswordModal({ isOpen, onClose }) {
  const { user } = useUser();
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [strength, setStrength] = useState(0);
  const [success, setSuccess] = useState(false);

  const getPasswordStrength = (password) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[@$!%*?&#]/.test(password)) score++;
    return score;
  };

  // Disable scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => (document.body.style.overflow = "");
  }, [isOpen]);

  // Reset fields when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({ newPassword: "", confirmPassword: "" });
      setError("");
      setLoading(false);
      setStrength(0);
      setSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...formData, [name]: value };
    setFormData(updated);

    //  ADDED – Live strength update
    if (name === "newPassword") {
      setStrength(getPasswordStrength(value));
    }

    // Check passwords match in real time
    if (updated.newPassword && updated.confirmPassword) {
      setError(
        updated.newPassword !== updated.confirmPassword
          ? "Passwords do not match"
          : "",
      );
    } else {
      setError("");
    }
  };

  const isFormValid =
    formData.newPassword.trim() && formData.confirmPassword && !error;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid) {
      toast.error("Please fix all errors before submitting");
      return;
    }

    try {
      setLoading(true);

      if (!user || !user.email) {
        toast.error("User not found. Please login again.");
        onClose();
        return;
      }

      const response = await axiosInstance.post("/admin/reset-password", {
        email: user.email,
        newPassword: formData.newPassword,
      });

      if (response.data.success) {
        toast.success("Password updated successfully!");
        onClose();
      } else {
        toast.error(response.data.message || "Failed to update password");
      }
    } catch (error) {
      console.error("Change password error:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to update password. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const strengthConfig = [
    { color: "bg-gray-200", label: "Too short", width: "15%" },
    { color: "bg-red-500", label: "Weak", width: "35%" },
    { color: "bg-yellow-500", label: "Moderate", width: "60%" },
    { color: "bg-blue-500", label: "Strong", width: "85%" },
    { color: "bg-green-500", label: "Very Strong", width: "100%" },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white font-semibold">
            <FiShield className="w-5 h-5" />
            <span>Change Password</span>
          </div>
          <Btn_X
            onClick={onClose}
            className="text-white/80 hover:text-white hover:bg-white/10 p-1 rounded-full transition-colors"
            disabled={loading}
          />
        </div>

        {/* Body */}
        <div className="p-6">
          {success ? (
            <div className="flex flex-col items-center text-center py-8">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                <FiCheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                Password Updated!
              </h3>
              <p className="text-sm text-gray-600">
                Your password has been changed successfully.
              </p>
            </div>
          ) : (
            <>
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-2">
                  <FiLock className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-sm text-gray-500">
                  Update your password to keep your account secure.
                </p>
              </div>

              <form className="space-y-4" onSubmit={handleSubmit}>
                {/* New Password */}
                <Input_Password
                  label="New Password"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  required
                  placeholder="Enter new password"
                />

                {/* Password Strength Bar */}
                {formData.newPassword.length > 0 && (
                  <div className="mt-2">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${strengthConfig[strength].color}`}
                          style={{ width: strengthConfig[strength].width }}
                        />
                      </div>
                      <span
                        className={`text-xs font-semibold ${
                          strength === 0
                            ? "text-gray-400"
                            : strength === 1
                              ? "text-red-500"
                              : strength === 2
                                ? "text-yellow-500"
                                : strength === 3
                                  ? "text-blue-500"
                                  : "text-green-500"
                        }`}
                      >
                        {strengthConfig[strength].label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      Use 8+ characters with uppercase, numbers & symbols
                    </p>
                  </div>
                )}

                {/* Confirm Password */}
                <Input_Password
                  label="Confirm New Password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="Confirm new password"
                  password_className={
                    error ? "border-red-300 focus:ring-red-200" : ""
                  }
                />
                {error && (
                  <div className="bg-red-50 text-red-600 text-xs py-2 px-3 rounded-md text-center font-medium animate-shake">
                    {error}
                  </div>
                )}

                {/* Actions */}
                <div className="pt-2">
                  <Button
                    type="submit"
                    label="Update Password"
                    variant="primary"
                    className="w-full py-2.5 rounded-xl font-bold"
                    isLoading={loading}
                    loadingText="Updating..."
                    disabled={!isFormValid}
                  />
                </div>
              </form>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-shake { animation: shake 0.2s ease-in-out 0s 2; }
      `}</style>
    </div>
  );
}
