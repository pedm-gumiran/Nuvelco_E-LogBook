import React, { useEffect, useState } from "react";
import { FiMail, FiX, FiFacebook } from "react-icons/fi";
import Button from "../Buttons/Button.jsx";

/**
 * DeveloperModal - Shows developer information and contact options
 *
 * @param {boolean} isOpen - Whether the modal is visible
 * @param {function} onClose - Function to close the modal
 */
const DeveloperModal = ({ isOpen, onClose }) => {
  const [selectedImage, setSelectedImage] = useState(null);
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
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.width = "";
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleContactDeveloper = () => {
    window.location.href = "https://web.facebook.com/petergumiranjr";
  };

  const openImageModal = (imageSrc, name) => {
    setSelectedImage({ src: imageSrc, name });
  };

  const closeImageModal = () => {
    setSelectedImage(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg mx-4 bg-white rounded-2xl shadow-2xl animate-fadeIn max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#168e3f] rounded-t-2xl shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-white">Developers</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors text-white/80 hover:text-white"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto">
          {/* Developer Info */}
          <div className="text-center mb-6">
            {/* Team Members Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {/* Pedro M. Gumiran Jr. */}
              <div className="flex flex-col items-center">
                <div
                  onClick={() =>
                    openImageModal("/peter.png", "Pedro M. Gumiran Jr.")
                  }
                  className="w-20 h-20 bg-gradient-to-br from-blue-500 to-green-500 rounded-full mx-auto mb-2 flex items-center justify-center overflow-hidden group cursor-pointer transition-transform duration-300 hover:scale-105"
                >
                  <img
                    src="/peter.png"
                    alt="Pedro M. Gumiran Jr."
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.parentElement.innerHTML =
                        '<span class="text-2xl font-bold text-white">PG</span>';
                    }}
                  />
                </div>
                <h4 className="text-sm font-bold text-gray-900">
                  Pedro M. Gumiran Jr.
                </h4>
                <p className="text-xs text-gray-500">
                  Project Lead and Backend Developer
                </p>
              </div>

              {/* Jolo Josiah M. Tablada */}
              <div className="flex flex-col items-center">
                <div
                  onClick={() =>
                    openImageModal(
                      "/placeholder-profile.png",
                      "Jolo Josiah M. Tablada",
                    )
                  }
                  className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full mx-auto mb-2 flex items-center justify-center overflow-hidden group cursor-pointer transition-transform duration-300 hover:scale-105"
                >
                  <img
                    src="/placeholder-profile.png"
                    alt="Jolo Josiah M. Tablada"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.parentElement.innerHTML =
                        '<span class="text-2xl font-bold text-white">JT</span>';
                    }}
                  />
                </div>
                <h4 className="text-sm font-bold text-gray-900">
                  Jolo Josiah M. Tablada
                </h4>
                <p className="text-xs text-gray-500">Frontend Developer</p>
              </div>

              {/* Angelo Keith S. Ortiguez */}
              <div className="flex flex-col items-center">
                <div
                  onClick={() =>
                    openImageModal(
                      "/placeholder-profile.png",
                      "Angelo Keith S. Ortiguez",
                    )
                  }
                  className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-full mx-auto mb-2 flex items-center justify-center overflow-hidden group cursor-pointer transition-transform duration-300 hover:scale-105"
                >
                  <img
                    src="/placeholder-profile.png"
                    alt="Angelo Keith S. Ortiguez"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.parentElement.innerHTML =
                        '<span class="text-2xl font-bold text-white">AO</span>';
                    }}
                  />
                </div>
                <h4 className="text-sm font-bold text-gray-900">
                  Angelo Keith S. Ortiguez
                </h4>
                <p className="text-xs text-gray-500">Frontend Designer</p>
              </div>

              {/* Myson Amlo */}
              <div className="flex flex-col items-center">
                <div
                  onClick={() => openImageModal("/myson.png", "Myson Amlo")}
                  className="w-20 h-20 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-full mx-auto mb-2 flex items-center justify-center overflow-hidden group cursor-pointer transition-transform duration-300 hover:scale-105"
                >
                  <img
                    src="/myson.png"
                    alt="Myson Amlo"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.parentElement.innerHTML =
                        '<span class="text-2xl font-bold text-white">MA</span>';
                    }}
                  />
                </div>
                <h4 className="text-sm font-bold text-gray-900">Myson Amlo</h4>
                <p className="text-xs text-gray-500">
                  {" "}
                  System Quality Assurance
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="text-gray-600 text-center mb-4 text-sm mt-8">
            Have questions about the system or need assistance? Get in touch
            with the developers.
          </p>

          {/* Partnership Logos */}
          <div className="mb-6">
            <p className="text-xs text-gray-500 text-center mb-3 uppercase tracking-wider">
              In Partnership With
            </p>
            <div className="flex items-center justify-center gap-4">
              <img
                src="/MIS_LOGO.jpg"
                alt="MIS Logo"
                className="h-20 w-auto object-contain"
              />
              <img
                src="/client_logo.png"
                alt="Nuvelco Logo"
                className="h-20 w-auto object-contain"
              />
              <img
                src="/Nvsu_logo.jfif"
                alt="NVSU Logo"
                className="h-20 w-auto object-contain"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              label="Contact Developer"
              onClick={handleContactDeveloper}
              icon={<FiMail className="w-4 h-4" />}
              variant="custom"
              customColor="#188b3e"
              size="md"
              className="w-full"
            />
          </div>

          {/* Social Links */}
          <div className="flex justify-center gap-4 mt-6 pt-6 border-t border-gray-200">
            <a
              href="https://web.facebook.com/petergumiranjr"
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
              title="Facebook"
            >
              <FiFacebook className="w-5 h-5" />
            </a>
            <a
              href="mailto:gumiranpeter102816@gmail.com "
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
              title="Gmail"
            >
              <FiMail className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={closeImageModal}
        >
          <div className="relative max-w-2xl mx-4">
            <button
              onClick={closeImageModal}
              className="absolute -top-12 right-0 p-2 text-white hover:text-gray-300 transition-colors"
            >
              <FiX className="w-8 h-8" />
            </button>
            <img
              src={selectedImage.src}
              alt={selectedImage.name}
              className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            <p className="text-center text-white mt-4 text-lg font-medium">
              {selectedImage.name}
            </p>
          </div>
        </div>
      )}

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

export default DeveloperModal;
