import React, { useEffect } from "react";
import { FiAlertTriangle, FiTrash2, FiRotateCcw } from "react-icons/fi";
import Button from "../Buttons/Button.jsx";
import Btn_X from "../Buttons/Btn_X.jsx";

/**
 * DeleteConfirmationModal - A reusable confirmation modal for delete/reset operations
 *
 * @param {boolean} isOpen - Whether the modal is visible
 * @param {function} onClose - Function to close/cancel the modal
 * @param {function} onConfirm - Function called when confirmed
 * @param {string} title - Modal title (e.g., 'Delete Record', 'Reset Data')
 * @param {string} message - Confirmation message
 * @param {string} type - Type of operation: 'delete' | 'reset'
 * @param {string} itemName - Name of item being deleted/reset (e.g., 'Faculty Member', 'Attendance Data')
 * @param {boolean} isLoading - Whether operation is in progress
 * @param {string} loadingText - Text to show when loading
 */
const DeleteConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message,
  type = "delete",
  itemName = "Item",
  isLoading = false,
  loadingText,
}) => {
  // Prevent body scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      // Save current overflow values
      const originalHtmlOverflow = document.documentElement.style.overflow;
      const originalBodyOverflow = document.body.style.overflow;

      // Set overflow hidden with !important to override any existing styles
      document.documentElement.style.setProperty(
        "overflow",
        "hidden",
        "important",
      );
      document.body.style.setProperty("overflow", "hidden", "important");

      return () => {
        // Restore original values
        document.documentElement.style.overflow = originalHtmlOverflow;
        document.body.style.overflow = originalBodyOverflow;
      };
    }
  }, [isOpen]);

  // Default loading text based on type
  const effectiveLoadingText =
    loadingText || (type === "delete" ? "Deleting..." : "Resetting...");

  // Icon and colors based on type
  const config = {
    delete: {
      icon: <FiTrash2 className="w-5 h-5 text-white" />,
      headerGradient: "bg-gradient-to-r from-red-600 to-red-700",
    },
    reset: {
      icon: <FiRotateCcw className="w-5 h-5 text-white" />,
      headerGradient: "bg-gradient-to-r from-red-600 to-red-700",
    },
  };

  const { icon, headerGradient } = config[type] || config.delete;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={!isLoading ? onClose : undefined}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 bg-white rounded-3xl shadow-2xl animate-fadeIn flex flex-col max-h-[85vh]">
        {/* Header */}
        <div
          className={`flex items-center justify-between px-6 py-4 ${headerGradient} shrink-0 rounded-t-3xl`}
        >
          <div className="flex items-center gap-3">
            {icon}
            <h2 className="text-lg font-semibold text-white">{title}</h2>
          </div>
          <Btn_X
            onClick={onClose}
            className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-1"
          />
        </div>

        {/* Body */}
        <div className="p-6 flex-1 min-h-0 overflow-y-auto">
          <div className="flex items-start gap-3">
            <FiAlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
            <p className="text-gray-600 text-sm leading-relaxed">
              {message ||
                `Are you sure you want to ${type} this ${itemName.toLowerCase()}? All of the data inside it will be deleted. This action cannot be undone.`}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 shrink-0 rounded-b-3xl">
          <div className="flex items-center justify-end gap-3">
            <Button
              variant="modal-secondary"
              onClick={onClose}
              label="Cancel"
              disabled={isLoading}
            />
            <Button
              variant="custom"
              customColor="#dc2626"
              onClick={onConfirm}
              label={
                isLoading
                  ? effectiveLoadingText
                  : type === "delete"
                    ? "Delete"
                    : "Reset"
              }
              icon={
                isLoading ? null : type === "delete" ? (
                  <FiTrash2 className="w-4 h-4" />
                ) : (
                  <FiRotateCcw className="w-4 h-4" />
                )
              }
              isLoading={isLoading}
              loadingText={effectiveLoadingText}
              disabled={isLoading}
            />
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

export default DeleteConfirmationModal;
