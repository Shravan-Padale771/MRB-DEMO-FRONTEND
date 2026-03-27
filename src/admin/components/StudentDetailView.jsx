import React, { useState, useEffect } from 'react';
import { 
    ArrowLeft, Save, Loader2, User, Mail, Phone, Calendar, 
    BookOpen, Award, FileText, Info, Trash2, ExternalLink,
    MapPin, Globe, CheckCircle2, AlertCircle, Camera, Upload, X,
    ShieldCheck, GraduationCap, Briefcase
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { 
    getStudents, 
    updateStudent, 
    getExamApplications, 
    getExamResults,
    getStudentProfile,
    getStudentProfileByStudentIdString,
    updateStudentProfile,
    createStudentProfileAPI,
    uploadFiles
} from '../../api';

const StudentDetailView = ({ studentId, onBack }) => {
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState('profile');
    const [formData, setFormData] = useState(null);
    const [profileData, setProfileData] = useState(null);
    const [uploading, setUploading] = useState({});

    // Main student data
    const { data: studentPage, isLoading: isLoadingStudent } = useQuery({
        queryKey: ['student', studentId],
        queryFn: () => getStudents({ studentId: studentId }),
        select: (data) => data.content?.[0]
    });

    // Student Profile data
    const { data: profileFetched, isLoading: isLoadingProfile } = useQuery({
        queryKey: ['studentProfile', studentId],
        queryFn: () => getStudentProfileByStudentIdString(studentId),
        enabled: !!studentId,
        retry: false
    });

    // Applications history
    const { data: applicationsPage, isLoading: isLoadingApps } = useQuery({
        queryKey: ['studentApplications', studentId],
        queryFn: () => getExamApplications({ studentId: studentId, size: 50 }),
        enabled: !!studentId
    });
    const applications = applicationsPage?.content || [];

    // Results history
    const { data: resultsPage, isLoading: isLoadingResults } = useQuery({
        queryKey: ['studentResults', studentId],
        queryFn: () => getExamResults({ studentId: studentId, size: 50 }),
        enabled: !!studentId
    });
    const results = resultsPage?.content || [];

    useEffect(() => {
        if (studentPage && !formData) {
            setFormData({ ...studentPage });
        }
    }, [studentPage, formData]);

    useEffect(() => {
        if (profileFetched && !profileData) {
            setProfileData({
                ...profileFetched,
                address: profileFetched.address || {
                    line1: "",
                    line2: "",
                    villageOrCity: "",
                    taluka: "",
                    district: "",
                    state: "",
                    pincode: ""
                }
            });
        } else if (!profileFetched && !isLoadingProfile && studentPage && !profileData) {
            // Initialize empty profile if not found
            setProfileData({
                studentId: studentId,
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
                address: {
                    line1: "",
                    line2: "",
                    villageOrCity: "",
                    taluka: "",
                    district: "",
                    state: "",
                    pincode: ""
                }
            });
        }
    }, [profileFetched, isLoadingProfile, studentPage, profileData, studentId]);

    const updateStudentMutation = useMutation({
        mutationFn: (data) => updateStudent(studentId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['student', studentId] });
            queryClient.invalidateQueries({ queryKey: ['students'] });
        }
    });

    const updateProfileMutation = useMutation({
        mutationFn: (data) => {
            if (data.profileId) {
                return updateStudentProfile(data.profileId, data);
            } else {
                return createStudentProfileAPI(studentId, data);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['studentProfile', studentId] });
        }
    });

    const handleFileUpload = async (field, file) => {
        if (!file) return;
        setUploading(prev => ({ ...prev, [field]: true }));
        try {
            const fileName = `${field}_${Date.now()}_${file.name}`;
            const renamedFile = new File([file], fileName, { type: file.type });
            const response = await uploadFiles([renamedFile]);
            const url = response[fileName];

            if (url) {
                setProfileData(prev => ({ ...prev, [field]: url }));
                toast.success(`${field} uploaded successfully`);
            } else {
                throw new Error("Upload failed");
            }
        } catch (error) {
            console.error("Upload failed", error);
            toast.error("Upload failed");
        } finally {
            setUploading(prev => ({ ...prev, [field]: false }));
        }
    };

    const handleSave = async () => {
        const tid = toast.loading("Saving changes...");
        try {
            await Promise.all([
                updateStudentMutation.mutateAsync(formData),
                updateProfileMutation.mutateAsync(profileData)
            ]);
            toast.success("Detailed records updated successfully", { id: tid });
            // Reset local states to allow refetch to populate
            setFormData(null);
            setProfileData(null);
        } catch (error) {
            console.error(error);
            toast.error("Failed to save changes", { id: tid });
        }
    };

    const setField = (key, val) => setFormData(prev => ({ ...prev, [key]: val }));
    const setProfField = (key, val) => setProfileData(prev => ({ ...prev, [key]: val }));
    const setAddrField = (key, val) => setProfileData(prev => ({ 
        ...prev, 
        address: { ...prev.address, [key]: val } 
    }));

    if (isLoadingStudent || isLoadingProfile) return (
        <div style={s.loaderWrap}>
            <Loader2 className="animate-spin" size={32} color="#4361EE" />
            <p style={s.loaderText}>Fetching Comprehensive Records...</p>
        </div>
    );

    if (!studentPage && !isLoadingStudent) return (
        <div style={s.errorWrap}>
            <AlertCircle size={40} color="#EF4444" />
            <p>Student record not found</p>
            <button onClick={onBack} style={s.backBtnText}>Go Back</button>
        </div>
    );

    return (
        <div style={s.container}>
            {/* Header Area */}
            <div style={s.headerCard}>
                <div style={s.headerLeft}>
                    <button onClick={onBack} style={s.backBtn}><ArrowLeft size={18} /></button>
                    <div style={s.profileBrief}>
                        <div style={s.avatarLarge}>
                            {profileData?.profilePhotoUrl ? (
                                <img src={profileData.profilePhotoUrl} alt="Student" style={s.avatarImg} />
                            ) : (
                                <span>{formData?.firstName?.charAt(0)}{formData?.lastName?.charAt(0)}</span>
                            )}
                        </div>
                        <div>
                            <h1 style={s.studentName}>{formData?.firstName} {formData?.lastName}</h1>
                            <p style={s.studentMeta}>Student ID: #{studentId} • {formData?.schoolName || 'Private Candidate'}</p>
                        </div>
                    </div>
                </div>
                <div style={s.headerActions}>
                    <button 
                        onClick={handleSave} 
                        style={s.saveBtn} 
                        disabled={updateStudentMutation.isPending || updateProfileMutation.isPending || Object.values(uploading).some(v => v)}
                    >
                        {(updateStudentMutation.isPending || updateProfileMutation.isPending) ? (
                            <Loader2 size={14} className="animate-spin" />
                        ) : (
                            <Save size={14} />
                        )}
                        {(updateStudentMutation.isPending || updateProfileMutation.isPending) ? 'Updating...' : 'Save Comprehensive Details'}
                    </button>
                </div>
            </div>

            {/* Main Tabs */}
            <div style={s.tabBar}>
                <TabItem id="profile" label="Full Profile" active={activeTab} onClick={setActiveTab} icon={<User size={14} />} />
                <TabItem id="applications" label="Applications" active={activeTab} onClick={setActiveTab} icon={<FileText size={14} />} count={applications.length} />
                <TabItem id="results" label="Results & Marks" active={activeTab} onClick={setActiveTab} icon={<Award size={14} />} count={results.length} />
            </div>

            {/* Content Area */}
            <div style={s.contentArea}>
                {activeTab === 'profile' && formData && profileData && (
                    <div style={s.tabContent}>
                        {/* Summary Stats */}
                        <div style={s.statsRow}>
                            <StatCard label="Applied Exams" value={applications.length} icon={<BookOpen size={16} />} color="#4361EE" />
                            <StatCard label="Exams Passed" value={results.length} icon={<Award size={16} />} color="#10B981" />
                            <StatCard label="Profile Status" value={profileFetched ? "Complete" : "Incomplete"} icon={<CheckCircle2 size={16} />} color={profileFetched ? "#10B981" : "#F59E0B"} />
                        </div>

                        <div style={s.mainGrid}>
                            {/* Left Column: Photos & Basic Info */}
                            <div style={s.col}>
                                <Section title="Identity Media" icon={<Camera size={14} />}>
                                    <div style={s.mediaGrid}>
                                        <div style={s.photoBox}>
                                            <p style={s.label}>Profile Photograph</p>
                                            <div style={s.imagePreview}>
                                                {profileData.profilePhotoUrl ? (
                                                    <img src={profileData.profilePhotoUrl} alt="Photo" style={s.img} />
                                                ) : (
                                                    <div style={s.imgPlaceholder}><Camera size={32} /></div>
                                                )}
                                                <label style={s.uploadBtnOverlay}>
                                                    {uploading.profilePhotoUrl ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                                                    <input type="file" style={{ display: 'none' }} accept="image/*" onChange={e => handleFileUpload('profilePhotoUrl', e.target.files[0])} disabled={uploading.profilePhotoUrl} />
                                                </label>
                                            </div>
                                        </div>
                                        <div style={s.photoBox}>
                                            <p style={s.label}>Signature Specimen</p>
                                            <div style={s.sigPreview}>
                                                {profileData.signatureUrl ? (
                                                    <img src={profileData.signatureUrl} alt="Signature" style={s.imgContain} />
                                                ) : (
                                                    <div style={s.imgPlaceholder}><FileText size={32} /></div>
                                                )}
                                                <label style={s.uploadBtnOverlay}>
                                                    {uploading.signatureUrl ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                                                    <input type="file" style={{ display: 'none' }} accept="image/*" onChange={e => handleFileUpload('signatureUrl', e.target.files[0])} disabled={uploading.signatureUrl} />
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </Section>

                                <Section title="Basic Information" icon={<Info size={14} />}>
                                    <div style={s.fieldGrid}>
                                        <Field label="First Name" value={formData.firstName} onChange={v => setField('firstName', v)} />
                                        <Field label="Middle Name" value={formData.middleName} onChange={v => setField('middleName', v)} />
                                        <Field label="Last Name" value={formData.lastName} onChange={v => setField('lastName', v)} />
                                        <Field label="Contact" value={formData.contact} onChange={v => setField('contact', v)} />
                                        <Field label="Email" value={formData.email} onChange={v => setField('email', v)} />
                                        <Field label="Age" value={formData.age} onChange={v => setField('age', parseInt(v))} type="number" />
                                    </div>
                                </Section>

                                <Section title="Residential Address" icon={<MapPin size={14} />}>
                                    <div style={s.fieldStack}>
                                        <Field label="Address Line 1" value={profileData.address.line1} onChange={v => setAddrField('line1', v)} />
                                        <Field label="Address Line 2" value={profileData.address.line2} onChange={v => setAddrField('line2', v)} />
                                        <div style={s.fieldGrid}>
                                            <Field label="Village/City" value={profileData.address.villageOrCity} onChange={v => setAddrField('villageOrCity', v)} />
                                            <Field label="Taluka" value={profileData.address.taluka} onChange={v => setAddrField('taluka', v)} />
                                            <Field label="District" value={profileData.address.district} onChange={v => setAddrField('district', v)} />
                                            <Field label="State" value={profileData.address.state} onChange={v => setAddrField('state', v)} />
                                            <Field label="Pincode" value={profileData.address.pincode} onChange={v => setAddrField('pincode', v)} />
                                        </div>
                                    </div>
                                </Section>
                            </div>

                            {/* Right Column: Family & Education */}
                            <div style={s.col}>
                                <Section title="Family & Identity" icon={<ShieldCheck size={14} />}>
                                    <div style={s.fieldGrid}>
                                        <Field label="Father's Name" value={profileData.fatherName} onChange={v => setProfField('fatherName', v)} />
                                        <Field label="Mother's Name" value={profileData.motherName} onChange={v => setProfField('motherName', v)} />
                                        <Field label="Gender" value={profileData.gender} onChange={v => setProfField('gender', v)} />
                                        <Field label="Category" value={profileData.category} onChange={v => setProfField('category', v)} />
                                        <Field label="Date of Birth" value={profileData.dateOfBirth} onChange={v => setProfField('dateOfBirth', v)} type="date" />
                                        <Field label="Mother Tongue" value={formData.motherTongue} onChange={v => setField('motherTongue', v)} />
                                        <Field label="ID Proof Number" value={profileData.idProofNumber} onChange={v => setProfField('idProofNumber', v)} />
                                        <Field label="Guardian Phone" value={profileData.guardianContact} onChange={v => setProfField('guardianContact', v)} />
                                    </div>
                                </Section>

                                <Section title="Academic Background" icon={<GraduationCap size={14} />}>
                                    <div style={s.fieldGrid}>
                                        <Field label="Last Qualification" value={profileData.qualification} onChange={v => setProfField('qualification', v)} />
                                        <Field label="Previous Exam" value={profileData.previousExamName} onChange={v => setProfField('previousExamName', v)} />
                                        <Field label="Roll No" value={profileData.previousExamRollNo} onChange={v => setProfField('previousExamRollNo', v)} />
                                        <Field label="Marks (%)" value={profileData.previousExamMarks} onChange={v => setProfField('previousExamMarks', v)} type="number" />
                                        <Field label="Passing Year" value={profileData.previousExamYear} onChange={v => setProfField('previousExamYear', v)} type="number" />
                                    </div>
                                </Section>

                                <Section title="System Information" icon={<Briefcase size={14} />}>
                                    <div style={s.fieldGrid}>
                                        <Field label="School / Centre" value={formData.schoolName || 'Self Registration'} readOnly />
                                        <Field label="Region" value={formData.regionName || 'N/A'} readOnly />
                                        <Field label="Joined At" value={new Date(formData.registeredAt).toLocaleDateString()} readOnly />
                                    </div>
                                </Section>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'applications' && (
                    <div style={s.tabContent}>
                        <Section title="Exam Applications History" icon={<FileText size={14} />}>
                            {isLoadingApps ? <p style={s.muted}>Loading history...</p> : 
                             applications.length === 0 ? <p style={s.muted}>No applications found.</p> : (
                                <table style={s.table}>
                                    <thead>
                                        <tr>
                                            <th style={s.th}>ID</th>
                                            <th style={s.th}>Exam Name</th>
                                            <th style={s.th}>Applied Date</th>
                                            <th style={s.th}>Status</th>
                                            <th style={s.th}>Centre</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {applications.map(app => (
                                            <tr key={app.applicationId} style={s.tr}>
                                                <td style={s.tdCode}>#{app.applicationId}</td>
                                                <td style={s.tdMain}>{app.examName || app.exam?.exam_name}</td>
                                                <td style={s.td}>{new Date(app.appliedAt).toLocaleDateString()}</td>
                                                <td style={s.td}>
                                                    <span style={{ ...s.statusBadge, ...getStatusStyle(app.status) }}>
                                                        {app.status}
                                                    </span>
                                                </td>
                                                <td style={s.td}>{app.examCentreName || 'Pending Allocation'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </Section>
                    </div>
                )}

                {activeTab === 'results' && (
                    <div style={s.tabContent}>
                        <Section title="Academic Results" icon={<Award size={14} />}>
                             {isLoadingResults ? <p style={s.muted}>Loading results...</p> : 
                             results.length === 0 ? <p style={s.muted}>No results published yet.</p> : (
                                <table style={s.table}>
                                    <thead>
                                        <tr>
                                            <th style={s.th}>Exam</th>
                                            <th style={s.th}>Total Marks</th>
                                            <th style={s.th}>Percentage</th>
                                            <th style={s.th}>Status</th>
                                            <th style={s.th}>Marksheet</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {results.map(res => (
                                            <tr key={res.resultId} style={s.tr}>
                                                <td style={s.tdMain}>{res.examName || res.application?.exam?.exam_name}</td>
                                                <td style={s.td}>{res.totalMarks}</td>
                                                <td style={s.tdBold}>{res.percentage}%</td>
                                                <td style={s.td}>
                                                    <span style={s.passBadge}>PASSED</span>
                                                </td>
                                                <td style={s.td}>
                                                    <button style={s.certBtn}>
                                                        <ExternalLink size={12} /> View Details
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </Section>
                    </div>
                )}
            </div>
        </div>
    );
};

// Sub-components
const TabItem = ({ id, label, active, onClick, icon, count }) => (
    <button onClick={() => onClick(id)} style={{ ...s.tabItem, ...(active === id ? s.tabActive : {}) }}>
        {icon} {label} {count !== undefined && <span style={s.tabCount}>{count}</span>}
    </button>
);

const StatCard = ({ label, value, icon, color }) => (
    <div style={s.statCard}>
        <div style={{ ...s.statIcon, backgroundColor: `${color}15`, color: color }}>{icon}</div>
        <div><p style={s.statLabel}>{label}</p><p style={s.statValue}>{value}</p></div>
    </div>
);

const Section = ({ title, icon, children }) => (
    <div style={s.sectionCard}>
        <div style={s.sectionHeader}><div style={s.sectionIcon}>{icon}</div><h3 style={s.sectionTitle}>{title}</h3></div>
        <div style={s.sectionBody}>{children}</div>
    </div>
);

const Field = ({ label, value, onChange, type = "text", readOnly = false }) => (
    <div style={s.fieldWrap}>
        <label style={s.label}>{label}</label>
        <input 
            type={type} value={value || ''} 
            onChange={e => onChange && onChange(e.target.value)}
            style={{ ...s.input, ...(readOnly ? s.inputReadOnly : {}) }}
            readOnly={readOnly}
        />
    </div>
);

const getStatusStyle = (status) => {
    switch(status?.toUpperCase()) {
        case 'APPROVED': return { background: '#ECFDF5', color: '#059669' };
        case 'PENDING': return { background: '#FFFBEB', color: '#D97706' };
        default: return { background: '#F3F4F6', color: '#6B7280' };
    }
};

const s = {
    container: { display: 'flex', flexDirection: 'column', gap: 16, fontFamily: "'DM Sans', sans-serif" },
    headerCard: { background: '#fff', borderRadius: 16, padding: '16px 20px', border: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    headerLeft: { display: 'flex', alignItems: 'center', gap: 16 },
    backBtn: { width: 34, height: 34, borderRadius: 10, border: '1px solid #E5E7EB', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
    profileBrief: { display: 'flex', alignItems: 'center', gap: 16 },
    avatarLarge: { width: 52, height: 52, borderRadius: 12, background: 'linear-gradient(135deg, #4361EE, #3F37C9)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, overflow: 'hidden' },
    avatarImg: { width: '100%', height: '100%', objectFit: 'cover' },
    studentName: { fontSize: 18, fontWeight: 700, color: '#111827', margin: 0 },
    studentMeta: { fontSize: 12, color: '#6B7280', margin: '2px 0 0' },
    saveBtn: { display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', background: '#4361EE', color: '#fff', border: 'none', borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: 'pointer' },
    tabBar: { display: 'flex', gap: 6, background: '#F9FAFB', padding: 4, borderRadius: 10, border: '1px solid #E5E7EB', width: 'fit-content' },
    tabItem: { display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 8, border: 'none', background: 'none', fontSize: 13, fontWeight: 600, color: '#6B7280', cursor: 'pointer' },
    tabActive: { background: '#fff', color: '#4361EE', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
    tabCount: { fontSize: 10, background: '#EEF2FF', color: '#4361EE', padding: '1px 5px', borderRadius: 8 },
    contentArea: { marginTop: 4 },
    tabContent: { display: 'flex', flexDirection: 'column', gap: 16 },
    statsRow: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 },
    statCard: { background: '#fff', borderRadius: 16, padding: '16px', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: 14 },
    statIcon: { width: 38, height: 38, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' },
    statLabel: { fontSize: 10, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', margin: 0 },
    statValue: { fontSize: 16, fontWeight: 800, color: '#111827', margin: '1px 0 0' },
    mainGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
    col: { display: 'flex', flexDirection: 'column', gap: 16 },
    sectionCard: { background: '#fff', borderRadius: 16, border: '1px solid #E5E7EB', overflow: 'hidden' },
    sectionHeader: { padding: '14px 20px', borderBottom: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', gap: 10, background: '#FAFBFF' },
    sectionIcon: { color: '#4361EE', display: 'flex' },
    sectionTitle: { fontSize: 11, fontWeight: 800, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.05em' },
    sectionBody: { padding: '18px 20px' },
    mediaGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
    photoBox: { display: 'flex', flexDirection: 'column', gap: 8 },
    imagePreview: { position: 'relative', width: '100%', height: 160, borderRadius: 10, border: '1px solid #E5E7EB', background: '#F9FAFB', overflow: 'hidden' },
    sigPreview: { position: 'relative', width: '100%', height: 100, borderRadius: 10, border: '1px solid #E5E7EB', background: '#F9FAFB', overflow: 'hidden' },
    img: { width: '100%', height: '100%', objectFit: 'cover' },
    imgContain: { width: '100%', height: '100%', objectFit: 'contain', padding: 10 },
    imgPlaceholder: { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#CBD5E1' },
    uploadBtnOverlay: { position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', opacity: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer', transition: 'opacity 0.2s', ':hover': { opacity: 1 } },
    fieldGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 },
    fieldStack: { display: 'flex', flexDirection: 'column', gap: 14 },
    fieldWrap: { display: 'flex', flexDirection: 'column', gap: 5 },
    label: { fontSize: 10, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' },
    input: { padding: '9px 12px', borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 13, color: '#111827', width: '100%', boxSizing: 'border-box', outline: 'none', background: '#F8FAFC' },
    inputReadOnly: { background: '#F1F5F9', color: '#64748B', cursor: 'not-allowed' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { textAlign: 'left', padding: '12px 14px', fontSize: 10, fontWeight: 800, color: '#6B7280', textTransform: 'uppercase', borderBottom: '1px solid #F3F4F6' },
    tr: { borderBottom: '1px solid #F9FAFB' },
    td: { padding: '12px 14px', fontSize: 13, color: '#4B5563' },
    tdCode: { padding: '12px 14px', fontSize: 12, fontWeight: 800, color: '#4361EE', fontFamily: 'monospace' },
    tdMain: { padding: '12px 14px', fontSize: 13, fontWeight: 600, color: '#111827' },
    tdBold: { padding: '12px 14px', fontSize: 13, fontWeight: 700, color: '#111827' },
    statusBadge: { padding: '3px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700 },
    passBadge: { background: '#ECFDF5', color: '#059669', padding: '3px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700 },
    certBtn: { display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', background: '#fff', border: '1px solid #E5E7EB', borderRadius: 6, fontSize: 11, fontWeight: 600, color: '#4361EE', cursor: 'pointer' },
    loaderWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, gap: 16 },
    loaderText: { fontSize: 11, fontWeight: 800, color: '#4361EE', textTransform: 'uppercase', letterSpacing: '0.1em' },
    errorWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 60, gap: 12 },
    backBtnText: { background: 'none', border: 'none', color: '#4361EE', fontWeight: 700, textDecoration: 'underline', cursor: 'pointer' },
    muted: { fontSize: 12, color: '#9CA3AF', fontStyle: 'italic', textAlign: 'center', padding: '20px 0' }
};

export default StudentDetailView;
