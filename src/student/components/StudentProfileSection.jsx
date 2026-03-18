import React, { useState, useEffect } from "react";
import { getStudentProfile, createStudentProfileAPI, updateStudentProfile, uploadFiles } from "../../api";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { User, MapPin, CheckCircle, AlertCircle, Save, Calendar, Phone, Book, Camera, Upload, XCircle, FileText, GraduationCap, ArrowRight, ShieldCheck } from "lucide-react";

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

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviews((prev) => ({
        ...prev,
        [type]: reader.result,
      }));
    };
    reader.readAsDataURL(file);
    
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
        const tid = toast.loading("Uploading documents...");
        try {
          const uploadResponse = await uploadFiles(uploadQueue);
          toast.success("Documents uploaded!", { id: tid });

          if (selectedFiles.photo) {
            finalFormData.profilePhotoUrl = uploadResponse[`photo_${selectedFiles.photo.name}`];
          }
          if (selectedFiles.signature) {
            finalFormData.signatureUrl = uploadResponse[`signature_${selectedFiles.signature.name}`];
          }
          if (selectedFiles.idProof) {
            finalFormData.idProofDocumentUrl = uploadResponse[`idproof_${selectedFiles.idProof.name}`];
          }
          setSelectedFiles({ photo: null, signature: null, idProof: null });
        } catch (uploadError) {
          toast.error("Upload failed", { id: tid });
          setLoading(false);
          return;
        }
      }

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

      if ((student.hasProfile || profileId) && profileId) {
        await updateStudentProfile(profileId, payload);
        toast.success("Profile updated!");
      } else {
        const response = await createStudentProfileAPI(student.studentId, payload);
        if (response && response.profileId) {
          setProfileId(response.profileId);
        }
        toast.success("Profile created!");
      }

      setIsEditing(false);
      if (onProfileUpdated) onProfileUpdated();
    } catch (error) {
      toast.error("Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !formData.fatherName) {
    return <div style={{ padding: '80px 40px', textAlign: 'center', color: '#94a3b8', fontWeight: '800', letterSpacing: '0.1em' }}>SYNCHRONIZING PROFILE...</div>;
  }

  return (
    <div style={s.container}>
      {/* Header with Admin Stats feel */}
      <div style={s.header}>
        <div style={s.headerLeft}>
          <h2 style={s.title}>
            <User size={24} style={s.titleIcon} /> Student Profile
          </h2>
          <p style={s.subtitle}>MANAGE YOUR PERSONAL AND ACADEMIC CREDENTIALS</p>
        </div>
        {!isEditing && (
          <button onClick={() => setIsEditing(true)} style={s.editBtn}>
            EDIT INFORMATION
          </button>
        )}
      </div>

      {!student?.hasProfile && (
        <div style={s.alertBox}>
          <AlertCircle size={20} color="#f59e0b" />
          <div style={s.alertContent}>
            <h4 style={s.alertTitle}>PROFILE ACTION REQUIRED</h4>
            <p style={s.alertText}>Your permanent record is incomplete. Please furnish all details below to activate exam registration.</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} style={s.form}>
        {/* Identity Section */}
        <div style={s.card}>
          <div style={s.cardHeader}>
            <ShieldCheck size={16} color="#4c84ff" />
            <span style={s.cardTitle}>Identity & Core Details</span>
          </div>
          
          <div style={s.flexRow}>
            <div style={s.formArea}>
              <div style={s.grid2}>
                <div style={s.fieldGroup}>
                  <label style={s.label}>FULL NAME</label>
                  <input
                    type="text"
                    value={`${student?.firstName || ""} ${student?.lastName || ""}`}
                    disabled
                    style={s.inputDisabled}
                  />
                </div>
                <div style={s.fieldGroup}>
                  <label style={s.label}>DATE OF BIRTH</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    disabled={!isEditing}
                    style={isEditing ? s.input : s.inputDisabled}
                    required
                  />
                </div>
                <div style={s.fieldGroup}>
                  <label style={s.label}>FATHER'S NAME</label>
                  <input
                    type="text"
                    name="fatherName"
                    value={formData.fatherName}
                    onChange={handleChange}
                    disabled={!isEditing}
                    style={isEditing ? s.input : s.inputDisabled}
                    required
                  />
                </div>
                <div style={s.fieldGroup}>
                  <label style={s.label}>MOTHER'S NAME</label>
                  <input
                    type="text"
                    name="motherName"
                    value={formData.motherName}
                    onChange={handleChange}
                    disabled={!isEditing}
                    style={isEditing ? s.input : s.inputDisabled}
                    required
                  />
                </div>
                <div style={s.fieldGroup}>
                  <label style={s.label}>GENDER</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    disabled={!isEditing}
                    style={isEditing ? s.input : s.inputDisabled}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div style={s.fieldGroup}>
                  <label style={s.label}>CATEGORY</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    disabled={!isEditing}
                    style={isEditing ? s.input : s.inputDisabled}
                  >
                    <option value="General">General</option>
                    <option value="OBC">OBC</option>
                    <option value="SC">SC</option>
                    <option value="ST">ST</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            <div style={s.photoArea}>
                <label style={s.labelCentered}>PASSPORT PHOTO</label>
                <div style={s.photoBox}>
                    {(previews.photo || formData.profilePhotoUrl) ? (
                        <div style={s.imagePreview}>
                            <img src={previews.photo || formData.profilePhotoUrl} alt="Photo" style={s.img} />
                            {isEditing && (
                                <label style={s.uploadOverlay}>
                                    <Camera size={20} color="#fff" />
                                    <input type="file" style={{ display: 'none' }} accept="image/*" onChange={(e) => handleFileChange(e, 'photo')} />
                                </label>
                            )}
                        </div>
                    ) : (
                        <div style={s.placeholderBox}>
                            <Camera size={40} color="#cbd5e1" />
                            <span style={s.placeholderText}>No Photo</span>
                            {isEditing && (
                                <input type="file" style={s.hiddenFile} accept="image/*" onChange={(e) => handleFileChange(e, 'photo')} />
                            )}
                        </div>
                    )}
                </div>
            </div>
          </div>
        </div>

        {/* Assets Section */}
        <div style={s.sideBySide}>
          <div style={s.card}>
            <div style={s.cardHeader}>
                <FileText size={16} color="#4c84ff" />
                <span style={s.cardTitle}>Supporting Evidence</span>
            </div>
            <div style={s.docsStack}>
                <div style={s.fieldGroup}>
                  <label style={s.label}>SIGNATURE SPECIMEN</label>
                  <div style={s.sigBox}>
                    {(previews.signature || formData.signatureUrl) ? (
                        <div style={s.imagePreview}>
                            <img src={previews.signature || formData.signatureUrl} alt="Sig" style={s.imgContain} />
                            {isEditing && (
                                <label style={s.uploadOverlay}>
                                    <Upload size={16} color="#fff" />
                                    <input type="file" style={{ display: 'none' }} accept="image/*" onChange={(e) => handleFileChange(e, 'signature')} />
                                </label>
                            )}
                        </div>
                    ) : (
                        <div style={s.placeholderBoxCompact}>
                            <Upload size={20} color="#cbd5e1" />
                            {isEditing && (
                                <input type="file" style={s.hiddenFile} accept="image/*" onChange={(e) => handleFileChange(e, 'signature')} />
                            )}
                        </div>
                    )}
                  </div>
                </div>

                <div style={s.fieldGroup}>
                    <label style={s.label}>ID PROOF DOCUMENT</label>
                    <div style={s.docStatusBox}>
                        {(previews.idProof || formData.idProofDocumentUrl) ? (
                            <div style={s.docDetails}>
                                <div style={s.docIcon}><FileText size={18} color="#4c84ff" /></div>
                                <div style={s.docMeta}>
                                    <div style={s.docName}>{previews.idProof ? "NEW SELECTION" : "ID_PROOF_SAVED.PDF"}</div>
                                    <div style={s.docStatus}>{previews.idProof ? "READY TO UPLOAD" : "VERIFIED RECORD"}</div>
                                </div>
                                {isEditing && (
                                    <button type="button" onClick={() => {setPreviews(p => ({...p, idProof: null})); setSelectedFiles(s => ({...s, idProof: null}));}} style={s.clearBtn}>
                                        <XCircle size={14} />
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div style={s.docEmpty}>
                                <Upload size={16} color="#94a3b8" />
                                <span style={s.emptyMsg}>SELECT DOCUMENT (PDF/IMAGE)</span>
                                {isEditing && (
                                    <input type="file" style={s.hiddenFile} accept=".pdf,image/*" onChange={(e) => handleFileChange(e, 'idProof')} />
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
          </div>

          <div style={s.card}>
            <div style={s.cardHeader}>
              <GraduationCap size={16} color="#4c84ff" />
              <span style={s.cardTitle}>Academic Background</span>
            </div>
            <div style={s.grid2}>
                <div style={s.fieldGroup}>
                    <label style={s.label}>PREVIOUS EXAM</label>
                    <input type="text" name="previousExamName" value={formData.previousExamName} onChange={handleChange} disabled={!isEditing} style={isEditing ? s.input : s.inputDisabled} placeholder="e.g. Higher Secondary" />
                </div>
                <div style={s.fieldGroup}>
                    <label style={s.label}>PERCENTAGE (%)</label>
                    <input type="number" name="previousExamMarks" value={formData.previousExamMarks || ""} onChange={handleChange} disabled={!isEditing} style={isEditing ? s.input : s.inputDisabled} placeholder="85.5" />
                </div>
                <div style={s.fieldGroup}>
                    <label style={s.label}>YEAR OF PASSING</label>
                    <input type="number" name="previousExamYear" value={formData.previousExamYear || ""} onChange={handleChange} disabled={!isEditing} style={isEditing ? s.input : s.inputDisabled} placeholder="2023" />
                </div>
                <div style={s.fieldGroup}>
                    <label style={s.label}>ROLL NUMBER / REF</label>
                    <input type="text" name="previousExamRollNo" value={formData.previousExamRollNo || ""} onChange={handleChange} disabled={!isEditing} style={isEditing ? s.input : s.inputDisabled} placeholder="UK-1029-X" />
                </div>
            </div>
          </div>
        </div>

        {/* Location Section */}
        <div style={s.card}>
          <div style={s.cardHeader}>
            <MapPin size={16} color="#4c84ff" />
            <span style={s.cardTitle}>Communication & Residential Address</span>
          </div>
          <div style={s.grid4}>
              <div style={{gridColumn: 'span 2'}}>
                <div style={s.fieldGroup}>
                    <label style={s.label}>STREET ADDRESS / LINE 1</label>
                    <input type="text" name="addr_line1" value={formData.address.line1} onChange={handleChange} disabled={!isEditing} style={isEditing ? s.input : s.inputDisabled} required />
                </div>
              </div>
              <div style={s.fieldGroup}>
                <label style={s.label}>GUARDIAN CONTACT</label>
                <div style={{position: 'relative'}}>
                    <Phone size={14} style={s.innerIcon} />
                    <input type="tel" name="guardianContact" value={formData.guardianContact} onChange={handleChange} disabled={!isEditing} style={{...(isEditing ? s.input : s.inputDisabled), paddingLeft: '34px'}} />
                </div>
              </div>
              <div style={s.fieldGroup}>
                <label style={s.label}>VILLAGE / CITY</label>
                <input type="text" name="addr_villageOrCity" value={formData.address.villageOrCity} onChange={handleChange} disabled={!isEditing} style={isEditing ? s.input : s.inputDisabled} required />
              </div>
              <div style={s.fieldGroup}>
                <label style={s.label}>DISTRICT</label>
                <input type="text" name="addr_district" value={formData.address.district} onChange={handleChange} disabled={!isEditing} style={isEditing ? s.input : s.inputDisabled} />
              </div>
              <div style={s.fieldGroup}>
                <label style={s.label}>STATE / REGION</label>
                <input type="text" name="addr_state" value={formData.address.state} onChange={handleChange} disabled={!isEditing} style={isEditing ? s.input : s.inputDisabled} required />
              </div>
              <div style={s.fieldGroup}>
                <label style={s.label}>POSTAL PINCODE</label>
                <input type="text" name="addr_pincode" value={formData.address.pincode} onChange={handleChange} disabled={!isEditing} style={isEditing ? s.input : s.inputDisabled} required />
              </div>
              <div style={s.fieldGroup}>
                <label style={s.label}>GOVT ID NUMBER (UID)</label>
                <input type="text" name="idProofNumber" value={formData.idProofNumber} onChange={handleChange} disabled={!isEditing} style={isEditing ? s.input : s.inputDisabled} />
              </div>
          </div>
        </div>

        {isEditing && (
          <div style={s.footer}>
            {student?.hasProfile && (
              <button type="button" onClick={() => setIsEditing(false)} style={s.cancelBtn} disabled={loading}>
                DISCARD CHANGES
              </button>
            )}
            <button type="submit" disabled={loading} style={s.saveBtn}>
              {loading ? "SAVING..." : <><Save size={18} /> UPDATE PROFILE</>}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

const s = {
    container: { fontFamily: 'DM Sans, Segoe UI, sans-serif' },
    header: {
        marginBottom: '32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        paddingBottom: '20px',
        borderBottom: '1px solid #eee',
    },
    headerLeft: { display: 'flex', flexDirection: 'column', gap: '4px' },
    title: { 
        fontSize: '24px', 
        fontWeight: '900', 
        color: '#1e293b', 
        margin: 0, 
        display: 'flex', 
        alignItems: 'center', 
        gap: '12px' 
    },
    titleIcon: { color: '#4c84ff' },
    subtitle: { 
        fontSize: '10px', 
        fontWeight: '800', 
        color: '#94a3b8', 
        letterSpacing: '0.2em', 
        margin: 0 
    },
    editBtn: {
        padding: '10px 20px',
        borderRadius: '8px',
        backgroundColor: '#f1f5f9',
        color: '#475569',
        fontSize: '11px',
        fontWeight: '900',
        letterSpacing: '0.05em',
        border: '1px solid #e2e8f0',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
    },
    alertBox: {
        backgroundColor: '#fffbeb',
        border: '1px solid #fef3c7',
        borderRadius: '12px',
        padding: '20px',
        display: 'flex',
        gap: '16px',
        marginBottom: '32px',
    },
    alertContent: { flex: 1 },
    alertTitle: { fontSize: '12px', fontWeight: '900', color: '#92400e', margin: 0, letterSpacing: '0.05em' },
    alertText: { fontSize: '13px', color: '#b45309', margin: '4px 0 0 0', lineHeight: '1.5' },
    form: { display: 'flex', flexDirection: 'column', gap: '24px' },
    card: {
        backgroundColor: '#fff',
        borderRadius: '12px',
        border: '1px solid #f1f5f9',
        padding: '24px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
    },
    cardHeader: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' },
    cardTitle: { fontSize: '10px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' },
    flexRow: { display: 'flex', gap: '40px' },
    formArea: { flex: 1 },
    photoArea: { width: '220px', display: 'flex', flexDirection: 'column', alignItems: 'center' },
    labelCentered: { fontSize: '10px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' },
    photoBox: {
        width: '180px',
        height: '240px',
        borderRadius: '12px',
        border: '1px dashed #e2e8f0',
        backgroundColor: '#f8fafc',
        position: 'relative',
        overflow: 'hidden',
    },
    imagePreview: { width: '100%', height: '100%', position: 'relative' },
    img: { width: '100%', height: '100%', objectFit: 'cover' },
    imgContain: { width: '100%', height: '100%', objectFit: 'contain', padding: '12px' },
    uploadOverlay: {
        position: 'absolute',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        opacity: 0,
        transition: 'opacity 0.2s',
        ":hover": { opacity: 1 }
    },
    placeholderBox: { 
        width: '100%', 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center', 
        gap: '12px'
    },
    placeholderText: { fontSize: '11px', fontWeight: '800', color: '#cbd5e1', letterSpacing: '0.05em' },
    hiddenFile: { position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' },
    sideBySide: { display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '24px' },
    grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },
    grid4: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' },
    fieldGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
    label: { fontSize: '10px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' },
    input: {
        height: '42px',
        padding: '0 12px',
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
        backgroundColor: '#f8fafc',
        fontSize: '13px',
        color: '#1e293b',
        fontWeight: '600',
        outline: 'none',
        transition: 'border-color 0.2s ease',
        ":focus": { borderColor: '#4c84ff' }
    },
    inputDisabled: {
        height: '42px',
        padding: '0 12px',
        borderRadius: '8px',
        border: '1px solid #f1f5f9',
        backgroundColor: '#fcfcfd',
        fontSize: '13px',
        color: '#64748b',
        fontWeight: '600',
        cursor: 'not-allowed'
    },
    innerIcon: { position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' },
    docsStack: { display: 'flex', flexDirection: 'column', gap: '24px' },
    sigBox: {
        height: '100px',
        borderRadius: '8px',
        border: '1px dashed #e2e8f0',
        backgroundColor: '#f8fafc',
        overflow: 'hidden',
        position: 'relative'
    },
    placeholderBoxCompact: { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    docStatusBox: {
        height: '56px',
        borderRadius: '8px',
        backgroundColor: '#f8fafc',
        border: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        padding: '0 12px',
        position: 'relative'
    },
    docDetails: { display: 'flex', alignItems: 'center', gap: '12px', width: '100%' },
    docIcon: { width: '32px', height: '32px', borderRadius: '6px', backgroundColor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0' },
    docMeta: { flex: 1, display: 'flex', flexDirection: 'column' },
    docName: { fontSize: '11px', fontWeight: '900', color: '#0f172a', letterSpacing: '0.02em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
    docStatus: { fontSize: '9px', fontWeight: '800', color: '#10b981', letterSpacing: '0.05em' },
    clearBtn: { border: 'none', backgroundColor: 'transparent', color: '#94a3b8', cursor: 'pointer', padding: '4px' },
    docEmpty: { display: 'flex', alignItems: 'center', gap: '10px', width: '100%', justifyContent: 'center' },
    emptyMsg: { fontSize: '10px', fontWeight: '800', color: '#94a3b8', letterSpacing: '0.02em' },
    footer: { display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '16px' },
    cancelBtn: {
        padding: '12px 24px',
        borderRadius: '8px',
        backgroundColor: '#fff',
        color: '#64748b',
        fontSize: '11px',
        fontWeight: '900',
        letterSpacing: '0.05em',
        border: '1px solid #e2e8f0',
        cursor: 'pointer',
    },
    saveBtn: {
        padding: '12px 32px',
        borderRadius: '8px',
        backgroundColor: '#4c84ff',
        color: '#fff',
        fontSize: '11px',
        fontWeight: '900',
        letterSpacing: '0.05em',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        boxShadow: '0 4px 12px rgba(76, 132, 255, 0.2)',
        transition: 'all 0.2s ease',
        ":hover": { backgroundColor: '#3b6ddb' }
    }
};

export default StudentProfileSection;

