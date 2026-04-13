import React, { useState, useEffect } from "react";
import { FiX, FiFileText, FiDownload } from "react-icons/fi";
import Button from "../Buttons/Button.jsx";

/**
 * CertificateOfAppearanceModal - Modal for generating Certificate of Appearance
 *
 * @param {boolean} isOpen - Whether the modal is visible
 * @param {function} onClose - Function to close the modal
 * @param {object} visitorData - Visitor record data
 * @param {function} onGenerate - Function to generate certificate with selected template
 */
const CertificateOfAppearanceModal = ({
  isOpen,
  onClose,
  visitorData,
  onGenerate,
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // Available certificate templates
  const templates = [
    { value: "template1", label: "Standard Certificate Template" },
    { value: "template2", label: "Formal Business Certificate" },
    { value: "template3", label: "Simple Minimal Certificate" },
  ];

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedTemplate("");
      setIsGenerating(false);
    }
  }, [isOpen]);

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

      return () => {
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.left = "";
        document.body.style.right = "";
        document.body.style.width = "";
        document.body.style.overflow = "";
        window.scrollTo(0, parseInt(scrollY || "0") * -1);
      };
    }
  }, [isOpen]);

  const handleGenerate = async () => {
    if (!selectedTemplate) return;

    setIsGenerating(true);
    try {
      await onGenerate(visitorData, selectedTemplate);
      onClose();
    } catch (error) {
      console.error("Error generating certificate:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#188b3e] rounded-t-2xl">
          <div className="flex items-center gap-3">
            <FiFileText className="text-white" size={20} />
            <h2 className="text-lg font-semibold text-white">
              Certificate of Appearance
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors text-white/80 hover:text-white"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Visitor Info */}
          {visitorData && (
            <div className="mb-6 p-4 bg-gray-50 rounded-xl">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                Visitor Information
              </h3>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="text-gray-500">Name:</span>{" "}
                  <span className="font-medium text-gray-900">
                    {visitorData.name}
                  </span>
                </p>
                <p>
                  <span className="text-gray-500">Date:</span>{" "}
                  <span className="font-medium text-gray-900">
                    {visitorData.displayDate}
                  </span>
                </p>
                <p>
                  <span className="text-gray-500">Purpose:</span>{" "}
                  <span className="font-medium text-gray-900">
                    {visitorData.purpose}
                  </span>
                </p>
              </div>
            </div>
          )}

          {/* Template Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Certificate Template
            </label>
            <select
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#188b3e] focus:border-transparent outline-none transition-all bg-white"
            >
              <option value="">-- Choose a template --</option>
              {templates.map((template) => (
                <option key={template.value} value={template.value}>
                  {template.label}
                </option>
              ))}
            </select>
          </div>

          {/* Template Preview Placeholder */}
          {selectedTemplate && (
            <div className="mb-6 p-4 border-2 border-dashed border-gray-300 rounded-xl text-center">
              <FiFileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">
                Preview: {templates.find((t) => t.value === selectedTemplate)?.label}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleGenerate}
              disabled={!selectedTemplate || isGenerating}
              isLoading={isGenerating}
              loadingText="Generating..."
              label="Generate Certificate"
              variant="modal-primary"
              size="lg"
              icon={<FiDownload size={18} />}
              className="flex-1"
            />
            <Button
              onClick={onClose}
              label="Cancel"
              variant="modal-secondary"
              size="lg"
              className="flex-1"
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

export default CertificateOfAppearanceModal;
