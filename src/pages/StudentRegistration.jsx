import React, { useState } from "react";
import { motion } from "framer-motion";
import { UserPlus, Eye, EyeOff, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import { registerStudent } from "../api";

const StudentRegistration = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    contact: "",
    email: "",
    age: "",
    motherTongue: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters!");
      return;
    }

    try {
      // Prepare data for backend (exclude confirmPassword)
      const { confirmPassword, ...studentData } = formData;

      // Call backend API
      const response = await registerStudent(studentData, 1); // schoolId = 1 (default)

      toast.success("Registration Successful! Redirecting to login...");
      console.log("Registered Student:", response);

      // Reset form
      setFormData({
        firstName: "",
        middleName: "",
        lastName: "",
        contact: "",
        email: "",
        age: "",
        motherTongue: "",
        password: "",
        confirmPassword: "",
      });

      // Redirect to student dashboard after 2 seconds
      setTimeout(() => {
        window.location.href = "/student";
      }, 2000);
    } catch (error) {
      console.error("Registration Error:", error);
      toast.error(
        error.response?.data?.message ||
          "Registration failed! Please try again.",
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-white">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <UserPlus size={32} />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Student Registration</h1>
                <p className="text-indigo-100 text-sm mt-1">
                  Create your account to get started
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8">
            <div className="space-y-6">
              {/* Name Fields */}
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    required
                    placeholder="Enter first name"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                    value={formData.firstName}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Middle Name
                  </label>
                  <input
                    type="text"
                    name="middleName"
                    placeholder="Enter middle name"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                    value={formData.middleName}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    required
                    placeholder="Enter last name"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                    value={formData.lastName}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Contact & Email */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Contact Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="contact"
                    required
                    placeholder="Enter contact number"
                    pattern="[0-9]{10}"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                    value={formData.contact}
                    onChange={handleChange}
                  />
                  <p className="text-xs text-gray-500 mt-1">10 digit number</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="Enter email address"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Age & Mother Tongue */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Age <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="age"
                    required
                    min="5"
                    max="100"
                    placeholder="Enter age"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                    value={formData.age}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Mother Tongue <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="motherTongue"
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition bg-white"
                    value={formData.motherTongue}
                    onChange={handleChange}
                  >
                    <option value="">Select mother tongue</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Marathi">Marathi</option>
                  </select>
                </div>
              </div>

              {/* Password Fields */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      required
                      minLength="6"
                      placeholder="Enter password"
                      className="w-full p-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                      value={formData.password}
                      onChange={handleChange}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Minimum 6 characters
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      required
                      minLength="6"
                      placeholder="Re-enter password"
                      className="w-full p-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={20} />
                      ) : (
                        <Eye size={20} />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-4 rounded-lg hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 mt-8"
              >
                <CheckCircle size={20} />
                Register Student
              </motion.button>
            </div>
          </form>
        </motion.div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-6 bg-indigo-50 border border-indigo-200 rounded-xl p-6"
        >
          <h3 className="font-semibold text-indigo-900 mb-2">
            Registration Guidelines
          </h3>
          <ul className="text-sm text-indigo-700 space-y-1">
            <li>• All fields marked with * are mandatory</li>
            <li>• Contact number must be 10 digits</li>
            <li>• Password must be at least 6 characters long</li>
            <li>• Make sure both passwords match</li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
};

export default StudentRegistration;
