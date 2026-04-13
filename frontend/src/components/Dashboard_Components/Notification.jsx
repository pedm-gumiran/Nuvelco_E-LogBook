import React, { useState, useRef, useEffect } from "react";
import { FaBell } from "react-icons/fa";

/**
 * Notification Component - Displays a bell icon with notification count and dropdown
 *
 * @param {Array} notifications - Array of notification objects { id, title, message, time, read }
 * @param {function} onMarkAsRead - Function to mark a notification as read
 * @param {function} onMarkAllAsRead - Function to mark all notifications as read
 * @param {function} onDelete - Function to delete a notification
 */
const Notification = ({
  notifications = [],
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const dropdownRef = useRef(null);

  // Filter notifications by tab
  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === "all") return true;
    if (activeTab === "intern") return n.type === "intern";
    if (activeTab === "school-course")
      return n.type === "school" || n.type === "course";
    if (activeTab === "visitor") return n.type === "visitor";
    return true;
  });

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
  }, []);

  // Format time to 12-hour with AM/PM (no seconds)
  const formatTime = (time) => {
    const date = new Date(time);
    if (isNaN(date.getTime())) return "Unknown time";

    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";

    hours = hours % 12;
    hours = hours ? hours : 12; // 0 should be 12

    return `${hours}:${minutes} ${ampm}`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
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
                  onMarkAllAsRead();
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
                  className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${
                    !notification.read ? "bg-blue-50/50" : ""
                  }`}
                  onClick={() => {
                    if (!notification.read && onMarkAsRead) {
                      onMarkAsRead(notification.id);
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
                    {onDelete && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(notification.id);
                        }}
                        className="text-gray-400 hover:text-red-500 transition-colors p-1"
                        title="Delete"
                      >
                        <span className="text-xs">✕</span>
                      </button>
                    )}
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
