import React, { useState, useEffect } from "react";
import { getStudentProfile, createStudentProfileAPI, updateStudentProfile, uploadFiles } from "../../api";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { User, MapPin, CheckCircle, AlertCircle, Save, Calendar, Phone, Book, Camera, Upload, XCircle, FileText } from "lucide-react";

const StudentProfileSection = ({ student, prefetchedProfile, onProfileUpdated }) => {
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(!student?.hasProfile && !prefetchedProfile);
  const [profileId, setProfileId] = useState(prefetchedProfile?.profileId || null);
  const [previews, setPreviews] = useState({
    photo: null,
    signature: null,
    idProof: null,
  });
  const [selectedFiles, setSelectedFiles] = useState({
    photo: null,
    signature: null,
    idProof: null,
  });

  const [formData, setFormData] = useState({
    dateOfBirth: "",
    gender: "Male",
    category: "General",
    previousExamName: "",
    previousExamMarks: "",
    previousExamYear: "",
    previousExamRollNo: "",
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
    if (prefetchedProfile) {
      setFormData({
        dateOfBirth: prefetchedProfile.dateOfBirth || "",
        gender: prefetchedProfile.gender || "Male",
        category: prefetchedProfile.category || "General",
        previousExamName: prefetchedProfile.previousExamName || "",
        previousExamMarks: prefetchedProfile.previousExamMarks || "",
        previousExamYear: prefetchedProfile.previousExamYear || "",
        previousExamRollNo: prefetchedProfile.previousExamRollNo || "",
        fatherName: prefetchedProfile.fatherName || "",
        motherName: prefetchedProfile.motherName || "",
        guardianContact: prefetchedProfile.guardianContact || "",
        qualification: prefetchedProfile.qualification || "",
        profilePhotoUrl: prefetchedProfile.profilePhotoUrl || "",
        signatureUrl: prefetchedProfile.signatureUrl || "",
        idProofNumber: prefetchedProfile.idProofNumber || "",
        idProofDocumentUrl: prefetchedProfile.idProofDocumentUrl || "",
        profileCompletionStatus: prefetchedProfile.profileCompletionStatus || "Complete",
        address: prefetchedProfile.address || {
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
  }, [prefetchedProfile]);

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

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    // Create local preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviews((prev) => ({
        ...prev,
        [type]: reader.result,
      }));
    };
    reader.readAsDataURL(file);
    
    // Store actual file for upload later
    setSelectedFiles((prev) => ({
      ...prev,
      [type]: file,
    }));

    toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} selected`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let finalFormData = { ...formData };

      // 1. Check if there are files to upload
      const uploadQueue = [];
      if (selectedFiles.photo) {
        uploadQueue.push(new File([selectedFiles.photo], `photo_${selectedFiles.photo.name}`, { type: selectedFiles.photo.type }));
      }
      if (selectedFiles.signature) {
        uploadQueue.push(new File([selectedFiles.signature], `signature_${selectedFiles.signature.name}`, { type: selectedFiles.signature.type }));
      }
      if (selectedFiles.idProof) {
        uploadQueue.push(new File([selectedFiles.idProof], `idproof_${selectedFiles.idProof.name}`, { type: selectedFiles.idProof.type }));
      }
      
      if (uploadQueue.length > 0) {
        toast.loading("Uploading documents...", { id: "uploading" });
        try {
          const uploadResponse = await uploadFiles(uploadQueue);
          toast.success("Documents uploaded successfully!", { id: "uploading" });

          // 2. Map returned URLs using our unique prefixes
          if (selectedFiles.photo) {
            finalFormData.profilePhotoUrl = uploadResponse[`photo_${selectedFiles.photo.name}`];
          }
          if (selectedFiles.signature) {
            finalFormData.signatureUrl = uploadResponse[`signature_${selectedFiles.signature.name}`];
          }
          if (selectedFiles.idProof) {
            finalFormData.idProofDocumentUrl = uploadResponse[`idproof_${selectedFiles.idProof.name}`];
          }
          
          // Clear selected files after successful upload
          setSelectedFiles({ photo: null, signature: null, idProof: null });
        } catch (uploadError) {
          console.error("Upload failed:", uploadError);
          toast.error("Document upload failed. Profile not saved.", { id: "uploading" });
          setLoading(false);
          return;
        }
      }

      // Basic completion check
      const isComplete =
        finalFormData.dateOfBirth &&
        finalFormData.gender &&
        finalFormData.fatherName &&
        finalFormData.address.line1 &&
        finalFormData.address.villageOrCity &&
        finalFormData.address.state &&
        finalFormData.address.pincode;

      const payload = {
        ...finalFormData,
        studentId: student.studentId,
        profileId: profileId,
        profileCompletionStatus: isComplete ? "Complete" : "Incomplete",
      };

      console.log("Final profile payload to be saved:", payload);

      if ((student.hasProfile || profileId) && profileId) {
        await updateStudentProfile(profileId, payload);
        toast.success("Profile updated successfully!");
      } else {
        const response = await createStudentProfileAPI(student.studentId, payload);
        if (response && response.profileId) {
          setProfileId(response.profileId);
        }
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
          {/* Top Section: Identity & Photo */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Info Column */}
            <div className="lg:col-span-3 space-y-8">
              <section>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2 text-sm uppercase tracking-wider">
                  <User size={18} className="text-gray-400" /> Basic Identity
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Student Name</label>
                    <input
                      type="text"
                      value={`${student?.firstName || ""} ${student?.lastName || ""}`}
                      disabled
                      className="w-full border border-gray-200 rounded-lg p-2.5 bg-gray-100 text-gray-500 font-semibold cursor-not-allowed"
                    />
                  </div>
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
                </div>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2 text-sm uppercase tracking-wider">
                  <Phone size={18} className="text-gray-400" /> Additional Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  <div className="md:col-span-2">
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
            </div>

            {/* Photo Column */}
            <div className="lg:col-span-1 border-l lg:pl-8 pt-8 lg:pt-0">
              <label className="block text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider text-center">Profile Photo</label>
              <div 
                className={`relative aspect-[3/4] w-full max-w-[240px] mx-auto rounded-3xl border-2 border-dashed transition-all flex flex-col items-center justify-center overflow-hidden shadow-sm
                  ${previews.photo || formData.profilePhotoUrl ? 'border-indigo-200 bg-white' : 'border-gray-200 bg-gray-50'}`}
              >
                {(previews.photo || formData.profilePhotoUrl) ? (
                  <>
                    <img 
                      src={previews.photo || formData.profilePhotoUrl} 
                      alt="Profile Preview" 
                      className="w-full h-full object-cover"
                    />
                    {isEditing && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <label className="cursor-pointer bg-white text-gray-800 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 shadow-lg">
                          <Upload size={14} /> Change
                          <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'photo')} />
                        </label>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center p-6 relative w-full h-full flex flex-col items-center justify-center">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                      <Camera className="text-gray-300" size={32} />
                    </div>
                    <p className="text-sm text-gray-500 font-bold mb-1">Upload Photo</p>
                    <p className="text-[10px] text-gray-400">Passport size (Max 1MB)</p>
                    {isEditing && (
                      <input 
                        type="file" 
                        className="absolute inset-0 opacity-0 cursor-pointer" 
                        accept="image/*" 
                        onChange={(e) => handleFileChange(e, 'photo')} 
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
            {/* Signature & ID Section */}
            <section className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2 border-b pb-2 text-sm uppercase tracking-wider">
                <Camera size={18} className="text-gray-400" /> Essential Documents
              </h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Candidate Signature</label>
                  <div 
                    className={`relative aspect-[5/2] w-full rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center overflow-hidden
                      ${previews.signature || formData.signatureUrl ? 'border-indigo-200 bg-white shadow-sm' : 'border-gray-200 bg-gray-100'}`}
                  >
                    {(previews.signature || formData.signatureUrl) ? (
                      <>
                        <img 
                          src={previews.signature || formData.signatureUrl} 
                          alt="Signature Preview" 
                          className="w-full h-full object-contain p-2"
                        />
                        {isEditing && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                            <label className="cursor-pointer bg-white text-gray-800 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 shadow-lg">
                              <Upload size={14} /> Change
                              <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'signature')} />
                            </label>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center p-4">
                        <Upload className="mx-auto text-gray-400 mb-2" size={24} />
                        <p className="text-xs text-gray-500 font-bold">Select Signature copy</p>
                        {isEditing && (
                          <input 
                            type="file" 
                            className="absolute inset-0 opacity-0 cursor-pointer" 
                            accept="image/*" 
                            onChange={(e) => handleFileChange(e, 'signature')} 
                          />
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">ID Proof Document</label>
                  <div 
                    className={`relative h-20 w-full rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center overflow-hidden
                      ${previews.idProof || formData.idProofDocumentUrl ? 'border-indigo-200 bg-white shadow-sm' : 'border-gray-200 bg-gray-100'}`}
                  >
                    {(previews.idProof || formData.idProofDocumentUrl) ? (
                      <div className="flex items-center gap-3 px-4 w-full">
                        <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
                          <FileText size={20} />
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <p className="text-xs font-bold text-gray-800 truncate">
                            {previews.idProof ? "New Document Selected" : "ID Proof Document"}
                          </p>
                          <p className="text-[10px] text-green-600 font-bold tracking-tight uppercase">
                            {previews.idProof ? "Ready to Upload" : "Verified & Stored"}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {formData.idProofDocumentUrl && (
                            <a 
                              href={formData.idProofDocumentUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg font-bold hover:bg-indigo-100 transition-colors"
                            >
                              View
                            </a>
                          )}
                          {isEditing && (
                            <button 
                              type="button"
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                setPreviews(p => ({...p, idProof: null}));
                                setSelectedFiles(p => ({...p, idProof: null}));
                              }}
                              className="text-gray-400 hover:text-red-500 transition-colors p-1"
                            >
                              <XCircle size={18} />
                            </button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center flex items-center gap-3 px-6">
                        <FileText className="text-gray-400" size={24} />
                        <div className="text-left">
                          <p className="text-xs text-gray-500 font-bold">Select Aadhar/PAN</p>
                          <p className="text-[10px] text-gray-400">PDF or JPG (Max 2MB)</p>
                        </div>
                        {isEditing && (
                          <input 
                            type="file" 
                            className="absolute inset-0 opacity-0 cursor-pointer" 
                            accept=".pdf,image/*" 
                            onChange={(e) => handleFileChange(e, 'idProof')} 
                          />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Academic History Section */}
            <section className="bg-white p-6 rounded-2xl border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2 border-b pb-2 text-sm uppercase tracking-wider">
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Previous Exam Year</label>
                  <input
                    type="number"
                    name="previousExamYear"
                    value={formData.previousExamYear || ""}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="E.g., 2024"
                    className="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-70 disabled:bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Previous Exam Roll No</label>
                  <input
                    type="text"
                    name="previousExamRollNo"
                    value={formData.previousExamRollNo || ""}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="E.g., PRB-9921"
                    className="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-50 focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-70 disabled:bg-gray-100"
                  />
                </div>
              </div>
            </section>
          </div>

          {/* Address Section */}
          <section className="pt-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2 text-sm uppercase tracking-wider">
              <MapPin size={18} className="text-gray-400" /> Permanent Address
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-blue-50/30 p-6 rounded-2xl border border-blue-100/50">
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1</label>
                <input
                  type="text"
                  name="addr_line1"
                  value={formData.address.line1}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="House/Flat No., Street, Area"
                  className="w-full border border-gray-300 rounded-xl p-3 bg-white focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-70 disabled:bg-gray-100 shadow-sm"
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
                  className="w-full border border-gray-300 rounded-xl p-3 bg-white focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-70 disabled:bg-gray-100 shadow-sm"
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
                  className="w-full border border-gray-300 rounded-xl p-3 bg-white focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-70 disabled:bg-gray-100 shadow-sm"
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
                  className="w-full border border-gray-300 rounded-xl p-3 bg-white focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-70 disabled:bg-gray-100 shadow-sm"
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
                  className="w-full border border-gray-300 rounded-xl p-3 bg-white focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-70 disabled:bg-gray-100 shadow-sm"
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
                  className="w-full border border-gray-300 rounded-xl p-3 bg-white focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-70 disabled:bg-gray-100 shadow-sm"
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
                  className="w-full border border-gray-300 rounded-xl p-3 bg-white focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-70 disabled:bg-gray-100 shadow-sm"
                  required
                />
              </div>
            </div>
          </section>

          {/* Profile Documents Section */}
          <section className="hidden">
            {/* Redundant, handled above in redesigned layout */}
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
