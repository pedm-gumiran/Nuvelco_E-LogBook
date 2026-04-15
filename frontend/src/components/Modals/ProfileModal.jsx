import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FiUser, FiX, FiLoader, FiAlertTriangle } from "react-icons/fi";
import { toast } from "react-toastify";
import axios from "../../api/axios.js";
import { useUser } from "../context/UserContext";
import Input_Text from "../Input_Fields/Input_Text.jsx";
import Input_Password from "../Input_Fields/Input_Password.jsx";
import Button from "../Buttons/Button.jsx";
import historyManager from "../../utils/historyManager.js";

const ProfileModal = ({ isOpen, onClose }) => {
  const { user, setUser } = useUser();
  const navigate = useNavigate();
  const originalDataRef = useRef({});

  // Disable body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = "0";
      document.body.style.right = "0";
      document.body.style.width = "100%";
      document.body.style.overflow = "hidden";
    } else {
      const scrollY = document.body.style.top;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.width = "";
      document.body.style.overflow = "";
      window.scrollTo(0, parseInt(scrollY || "0") * -1);
    }

    return () => {
      const scrollY = document.body.style.top;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.width = "";
      document.body.style.overflow = "";
      window.scrollTo(0, parseInt(scrollY || "0") * -1);
    };
  }, [isOpen]);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    username: "",
    password: "",
    pin_code: "",
  });

  // Fetch current admin profile when modal opens
  useEffect(() => {
    const fetchProfile = async () => {
      if (isOpen && user?.id) {
        setFetching(true);
        try {
          const response = await axios.get(`/admin/profile/${user.id}`);
          if (response.data.success) {
            const data = response.data.data;
            const initialData = {
              first_name: data.first_name || "",
              last_name: data.last_name || "",
              username: data.username || "",
              password: "",
              pin_code: "",
            };
            originalDataRef.current = initialData;
            setFormData(initialData);
          }
        } catch (error) {
          console.error("Error fetching profile:", error);
          toast.error("Failed to load profile information");
        } finally {
          setFetching(false);
        }
      }
    };

    fetchProfile();
  }, [isOpen, user?.id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Check if any value has been modified
  const isModified =
    formData.first_name !== (originalDataRef.current.first_name || "") ||
    formData.last_name !== (originalDataRef.current.last_name || "") ||
    formData.username !== (originalDataRef.current.username || "") ||
    formData.password.trim() !== "" ||
    formData.pin_code.trim() !== "";

  // Check if credentials (username or password) were changed
  const isCredentialChanged =
    formData.username !== (originalDataRef.current.username || "") ||
    formData.password.trim() !== "";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.id) return;

    setLoading(true);
    try {
      const response = await axios.put(`/admin/profile/${user.id}`, formData);
      if (response.data.success) {
        // If username or password was changed, auto-logout
        if (isCredentialChanged) {
          toast.success(
            "Profile updated successfully. Logging out for security..."
          );

          // Short delay to let the user see the toast before logout
          setTimeout(() => {
            localStorage.removeItem("user");
            setUser(null);
            onClose();
            historyManager.handleLogout("/");
            navigate("/");
          }, 1500);
        } else {
          toast.success("Profile updated successfully");
          // Update user context with new name
          const updatedUser = {
            ...user,
            first_name: formData.first_name,
            last_name: formData.last_name,
            username: formData.username,
          };
          setUser(updatedUser);
          localStorage.setItem("user", JSON.stringify(updatedUser));
          onClose();
        }
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#188b3e] to-[#147a35] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <FiUser className="text-white w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Manage Profile</h3>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 min-h-0 overflow-y-auto">
          {fetching ? (
            <div className="flex flex-col items-center justify-center py-12">
              <FiLoader className="w-10 h-10 text-[#188b3e] animate-spin mb-4" />
              <p className="text-gray-500 font-medium">Loading profile...</p>
            </div>
          ) : (
            <form id="profile-form" onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* First Name */}
                <Input_Text
                  label="First Name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  placeholder="First name"
                />

                {/* Last Name */}
                <Input_Text
                  label="Last Name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  placeholder="Last name"
                />
              </div>

              {/* Username */}
              <Input_Text
                label="Username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                disabled={loading}
                placeholder="Enter username"
              />

              {/* Password */}
              <div className="space-y-1">
                <Input_Password
                  label="Password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                  placeholder="Enter new password (optional)"
                />
                <p className="text-[10px] text-gray-400 italic ml-1">
                  Leave blank to keep existing password
                </p>
              </div>

              {/* Pin Code */}
              <div className="space-y-1">
                <Input_Text
                  label="Pin Code"
                  name="pin_code"
                  type="text"
                  value={formData.pin_code}
                  onChange={(e) => {
                    if (e.target.value.length <= 6) handleChange(e);
                  }}
                  disabled={loading}
                  placeholder="Enter new 6-digit pin (optional)"
                />
                <p className="text-[10px] text-gray-400 italic ml-1">
                  Leave blank to keep existing pin code
                </p>
              </div>


              {/* Security Note */}
              <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5">
                <FiAlertTriangle className="text-amber-500 w-4 h-4 flex-shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-700 leading-relaxed">
                  <span className="font-semibold">Note:</span> Changing your
                  username or password will automatically log you out for
                  security purposes. You will need to log in again with your
                  new credentials.
                </p>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        {!fetching && (
          <div className="px-6 py-4 bg-gray-50 shrink-0 rounded-b-2xl border-t border-gray-200">
            <div className="flex items-center justify-end gap-3">
              <div>
                <Button
                  variant="modal-secondary"
                  onClick={onClose}
                  label="Cancel"
                />
              </div>
              <div>
                <Button
                  variant="modal-primary"
                  type="submit"
                  form="profile-form"
                  label="Save Changes"
                  disabled={!isModified}
                  isLoading={loading}
                  loadingText="Saving..."
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileModal;
