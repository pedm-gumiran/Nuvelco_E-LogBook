import React, { useState, useEffect, useRef } from 'react';
import { FaBell, FaBox, FaTimes, FaArrowRight } from 'react-icons/fa';
import { FiLoader } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

export default function NotificationDropdown({ isOpen, onClose }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside or escape key
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        // Don't close if clicking on the notification button
        const notificationButton = event.target.closest('[data-notification-button]');
        if (!notificationButton) {
          onClose();
        }
      }
    }
    
    // Close on escape key
    function handleEscapeKey(event) {
      if (event.key === 'Escape') {
        onClose();
      }
    }
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [onClose, isOpen]);

  // Fetch notifications when dropdown opens
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/notifications/low-stock');
      const data = await response.json();
      
      if (data.success) {
        setNotifications(data.data.notifications);
      } else {
        console.error('API returned error:', data.message);
        setNotifications([]);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewItem = (itemId) => {
    // Close dropdown and navigate to consumable products page with the specific item
    onClose();
    navigate('/consumable_products', { 
      state: { 
        fromNotification: true,
        filterBy: 'product_id',
        filterValue: itemId,
        highlightItemId: itemId 
      } 
    });
  };

  if (!isOpen) return null;

  return (
    <div 
      data-notification-dropdown
      className="absolute right-0 mt-2 w-full sm:w-96 max-w-[95vw] sm:max-w-md bg-white rounded-lg shadow-xl border border-gray-100 z-50 transform transition-all duration-200 origin-top-right"
      ref={dropdownRef}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
        <div className="flex items-center gap-2">
          <FaBell className="text-green-600" />
          <h3 className="font-semibold text-gray-800 text-sm sm:text-base">Low Stock Consumables</h3>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded hover:bg-gray-100"
          aria-label="Close notifications"
        >
          <FaTimes className="text-sm" />
        </button>
      </div>

      {/* Content */}
      <div className="max-h-64 sm:max-h-96 overflow-y-auto">
        {loading ? (
          <div className="p-6 sm:p-8 text-center text-gray-500">
            <FiLoader className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-green-600 mx-auto mb-2" />
            <p className="text-xs sm:text-sm">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-6 sm:p-8 text-center text-gray-500">
            <FaBox className="text-3xl sm:text-4xl mx-auto mb-2 text-green-200" />
            <p className="text-sm sm:text-base font-medium">No low stock consumables</p>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">All consumables are well stocked</p>
          </div>
        ) : (
          <div className="p-2 sm:p-3">
            {notifications.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-lg mb-2 border-l-4 bg-yellow-50 border-yellow-500 transition-all duration-200 hover:shadow-md hover:bg-yellow-100"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <FaBox className="text-yellow-500 text-sm flex-shrink-0" />
                      <span className="font-medium text-gray-800 text-sm truncate">
                        {item.name}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 space-y-1">
                      <p>Type: <span className="font-medium">{item.type}</span></p>
                      <p>Current Stock: <span className="font-semibold text-gray-800">{item.quantity} {item.unit}</span></p>
                      <p>Threshold: <span className="font-medium">{item.threshold} {item.unit}</span></p>
                      {item.category && <p>Category: {item.category}</p>}
                    </div>
                  </div>
                  <button
                    onClick={() => handleViewItem(item.id)}
                    className="flex items-center gap-1 px-2 py-1 bg-green-500 hover:bg-green-600 text-white text-xs rounded transition-colors"
                    title="View in Inventory"
                  >
                    <FaArrowRight className="text-xs" />
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
