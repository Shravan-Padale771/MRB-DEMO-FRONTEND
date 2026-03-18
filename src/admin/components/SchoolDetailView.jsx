import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Image as ImageIcon, Loader2, User, MapPin, Info, Upload, X, FileText } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getSchool, updateSchool, uploadFiles } from '../../api';

const SchoolDetailView = ({ schoolId, onBack }) => {
    const queryClient = useQueryClient();
    const [uploading, setUploading] = useState({});
    const [formData, setFormData] = useState(null);

    const { data: school, isLoading, isError } = useQuery({
        queryKey: ['school', schoolId],
        queryFn: () => getSchool(schoolId),
        enabled: !!schoolId
    });

    useEffect(() => {
        if (school && !formData) {
            setFormData({
                ...school,
                address: school.address || {
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
    }, [school, formData]);

    // Helper to extract URL from stringified JSON if needed
    const getDisplayUrl = (urlStr) => {
        if (!urlStr) return "";
        try {
            if (urlStr.startsWith('{')) {
                const parsed = JSON.parse(urlStr);
                return Object.values(parsed)[0] || "";
            }
        } catch (e) {
            console.error("Failed to parse URL JSON", e);
        }
        return urlStr;
    };

    const updateMutation = useMutation({
        mutationFn: (data) => updateSchool(schoolId, data),
        onSuccess: () => {
            toast.success("School Details Updated!");
            queryClient.invalidateQueries({ queryKey: ['school', schoolId] });
            queryClient.invalidateQueries({ queryKey: ['schools'] });
        },
        onError: (err) => {
            console.error(err);
            toast.error("Failed to update school");
        }
    });

    const handleFileUpload = async (field, file) => {
        if (!file) return;
        setUploading(prev => ({ ...prev, [field]: true }));
        try {
            const response = await uploadFiles(file);
            let url = "";
            if (typeof response === 'string') {
                url = response;
            } else if (Array.isArray(response)) {
                url = response[0];
            } else if (response && typeof response === 'object') {
                url = response.url || response.data?.url || response.fileUrl || Object.values(response)[0];
            }

            if (url) {
                setFormData(prev => ({ ...prev, [field]: url }));
                toast.success("File uploaded successfully");
            } else {
                throw new Error("Could not determine file URL from response");
            }
        } catch (error) {
            console.error("Upload failed", error);
            toast.error("Upload failed");
        } finally {
            setUploading(prev => ({ ...prev, [field]: false }));
        }
    };

    const handleSave = () => {
        updateMutation.mutate(formData);
    };

    const set = (key, val) => setFormData(p => ({ ...p, [key]: val }));
    const setAddr = (key, val) => setFormData(p => ({ ...p, address: { ...p.address, [key]: val } }));

    if (isLoading) return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, gap: 16 }}>
            <Loader2 className="animate-spin" style={{ color: '#4361EE' }} size={40} />
            <p style={{ color: '#8B8FA8', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', fontSize: 11 }}>Fetching School Details...</p>
        </div>
    );

    if (isError || !formData) return (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <p style={{ color: '#F03E3E', fontWeight: 700 }}>Error loading school data</p>
            <button onClick={onBack} style={{ marginTop: 16, color: '#4361EE', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Go Back</button>
        </div>
    );

    return (
        <div style={s.page}>

            {/* Header */}
            <div style={s.headerCard}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <button onClick={onBack} style={s.backBtn}><ArrowLeft size={16} /></button>
                    <div>
                        <p style={s.pageTitle}>{formData.schoolName || 'School Detail'}</p>
                        <p style={s.pageSub}>Institution Profile · #{formData.schoolId || schoolId}</p>
                    </div>
                </div>
                <button 
                    onClick={handleSave} 
                    style={s.saveBtn}
                    disabled={updateMutation.isPending || Object.values(uploading).some(v => v)}
                >
                    {updateMutation.isPending ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                    {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            {/* Body */}
            <div style={s.bodyGrid}>

                {/* Left column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

                    {/* Basic Info */}
                    <div style={s.card}>
                        <div style={s.sectionHdr}><Info size={13} style={{ color: '#4361EE' }} /> Basic Information</div>
                        <div style={s.fieldGrid2}>
                            <Field label="School Name">
                                <input style={s.input} value={formData.schoolName} onChange={e => set('schoolName', e.target.value)} />
                            </Field>
                            <Field label="School Code">
                                <input style={s.input} value={formData.schoolCode} onChange={e => set('schoolCode', e.target.value)} />
                            </Field>
                            <Field label="Board Affiliation">
                                <input style={s.input} value={formData.boardAffiliation} onChange={e => set('boardAffiliation', e.target.value)} />
                            </Field>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                <Field label="Medium">
                                    <input style={s.input} value={formData.mediumOfInstruction} onChange={e => set('mediumOfInstruction', e.target.value)} />
                                </Field>
                                <Field label="Est. Year">
                                    <input style={s.input} type="number" value={formData.establishmentYear} onChange={e => set('establishmentYear', parseInt(e.target.value))} />
                                </Field>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                <Field label="Seating Capacity">
                                    <input style={s.input} type="number" value={formData.seatingCapacity} onChange={e => set('seatingCapacity', parseInt(e.target.value))} />
                                </Field>
                                <Field label="Classrooms">
                                    <input style={s.input} type="number" value={formData.numberOfClassrooms} onChange={e => set('numberOfClassrooms', parseInt(e.target.value))} />
                                </Field>
                            </div>
                            <Field label="Website URL">
                                <input style={s.input} value={formData.websiteUrl} onChange={e => set('websiteUrl', e.target.value)} />
                            </Field>
                            <Field label="CCTV Available">
                                <label style={s.checkLabel}>
                                    <input type="checkbox" style={{ accentColor: '#4361EE' }} checked={!!formData.cctvAvailable} onChange={e => set('cctvAvailable', e.target.checked)} />
                                    {formData.cctvAvailable ? 'Yes' : 'No'}
                                </label>
                            </Field>
                        </div>
                    </div>

                    {/* Contact */}
                    <div style={s.card}>
                        <div style={s.sectionHdr}><User size={13} style={{ color: '#4361EE' }} /> Contact Details</div>
                        <div style={s.fieldGrid2}>
                            <Field label="Principal Name">
                                <input style={s.input} value={formData.principalName} onChange={e => set('principalName', e.target.value)} />
                            </Field>
                            <Field label="Official Email">
                                <input style={s.input} type="email" value={formData.officialEmail} onChange={e => set('officialEmail', e.target.value)} />
                            </Field>
                            <Field label="Phone">
                                <input style={s.input} value={formData.principalContactNumber} onChange={e => set('principalContactNumber', e.target.value)} />
                            </Field>
                            <Field label="Alt Phone">
                                <input style={s.input} value={formData.secondaryContactNumber} onChange={e => set('secondaryContactNumber', e.target.value)} />
                            </Field>
                        </div>
                    </div>
                </div>

                {/* Right column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

                    {/* Address */}
                    <div style={s.card}>
                        <div style={s.sectionHdr}><MapPin size={13} style={{ color: '#4361EE' }} /> Location</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            <Field label="Address Line 1">
                                <textarea style={{ ...s.input, height: 58, resize: 'none' }} value={formData.address.line1} onChange={e => setAddr('line1', e.target.value)} />
                            </Field>
                            <Field label="Address Line 2">
                                <input style={s.input} value={formData.address.line2} onChange={e => setAddr('line2', e.target.value)} />
                            </Field>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                <Field label="City / Village">
                                    <input style={s.input} value={formData.address.villageOrCity} onChange={e => setAddr('villageOrCity', e.target.value)} />
                                </Field>
                                <Field label="Taluka">
                                    <input style={s.input} value={formData.address.taluka} onChange={e => setAddr('taluka', e.target.value)} />
                                </Field>
                                <Field label="District">
                                    <input style={s.input} value={formData.address.district} onChange={e => setAddr('district', e.target.value)} />
                                </Field>
                                <Field label="State">
                                    <input style={s.input} value={formData.address.state} onChange={e => setAddr('state', e.target.value)} />
                                </Field>
                                <Field label="Pincode">
                                    <input style={s.input} value={formData.address.pincode} onChange={e => setAddr('pincode', e.target.value)} />
                                </Field>
                            </div>
                        </div>
                    </div>

                    {/* Documents */}
                    <div style={s.card}>
                        <div style={s.sectionHdr}><FileText size={13} style={{ color: '#4361EE' }} /> Documents</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <UploadBox label="Principal Signature" field="principalSignatureUrl" formData={formData} setFormData={setFormData} uploading={uploading} handleFileUpload={handleFileUpload} getDisplayUrl={getDisplayUrl} />
                            <UploadBox label="School Stamp" field="schoolStampUrl" formData={formData} setFormData={setFormData} uploading={uploading} handleFileUpload={handleFileUpload} getDisplayUrl={getDisplayUrl} />
                        </div>
                    </div>
                </div>
            </div>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

function Field({ label, children }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={s.label}>{label}</label>
            {children}
        </div>
    );
}

function UploadBox({ label, field, formData, setFormData, uploading, handleFileUpload, getDisplayUrl }) {
    const url = formData[field];
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <span style={s.label}>{label}</span>
            <div style={s.uploadBox}>
                {url ? (
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                        <img src={getDisplayUrl(url)} alt={label} style={{ width: 80, height: 44, objectFit: 'contain', borderRadius: 6, border: '0.5px solid #E8EAF0', background: '#fff' }} />
                        <button type="button" onClick={() => setFormData(p => ({ ...p, [field]: '' }))} style={s.removeBtn}><X size={9} /></button>
                    </div>
                ) : (
                    <div style={s.uploadPlaceholder}><ImageIcon size={16} style={{ color: '#D1D5E8' }} /></div>
                )}
                <label style={s.uploadBtn}>
                    {uploading[field] ? <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> : <Upload size={12} />}
                    {uploading[field] ? 'Uploading…' : url ? 'Change' : `Upload`}
                    <input type="file" style={{ display: 'none' }} accept="image/*" onChange={e => handleFileUpload(field, e.target.files[0])} disabled={uploading[field]} />
                </label>
            </div>
        </div>
    );
}

export default SchoolDetailView;

const s = {
    page: {
        display: 'flex', flexDirection: 'column', gap: 14,
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    },
    headerCard: {
        background: '#fff', borderRadius: 14, padding: '16px 22px',
        border: '0.5px solid #E8EAF0',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    },
    backBtn: {
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: 32, height: 32, borderRadius: 8,
        background: '#FAFBFF', border: '0.5px solid #E8EAF0',
        cursor: 'pointer', color: '#3D405B',
    },
    pageTitle: { fontSize: 14, fontWeight: 700, color: '#1A1D2E', margin: 0 },
    pageSub: { fontSize: 11, color: '#8B8FA8', margin: '2px 0 0' },
    saveBtn: {
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '8px 18px', fontSize: 12, fontWeight: 700,
        background: '#4361EE', color: '#fff',
        border: 'none', borderRadius: 8, cursor: 'pointer',
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    },
    bodyGrid: {
        display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 14, alignItems: 'start',
    },
    card: {
        background: '#fff', borderRadius: 14, padding: '20px 22px',
        border: '0.5px solid #E8EAF0',
    },
    sectionHdr: {
        display: 'flex', alignItems: 'center', gap: 7,
        fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
        letterSpacing: '0.07em', color: '#3D405B',
        marginBottom: 14, paddingBottom: 10,
        borderBottom: '0.5px solid #E8EAF0',
    },
    fieldGrid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 },
    label: {
        fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
        letterSpacing: '0.07em', color: '#8B8FA8',
    },
    input: {
        padding: '8px 11px', fontSize: 13, color: '#1A1D2E',
        border: '0.5px solid #E8EAF0', borderRadius: 8, outline: 'none',
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
        background: '#FAFBFF', width: '100%', boxSizing: 'border-box',
    },
    checkLabel: {
        display: 'flex', alignItems: 'center', gap: 8,
        fontSize: 13, fontWeight: 500, color: '#3D405B', cursor: 'pointer',
        padding: '8px 11px', background: '#FAFBFF',
        border: '0.5px solid #E8EAF0', borderRadius: 8,
    },
    uploadBox: {
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '10px 12px', background: '#FAFBFF',
        border: '0.5px solid #E8EAF0', borderRadius: 10,
    },
    uploadPlaceholder: {
        width: 44, height: 44, borderRadius: 8, flexShrink: 0,
        background: '#fff', border: '0.5px dashed #D1D5E8',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
    },
    uploadBtn: {
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '6px 12px', fontSize: 10, fontWeight: 700,
        textTransform: 'uppercase', letterSpacing: '0.06em',
        background: '#fff', color: '#4361EE',
        border: '0.5px solid #C5D0FF', borderRadius: 7, cursor: 'pointer',
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    },
    removeBtn: {
        position: 'absolute', top: -4, right: -4,
        background: '#F03E3E', color: '#fff', border: 'none',
        borderRadius: '50%', width: 16, height: 16, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
    },
};