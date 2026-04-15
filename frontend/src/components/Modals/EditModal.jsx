import React, { useState, useEffect } from "react";
import Button from "../Buttons/Button.jsx";
import Btn_X from "../Buttons/Btn_X.jsx";
import Input_Text from "../Input_Fields/Input_Text.jsx";
import Input_Password from "../Input_Fields/Input_Password.jsx";
import Dropdown from "../Input_Fields/Dropdown.jsx";
import TextArea from "../Input_Fields/TextArea.jsx";

/**
 * EditModal - A dedicated modal for editing records
 *
 * @param {boolean} isOpen - Whether the modal is visible
 * @param {function} onClose - Function to close the modal
 * @param {function} onSubmit - Function called when form is submitted
 * @param {Object} data - The record data to edit
 * @param {string} itemName - Name of the item (e.g., 'Faculty', 'Attendance Record')
 * @param {Array} fields - Array of field configurations
 *   Each field: { name, label, type, placeholder, required, options (for select) }
 * @param {string} size - Modal size: 'sm', 'md', 'lg', 'xl'
 */
const EditModal = ({
  isOpen,
  onClose,
  onSubmit,
  data = {},
  itemName = "Item",
  fields = [],
  size = "md",
  submitLabel = "Save",
}) => {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Disable scroll when modal is open
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

  // Size classes mapping
  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  // Initialize form data when modal opens or data changes
  useEffect(() => {
    if (isOpen && data) {
      const initialData = {};
      fields.forEach((field) => {
        initialData[field.name] =
          data[field.name] !== undefined ? data[field.name] : "";
      });
      setFormData(initialData);
      setErrors({});
    }
  }, [isOpen, data, fields]);

  // Handle input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    fields.forEach((field) => {
      if (field.required && !formData[field.name]) {
        newErrors[field.name] = `${field.label || field.name} is required`;
      }
      if (field.type === "email" && formData[field.name]) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData[field.name])) {
          newErrors[field.name] = "Please enter a valid email address";
        }
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsLoading(true);
      try {
        await onSubmit(formData);
        // Only close after successful submission
        onClose();
      } catch (error) {
        // Keep modal open on error
        console.error("Submit error:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Render input field using pre-built components
  const renderField = (field) => {
    const {
      name,
      label,
      type = "text",
      placeholder,
      required,
      options = [],
      disabled,
    } = field;
    const value = formData[name] || "";
    const fieldLabel = (
      <>
        {label || name}
        {required && <span className="text-red-500 ml-1">*</span>}
      </>
    );

    switch (type) {
      case "select":
        return (
          <div className="flex flex-col gap-1" key={name}>
            <Dropdown
              id={name}
              name={name}
              label={fieldLabel}
              value={value}
              onChange={handleChange}
              options={options.map((opt) => ({
                value: typeof opt === "object" ? opt.value : opt,
                label: typeof opt === "object" ? opt.label : opt,
              }))}
              placeholder={`Select ${label || name}...`}
              disabled={isLoading || disabled}
              required={required}
              className={errors[name] ? "border-red-500" : ""}
            />
            {errors[name] && (
              <span className="text-xs text-red-500">{errors[name]}</span>
            )}
          </div>
        );

      case "textarea":
        return (
          <div className="flex flex-col gap-1" key={name}>
            <TextArea
              id={name}
              name={name}
              label={fieldLabel}
              value={value}
              onChange={handleChange}
              placeholder={placeholder || `Enter ${label || name}...`}
              disabled={isLoading || disabled}
              required={required}
              rows={4}
              resize="none"
              text_ClassName={errors[name] ? "border-red-500" : ""}
            />
            {errors[name] && (
              <span className="text-xs text-red-500">{errors[name]}</span>
            )}
          </div>
        );

      case "password":
        return (
          <div className="flex flex-col gap-1" key={name}>
            <Input_Password
              name={name}
              label={fieldLabel}
              value={value}
              onChange={handleChange}
              placeholder={placeholder || `Enter ${label || name}...`}
              disabled={isLoading || disabled}
              required={required}
              password_className={errors[name] ? "border-red-500" : ""}
            />
            {errors[name] && (
              <span className="text-xs text-red-500">{errors[name]}</span>
            )}
          </div>
        );

      default:
        return (
          <div className="flex flex-col gap-1" key={name}>
            <Input_Text
              id={name}
              name={name}
              label={fieldLabel}
              type={type}
              value={value}
              onChange={handleChange}
              placeholder={placeholder || `Enter ${label || name}...`}
              required={required}
              disabled={isLoading || disabled}
              text_ClassName={`${errors[name] ? "border-red-500" : ""} ${isLoading || disabled ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""}`}
            />
            {errors[name] && (
              <span className="text-xs text-red-500">{errors[name]}</span>
            )}
          </div>
        );
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className={`relative w-full ${sizeClasses[size]} mx-4 bg-white rounded-3xl shadow-2xl animate-fadeIn flex flex-col max-h-[85vh]`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 shrink-0 rounded-t-3xl">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-white">
              Edit {itemName}
            </h2>
          </div>
          <Btn_X
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors text-white/80 hover:text-white"
          />
        </div>

        {/* Body */}
        <form
          onSubmit={handleSubmit}
          className="p-6 flex-1 min-h-0 overflow-y-auto"
        >
          <div
            className={`grid gap-4 ${fields.length > 6 ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"}`}
          >
            {fields
              .filter((field) => !field.hidden)
              .map((field) => renderField(field))}
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 shrink-0 rounded-b-3xl border-t-1 border-gray-200 shadow-sm">
          <div className="flex items-center justify-end gap-3 ">
            <div>
              <Button
                variant="modal-secondary"
                onClick={onClose}
                label="Cancel"
              />
            </div>
            <div>
              <Button
                variant="primary"
                onClick={handleSubmit}
                type="submit"
                label={submitLabel}
                isLoading={isLoading}
                loadingText={`${submitLabel}...`}
              />
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
      `}</style>
    </div>
  );
};

export default EditModal;
