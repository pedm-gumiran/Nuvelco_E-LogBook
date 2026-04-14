import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  FaBars,
  FaHome,
  FaUsers,
  FaCog,
  FaDatabase,
  FaChevronDown,
  FaKey,
  FaSignOutAlt,
  FaTimes,
  FaSchool,
  FaBell,
} from "react-icons/fa";
import ChangePasswordModal from "../Modals/ChangePasswordModal";
import ConfirmationBox from "../Modals/ConfirmationBox";
import Client_Logo from "../Logo/Client_Logo";
import Notification from "./Notification";
import { useUser } from "../context/UserContext";
import historyManager from "../../utils/historyManager.js";
import axiosInstance from "../../api/axios.js";
//import { supabase } from '../../supabaseClient';

export default function Navbar({ activeMenu = "", setIsModalOpen }) {
  const [menuOpen, setMenuOpen] = useState(false); // mobile menu
  const [openSubmenu, setOpenSubmenu] = useState({});
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] =
    useState(false);
  const [logoutConfirm, setLogoutConfirm] = useState(false);

  // Load read status from localStorage
  const loadReadStatus = () => {
    try {
      const saved = localStorage.getItem("notificationReadStatus");
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  };

  // Save read status to localStorage
  const saveReadStatus = (readStatus) => {
    localStorage.setItem("notificationReadStatus", JSON.stringify(readStatus));
  };

  // Notifications state - fetch from database
  const [notifications, setNotifications] = useState([]);

  // Fetch notifications from API (today's data only)
  const fetchNotifications = async () => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const [internsRes, schoolsRes, coursesRes, visitorsRes] =
        await Promise.all([
          axiosInstance.get("/intern?limit=10&order=desc"),
          axiosInstance.get("/school?limit=10&order=desc"),
          axiosInstance.get("/course?limit=10&order=desc"),
          axiosInstance.get(`/visitor-attendance?date=${today}`),
        ]);

      // Load saved read status
      const readStatus = loadReadStatus();
      const newNotifications = [];

      // Add new intern notifications from today
      if (internsRes.data.success && internsRes.data.data) {
        internsRes.data.data.forEach((intern) => {
          if (!intern.created_at) return;
          const createdAt = new Date(intern.created_at);
          if (isNaN(createdAt.getTime())) return;
          const isToday = createdAt.toISOString().split("T")[0] === today;
          if (isToday) {
            const id = `intern-${intern.id}`;
            newNotifications.push({
              id,
              title: "New Intern Registered",
              message: `${intern.first_name} ${intern.last_name} ${intern.suffix || ""} has been registered successfully.`,
              time: createdAt,
              read: readStatus[id] || false,
              type: "intern",
            });
          }
        });
      }

      // Add new school notifications from today
      if (schoolsRes.data.success && schoolsRes.data.data) {
        schoolsRes.data.data.forEach((school) => {
          if (!school.created_at) return;
          const createdAt = new Date(school.created_at);
          if (isNaN(createdAt.getTime())) return;
          const isToday = createdAt.toISOString().split("T")[0] === today;
          if (isToday) {
            const id = `school-${school.id}`;
            newNotifications.push({
              id,
              title: "New School Added",
              message: `${school.school_name} has been added to the system.`,
              time: createdAt,
              read: readStatus[id] || false,
              type: "school",
            });
          }
        });
      }

      // Add new course notifications from today
      if (coursesRes.data.success && coursesRes.data.data) {
        coursesRes.data.data.forEach((course) => {
          if (!course.created_at) return;
          const createdAt = new Date(course.created_at);
          if (isNaN(createdAt.getTime())) return;
          const isToday = createdAt.toISOString().split("T")[0] === today;
          if (isToday) {
            const id = `course-${course.id}`;
            newNotifications.push({
              id,
              title: "New Course Added",
              message: `${course.course_name} (${course.abbreviation || "N/A"}) has been added.`,
              time: createdAt,
              read: readStatus[id] || false,
              type: "course",
            });
          }
        });
      }

      // Add today's visitor notifications
      if (visitorsRes.data.success && visitorsRes.data.data) {
        visitorsRes.data.data.forEach((visitor) => {
          // Use stable ID based on visitor.id and time_in so read status persists
          const timeKey = visitor.time_in
            ? visitor.time_in.replace(/:/g, "")
            : "";
          const id = `visitor-${visitor.id}-${timeKey}`;
          newNotifications.push({
            id,
            title: "New Visitor Today",
            message: `${visitor.visitor_name || "A visitor"} checked in.`,
            time: visitor.time_in
              ? new Date(`2000-01-01T${visitor.time_in}`)
              : new Date(),
            read: readStatus[id] || false,
            type: "visitor",
          });
        });
      }

      // Sort by time (newest first)
      newNotifications.sort((a, b) => b.time - a.time);
      setNotifications(newNotifications.slice(0, 10));
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  // Fetch notifications on mount and every 10 seconds
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  // Listen for notification events from other components (for instant update)
  useEffect(() => {
    const handleNotificationEvent = () => {
      // Refetch when an action happens
      fetchNotifications();
    };

    window.addEventListener("add-notification", handleNotificationEvent);
    return () =>
      window.removeEventListener("add-notification", handleNotificationEvent);
  }, []);

  const menuRef = useRef(null);
  const desktopMenuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, setUser } = useUser(); // ← Get setUser from useUser hook
  const [loading, setLoading] = useState(false);

  const roleMenus = {
    Admin: [
      { name: "Home", icon: FaHome, path: "/home" },
      { name: "School", icon: FaSchool, path: "/school" },
      {
        name: "Settings",
        icon: FaCog,
        submenu: [
          { name: "Change Password", icon: FaKey, action: "changePassword" },
          {
            name: "Backup & Restore",
            icon: FaDatabase,
            path: "/backup_restore",
          },
        ],
      },
    ],
  };

  const menuItems = roleMenus.Admin || [];

  const toggleSubmenu = (name) => {
    setOpenSubmenu((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  // Handle modal state for sidebar z-index
  useEffect(() => {
    const anyModalOpen = isChangePasswordModalOpen || logoutConfirm;
    setIsModalOpen(anyModalOpen);
  }, [isChangePasswordModalOpen, logoutConfirm, setIsModalOpen]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
      // Close desktop submenu when clicking outside
      if (
        desktopMenuRef.current &&
        !desktopMenuRef.current.contains(event.target)
      ) {
        setOpenSubmenu({});
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handlePasswordChange = (data) => {
    console.log("Password data:", data);
  };

  // Notification handlers
  const handleMarkAsRead = (id) => {
    setNotifications((prev) => {
      const updated = prev.map((n) => (n.id === id ? { ...n, read: true } : n));
      // Save read status to localStorage
      const readStatus = loadReadStatus();
      readStatus[id] = true;
      saveReadStatus(readStatus);
      return updated;
    });
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, read: true }));
      // Save all read status to localStorage
      const readStatus = loadReadStatus();
      prev.forEach((n) => {
        readStatus[n.id] = true;
      });
      saveReadStatus(readStatus);
      return updated;
    });
  };

  const handleDeleteNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      //await supabase.auth.signOut();

      // Clear user authentication data
      localStorage.removeItem("user");
      setUser(null); // Clear user context

      // Close the confirmation box immediately
      setLogoutConfirm(false);

      // Handle logout history management
      historyManager.handleLogout("/");

      // Use React Router to navigate to landing page
      navigate("/");
    } catch (err) {
      console.error("Logout error:", err.message);
      // Clear user data even on error
      localStorage.removeItem("user");
      setUser(null);
      setLogoutConfirm(false);
      navigate("/");
    } finally {
      // Add delay to show loading state
      setTimeout(() => {
        setLoading(false);
      }, 1500);
    }
  };

  return (
    <nav className="w-full bg-white shadow-lg px-4 sm:px-6 md:px-8 py-2 flex items-center justify-between fixed top-0 left-0 right-0 z-50">
      {/* Left: Logo */}
      <div className="shrink-0">
        <Link to="/home" className="flex items-center gap-2">
          <Client_Logo size={40} />
          <span className="text-lg font-bold text-gray-800">NUVELCO</span>
        </Link>
      </div>

      {/* Center: Navigation Menu */}
      <div
        className="flex-1 flex items-center justify-center"
        ref={desktopMenuRef}
      >
        {/* Desktop Navigation Menu */}
        <div className="hidden lg:flex items-center gap-1">
          {menuItems.map((item, idx) => (
            <div key={idx} className="relative">
              {item.submenu ? (
                <div>
                  <button
                    onClick={() => toggleSubmenu(item.name)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      openSubmenu[item.name] ||
                      item.submenu?.some(
                        (sub) => location.pathname === sub.path,
                      )
                        ? "bg-[#188b3e]/10 text-[#188b3e]"
                        : "text-gray-700 hover:bg-[#188b3e]/10"
                    }`}
                  >
                    <span className="text-lg">
                      <item.icon />
                    </span>
                    <span>{item.name}</span>
                    <FaChevronDown
                      className={`text-xs transition-transform ${openSubmenu[item.name] ? "rotate-180" : ""}`}
                    />
                  </button>
                  {openSubmenu[item.name] && (
                    <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50">
                      {item.submenu.map((sub, subIdx) => (
                        <div key={subIdx}>
                          {sub.submenu ? (
                            <div>
                              <button
                                onClick={() =>
                                  toggleSubmenu(`${item.name}-${sub.name}`)
                                }
                                className="w-full flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-[#188b3e]/10"
                              >
                                <span className="flex items-center gap-2">
                                  <span>
                                    <sub.icon />
                                  </span>
                                  {sub.name}
                                </span>
                                <FaChevronDown
                                  className={`text-xs transition-transform ${openSubmenu[`${item.name}-${sub.name}`] ? "rotate-180" : ""}`}
                                />
                              </button>
                              {openSubmenu[`${item.name}-${sub.name}`] && (
                                <div className="pl-4">
                                  {sub.submenu.map((nested, nestedIdx) => (
                                    <Link
                                      key={nestedIdx}
                                      to={nested.path}
                                      onClick={() => setOpenSubmenu({})}
                                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-[#188b3e]/10 rounded"
                                    >
                                      <span>
                                        <nested.icon />
                                      </span>
                                      {nested.name}
                                    </Link>
                                  ))}
                                </div>
                              )}
                            </div>
                          ) : sub.action === "changePassword" ? (
                            <button
                              onClick={() => {
                                setIsChangePasswordModalOpen(true);
                                setOpenSubmenu({});
                              }}
                              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-[#188b3e]/10 w-full text-left"
                            >
                              <span>
                                <sub.icon />
                              </span>
                              {sub.name}
                            </button>
                          ) : (
                            <Link
                              to={sub.path}
                              onClick={() => setOpenSubmenu({})}
                              className={`flex items-center gap-2 px-4 py-2 text-sm ${
                                location.pathname === sub.path
                                  ? "bg-[#188b3e]/10 text-[#188b3e]"
                                  : "text-gray-700 hover:bg-[#188b3e]/10"
                              }`}
                            >
                              <span>
                                <sub.icon />
                              </span>
                              {sub.name}
                            </Link>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to={item.path}
                  onClick={() => setOpenSubmenu({})}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === item.path
                      ? "bg-[#188b3e]/10 text-[#188b3e]"
                      : "text-gray-700 hover:bg-[#188b3e]/10"
                  }`}
                >
                  <span className="text-lg">
                    <item.icon />
                  </span>
                  <span>{item.name}</span>
                </Link>
              )}
            </div>
          ))}
        </div>

        {/* Mobile Menu Dropdown */}
        {menuOpen && (
          <div
            ref={menuRef}
            className="fixed top-14 left-4 right-4 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50 lg:hidden max-h-[80vh] overflow-y-auto"
          >
            {menuItems.map((item, idx) => (
              <div key={idx}>
                {item.submenu ? (
                  <div>
                    <button
                      onClick={() => toggleSubmenu(item.name)}
                      className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium ${
                        openSubmenu[item.name] ||
                        item.submenu?.some(
                          (sub) => location.pathname === sub.path,
                        )
                          ? "bg-[#188b3e]/10 text-[#188b3e]"
                          : "text-gray-700 hover:bg-[#188b3e]/10"
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <span className="text-lg">
                          <item.icon />
                        </span>
                        {item.name}
                      </span>
                      <FaChevronDown
                        className={`text-xs transition-transform ${openSubmenu[item.name] ? "rotate-180" : ""}`}
                      />
                    </button>
                    {openSubmenu[item.name] && (
                      <div className="pl-4">
                        {item.submenu.map((sub, subIdx) => (
                          <div key={subIdx}>
                            {sub.submenu ? (
                              <div>
                                <button
                                  onClick={() =>
                                    toggleSubmenu(`${item.name}-${sub.name}`)
                                  }
                                  className="w-full flex items-center justify-between px-4 py-2 text-sm text-gray-600 hover:bg-[#188b3e]/10"
                                >
                                  <span className="flex items-center gap-2">
                                    <span>
                                      <sub.icon />
                                    </span>
                                    {sub.name}
                                  </span>
                                  <FaChevronDown
                                    className={`text-xs transition-transform ${openSubmenu[`${item.name}-${sub.name}`] ? "rotate-180" : ""}`}
                                  />
                                </button>
                                {openSubmenu[`${item.name}-${sub.name}`] && (
                                  <div className="pl-4">
                                    {sub.submenu.map((nested, nestedIdx) => (
                                      <Link
                                        key={nestedIdx}
                                        to={nested.path}
                                        onClick={() => {
                                          setMenuOpen(false);
                                          setOpenSubmenu({});
                                        }}
                                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-[#188b3e]/10"
                                      >
                                        <span>
                                          <nested.icon />
                                        </span>
                                        {nested.name}
                                      </Link>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ) : sub.action === "changePassword" ? (
                              <button
                                onClick={() => {
                                  setIsChangePasswordModalOpen(true);
                                  setMenuOpen(false);
                                  setOpenSubmenu({});
                                }}
                                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:bg-[#188b3e]/10 w-full text-left"
                              >
                                <span>
                                  <sub.icon />
                                </span>
                                {sub.name}
                              </button>
                            ) : (
                              <Link
                                to={sub.path}
                                onClick={() => {
                                  setMenuOpen(false);
                                  setOpenSubmenu({});
                                }}
                                className={`flex items-center gap-2 px-4 py-2 text-sm ${
                                  location.pathname === sub.path
                                    ? "bg-[#188b3e]/10 text-[#188b3e]"
                                    : "text-gray-600 hover:bg-[#188b3e]/10"
                                }`}
                              >
                                <span>
                                  <sub.icon />
                                </span>
                                {sub.name}
                              </Link>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    to={item.path}
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 text-sm font-medium ${
                      location.pathname === item.path
                        ? "bg-[#188b3e]/10 text-[#188b3e]"
                        : "text-gray-700 hover:bg-[#188b3e]/10"
                    }`}
                  >
                    <span className="text-lg">
                      <item.icon />
                    </span>
                    {item.name}
                  </Link>
                )}
              </div>
            ))}
            {/* Logout button - separate in mobile menu */}
            <button
              onClick={() => {
                setMenuOpen(false);
                setLogoutConfirm(true);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              <span className="text-lg">
                <FaSignOutAlt />
              </span>
              Logout
            </button>
          </div>
        )}
      </div>

      {/* Right: Notification, Hamburger Menu (small screen) / Logout (large screen) */}
      <div className="shrink-0 flex items-center gap-2">
        {/* Notification Bell */}
        <Notification
          notifications={notifications}
          onMarkAsRead={handleMarkAsRead}
          onMarkAllAsRead={handleMarkAllAsRead}
          onDelete={handleDeleteNotification}
        />

        {/* Mobile Menu Button - visible on small screens */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="lg:hidden p-2 rounded-full text-gray-700 text-xl focus:outline-none hover:bg-gray-200 transition-colors cursor-pointer"
          title={menuOpen ? "Close menu" : "Show menu items"}
        >
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>

        {/* Logout Button - visible on large screens */}
        <button
          onClick={() => setLogoutConfirm(true)}
          className="hidden lg:flex items-center gap-2 px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg text-sm font-medium transition-colors shadow-sm"
          title="Logout"
        >
          <FaSignOutAlt />
          <span>Logout</span>
        </button>
      </div>

      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
        onSubmit={handlePasswordChange}
      />

      {/* Logout Confirmation Modal */}
      {logoutConfirm && (
        <ConfirmationBox
          title="Confirm Logout"
          message="Are you sure you want to log out?"
          label={"Logout"}
          disabled={loading}
          isLoading={loading}
          loadingText={"Logging out..."}
          onConfirm={async () => {
            await handleLogout();
          }}
          onCancel={() => setLogoutConfirm(false)}
        />
      )}
    </nav>
  );
}
