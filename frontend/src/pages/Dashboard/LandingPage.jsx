import React, { useState, useEffect, useRef } from "react";
import {
  FiUsers,
  FiClock,
  FiCheckCircle,
  FiArrowRight,
  FiShield,
  FiBarChart2,
  FiActivity,
  FiArrowUp,
  FiCode,
  FiDownload,
  FiMail,
  FiCamera,
} from "react-icons/fi";
import { FaQrcode } from "react-icons/fa";
import Button from "../../components/Buttons/Button.jsx";
import LoginModal from "../../components/Modals/LoginModal.jsx";
import AttendanceModal from "../../components/modals/AttendanceModal.jsx";
import DeveloperModal from "../../components/modals/DeveloperModal.jsx";
import System_Logo from "../../components/Logo/System_Logo.jsx";
import Client_Logo from "../../components/Logo/Client_Logo.jsx";

const LandingPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [isDeveloperModalOpen, setIsDeveloperModalOpen] = useState(false);
  const mobileMenuRef = useRef(null);
  const mobileMenuButtonRef = useRef(null);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target) &&
        mobileMenuButtonRef.current &&
        !mobileMenuButtonRef.current.contains(event.target)
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobileMenuOpen]);
  useEffect(() => {
    // Hide scrollbar styles
    const style = document.createElement("style");
    style.setAttribute("data-scrollbar-hide", "true");
    style.textContent = `
      /* Hide all scrollbars */
      *::-webkit-scrollbar {
        display: none !important;
      }
      * {
        -ms-overflow-style: none !important;
        scrollbar-width: none !important;
      }
      html, body {
        overflow-x: hidden !important;
        scrollbar-width: none !important;
        -ms-overflow-style: none !important;
      }
      .hide-scrollbar::-webkit-scrollbar {
        display: none !important;
      }
      .hide-scrollbar {
        -ms-overflow-style: none !important;
        scrollbar-width: none !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      // Clean up style on unmount
      const existingStyle = document.querySelector(
        "style[data-scrollbar-hide]",
      );
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, []);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const openAttendanceModal = () => setIsAttendanceModalOpen(true);
  const closeAttendanceModal = () => setIsAttendanceModalOpen(false);

  const handleStartAttendance = () => {
    navigate("/attendance");
  };

  // Show/hide back to top button based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const smoothScroll = (targetId) => {
    const element = document.getElementById(targetId);
    if (element) {
      const startPosition = window.pageYOffset;
      const targetPosition =
        element.getBoundingClientRect().top + window.pageYOffset - 80;
      const distance = targetPosition - startPosition;
      const duration = 1200; // 1.2 seconds for smooth scrolling
      let start = null;

      const animation = (currentTime) => {
        if (start === null) start = currentTime;
        const timeElapsed = currentTime - start;
        const run = ease(timeElapsed, startPosition, distance, duration);
        window.scrollTo(0, run);
        if (timeElapsed < duration) requestAnimationFrame(animation);
      };

      const ease = (t, b, c, d) => {
        t /= d / 2;
        if (t < 1) return (c / 2) * t * t * t + b;
        t -= 2;
        return (c / 2) * (t * t * t + 2) + b;
      };

      requestAnimationFrame(animation);
    }
  };

  const openDeveloperModal = () => setIsDeveloperModalOpen(true);
  const closeDeveloperModal = () => setIsDeveloperModalOpen(false);

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 scroll-smooth hide-scrollbar"
      style={{ scrollBehavior: "smooth" }}
    >
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm fixed top-0 left-0 right-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Client_Logo size={window.innerWidth < 640 ? 40 : 45} />
                <div className="absolute rounded-full "></div>
              </div>
              <span className="text-xl font-bold text-gray-800">NUVELCO</span>
            </div>

            {/* Navigation - Mobile Menu Button */}
            <div className="lg:hidden" ref={mobileMenuButtonRef}>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-lg text-gray-600 hover:text-[#188b3e] hover:bg-gray-100 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={isMobileMenuOpen ? 2 : 1.5}
                    d={
                      isMobileMenuOpen
                        ? "M6 18L18 6M6 6l12 12"
                        : "M4 6h16M4 12h16M4 18h16"
                    }
                  />
                </svg>
              </button>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
              <div
                ref={mobileMenuRef}
                className="fixed top-16 right-4 z-60 lg:hidden"
              >
                <div className="bg-white shadow-2xl border-2 border-gray-300 w-80 sm:w-96 rounded-2xl transform transition-transform duration-300 ease-in-out">
                  <nav className="flex flex-col">
                    <div className="p-6 bg-white rounded-t-2xl">
                      <div className="space-y-2">
                        <button
                          onClick={() => {
                            smoothScroll("features");
                            setIsMobileMenuOpen(false);
                          }}
                          className="w-full text-left px-4 py-4 text-lg text-gray-700 hover:bg-gray-50 hover:text-[#188b3e] transition-colors rounded-lg font-medium"
                        >
                          Features
                        </button>
                        <button
                          onClick={() => {
                            smoothScroll("about");
                            setIsMobileMenuOpen(false);
                          }}
                          className="w-full text-left px-4 py-4 text-lg text-gray-700 hover:bg-gray-50 hover:text-[#188b3e] transition-colors rounded-lg font-medium"
                        >
                          About
                        </button>
                        <button
                          onClick={() => {
                            openDeveloperModal();
                            setIsMobileMenuOpen(false);
                          }}
                          className="w-full text-left px-4 py-4 text-lg text-gray-700 hover:bg-gray-50 hover:text-[#188b3e] transition-colors rounded-lg font-medium"
                        >
                          Developer
                        </button>
                      </div>
                    </div>
                    <div className="p-6 border-t-2 border-gray-200 bg-white rounded-b-2xl">
                      <Button
                        label="Login"
                        onClick={() => {
                          openModal();
                          setIsMobileMenuOpen(false);
                        }}
                        variant="custom"
                        customColor="#188b3e"
                        icon={<FiArrowRight className="w-4 h-4" />}
                        size="lg"
                        className="w-full"
                      />
                    </div>
                  </nav>
                </div>
              </div>
            )}

            {/* Navigation - Desktop */}
            <nav className="hidden lg:flex space-x-8">
              <button
                onClick={() => smoothScroll("features")}
                className="text-gray-600 hover:text-[#188b3e] transition-colors relative group"
              >
                Features
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#188b3e] transition-all duration-300 group-hover:w-full"></span>
              </button>
              <button
                onClick={() => smoothScroll("about")}
                className="text-gray-600 hover:text-[#188b3e] transition-colors relative group"
              >
                About
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#188b3e] transition-all duration-300 group-hover:w-full"></span>
              </button>
              <button
                onClick={openDeveloperModal}
                className="text-gray-600 hover:text-[#188b3e] transition-colors relative group"
              >
                Developer
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#188b3e] transition-all duration-300 group-hover:w-full"></span>
              </button>
            </nav>

            {/* Login Button - Hidden on Small and Medium Screens */}
            <div className="hidden lg:block">
              <Button
                label="Login"
                onClick={openModal}
                variant="custom"
                customColor="#188b3e"
                icon={<FiArrowRight className="w-4 h-4" />}
                size="md"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - Split Layout */}
      <section className="min-h-screen flex items-center relative overflow-hidden pt-16">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-green-500 rounded-full filter blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8 mt-10">
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
                QR
                <span className="block text-[#188b3e]">Attendance</span>
                <span className="block">Keeper</span>
              </h1>

              <p className="text-xl text-gray-600 leading-relaxed">
                A smart attendance solution forNueva Vizcaya Electric
                Cooperative. Simplify interns and visitor tracking with quick QR
                code scanning and image capture in every entry as proof.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  label="Start Attendance"
                  onClick={openAttendanceModal}
                  variant="custom"
                  customColor="#188b3e"
                  icon={<FiArrowRight className="w-5 h-5" />}
                  size="lg"
                  className="w-full sm:w-auto"
                />
                <Button
                  label="Learn More"
                  onClick={() => smoothScroll("features")}
                  variant="secondary"
                  size="lg"
                  className="border-2 border-[#188b3e] text-[#188b3e] hover:bg-[#188b3e] hover:text-white w-full sm:w-auto"
                />
              </div>
            </div>

            {/* Right Visual */}
            <div className="relative">
              <div className="relative z-10">
                {/* Main Card */}
                <div className="bg-white rounded-2xl shadow-2xl p-8 transform hover:scale-105 transition-transform duration-300">
                  <div className="flex flex-col items-center">
                    <div className="relative mb-6">
                      <img
                        src="/system_logo.png"
                        alt="NUVELCO"
                        className="h-20 sm:h-24 w-auto"
                      />
                      <div className="absolute  rounded-full "></div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      NUVELCO
                    </h3>
                    <p className="text-gray-600 text-center">
                      Nueva Vizcaya Electric Cooperative
                    </p>

                    {/* Feature Icons */}
                    <div className="flex gap-4 mt-6">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FiActivity className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <FiCamera className="w-6 h-6 text-green-600" />
                      </div>
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <FaQrcode className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              QR Attendance Keeper Features
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Essential tools for tracking interns and visitors attendance at
              DDNHS.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="bg-green-100 rounded-full p-4 w-fit mb-4">
                <FiActivity className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Time-in/Time-out Tracking
              </h3>
              <p className="text-gray-600">
                Accurate interns and visitors attendance tracking with
                timestamp.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="bg-blue-100 rounded-full p-4 w-fit mb-4">
                <FaQrcode className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                QR Code Attendance
              </h3>
              <p className="text-gray-600">
                QR code scanning for interns and visitors attendance .
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="bg-green-100 rounded-full p-4 w-fit mb-4">
                <FiCamera className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Photo Capture Attendance
              </h3>
              <p className="text-gray-600">
                Automatic photo capture for every attendance entry.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="py-16 bg-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                About QR Attendance Keeper
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                <strong>QR Attendance Keeper</strong> is designed to transform
                how NUVELCO manages attendance. By leveraging QR code
                technology, the system eliminates manual record-keeping and
                provides real-time, accurate tracking for both interns and
                visitors.
              </p>
            </div>
            <div className="flex justify-center">
              <div className="bg-white rounded-2xl  p-8 shadow-lg">
                <System_Logo size={200} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p>
              Copyright &copy; 2026 PM.Gumiran Digital Solutions. All Rights
              Reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Back to Top Button */}
      {showBackToTop && (
        <div className="fixed bottom-8 right-8 z-40 group">
          <button
            onClick={scrollToTop}
            className="bg-[#188b3e] text-white p-3 rounded-full shadow-lg hover:bg-[#188b3a] transition-all duration-300 hover:scale-110"
            aria-label="Back to top"
          >
            <FiArrowUp className="w-6 h-6" />
          </button>
          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
            Go to top
            {/* Tooltip arrow */}
            <div className="absolute top-full right-4 -mr-1 border-4 border-transparent border-t-gray-800"></div>
          </div>
        </div>
      )}

      {/* Login Modal */}
      <LoginModal isOpen={isModalOpen} onClose={closeModal} />

      {/* Attendance Modal */}
      <AttendanceModal
        isOpen={isAttendanceModalOpen}
        onClose={closeAttendanceModal}
      />

      {/* Developer Modal */}
      <DeveloperModal
        isOpen={isDeveloperModalOpen}
        onClose={closeDeveloperModal}
      />
    </div>
  );
};

export default LandingPage;
