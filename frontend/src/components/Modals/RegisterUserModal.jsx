import React, { useState, useEffect, useMemo, useCallback } from "react";
import Input_Text from "../Input_Fields/Input_Text.jsx";
import Button from "../Buttons/Button.jsx";
import Btn_X from "../Buttons/Btn_X.jsx";
import School_Logo from "../Logo/Client_Logo.jsx";
import Dropdown from "../Input_Fields/Dropdown.jsx";
import axiosInstance from "../../api/axios.js";
import { toast } from "react-toastify";
import AddModal from "./AddModal.jsx";

const RegisterUserModal = ({ isOpen, onClose, onRegister }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [schools, setSchools] = useState([]);
  const [courses, setCourses] = useState([]);

  // States for modal visibility
  const [isSchoolModalOpen, setIsSchoolModalOpen] = useState(false);
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);

  // Field configurations for AddModal - memoized to prevent re-renders
  const schoolFields = useMemo(
    () => [
      {
        name: "school_name",
        label: "School Name",
        type: "text",
        required: true,
        placeholder: "Enter school name",
      },
    ],
    [],
  );

  const courseFields = useMemo(
    () => [
      {
        name: "course_name",
        label: "Course Name",
        type: "text",
        required: true,
        placeholder: "Enter course name",
      },
      {
        name: "abbreviation",
        label: "Abbreviation (Optional)",
        type: "text",
        required: false,
        placeholder: "e.g., BSIT, BSCS",
      },
    ],
    [],
  );

  const [formData, setFormData] = useState({
    intern_id: "",
    firstName: "",
    middleInitial: "",
    lastName: "",
    suffix: "",
    school: "",
    course: "",
  });

  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = "0";
      document.body.style.right = "0";
      document.body.style.overflow = "hidden";
      document.body.style.width = "100%";
    } else {
      const scrollY = document.body.style.top;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.overflow = "";
      document.body.style.width = "";
      window.scrollTo(0, parseInt(scrollY || "0") * -1);
    }

    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.overflow = "";
      document.body.style.width = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const fetchSchools = async () => {
    try {
      const response = await axiosInstance.get("/school");
      if (response.data.success) {
        const sortedSchools = response.data.data
          .map((s) => ({
            value: s.id.toString(),
            label: s.school_name,
          }))
          .sort((a, b) => a.label.localeCompare(b.label));
        setSchools(sortedSchools);
      }
    } catch (error) {
      console.error("Error fetching schools:", error);
    }
  };

  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchCourses = async (schoolId) => {
    if (!schoolId) {
      setCourses([]);
      return;
    }
    try {
      const response = await axiosInstance.get(`/course?schoolId=${schoolId}`);
      if (response.data.success) {
        const sortedCourses = response.data.data
          .map((c) => ({
            value: c.id.toString(),
            label: c.abbreviation || c.course_name,
          }))
          .sort((a, b) => a.label.localeCompare(b.label));
        setCourses(sortedCourses);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  // Fetch courses when school is selected
  useEffect(() => {
    fetchCourses(formData.school);
  }, [formData.school]);

  const generateInternId = () => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const length = 8;
    let result = "I";
    for (let i = 0; i < length - 1; i++) {
      result += characters.charAt(
        Math.floor(Math.random() * characters.length),
      );
    }
    return result;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Handle "Add New School" selection
    if (name === "school" && value === "add_new_school") {
      setIsSchoolModalOpen(true);
      return;
    }

    // Handle "Add New Course" selection
    if (name === "course" && value === "add_new_course") {
      setIsCourseModalOpen(true);
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
      // Clear course when school changes
      ...(name === "school" ? { course: "" } : {}),
    }));
  };

  // Handle new school added from AddModal
  const handleSchoolSubmit = async (modalFormData) => {
    const response = await axiosInstance.post("/school", {
      schoolName: modalFormData.school_name,
    });

    if (response.data.success) {
      const newSchool = response.data.data;
      // Close modal first
      setIsSchoolModalOpen(false);
      // Refetch schools from API to get complete list with new school
      await fetchSchools();
      // Select the newly added school
      setFormData((prev) => ({
        ...prev,
        school: newSchool.id.toString(),
        course: "",
      }));
      toast.success("School added successfully");

      // Dispatch notification event
      window.dispatchEvent(
        new CustomEvent("add-notification", {
          detail: {
            type: "school",
            title: "New School Added",
            message: `${newSchool.school_name} has been added to the system.`,
          },
        }),
      );
    }
  };

  // Handle new course added from AddModal
  const handleCourseSubmit = async (modalFormData) => {
    const response = await axiosInstance.post("/course", {
      courseName: modalFormData.course_name,
      abbreviation: modalFormData.abbreviation || undefined,
      schoolId: formData.school,
    });

    if (response.data.success) {
      const newCourse = response.data.data;
      // Close modal first
      setIsCourseModalOpen(false);
      // Refetch courses from API to get complete list with new course
      await fetchCourses(formData.school);
      // Select the newly added course
      setFormData((prev) => ({ ...prev, course: newCourse.id.toString() }));
      toast.success("Course added successfully");

      // Dispatch notification event
      window.dispatchEvent(
        new CustomEvent("add-notification", {
          detail: {
            type: "course",
            title: "New Course Added",
            message: `${newCourse.course_name} (${newCourse.abbreviation || "N/A"}) has been added.`,
          },
        }),
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axiosInstance.post("/intern", {
        id: formData.intern_id,
        firstName: formData.firstName,
        middleInitial: formData.middleInitial,
        lastName: formData.lastName,
        suffix: formData.suffix,
        schoolId: formData.school,
        courseId: formData.course,
      });

      if (response.data.success) {
        toast.success("Intern registered successfully!");
        const submissionData = {
          ...formData,
          id: response.data.data.id,
          status: "Active",
          type: "faculty",
        };
        onRegister && onRegister(submissionData);

        // Dispatch notification event
        window.dispatchEvent(
          new CustomEvent("add-notification", {
            detail: {
              type: "intern",
              title: "New Intern Registered",
              message: `${formData.firstName} ${formData.lastName} has been registered successfully.`,
            },
          }),
        );

        resetForm();
        onClose();
      }
    } catch (error) {
      console.error("Error registering intern:", error);

      // Handle duplicate name error specifically
      if (error.response?.status === 409) {
        toast.error(
          error.response.data.message ||
            "An intern with this name already exists",
        );
      } else {
        toast.error(
          error.response?.data?.message || "Failed to register intern",
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      intern_id: generateInternId(),
      firstName: "",
      middleInitial: "",
      lastName: "",
      suffix: "",
      school: "",
      course: "",
    });
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[400px] sm:max-w-[450px] relative flex flex-col items-center p-4 sm:p-5 animate-in zoom-in-95 duration-300">
        {/* Close Button */}
        <div className="absolute top-3 right-3 z-10">
          <Btn_X
            onClick={handleClose}
            className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
          />
        </div>

        {/* Body */}
        <div className="p-4 sm:p-5 w-full">
          <div className="flex flex-col items-center text-center mb-3 w-full">
            <div className="mb-1">
              <School_Logo size={window.innerWidth < 640 ? 30 : 40} />
            </div>

            <h1 className="text-[#188b3e] text-sm sm:text-base font-black leading-tight mt-1 px-1">
              Nueva Vizcaya Electric Cooperative
            </h1>

            <h2 className="text-gray-800 text-sm font-bold uppercase tracking-tight mt-1">
              Register New Intern
            </h2>
          </div>

          {isOpen && (
            <form
              onSubmit={handleSubmit}
              className="w-full space-y-0.5 text-left"
            >
              <div className="grid grid-cols-2 gap-3">
                <Input_Text
                  label="First Name"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="First name"
                  required
                />

                <Input_Text
                  label="Middle Initial"
                  name="middleInitial"
                  value={formData.middleInitial}
                  onChange={handleChange}
                  placeholder="Middle initial"
                />
              </div>

              <Input_Text
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Last name"
                required
              />

              <Input_Text
                label="Suffix"
                name="suffix"
                value={formData.suffix}
                onChange={handleChange}
                placeholder="Suffix (e.g., Jr., Sr.)"
              />

              {/* School Selection */}
              <div className="relative">
                <label className="block text-gray-600 mb-1 font-semibold">
                  School
                </label>
                <select
                  id="school"
                  name="school"
                  value={formData.school}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 h-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-gray-900"
                >
                  <option value="" disabled>
                    Select school
                  </option>
                  {schools.map((school) => (
                    <option key={school.value} value={school.value}>
                      {school.label}
                    </option>
                  ))}
                  <option
                    value="add_new_school"
                    className="text-green-600 font-medium"
                  >
                    + Add New School
                  </option>
                </select>
              </div>

              {/* Course Selection */}
              <div className="relative">
                <label className="block text-gray-600 mb-1 font-semibold">
                  Course
                </label>
                <select
                  id="course"
                  name="course"
                  value={formData.course}
                  onChange={handleChange}
                  required
                  disabled={!formData.school}
                  className={`w-full px-3 py-2 h-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    !formData.school
                      ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                      : "bg-white text-gray-900"
                  }`}
                >
                  <option value="" disabled>
                    Select course
                  </option>
                  {courses.map((course) => (
                    <option key={course.value} value={course.value}>
                      {course.label}
                    </option>
                  ))}
                  {formData.school && (
                    <option
                      value="add_new_course"
                      className="text-green-600 font-medium"
                    >
                      + Add New Course
                    </option>
                  )}
                </select>
              </div>

              <div className="pt-0.5">
                <Button
                  type="submit"
                  label="Register Intern"
                  variant="custom"
                  customColor="#188b3e"
                  size="sm"
                  className="w-full rounded-md font-bold text-sm py-1.5 shadow shadow-blue-600/20 active:scale-[0.98]"
                  isLoading={isLoading}
                  loadingText="Registering..."
                />
              </div>

              <div className="text-center pt-0.5">
                <p className="text-gray-500 text-xs">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="text-[#188b3e] font-bold hover:underline underline-offset-4 transition-all"
                  >
                    Cancel
                  </button>
                </p>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Add School Modal */}
      <AddModal
        isOpen={isSchoolModalOpen}
        onClose={() => setIsSchoolModalOpen(false)}
        onSubmit={handleSchoolSubmit}
        itemName="School"
        fields={schoolFields}
        size="sm"
        submitLabel={"Save School"}
        submitVariant="custom"
        submitCustomColor="#188b3e"
        headerColor={"bg-[#188b3e]"}
      />

      {/* Add Course Modal */}
      <AddModal
        isOpen={isCourseModalOpen}
        onClose={() => setIsCourseModalOpen(false)}
        onSubmit={handleCourseSubmit}
        itemName="Course"
        fields={courseFields}
        size="sm"
        submitLabel={"Save Course"}
        submitVariant="custom"
        submitCustomColor="#188b3e"
        headerColor={"bg-[#188b3e]"}
      />
    </div>
  );
};

export default RegisterUserModal;
