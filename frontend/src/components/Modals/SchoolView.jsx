import React, { useState } from 'react';
import { FiRefreshCw, FiLoader } from 'react-icons/fi';
import { toast } from 'react-toastify';
import SearchBar from '../Input_Fields/SearchBar.jsx';
import Button from '../Buttons/Button.jsx';
import ItemCard from '../Cards/ItemCard.jsx';

const SchoolView = ({ schools, internAttendance, onSchoolClick, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    if (onRefresh) {
      await onRefresh();
      toast.success('Data refreshed successfully');
    }
    setIsRefreshing(false);
  };

  // Filter schools based on search term
  const filteredSchools = schools.filter(school =>
    school.school_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Toolbar - Always visible */}
      <div className="flex flex-col lg:flex-row gap-3">
        <div className="flex-1">
          <SearchBar
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by school name..."
            width="w-full"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            label="Refresh"
            onClick={handleRefresh}
            icon={isRefreshing ? <FiLoader className="w-3 h-3 sm:w-4 sm:h-4 animate-spin text-blue-600" /> : <FiRefreshCw className="w-3 h-3 sm:w-4 sm:h-4" />}
            variant="secondary"
            size="sm"
            disabled={isRefreshing}
            title="Refresh"
            hideLabelOnSmall
          />
        </div>
      </div>

      {/* Schools Grid or Empty Message */}
      {schools.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No intern attendance records found
        </div>
      ) : filteredSchools.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No schools found matching "{searchTerm}"
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSchools.map(school => (
            <ItemCard
              key={school.id}
              item={school}
              displayTitle={school.school_name}
              onClick={() => onSchoolClick(school)}
              hideActions={true}
              hideTimestamps={true}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SchoolView;
