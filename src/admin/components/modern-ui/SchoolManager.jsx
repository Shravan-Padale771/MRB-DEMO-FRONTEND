import React, { useState, useMemo } from 'react';
import { Building2, Plus, RefreshCw, Settings2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Pagination from '../../../common/components/Pagination';
import { createSchool, getSchools, getExamCentres, getRegions } from '../../../api';

const SchoolManager = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ schoolName: "", centreId: "" });
    const [filterRegion, setFilterRegion] = useState("");
    const [filterCentre, setFilterCentre] = useState("");
    const [page, setPage] = useState(0);
    const [size] = useState(10);

    // Metadata Queries
    const { data: regionsPage } = useQuery({
        queryKey: ['regions'],
        queryFn: () => getRegions({ size: 1000 }),
    });
    const regions = regionsPage?.content || [];

    const { data: centresPage } = useQuery({
        queryKey: ['examCentres'],
        queryFn: () => getExamCentres({ size: 1000 }),
    });
    const centres = centresPage?.content || [];

    // API Query for Schools
    const { data: schoolsData, isLoading: isLoadingSchools, refetch: refetchSchools } = useQuery({
        queryKey: ['schools', filterRegion, filterCentre, page, size],
        queryFn: () => getSchools({
            regionId: filterRegion || undefined,
            examCentreId: filterCentre || undefined,
            page,
            size,
            sort: 'schoolName,asc'
        }),
        keepPreviousData: true
    });

    const schools = schoolsData?.content || [];
    const totalPages = schoolsData?.totalPages ?? (schoolsData?.totalElements ? Math.ceil(schoolsData.totalElements / size) : 0);

    // Mutation
    const addSchoolMutation = useMutation({
        mutationFn: ({ centreId, schoolData }) => createSchool(schoolData, centreId),
        onSuccess: () => {
            toast.success("School Added!");
            setFormData({ schoolName: "", centreId: "" });
            queryClient.invalidateQueries({ queryKey: ['schools'] });
        },
        onError: () => toast.error("Failed to add school")
    });

    const loading = isLoadingSchools || addSchoolMutation.isPending;

    // Cascading filter logic
    const availableCentresForFilter = useMemo(() => {
        if (!filterRegion) return centres;
        return centres.filter(c => c.regionId?.toString() === filterRegion);
    }, [filterRegion, centres]);

    const handleCreateSchool = (e) => {
        e.preventDefault();
        if (!formData.schoolName || !formData.centreId) return toast.error("Please fill all fields");
        addSchoolMutation.mutate({
            centreId: formData.centreId,
            schoolData: { schoolName: formData.schoolName }
        });
    };

    return (
        <div style={s.page}>
            {/* Add School Form */}
            <div style={s.card}>
                <div style={s.cardHeader}>
                    <div>
                        <p style={s.cardTitle}>School Management</p>
                        <p style={s.cardSub}>Register new schools and assign them to exam centres</p>
                    </div>
                </div>
                <form onSubmit={handleCreateSchool} style={s.formGrid}>
                    <div style={s.fieldWrap}>
                        <label style={s.label}>School Name</label>
                        <input
                            type="text"
                            style={s.input}
                            placeholder="e.g. Model High School"
                            value={formData.schoolName}
                            onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                            required
                        />
                    </div>
                    <div style={s.fieldWrap}>
                        <label style={s.label}>Exam Centre</label>
                        <select
                            style={s.select}
                            value={formData.centreId}
                            onChange={(e) => setFormData({ ...formData, centreId: e.target.value })}
                            required
                        >
                            <option value="">Select Centre</option>
                            {centres.map((c, idx) => (
                                <option key={c.centreId || idx} value={c.centreId}>
                                    {c.centreName} ({c.centreCode})
                                </option>
                            ))}
                        </select>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                        <button type="submit" disabled={addSchoolMutation.isPending} style={s.btn}>
                            {addSchoolMutation.isPending 
                                ? <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> 
                                : <Plus size={14} />}
                            Add School
                        </button>
                    </div>
                </form>
            </div>

            {/* School List */}
            <div style={s.card}>
                <div style={s.cardHeader}>
                    <div>
                        <p style={s.cardTitle}>Existing Schools</p>
                        <p style={s.cardSub}>{schoolsData?.totalElements || 0} schools registered</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={s.filterWrap}>
                            <span style={s.filterLabel}>Region</span>
                            <select
                                style={s.filterSelect}
                                value={filterRegion}
                                onChange={(e) => { setFilterRegion(e.target.value); setFilterCentre(""); setPage(0); }}
                            >
                                <option value="">All</option>
                                {regions.map(r => <option key={r.regionId} value={r.regionId}>{r.regionName}</option>)}
                            </select>
                        </div>
                        <div style={s.filterWrap}>
                            <span style={s.filterLabel}>Centre</span>
                            <select
                                style={s.filterSelect}
                                value={filterCentre}
                                onChange={(e) => { setFilterCentre(e.target.value); setPage(0); }}
                            >
                                <option value="">All</option>
                                {availableCentresForFilter.map(c => <option key={c.centreId} value={c.centreId}>{c.centreName}</option>)}
                            </select>
                        </div>
                        <button onClick={() => refetchSchools()} style={s.iconBtn} title="Refresh">
                            <RefreshCw size={14} style={loading ? { animation: 'spin 1s linear infinite' } : {}} />
                        </button>
                    </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={s.table}>
                        <thead>
                            <tr style={s.thead}>
                                <th style={s.th}>School Details</th>
                                <th style={s.th}>Exam Centre</th>
                                <th style={{ ...s.th, textAlign: 'right' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {schools.length === 0 && !isLoadingSchools ? (
                                <tr>
                                    <td colSpan="3" style={s.emptyCell}>
                                        <Building2 size={32} style={{ color: '#D1D5E8', marginBottom: 10 }} />
                                        <p style={s.emptyText}>No schools found</p>
                                    </td>
                                </tr>
                            ) : (
                                schools.map((school, idx) => (
                                    <tr key={school.schoolId || idx} style={s.tr}>
                                        <td style={s.td}>
                                            <div style={s.schoolIdentity}>
                                                <div style={s.schoolAvatar}>
                                                    {school.schoolName?.charAt(0) || "S"}
                                                </div>
                                                <div>
                                                    <p style={s.schoolName}>{school.schoolName}</p>
                                                    <p style={s.schoolId}>ID: #{school.schoolId}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={s.td}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                                <span style={s.centreTag}>{school.centreName || "N/A"}</span>
                                                <span style={s.centreCode}>{school.centreCode || ""}</span>
                                            </div>
                                        </td>
                                        <td style={{ ...s.td, textAlign: 'right' }}>
                                            <button
                                                onClick={() => navigate(`/admin/manage/school/${school.schoolId}`)}
                                                style={s.manageBtn}
                                            >
                                                <Settings2 size={12} />
                                                Manage
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
                )}
            </div>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

export default SchoolManager;

const s = {
    page: {
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    },
    card: {
        background: '#fff',
        borderRadius: 14,
        padding: '20px 22px',
        border: '0.5px solid #E8EAF0',
    },
    cardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    cardTitle: {
        fontSize: 13,
        fontWeight: 700,
        color: '#1A1D2E',
        margin: 0,
    },
    cardSub: {
        fontSize: 11,
        color: '#8B8FA8',
        margin: '3px 0 0',
    },
    formGrid: {
        display: 'grid',
        gridTemplateColumns: 'minmax(200px, 2fr) minmax(200px, 1.5fr) auto',
        gap: 12,
        alignItems: 'end',
    },
    fieldWrap: {
        display: 'flex',
        flexDirection: 'column',
        gap: 5,
    },
    label: {
        fontSize: 10,
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        color: '#8B8FA8',
    },
    input: {
        padding: '9px 12px',
        fontSize: 13,
        border: '0.5px solid #E8EAF0',
        borderRadius: 8,
        outline: 'none',
        color: '#1A1D2E',
        fontFamily: 'inherit',
    },
    select: {
        padding: '9px 12px',
        fontSize: 13,
        border: '0.5px solid #E8EAF0',
        borderRadius: 8,
        outline: 'none',
        color: '#1A1D2E',
        fontFamily: 'inherit',
        background: '#fff',
    },
    btn: {
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '9px 18px',
        fontSize: 12,
        fontWeight: 700,
        background: '#4361EE',
        color: '#fff',
        border: 'none',
        borderRadius: 8,
        cursor: 'pointer',
        fontFamily: 'inherit',
        whiteSpace: 'nowrap',
    },
    filterWrap: {
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        background: '#FAFBFF',
        border: '0.5px solid #E8EAF0',
        borderRadius: 8,
        padding: '5px 10px',
    },
    filterLabel: {
        fontSize: 10,
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        color: '#8B8FA8',
    },
    filterSelect: {
        fontSize: 12,
        fontWeight: 600,
        color: '#4361EE',
        background: 'transparent',
        border: 'none',
        outline: 'none',
        fontFamily: 'inherit',
        cursor: 'pointer',
    },
    iconBtn: {
        background: 'none',
        border: '0.5px solid #E8EAF0',
        borderRadius: 8,
        padding: '6px 8px',
        cursor: 'pointer',
        color: '#8B8FA8',
        display: 'flex',
        alignItems: 'center',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
    },
    thead: {
        background: '#FAFBFF',
    },
    th: {
        padding: '10px 14px',
        fontSize: 10,
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.07em',
        color: '#8B8FA8',
        borderBottom: '0.5px solid #E8EAF0',
        textAlign: 'left',
    },
    tr: {
        borderBottom: '0.5px solid #F0F1F7',
    },
    td: {
        padding: '12px 14px',
    },
    schoolIdentity: {
        display: 'flex',
        alignItems: 'center',
        gap: 12,
    },
    schoolAvatar: {
        width: 32,
        height: 32,
        borderRadius: 8,
        background: '#EEF3FF',
        color: '#4361EE',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 12,
        fontWeight: 800,
    },
    schoolName: {
        fontSize: 13,
        fontWeight: 700,
        color: '#1A1D2E',
        margin: 0,
    },
    schoolId: {
        fontSize: 10,
        color: '#B0B3C6',
        fontWeight: 600,
        margin: '2px 0 0',
    },
    centreTag: {
        fontSize: 10,
        fontWeight: 700,
        padding: '2px 8px',
        background: '#EEF3FF',
        color: '#4361EE',
        borderRadius: 4,
        display: 'inline-block',
    },
    centreCode: {
        fontSize: 10,
        fontFamily: 'monospace',
        color: '#B0B3C6',
        fontWeight: 700,
    },
    manageBtn: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 12px',
        fontSize: 10,
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.03em',
        background: '#fff',
        color: '#4361EE',
        border: '0.5px solid #C5D0FF',
        borderRadius: 8,
        cursor: 'pointer',
        fontFamily: 'inherit',
    },
    emptyCell: {
        textAlign: 'center',
        padding: '40px 0',
    },
    emptyText: {
        fontSize: 13,
        color: '#B0B3C6',
        fontStyle: 'italic',
    },
};
