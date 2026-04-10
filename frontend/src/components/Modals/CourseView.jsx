import React, { useState } from 'react';
import { FiX, FiBook } from 'react-icons/fi';
import ItemCard from '../Cards/ItemCard.jsx';

const CourseView = ({ isOpen, school, courses, internAttendance, onCourseClick, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full h-full max-w-7xl mx-auto overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
           
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {school?.school_name} - Courses
              </h1>
              <p className="text-gray-600 mt-1">Select a course to view attendance</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
            title="Close"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        <main className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FiBook className="w-5 h-5 text-[#188b3e]" />
              Available Courses
            </h2>

            {courses.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <FiBook className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No courses found for this school</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {courses.map(course => (
                  <ItemCard
                    key={course.id}
                    item={course}
                    displayTitle={course.abbreviation || course.course_name}
                    displaySubtitle={course.abbreviation ? course.course_name : null}
                    count={internAttendance.filter(r => r.school_name === school?.school_name && r.course_name === course.course_name).length}
                    countLabel="records"
                    onClick={() => onCourseClick(course)}
                    hideActions={true}
                    hideTimestamps={true}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default CourseView;
