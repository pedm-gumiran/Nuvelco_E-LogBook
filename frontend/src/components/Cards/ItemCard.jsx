import React from 'react';
import { FiMoreVertical, FiEdit2, FiTrash2, FiUsers } from 'react-icons/fi';

export default function ItemCard({
  item,
  titleKey = 'name',
  displayTitle = null, // Direct title override
  displaySubtitle = null, // Direct subtitle override
  createdAtKey = 'created_at',
  updatedAtKey = 'updated_at',
  count = null, // Count to display (e.g., number of students)
  countLabel = 'students', // Label for the count
  onClick,
  onEdit,
  onDelete,
  isMenuOpen,
  onMenuToggle,
  onMenuClose,
  menuActions = null, // Optional custom menu actions
  hideActions = false, // Hide the 3-dot menu button
  hideTimestamps = false // Hide created/updated timestamps
}) {
  const handleMenuClick = (e) => {
    e.stopPropagation();
    onMenuToggle(item.id);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    onMenuClose();
    onEdit(item);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onMenuClose();
    onDelete(item.id);
  };

  const title = displayTitle || item[titleKey];
  const subtitle = displaySubtitle;
  const createdAt = item[createdAtKey];
  const updatedAt = item[updatedAtKey];

  return (
    <div
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        {/* Item info */}
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-lg">{title}</h3>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
          {count !== null && (
            <div className="flex items-center gap-1 mt-2 text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded-full w-fit">
              <FiUsers className="w-3 h-3" />
              <span className="font-medium">{count}</span>
              <span className="text-blue-500">{countLabel}</span>
            </div>
          )}
          {!hideTimestamps && (
            <div className="mt-2 space-y-1 text-sm text-gray-600">
              {createdAt && (
                <p><span className="font-medium">Created:</span> {createdAt}</p>
              )}
              {updatedAt && updatedAt !== '-' && (
                <p><span className="font-medium">Updated:</span> {updatedAt}</p>
              )}
            </div>
          )}
        </div>

        {/* 3-dot menu on the right */}
        {!hideActions && (
        <div className="relative ml-4">
          <button
            onClick={handleMenuClick}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
            title="Options"
          >
            <FiMoreVertical className="w-5 h-5" />
          </button>

          {/* Dropdown menu */}
          {isMenuOpen && (
            <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
              {menuActions ? (
                menuActions(item, onMenuClose)
              ) : (
                <>
                  <button
                    onClick={handleEdit}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 text-left"
                  >
                    <FiEdit2 className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 text-left"
                  >
                    <FiTrash2 className="w-4 h-4" />
                    Delete
                  </button>
                </>
              )}
            </div>
          )}
        </div>
        )}
      </div>
    </div>
  );
}
