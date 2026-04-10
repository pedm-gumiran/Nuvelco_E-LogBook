import React from 'react'

/**
 * AttendanceDataTable Component
 * 
 * A reusable data table for displaying attendance records (Faculty or Visitors)
 * 
 * @param {Object} props
 * @param {string} props.title - The title to display (e.g., "Recent Attendance - Faculty")
 * @param {string} props.date - The date string to display
 * @param {Array} props.data - Array of attendance records
 * @param {string} props.emptyMessage - Message to show when there's no data
 * @param {string} props.type - 'faculty' or 'visitors' for color theming (optional)
 */
const AttendanceDataTable = ({ 
  title, 
  date, 
  data = [], 
  emptyMessage = 'No records found',
  type = 'faculty'
}) => {
  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase()
  }

  const getAvatarColor = (index) => {
    const colors = ['bg-blue-500', 'bg-purple-500', 'bg-orange-500', 'bg-green-500', 'bg-pink-500', 'bg-teal-500']
    return colors[index % colors.length]
  }

  return (
    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs uppercase tracking-widest text-gray-600 font-black">
          {title}
        </h2>
        <span className="text-[10px] text-gray-500 font-medium">{date}</span>
      </div>
      
      <div className="grid grid-cols-[1fr_60px_60px_60px_60px] gap-2 text-[10px] text-gray-500 font-medium mb-2 px-2">
        <div>Name</div>
        <div className="text-center">AM In</div>
        <div className="text-center">AM Out</div>
        <div className="text-center">PM In</div>
        <div className="text-center">PM Out</div>
      </div>
      
      <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
        {data.length === 0 ? (
          <div className="text-center py-4 text-gray-400 text-sm">
            {emptyMessage}
          </div>
        ) : (
          data.map((record, index) => (
            <div 
              key={index} 
              className="grid grid-cols-[1fr_60px_60px_60px_60px] gap-2 items-center p-2 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className={`w-8 h-8 rounded-full ${getAvatarColor(index)} flex items-center justify-center text-white font-bold text-xs`}>
                    {getInitials(record.firstName, record.lastName)}
                  </div>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></span>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800 leading-tight">
                    {record.firstName} {record.lastName}
                  </p>
                  <p className="text-[9px] text-gray-500">{record.role || 'Staff'}</p>
                </div>
              </div>
              <div className="text-center text-xs text-gray-700">{record.amIn || '--'}</div>
              <div className="text-center text-xs text-gray-700">{record.amOut || '--'}</div>
              <div className="text-center text-xs text-gray-700">{record.pmIn || '--'}</div>
              <div className="text-center text-xs text-gray-400">{record.pmOut || '--'}</div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default AttendanceDataTable
