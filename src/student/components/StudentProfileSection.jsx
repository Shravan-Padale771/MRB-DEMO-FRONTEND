import React, { useState, useEffect } from "react";
import { getStudentProfile, createStudentProfileAPI, updateStudentProfile } from "../../api";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { User, MapPin, CheckCircle, AlertCircle, Save, Calendar, Phone, Book } from "lucide-react";

const StudentProfileSection = ({ student, onProfileUpdated }) => {
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(!student?.hasProfile);
  const [profileId, setProfileId] = useState(null);

  const [formData, setFormData] = useState({
    dateOfBirth: "",
    gender: "Male",
    category: "General",
    previousExamName: "",
    previousExamMarks: "",
    fatherName: "",
    motherName: "",
    guardianContact: "",
    qualification: "",
    profilePhotoUrl: "",
    signatureUrl: "",
    idProofNumber: "",
    idProofDocumentUrl: "",
    profileCompletionStatus: "Incomplete",
    address: {
      line1: "",
      line2: "",
      villageOrCity: "",
      taluka: "",
      district: "",
      state: "",
      pincode: "",
    },
  });

  useEffect(() => {
    if (student?.hasProfile) {
      fetchProfile();
    }
  }, [student]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      // Assuming getStudentProfile takes studentId based on backend conventions
      const data = await getStudentProfile(student.studentId);
      if (data) {
        setProfileId(data.id); // Or whatever the primary key of profile is
        setFormData({
          dateOfBirth: data.dateOfBirth || "",
          gender: data.gender || "Male",
          category: data.category || "General",
          previousExamName: data.previousExamName || "",
          previousExamMarks: data.previousExamMarks || "",
          fatherName: data.fatherName || "",
          motherName: data.motherName || "",
          guardianContact: data.guardianContact || "",
          qualification: data.qualification || "",
          profilePhotoUrl: data.profilePhotoUrl || "",
          signatureUrl: data.signatureUrl || "",
          idProofNumber: data.idProofNumber || "",
          idProofDocumentUrl: data.idProofDocumentUrl || "",
          profileCompletionStatus: data.profileCompletionStatus || "Complete",
          address: data.address || {
            line1: "",
            line2: "",
            villageOrCity: "",
            taluka: "",
            district: "",
            state: "",
            pincode: "",
          },
        });
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Failed to fetch profile", error);
      toast.error("Could not load existing profile data.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("addr_")) {
      const fieldName = name.replace("addr_", "");
      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [fieldName]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Basic completion check
      const isComplete =
        formData.dateOfBirth &&
        formData.gender &&
        formData.fatherName &&
        formData.address.line1 &&
        formData.address.villageOrCity &&
        formData.address.state &&
        formData.address.pincode;

      const payload = {
        ...formData,
        profileCompletionStatus: isComplete ? "Complete" : "Incomplete",
      };

      if (student.hasProfile && profileId) {
        await updateStudentProfile(profileId, payload);
        toast.success("Profile updated successfully!");
      } else {
        await createStudentProfileAPI(student.studentId, payload);
        toast.success("Profile created successfully!");
      }

      setIsEditing(false);
      if (onProfileUpdated) onProfileUpdated();
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Failed to save profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !formData.fatherName) {
    return <div className="p-8 text-center text-gray-500">Loading Profile...</div>;
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-6 border-b border-gray-100 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <User className="text-indigo-600" />
            Student Profile Details
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage your personal and contact information
          </p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-sm font-semibold bg-white border border-indigo-200 text-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-50 transition-colors"
          >
            Edit Profile
          </button>
        )}
      </div>

      <div className="p-6">
        {!student?.hasProfile && (
          <div className="mb-6 bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl flex items-start gap-3">
            <AlertCircle className="shrink-0 mt-0.5" size={20} />
            <div>
              <h4 className="font-semibold">Profile Incomplete</h4>
              <p className="text-sm mt-1">
                You must complete your profile information before applying for any exams. Please fill out the form below.
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Personal Details Section */}
          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2">
              <User size={18} className="text-gray-400" /> Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-70 disabled:bg-gray-100"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-70 disabled:bg-gray-100"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-70 disabled:bg-gray-100"
                >
                  <option value="General">General</option>
                  <option value="OBC">OBC</option>
                  <option value="SC">SC</option>
                  <option value="ST">ST</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Father's Name</label>
                <input
                  type="text"
                  name="fatherName"
                  value={formData.fatherName}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="Full Name"
                  className="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-70 disabled:bg-gray-100"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mother's Name</label>
                <input
                  type="text"
                  name="motherName"
                  value={formData.motherName}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="Full Name"
                  className="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-70 disabled:bg-gray-100"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Guardian Contact</label>
                <input
                  type="tel"
                  name="guardianContact"
                  value={formData.guardianContact}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="10-digit number"
                  className="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-70 disabled:bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ID Proof Number (Aadhar/PAN)</label>
                <input
                  type="text"
                  name="idProofNumber"
                  value={formData.idProofNumber}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="Document ID"
                  className="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-70 disabled:bg-gray-100"
                />
              </div>
              <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Qualification</label>
                 <input
                   type="text"
                   name="qualification"
                   value={formData.qualification}
                   onChange={handleChange}
                   disabled={!isEditing}
                   placeholder="E.g., 10th Pass"
                   className="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-70 disabled:bg-gray-100"
                 />
              </div>
            </div>
          </section>

          {/* Previous Academic Details Section */}
          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2">
              <Book size={18} className="text-gray-400" /> Academic History
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Previous Exam Name</label>
                <input
                  type="text"
                  name="previousExamName"
                  value={formData.previousExamName}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="E.g., Monthly Test 1"
                  className="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-70 disabled:bg-gray-100"
                />
              </div>
               <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Previous Exam Marks (%)</label>
                <input
                  type="number"
                  name="previousExamMarks"
                  value={formData.previousExamMarks || ""}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="E.g., 85"
                  className="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-70 disabled:bg-gray-100"
                />
              </div>
            </div>
          </section>

          {/* Address Section */}
          <section>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2">
              <MapPin size={18} className="text-gray-400" /> Address Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1</label>
                <input
                  type="text"
                  name="addr_line1"
                  value={formData.address.line1}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="House/Flat No., Street, Area"
                  className="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-70 disabled:bg-gray-100"
                  required
                />
              </div>
              <div className="lg:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2</label>
                <input
                  type="text"
                  name="addr_line2"
                  value={formData.address.line2}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="Landmark (Optional)"
                  className="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-70 disabled:bg-gray-100"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Village/City</label>
                <input
                  type="text"
                  name="addr_villageOrCity"
                  value={formData.address.villageOrCity}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-70 disabled:bg-gray-100"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Taluka</label>
                <input
                  type="text"
                  name="addr_taluka"
                  value={formData.address.taluka}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-70 disabled:bg-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                <input
                  type="text"
                  name="addr_district"
                  value={formData.address.district}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-70 disabled:bg-gray-100"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <input
                  type="text"
                  name="addr_state"
                  value={formData.address.state}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-70 disabled:bg-gray-100"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                <input
                  type="text"
                  name="addr_pincode"
                  value={formData.address.pincode}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-70 disabled:bg-gray-100"
                  required
                />
              </div>
            </div>
          </section>

          {isEditing && (
            <div className="flex justify-end gap-4 border-t pt-6">
              {student?.hasProfile && (
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-semibold transition-colors disabled:opacity-50"
                  disabled={loading}
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={loading}
                className="bg-indigo-600 text-white px-8 py-2.5 rounded-xl hover:bg-indigo-700 font-bold shadow-md flex items-center gap-2 transition-colors disabled:opacity-70"
              >
                {loading ? (
                  "Saving..."
                ) : (
                  <>
                    <Save size={18} /> Save Profile
                  </>
                )}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default StudentProfileSection;
