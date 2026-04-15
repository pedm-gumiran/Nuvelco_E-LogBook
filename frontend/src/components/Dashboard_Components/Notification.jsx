import React, { useState, useRef, useEffect, useMemo } from "react";
import { FaBell } from "react-icons/fa";

/**
 * Notification Component - Displays a bell icon with notification count and dropdown
 *
 * @param {Array} notifications - Array of notification objects { id, title, message, time, read }
 * @param {function} onMarkAsRead - Function to mark a notification as read
 * @param {function} onMarkAllAsRead - Function to mark all notifications as read
 * @param {function} onDelete - Function to delete a notification
 */
const DELETED_NOTIFICATIONS_KEY = "deletedNotificationIds";

const Notification = ({
  notifications = [],
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  externalIsOpen,
  onToggle,
  highlightedId,
  onClearHighlight,
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setIsOpen = onToggle !== undefined ? onToggle : setInternalIsOpen;

  const [activeTab, setActiveTab] = useState("all");
  const [hiddenReadIds, setHiddenReadIds] = useState(new Set());
  const [deletedIds, setDeletedIds] = useState(new Set());
  const dropdownRef = useRef(null);
  const readTimersRef = useRef({});
  const itemRefs = useRef({});

  // Effect to handle highlighting logic (scrolling + tab switching)
  useEffect(() => {
    if (isOpen && highlightedId) {
      const notification = notifications.find((n) => n.id === highlightedId);
      if (notification) {
        // 1. Switch to appropriate tab if not in "all"
        if (activeTab !== "all") {
          if (notification.type === "intern") setActiveTab("intern");
          else if (
            notification.type === "school" ||
            notification.type === "course"
          )
            setActiveTab("school-course");
          else if (notification.type === "visitor") setActiveTab("visitor");
        }

        // 2. Scroll into view after a short delay to allow tab switching/render
        setTimeout(() => {
          const element = itemRefs.current[highlightedId];
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }, 100);

        // 3. Optional: clear highlight after some time
        if (onClearHighlight) {
          setTimeout(onClearHighlight, 3000);
        }
      }
    }
  }, [isOpen, highlightedId, notifications]);

  // Load deleted notifications from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(DELETED_NOTIFICATIONS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setDeletedIds(new Set(parsed));
      }
    } catch (e) {
      console.error("Error loading deleted notifications:", e);
    }
  }, []);

  // Handle delete with persistence
  const handleDelete = (notificationId) => {
    // Add to deleted IDs
    setDeletedIds((prev) => {
      const newSet = new Set([...prev, notificationId]);
      localStorage.setItem(
        DELETED_NOTIFICATIONS_KEY,
        JSON.stringify([...newSet]),
      );
      return newSet;
    });

    // Call original onDelete if provided
    if (onDelete) {
      onDelete(notificationId);
    }
  };

  // Clear timers on unmount
  useEffect(() => {
    return () => {
      Object.values(readTimersRef.current).forEach(clearTimeout);
    };
  }, []);

  // Handle marking as read with auto-hide timer
  const handleMarkAsRead = (notificationId) => {
    if (onMarkAsRead) {
      onMarkAsRead(notificationId);
      // Set timer to hide this read notification after 1 minute
      readTimersRef.current[notificationId] = setTimeout(() => {
        setHiddenReadIds((prev) => new Set([...prev, notificationId]));
      }, 60000); // 1 minute
    }
  };

  // Handle mark all as read
  const handleMarkAllAsRead = () => {
    if (onMarkAllAsRead) {
      onMarkAllAsRead();
      // Set timers for all unread notifications
      notifications.forEach((n) => {
        if (!n.read) {
          readTimersRef.current[n.id] = setTimeout(() => {
            setHiddenReadIds((prev) => new Set([...prev, n.id]));
          }, 60000);
        }
      });
    }
  };

  // Filter and sort notifications - unread first, then read
  const filteredNotifications = useMemo(() => {
    // First filter by tab, deleted IDs, and exclude hidden read notifications
    let filtered = notifications.filter((n) => {
      // Hide deleted notifications
      if (deletedIds.has(n.id)) return false;
      // Hide read notifications that have been hidden
      if (n.read && hiddenReadIds.has(n.id)) return false;
      // Filter by tab
      if (activeTab === "all") return true;
      if (activeTab === "intern") return n.type === "intern";
      if (activeTab === "school-course")
        return n.type === "school" || n.type === "course";
      if (activeTab === "visitor") return n.type === "visitor";
      return true;
    });

    // Sort: unread first, then by time (newest first)
    return filtered.sort((a, b) => {
      if (a.read === b.read) {
        return new Date(b.time) - new Date(a.time);
      }
      return a.read ? 1 : -1;
    });
  }, [notifications, activeTab, hiddenReadIds, deletedIds]);

  // Count all unread notifications (regardless of active tab)
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Disable background scroll when dropdown is open
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
  }, [isOpen]);

  // Format time to 12-hour with AM/PM and date
  const formatTime = (time) => {
    const date = new Date(time);
    if (isNaN(date.getTime())) return "Unknown time";

    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";

    hours = hours % 12;
    hours = hours ? hours : 12;

    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const month = monthNames[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();

    const now = new Date();
    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();
    const datePrefix = isToday ? "this" : "last";

    return `${hours}:${minutes} ${ampm} ${datePrefix} ${month} ${day}, ${year}`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <style>{`
        @keyframes pulse-subtle {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        .animate-pulse-subtle {
          animation: pulse-subtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
      {/* Bell Icon with Count Badge */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full text-gray-600 hover:bg-gray-100 transition-colors focus:outline-none"
        title="Notifications"
      >
        <FaBell className="text-xl" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
            <h3 className="font-semibold text-gray-800">Notifications</h3>
            {unreadCount > 0 && onMarkAllAsRead && (
              <button
                onClick={() => {
                  handleMarkAllAsRead();
                }}
                className="text-xs text-[#188b3e] hover:underline font-medium"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab("all")}
              className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
                activeTab === "all"
                  ? "bg-white text-[#188b3e] border-b-2 border-[#188b3e]"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveTab("intern")}
              className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
                activeTab === "intern"
                  ? "bg-white text-[#188b3e] border-b-2 border-[#188b3e]"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100"
              }`}
            >
              Interns
            </button>
            <button
              onClick={() => setActiveTab("school-course")}
              className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
                activeTab === "school-course"
                  ? "bg-white text-[#188b3e] border-b-2 border-[#188b3e]"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100"
              }`}
            >
              School/Course
            </button>
            <button
              onClick={() => setActiveTab("visitor")}
              className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
                activeTab === "visitor"
                  ? "bg-white text-[#188b3e] border-b-2 border-[#188b3e]"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100"
              }`}
            >
              Visitors
            </button>
          </div>

          {/* Notification List */}
          <div className="max-h-80 overflow-y-auto">
            {filteredNotifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500">
                <FaBell className="mx-auto text-3xl text-gray-300 mb-2" />
                <p className="text-sm">No notifications in this tab</p>
              </div>
            ) : (
              filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  ref={(el) => (itemRefs.current[notification.id] = el)}
                  className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-all duration-500 cursor-pointer ${
                    !notification.read ? "bg-blue-50/50" : ""
                  } ${
                    highlightedId === notification.id
                      ? "ring-2 ring-inset ring-[#188b3e] bg-green-50 animate-pulse-subtle"
                      : ""
                  }`}
                  onClick={() => {
                    if (!notification.read) {
                      handleMarkAsRead(notification.id);
                    }
                  }}
                >
                  <div className="flex items-start gap-3">
                    {/* Unread Indicator */}
                    {!notification.read && (
                      <span className="mt-2 w-2 h-2 bg-[#188b3e] rounded-full flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm ${!notification.read ? "font-semibold text-gray-900" : "text-gray-700"}`}
                      >
                        {notification.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatTime(notification.time)}
                      </p>
                    </div>
                    {/* Delete Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(notification.id);
                      }}
                      className="text-gray-400 hover:text-red-500 transition-colors p-1"
                      title="Delete"
                    >
                      <span className="text-xs">✕</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {filteredNotifications.length > 0 && (
            <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-center">
              <button
                onClick={() => setIsOpen(false)}
                className="text-xs text-gray-500 hover:text-gray-700 font-medium"
              >
                Close
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Notification;
