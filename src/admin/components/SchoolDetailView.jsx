import React, { useState, useEffect } from 'react';
import { 
    ArrowLeft, 
    Building2, 
    Save, 
    Upload, 
    X, 
    Image as ImageIcon, 
    Loader2, 
    Phone, 
    Mail, 
    Globe, 
    User, 
    MapPin, 
    Info, 
    ShieldCheck, 
    Layout
} from 'lucide-react';
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
            // Check if it's a stringified JSON
            if (urlStr.startsWith('{')) {
                const parsed = JSON.parse(urlStr);
                // Return the first value (the actual URL)
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
            
            // Extract URL string from various potential response formats
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

    const handleSave = (e) => {
        e.preventDefault();
        updateMutation.mutate(formData);
    };

    if (isLoading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
            <Loader2 className="animate-spin text-indigo-600" size={40} />
            <p className="text-gray-500 font-bold animate-pulse uppercase tracking-widest text-xs">Fetching School Details...</p>
        </div>
    );

    if (isError || !formData) return (
        <div className="text-center py-20">
            <p className="text-red-500 font-bold">Error loading school data</p>
            <button onClick={onBack} className="mt-4 text-indigo-600 font-bold underline">Go Back</button>
        </div>
    );

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={onBack}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors group"
                    >
                        <ArrowLeft className="text-gray-400 group-hover:text-indigo-600" size={24} />
                    </button>
                    <div>
                        <div className="flex items-center gap-2">
                            <Building2 className="text-indigo-600" size={20} />
                            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">
                                {formData.schoolName} <span className="text-gray-300 font-medium ml-2">#{formData.schoolId}</span>
                            </h2>
                        </div>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-[0.2em] mt-1 ml-7">Extended Institution Profile</p>
                    </div>
                </div>
                
                <button 
                    onClick={handleSave}
                    disabled={updateMutation.isPending || Object.values(uploading).some(v => v)}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all disabled:opacity-50"
                >
                    {updateMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    Save Changes
                </button>
            </div>

            <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Column: Basic & Contact */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* Basic Information */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-sm font-black text-gray-800 uppercase tracking-wider mb-6 flex items-center gap-2">
                            <Info size={18} className="text-indigo-500" /> Basic Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase ml-1">School Name</label>
                                <input 
                                    type="text"
                                    className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    value={formData.schoolName}
                                    onChange={(e) => setFormData({...formData, schoolName: e.target.value})}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Registration Code</label>
                                <input 
                                    type="text"
                                    className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    value={formData.schoolCode || ""}
                                    onChange={(e) => setFormData({...formData, schoolCode: e.target.value})}
                                    placeholder="e.g. SCH-001"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Board Affiliation</label>
                                <input 
                                    type="text"
                                    className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    value={formData.boardAffiliation || ""}
                                    onChange={(e) => setFormData({...formData, boardAffiliation: e.target.value})}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Medium</label>
                                    <input 
                                        type="text"
                                        className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                        value={formData.mediumOfInstruction || ""}
                                        onChange={(e) => setFormData({...formData, mediumOfInstruction: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Est. Year</label>
                                    <input 
                                        type="number"
                                        className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                        value={formData.establishmentYear || ""}
                                        onChange={(e) => setFormData({...formData, establishmentYear: parseInt(e.target.value) || ""})}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Information */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-sm font-black text-gray-800 uppercase tracking-wider mb-6 flex items-center gap-2">
                            <User size={18} className="text-emerald-500" /> Contact Details
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Principal Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                                    <input 
                                        type="text"
                                        className="w-full p-3 pl-10 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                        value={formData.principalName || ""}
                                        onChange={(e) => setFormData({...formData, principalName: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Official Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                                    <input 
                                        type="email"
                                        className="w-full p-3 pl-10 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                        value={formData.officialEmail || ""}
                                        onChange={(e) => setFormData({...formData, officialEmail: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Principal Contact</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                                    <input 
                                        type="text"
                                        className="w-full p-3 pl-10 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                        value={formData.principalContactNumber || ""}
                                        onChange={(e) => setFormData({...formData, principalContactNumber: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Secondary Contact</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                                    <input 
                                        type="text"
                                        className="w-full p-3 pl-10 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                        value={formData.secondaryContactNumber || ""}
                                        onChange={(e) => setFormData({...formData, secondaryContactNumber: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="md:col-span-2 space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Website URL</label>
                                <div className="relative">
                                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
                                    <input 
                                        type="url"
                                        className="w-full p-3 pl-10 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                                        value={formData.websiteUrl || ""}
                                        onChange={(e) => setFormData({...formData, websiteUrl: e.target.value})}
                                        placeholder="https://example.com"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Infrastructure & Security */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-sm font-black text-gray-800 uppercase tracking-wider mb-6 flex items-center gap-2">
                            <ShieldCheck size={18} className="text-blue-500" /> Infrastructure
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Seating Capacity</label>
                                <input 
                                    type="number"
                                    className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    value={formData.seatingCapacity || ""}
                                    onChange={(e) => setFormData({...formData, seatingCapacity: parseInt(e.target.value) || ""})}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Classrooms</label>
                                <input 
                                    type="number"
                                    className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    value={formData.numberOfClassrooms || ""}
                                    onChange={(e) => setFormData({...formData, numberOfClassrooms: parseInt(e.target.value) || ""})}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase ml-1">CCTV Security</label>
                                <select 
                                    className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none"
                                    value={formData.cctvAvailable ? "true" : "false"}
                                    onChange={(e) => setFormData({...formData, cctvAvailable: e.target.value === "true"})}
                                >
                                    <option value="true">Available</option>
                                    <option value="false">Not Available</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Address & Documents */}
                <div className="space-y-6">
                    
                    {/* Address Information */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-sm font-black text-gray-800 uppercase tracking-wider mb-6 flex items-center gap-2">
                            <MapPin size={18} className="text-amber-500" /> Location
                        </h3>
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Address Line 1</label>
                                <textarea 
                                    className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold focus:ring-2 focus:ring-amber-500 outline-none transition-all h-20"
                                    value={formData.address.line1 || ""}
                                    onChange={(e) => setFormData({...formData, address: {...formData.address, line1: e.target.value}})}
                                    placeholder="House/Street/Area"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Address Line 2 (Optional)</label>
                                <input 
                                    type="text"
                                    className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                                    value={formData.address.line2 || ""}
                                    onChange={(e) => setFormData({...formData, address: {...formData.address, line2: e.target.value}})}
                                    placeholder="Landmark"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Village/City</label>
                                    <input 
                                        type="text"
                                        className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                                        value={formData.address.villageOrCity || ""}
                                        onChange={(e) => setFormData({...formData, address: {...formData.address, villageOrCity: e.target.value}})}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Taluka</label>
                                    <input 
                                        type="text"
                                        className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                                        value={formData.address.taluka || ""}
                                        onChange={(e) => setFormData({...formData, address: {...formData.address, taluka: e.target.value}})}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase ml-1">District</label>
                                    <input 
                                        type="text"
                                        className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                                        value={formData.address.district || ""}
                                        onChange={(e) => setFormData({...formData, address: {...formData.address, district: e.target.value}})}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase ml-1">State</label>
                                    <input 
                                        type="text"
                                        className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                                        value={formData.address.state || ""}
                                        onChange={(e) => setFormData({...formData, address: {...formData.address, state: e.target.value}})}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Pincode</label>
                                <input 
                                    type="text"
                                    className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                                    value={formData.address.pincode || ""}
                                    onChange={(e) => setFormData({...formData, address: {...formData.address, pincode: e.target.value}})}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Official Documents */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-sm font-black text-gray-800 uppercase tracking-wider mb-6 flex items-center gap-2">
                            <Layout size={18} className="text-purple-500" /> Documents
                        </h3>
                        
                        <div className="space-y-6">
                            {/* Principal Signature */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Principal Signature</label>
                                <div className="relative group p-4 border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50 flex flex-col items-center justify-center min-h-[120px] hover:border-indigo-200 transition-all">
                                    {formData.principalSignatureUrl ? (
                                        <>
                                            <img src={getDisplayUrl(formData.principalSignatureUrl)} alt="Signature" className="h-20 object-contain" />
                                            <button 
                                                type="button"
                                                onClick={() => setFormData({...formData, principalSignatureUrl: ""})}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X size={14} />
                                            </button>
                                        </>
                                    ) : (
                                        <div className="text-center">
                                            <ImageIcon className="mx-auto text-gray-300 mb-2" size={32} />
                                            <p className="text-[10px] font-bold text-gray-400 uppercase">No Signature Uploaded</p>
                                        </div>
                                    )}
                                    <label className="mt-4 cursor-pointer w-full bg-white border border-gray-100 text-[10px] font-black uppercase py-2 rounded-lg text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all text-center shadow-sm">
                                        {uploading.principalSignatureUrl ? <Loader2 className="animate-spin mx-auto" size={14} /> : "Upload Signature"}
                                        <input 
                                            type="file" 
                                            className="hidden" 
                                            accept="image/*" 
                                            onChange={(e) => handleFileUpload('principalSignatureUrl', e.target.files[0])}
                                            disabled={uploading.principalSignatureUrl}
                                        />
                                    </label>
                                </div>
                            </div>

                            {/* School Stamp */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase ml-1">School Stamp</label>
                                <div className="relative group p-4 border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50 flex flex-col items-center justify-center min-h-[120px] hover:border-indigo-200 transition-all">
                                    {formData.schoolStampUrl ? (
                                        <>
                                            <img src={getDisplayUrl(formData.schoolStampUrl)} alt="Stamp" className="h-20 object-contain" />
                                            <button 
                                                type="button"
                                                onClick={() => setFormData({...formData, schoolStampUrl: ""})}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X size={14} />
                                            </button>
                                        </>
                                    ) : (
                                        <div className="text-center">
                                            <ImageIcon className="mx-auto text-gray-300 mb-2" size={32} />
                                            <p className="text-[10px] font-bold text-gray-400 uppercase">No Stamp Uploaded</p>
                                        </div>
                                    )}
                                    <label className="mt-4 cursor-pointer w-full bg-white border border-gray-100 text-[10px] font-black uppercase py-2 rounded-lg text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all text-center shadow-sm">
                                        {uploading.schoolStampUrl ? <Loader2 className="animate-spin mx-auto" size={14} /> : "Upload Stamp"}
                                        <input 
                                            type="file" 
                                            className="hidden" 
                                            accept="image/*" 
                                            onChange={(e) => handleFileUpload('schoolStampUrl', e.target.files[0])}
                                            disabled={uploading.schoolStampUrl}
                                        />
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default SchoolDetailView;
