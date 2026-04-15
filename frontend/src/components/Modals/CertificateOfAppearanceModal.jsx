import React, { useState, useEffect, useRef } from "react";
import {
  FiX,
  FiFileText,
  FiPrinter,
  FiEdit3,
  FiImage,
  FiZoomIn,
  FiZoomOut,
  FiMaximize,
  FiMinimize,
  FiMaximize2,
  FiRotateCcw,
} from "react-icons/fi";
import Button from "../Buttons/Button.jsx";

/**
 * CertificateOfAppearanceModal - Modal for generating Certificate of Appearance
 *
 * @param {boolean} isOpen - Whether the modal is visible
 * @param {function} onClose - Function to close the modal
 * @param {object} visitorData - Visitor record data
 */
const CertificateOfAppearanceModal = ({ isOpen, onClose, visitorData }) => {
  const [selectedTemplate, setSelectedTemplate] = useState("template1");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [zoomScale, setZoomScale] = useState(65); // Initial zoom to see full page
  const [isFullScreen, setIsFullScreen] = useState(true); // Default full screen
  const fileInputRef = useRef(null);

  // Editable fields for the certificate
  const [certData, setCertData] = useState({
    requestorName: "",
    position: "Manager",
    department: "Department of Human Settlements",
    company: "Providers Multipurpose Cooperative (PMPC)",
    projectSite: "",
    issuedDate: "",
    issuedLocation: "Gabut, Dupax del Sur, Nueva Vizcaya",
    signatoryName: "FREDEL L. SALVADOR,JD,PhD",
    signatoryPosition: "General Manager",
    // Template 2, 3, 4 specific fields
    startDate: "",
    endDate: "",
    activity: "participant on the Bench Marking Activity",
    purpose: "whatever legal purposes it may serve",
    // Signature
    signatureImage: "/signature.png",
    showSignature: true,
  });

  // Available certificate templates
  const templates = [
    { value: "template1", label: "Standard Template 1 (A4)" },
    { value: "template2", label: "Formal Template 2 (Blue Title)" },
    { value: "template3", label: "Formal Template 3 (Black Title)" },
    { value: "template4", label: "Template 4 (With Underlines)" },
  ];

  // Helper for ordinal suffixes
  const getOrdinal = (n) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  // Reset state and sync with visitorData when modal opens
  useEffect(() => {
    if (isOpen && visitorData) {
      const now = new Date();
      setSelectedTemplate("template1");
      setIsGenerating(false);
      setShowPreview(true);
      setZoomScale(65); // Default zoom
      setIsFullScreen(true); // Always start as full screen

      const dayNum = now.getDate();
      const monthName = now.toLocaleDateString("en-US", { month: "long" });
      const fullYear = now.getFullYear();
      const formattedDate = `${getOrdinal(
        dayNum,
      )} day of ${monthName} ${fullYear}`;

      setCertData({
        ...certData,
        signatureImage: "/signature.png",
        showSignature: true,
        requestorName: visitorData.name || "",
        projectSite: visitorData.address || "",
        issuedDate: formattedDate,
        startDate: visitorData.displayDate || formattedDate,
        endDate: visitorData.displayDate || formattedDate,
        company:
          visitorData.company || "Providers Multipurpose Cooperative (PMPC)",
        activity: "participant on the Bench Marking Activity",
      });
    }
  }, [isOpen, visitorData]);

  // Update activity based on template selection
  useEffect(() => {
    if (selectedTemplate === "template3" || selectedTemplate === "template4") {
      setCertData((prev) => ({
        ...prev,
        activity: "conduct annual regular inspection",
      }));
    } else if (selectedTemplate === "template2") {
      setCertData((prev) => ({
        ...prev,
        activity: "participant on the Bench Marking Activity",
      }));
    }
  }, [selectedTemplate]);

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

  const handlePrint = () => {
    const printContent = document.getElementById("certificate-paper");
    if (!printContent) return;

    const printWindow = window.open("", "_blank", "width=800,height=900");
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Certificate - ${certData.requestorName}</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 10mm;
            }
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 0;
              color: black;
              line-height: 1.4;
            }
            #certificate-paper {
              width: 100%;
              height: 277mm;
              background: white;
              position: relative;
              box-sizing: border-box;
              display: flex;
              flex-direction: column;
            }
            /* Mapping Tailwind classes to CSS for Print Window */
            .flex { display: flex; }
            .justify-between { justify-content: space-between; }
            .justify-center { justify-content: center; }
            .items-center { align-items: center; }
            .flex-1 { flex: 1; }
            .gap-2 { gap: 8px; }
            .gap-8 { gap: 32px; }
            .mb-1 { margin-bottom: 4px; }
            .mb-8 { margin-bottom: 30px; }
            .mt-12 { margin-top: 40px; }
            .mb-16 { margin-bottom: 60px; }
            .mt-16 { margin-top: 50px; }
            .mt-32 { margin-top: 100px; }
            .px-4 { padding-left: 16px; padding-right: 16px; }
            .px-8 { padding-left: 32px; padding-right: 32px; }
            .pb-10 { padding-bottom: 40px; }
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .text-4xl { font-size: 24pt; }
            .font-black { font-weight: 900; }
            .uppercase { text-transform: uppercase; }
            .tracking-wider { letter-spacing: 1px; }
            .indent-12 { text-indent: 48px; }
            .leading-relaxed { line-height: 1.6; }
            .text-justify { text-align: justify; }
            .font-bold { font-weight: bold; }
            .text-xl { font-size: 14pt; }
            .text-lg { font-size: 12pt; }
            .h-20 { height: 80px; }
            .h-28 { height: 110px; }
            .w-22px { width: 22px; height: 22px; }
            .object-contain { object-fit: contain; }
            .inline-block { display: inline-block; }
            .relative { position: relative; }
            .absolute { position: absolute; }
            .z-0 { z-index: 0; }
            .z-10 { z-index: 10; }
            .mix-blend-multiply { mix-blend-mode: multiply; }
            .w-full { width: 100%; }
            .bottom-0 { bottom: 0; }
            .left-0 { left: 0; }
            .right-0 { right: 0; }
            
            /* Specific Styles */
            .cert-title-blue { color: #3b82f6 !important; }
            .border-t-\\[3px\\] { border-top: 3px solid #168e3f; }
            .border-b { border-bottom: 1px solid #168e3f; }
            .h-\\[5px\\] { height: 5px; }
            .italic { font-style: italic; }
            .text-\\[22px\\] { font-size: 22px; }
            .text-\\[1\\.25rem\\] { font-size: 16pt; }
            .underline-span { border-bottom: 1px solid black; }
            
            .motto-text {
              padding: 0 12px;
              color: #74d3a6 !important;
              font-family: inherit;
              font-size: 22px;
              white-space: nowrap;
            }

            .signature-box {
              position: absolute;
              top: -60px;
              left: 50%;
              transform: translateX(-50%);
              width: 150px;
            }

            .contact-info {
              font-size: 11px;
              color: #333;
            }

            @media print {
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            }
          </style>
        </head>
        <body>
          <div style="padding: 10mm; height: 277mm; box-sizing: border-box;">
            ${printContent.innerHTML}
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                setTimeout(function() { window.close(); }, 500);
              }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCertData({ ...certData, signatureImage: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleZoom = (type) => {
    if (type === "in") setZoomScale((prev) => Math.min(prev + 10, 150));
    else if (type === "out") setZoomScale((prev) => Math.max(prev - 10, 20));
    else setZoomScale(65);
  };

  const handleResetSignature = () => {
    setCertData((prev) => ({
      ...prev,
      signatureImage: "/signature.png",
    }));
    // Clear the file input value so we can re-upload the same file if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 transition-all duration-300">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal Container */}
      <div
        className={`relative bg-gray-100 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-fadeIn transition-all duration-500 ease-in-out ${
          isFullScreen ? "w-full h-full" : "w-full max-w-7xl h-[90vh]"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#188b3e] shrink-0">
          <div className="flex items-center gap-3 font-bold">
            <FiFileText className="text-white" size={24} />
            <h2 className="text-xl text-white">Certificate of Appearance</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFullScreen(!isFullScreen)}
              className="p-2 hover:bg-white/20 rounded-full transition-colors text-white/80 hover:text-white"
              title={isFullScreen ? "Small Screen" : "Full Screen"}
            >
              {isFullScreen ? (
                <FiMinimize size={22} />
              ) : (
                <FiMaximize2 size={22} />
              )}
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors text-white/80 hover:text-white"
            >
              <FiX size={26} />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Controls Panel (Left) */}
          <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto p-6 hidden lg:block shrink-0">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <FiEdit3 /> Edit Details
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">
                  SELECT TEMPLATE
                </label>
                <select
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                  className="w-full px-3 py-2 border border-blue-200 bg-blue-50/30 rounded-lg text-sm focus:ring-2 focus:ring-[#188b3e] outline-none font-medium text-blue-900"
                >
                  {templates.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-4 border-t border-gray-100"></div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">
                  VISITOR NAME
                </label>
                <input
                  type="text"
                  value={certData.requestorName}
                  onChange={(e) =>
                    setCertData({ ...certData, requestorName: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#188b3e] outline-none"
                />
              </div>

              {selectedTemplate === "template1" ? (
                <>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">
                      POSITION/TITLE
                    </label>
                    <input
                      type="text"
                      value={certData.position}
                      onChange={(e) =>
                        setCertData({ ...certData, position: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#188b3e] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">
                      DEPARTMENT
                    </label>
                    <input
                      type="text"
                      value={certData.department}
                      onChange={(e) =>
                        setCertData({ ...certData, department: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#188b3e] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">
                      COMPANY/INSTITUTION
                    </label>
                    <input
                      type="text"
                      value={certData.company}
                      onChange={(e) =>
                        setCertData({ ...certData, company: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#188b3e] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">
                      PROJECT SITE / LOCATION
                    </label>
                    <textarea
                      value={certData.projectSite}
                      onChange={(e) =>
                        setCertData({
                          ...certData,
                          projectSite: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#188b3e] outline-none resize-none"
                      rows={2}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">
                      COMPANY/INSTITUTION
                    </label>
                    <input
                      type="text"
                      value={certData.company}
                      onChange={(e) =>
                        setCertData({ ...certData, company: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#188b3e] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">
                      START DATE
                    </label>
                    <input
                      type="text"
                      value={certData.startDate}
                      onChange={(e) =>
                        setCertData({ ...certData, startDate: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#188b3e] outline-none"
                      placeholder={
                        selectedTemplate === "template4"
                          ? "Leave blank for manual line"
                          : ""
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">
                      END DATE
                    </label>
                    <input
                      type="text"
                      value={certData.endDate}
                      onChange={(e) =>
                        setCertData({ ...certData, endDate: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#188b3e] outline-none"
                      placeholder={
                        selectedTemplate === "template4"
                          ? "Leave blank for manual line"
                          : ""
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">
                      ACTIVITY/WORK
                    </label>
                    <textarea
                      value={certData.activity}
                      onChange={(e) =>
                        setCertData({ ...certData, activity: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#188b3e] outline-none resize-none"
                      rows={2}
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">
                  DATE ISSUED
                </label>
                <input
                  type="text"
                  value={certData.issuedDate}
                  onChange={(e) =>
                    setCertData({ ...certData, issuedDate: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#188b3e] outline-none"
                />
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold text-gray-500 uppercase">
                  Signatory
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="text-[10px] font-bold text-gray-400">
                    SHOW SIGNATURE
                  </span>
                  <input
                    type="checkbox"
                    checked={certData.showSignature}
                    onChange={(e) =>
                      setCertData({
                        ...certData,
                        showSignature: e.target.checked,
                      })
                    }
                    className="accent-[#188b3e]"
                  />
                </label>
              </div>

              {/* Signature Image Input at the top of Name */}
              <div className="mb-4">
                <label className="block text-[10px] font-bold text-gray-400 mb-1">
                  CHANGE SIGNATURE IMAGE
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 relative group">
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    />
                    <div className="w-full px-3 py-2 border border-dashed border-gray-300 rounded-lg text-xs text-gray-500 flex items-center gap-2 group-hover:bg-gray-50 transition-colors">
                      <FiImage />{" "}
                      {certData.signatureImage.length > 50
                        ? "Custom Image"
                        : "Click to Upload"}
                    </div>
                  </div>
                  {certData.signatureImage !== "/signature.png" && (
                    <button
                      onClick={handleResetSignature}
                      className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors"
                      title="Restore Default Signature"
                    >
                      <FiRotateCcw size={16} />
                    </button>
                  )}
                </div>
              </div>

              <input
                type="text"
                value={certData.signatoryName}
                onChange={(e) =>
                  setCertData({ ...certData, signatoryName: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-bold focus:ring-2 focus:ring-[#188b3e] outline-none shadow-sm"
              />
              <input
                type="text"
                value={certData.signatoryPosition}
                onChange={(e) =>
                  setCertData({
                    ...certData,
                    signatoryPosition: e.target.value,
                  })
                }
                className="w-full mt-2 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#188b3e] outline-none shadow-sm"
              />
            </div>
          </div>

          {/* Preview Panel (Right) */}
          <div className="flex-1 bg-gray-200/50 relative overflow-hidden flex flex-col">
            {/* Zoom Controls */}
            <div className="absolute top-4 right-4 z-40 flex items-center gap-2 bg-white/80 backdrop-blur shadow-lg rounded-full px-4 py-2 border border-white">
              <button
                onClick={() => handleZoom("out")}
                className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
                title="Zoom Out"
              >
                <FiZoomOut size={20} />
              </button>
              <span className="text-sm font-bold text-gray-700 w-12 text-center">
                {zoomScale}%
              </span>
              <button
                onClick={() => handleZoom("in")}
                className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
                title="Zoom In"
              >
                <FiZoomIn size={20} />
              </button>
              <div className="w-px h-4 bg-gray-300 mx-1"></div>
              <button
                onClick={() => handleZoom("reset")}
                className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
                title="Reset Zoom"
              >
                <FiMaximize size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-8 flex justify-center items-start scrollbar-thin scrollbar-thumb-gray-400">
              {/* Paper Container */}
              <div
                id="certificate-paper"
                className="bg-white shadow-2xl flex flex-col shrink-0 transition-transform duration-200 ease-out"
                style={{
                  fontFamily: "Arial, sans-serif",
                  width: "210mm",
                  minHeight: "297mm",
                  padding: "10mm",
                  transform: `scale(${zoomScale / 100})`,
                  transformOrigin: "top center",
                  marginBottom: `-${297 * (1 - zoomScale / 100)}mm`, // Adjust margin to prevent extra space
                }}
              >
                <div className="flex-1">
                  {/* Nuvelco Header */}
                  <div className="flex justify-between items-center mb-1">
                    <img
                      src="/system_logo.png"
                      alt="Nuvelco Logo"
                      className="h-20 object-contain"
                    />
                    <div className="flex-1 px-2 flex items-center">
                      <img
                        src="/Nuvelco_title.png"
                        alt="Nuvelco Title"
                        className="h-20 w-full object-contain object-left"
                        style={{ width: "95%", height: "95%" }}
                      />
                    </div>
                    <img
                      src="/nuvelco_establishment.png"
                      alt="Nuvelco Establishment"
                      className="h-20 object-contain"
                    />
                  </div>

                  {/* Motto Bar */}
                  <div
                    className="flex items-center mb-8 motto-bar"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: "30px",
                    }}
                  >
                    <div
                      style={{
                        flex: 1,
                        borderTop: "3px solid #168e3f",
                        borderBottom: "1px solid #168e3f",
                        height: "5px",
                      }}
                    ></div>
                    <div
                      className="px-3 text-[#74d3a6] italic text-[22px] font-medium whitespace-nowrap motto-text"
                      style={{
                        fontFamily:
                          '"Brush Script MT", "Brush Script Std", "Lucida Calligraphy", "Lucida Handwriting", "Apple Chancery", cursive',
                        textShadow: "1px 1px 0px rgba(255,255,255,0.5)",
                        letterSpacing: "0.5px",
                        padding: "0 12px",
                        color: "#74d3a6",
                      }}
                    >
                      "Basta sama-sama, kaya."
                    </div>
                    <div
                      style={{
                        width: "40px",
                        borderTop: "3px solid #168e3f",
                        borderBottom: "1px solid #168e3f",
                        height: "5px",
                        flexShrink: 0,
                      }}
                    ></div>
                  </div>

                  {/* Title Section */}
                  <div className="text-center mt-12 mb-16 px-4">
                    {selectedTemplate === "template2" ? (
                      <h1
                        className="text-4xl font-black uppercase tracking-wider text-blue-600 cert-title-blue"
                        style={{ color: "#3b82f6" }}
                      >
                        CERTIFICATE OF APPEARANCE
                      </h1>
                    ) : (
                      <h1 className="text-4xl font-black uppercase tracking-wider font-black">
                        CERTIFICATE OF APPEARANCE
                      </h1>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="space-y-8 text-[1.25rem] leading-relaxed text-justify px-8">
                    {selectedTemplate === "template1" ? (
                      <>
                        <p className="indent-12 text-justify">
                          This certificate is issued upon the request of{" "}
                          <strong>{certData.requestorName}</strong>,
                          {certData.position} of the {certData.department} at{" "}
                          {certData.company}, for the purpose of certifying the
                          availability of power supply where the proposed
                          project and/or development site in{" "}
                          <strong>{certData.projectSite}</strong>.
                        </p>

                        <p className="indent-12 text-justify">
                          The Nueva Vizcaya Electric Cooperative, Inc. (NUVELCO)
                          hereby certifies that the location of the proposed
                          project will be supplied with electricity in
                          accordance with the standard procedures of the
                          Cooperative.
                        </p>

                        <p className="indent-12 mt-12">
                          This certificate is issued on the{" "}
                          {certData.issuedDate} at {certData.issuedLocation}.
                        </p>
                      </>
                    ) : selectedTemplate === "template4" ? (
                      <>
                        <p className="indent-12 text-justify">
                          This is to certify that{" "}
                          <strong>{certData.requestorName}</strong> from the{" "}
                          {certData.company} appeared to this office to
                          {certData.activity} on{" "}
                          <span className="inline-block border-b border-black min-w-[250px] text-center px-4 underline-span">
                            {certData.startDate || "\u00A0"}
                          </span>
                          .
                        </p>

                        <p className="indent-12 text-justify">
                          This certification is issued upon the request of the
                          above-named person for {certData.purpose}.
                        </p>

                        <p className="indent-12 mt-12">
                          Issued this{" "}
                          <span className="inline-block border-b border-black min-w-[80px] text-center px-2 underline-span">
                            {certData.issuedDate.split(" ")[0] || "\u00A0"}
                          </span>{" "}
                          day of{" "}
                          <span className="inline-block border-b border-black min-w-[150px] text-center px-2 underline-span">
                            {certData.issuedDate
                              .split(" ")
                              .slice(2)
                              .join(" ") || "\u00A0"}
                          </span>
                          .
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="indent-12 text-justify">
                          This is to certify that{" "}
                          <strong>{certData.requestorName}</strong> from the{" "}
                          {certData.company} appeared to this office{" "}
                          {selectedTemplate === "template3" ? "to" : "on"}
                          {selectedTemplate === "template3"
                            ? ` ${certData.activity} on ${certData.startDate} to ${certData.endDate}`
                            : ` ${certData.startDate} to ${certData.endDate} as a ${certData.activity}`}
                          .
                        </p>

                        <p className="indent-12 text-justify">
                          This certification is issued upon the request of the
                          above-named person for {certData.purpose}.
                        </p>

                        <p className="indent-12 mt-12">
                          Issued this {certData.issuedDate}.
                        </p>
                      </>
                    )}
                  </div>
                </div>

                {/* Signatory Footer */}
                <div
                  className="  text-right pr-8 pb-32 relative "
                  style={{ marginTop: "100px", marginRight: "22px" }}
                >
                  <div className="inline-block text-center relative min-w-[250px]">
                    {certData.showSignature && certData.signatureImage && (
                      <div className="signature-box absolute -mt-17 ml-30">
                        <img
                          src={certData.signatureImage}
                          alt="Signature"
                          className="h-28 w-auto object-contain mix-blend-multiply signature-img"
                        />
                      </div>
                    )}
                    <div className="relative z-0">
                      <p className="font-bold text-xl uppercase mb-1 ">
                        {certData.signatoryName}
                      </p>
                      <p className="text-lg">{certData.signatoryPosition}</p>
                    </div>
                  </div>
                </div>

                {/* Document Footer - Contact Info */}
                <div
                  style={{
                    position: "absolute",
                    bottom: "0",
                    left: "0",
                    right: "0",
                  }}
                >
                  {/* Double green line */}
                  <div
                    style={{
                      borderTop: "3px solid #168e3f",
                      borderBottom: "1px solid #168e3f",
                      height: "5px",
                      width: "100%",
                    }}
                  ></div>
                  {/* Contact info row */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "32px",
                      padding: "10px 0",
                      flexWrap: "wrap",
                    }}
                  >
                    {/* Website */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        fontSize: "11px",
                        color: "#333",
                      }}
                    >
                      <img
                        src="/globe.png"
                        alt="Website"
                        style={{
                          width: "22px",
                          height: "22px",
                          objectFit: "contain",
                        }}
                      />
                      <span style={{ color: "#555" }}>|</span>
                      <span>www.nuvelco.com</span>
                    </div>
                    {/* Email */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        fontSize: "11px",
                      }}
                    >
                      <img
                        src="/email.png"
                        alt="Email"
                        style={{
                          width: "22px",
                          height: "22px",
                          objectFit: "contain",
                        }}
                      />
                      <span style={{ color: "#555" }}>|</span>
                      <a
                        href="mailto:hq@nuvelco.com"
                        style={{ color: "#1a56db", textDecoration: "none" }}
                      >
                        hq@nuvelco.com
                      </a>
                    </div>
                    {/* Phone */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        color: "#333",
                      }}
                    >
                      <img
                        src="/Telephone.png"
                        alt="Phone"
                        style={{
                          width: "22px",
                          height: "22px",
                          objectFit: "contain",
                        }}
                      />
                      <span style={{ color: "#555" }}>|</span>
                      <span>0917-312-5775</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-white border-t border-gray-200 flex justify-between items-center shrink-0">
          <p className="text-sm text-gray-500 italic">
            * {templates.find((t) => t.value === selectedTemplate)?.label}
          </p>
          <div className="flex gap-3">
            <Button
              onClick={onClose}
              label="Close"
              variant="modal-secondary"
              size="lg"
            />
            <Button
              onClick={handlePrint}
              label="Print Certificate"
              variant="modal-primary"
              size="lg"
              icon={<FiPrinter size={18} />}
              className="px-8"
            />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        
        /* Thin scrollbar for preview */
        .scrollbar-thin::-webkit-scrollbar { width: 6px; height: 6px; }
        .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>
    </div>
  );
};

export default CertificateOfAppearanceModal;
