import React, { useState, useEffect } from "react";
import { FiUser, FiSave, FiX, FiLoader } from "react-icons/fi";
import { toast } from "react-toastify";
import axios from "../../api/axios.js";
import { useUser } from "../context/UserContext";
import Input_Text from "../Input_Fields/Input_Text.jsx";
import Input_Password from "../Input_Fields/Input_Password.jsx";

const ProfileModal = ({ isOpen, onClose }) => {
  const { user, setUser } = useUser();

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
            setFormData({
              first_name: data.first_name || "",
              last_name: data.last_name || "",
              username: data.username || "",
              password: "", // Don't pre-fill password for security
              pin_code: "", // Don't pre-fill pin code for security
            });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.id) return;

    setLoading(true);
    try {
      const response = await axios.put(`/admin/profile/${user.id}`, formData);
      if (response.data.success) {
        toast.success("Profile updated successfully");
        // Update user context with new name/username
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
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
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
        <div className="p-6">
          {fetching ? (
            <div className="flex flex-col items-center justify-center py-12">
              <FiLoader className="w-10 h-10 text-[#188b3e] animate-spin mb-4" />
              <p className="text-gray-500 font-medium">Loading profile...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* First Name */}
                <Input_Text
                  label="First Name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                  placeholder="First name"
                />

                {/* Last Name */}
                <Input_Text
                  label="Last Name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
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
                placeholder="Enter username"
              />

              {/* Password */}
              <div className="space-y-1">
                <Input_Password
                  label="Password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
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
                  placeholder="Enter new 6-digit pin (optional)"
                />
                <p className="text-[10px] text-gray-400 italic ml-1">
                  Leave blank to keep existing pin code
                </p>
              </div>

              {/* Actions */}
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-[2] px-4 py-2.5 bg-[#188b3e] hover:bg-[#147a35] text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#188b3e]/20 disabled:opacity-70"
                >
                  {loading ? (
                    <FiLoader className="animate-spin w-5 h-5" />
                  ) : (
                    <FiSave className="w-5 h-5" />
                  )}
                  Save Changes
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
