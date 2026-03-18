import React, { useState, useMemo } from 'react';
import { Users, Filter, XCircle, Search, Printer, LayoutGrid, List, Settings2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import StudentLedger from '../StudentLedger';
import Pagination from '../../../common/components/Pagination';
import { getRegions, getExamCentres, getStudents, getSchools } from '../../../api';

const StudentManager = ({ isDashboard = false }) => {
    const navigate = useNavigate();
    const [filterRegion, setFilterRegion] = useState("");
    const [filterCentre, setFilterCentre] = useState("");
    const [filterSchool, setFilterSchool] = useState("");
    const [filterFirstName, setFilterFirstName] = useState("");
    const [filterLastName, setFilterLastName] = useState("");
    const [filterStudentId, setFilterStudentId] = useState("");
    const [page, setPage] = useState(0);
    const [size] = useState(isDashboard ? 5 : 12);
    const [viewMode, setViewMode] = useState("table");
    const [isLedgerOpen, setIsLedgerOpen] = useState(false);

    // Metadata Queries
    const { data: regionsPage } = useQuery({ queryKey: ['regions'], queryFn: () => getRegions({ size: 1000 }) });
    const regions = regionsPage?.content || [];

    const { data: centresPage } = useQuery({ queryKey: ['examCentres'], queryFn: () => getExamCentres({ size: 1000 }) });
    const centres = centresPage?.content || [];

    const { data: schoolsPage } = useQuery({ queryKey: ['schools'], queryFn: () => getSchools({ size: 1000 }) });
    const allSchools = schoolsPage?.content || [];

    // API Query for Students
    const { data: studentsData, isLoading } = useQuery({
        queryKey: ['students', filterSchool, filterFirstName, filterLastName, filterStudentId, page, size],
        queryFn: () => getStudents({
            schoolId: filterSchool || undefined,
            firstName: filterFirstName || undefined,
            lastName: filterLastName || undefined,
            studentId: filterStudentId || undefined,
            page,
            size,
        }),
        keepPreviousData: true
    });

    const { data: allStudentsData } = useQuery({
        queryKey: ['studentsAll', filterSchool, filterFirstName, filterLastName, filterStudentId],
        queryFn: () => getStudents({
            schoolId: filterSchool || undefined,
            firstName: filterFirstName || undefined,
            lastName: filterLastName || undefined,
            studentId: filterStudentId || undefined,
            size: 2000,
            page: 0
        }),
        enabled: isLedgerOpen
    });

    const students = studentsData?.content || [];
    const totalPages = studentsData?.totalPages ?? (studentsData?.totalElements ? Math.ceil(studentsData.totalElements / size) : 0);

    const availableCentres = useMemo(() => {
        if (!filterRegion) return centres;
        return centres.filter(c => c.regionId?.toString() === filterRegion);
    }, [filterRegion, centres]);

    const availableSchools = useMemo(() => {
        if (!filterCentre) return allSchools;
        return allSchools.filter(s => s.centreId?.toString() === filterCentre);
    }, [filterCentre, allSchools]);

    const clearFilters = () => {
        setFilterRegion("");
        setFilterCentre("");
        setFilterSchool("");
        setFilterFirstName("");
        setFilterLastName("");
        setFilterStudentId("");
        setPage(0);
    };

    if (isDashboard) {
        return (
            <div style={s.card}>
                <div style={s.cardHeader}>
                    <div>
                        <p style={s.cardTitle}>Recent Students</p>
                        <p style={s.cardSub}>Latest enrollments across regions</p>
                    </div>
                </div>
                {students.length === 0 ? (
                    <div style={s.emptyCell}>No students found</div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={s.table}>
                            <thead>
                                <tr style={s.thead}>
                                    <th style={s.th}>ID</th>
                                    <th style={s.th}>Student Name</th>
                                    <th style={s.th}>School</th>
                                    <th style={{ ...s.th, textAlign: 'right' }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map((st) => (
                                    <tr key={st.studentId} style={s.tr} onClick={() => navigate(`/admin/manage/student/${st.studentId}`)}>
                                        <td style={s.tdMuted}>#{st.studentId}</td>
                                        <td style={s.tdMain}>{st.firstName} {st.lastName}</td>
                                        <td style={{ ...s.tdMuted, fontSize: 11 }}>{st.schoolName || "Self"}</td>
                                        <td style={{ ...s.td, textAlign: 'right' }}>
                                            <Settings2 size={12} color="#B0B3C6" />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div style={s.page}>
            {/* Page Header */}
            <div style={s.card}>
                <div style={s.cardHeader}>
                    <div>
                        <p style={s.cardTitle}>Student Directory</p>
                        <p style={s.cardSub}>Manage and view all enrolled student records</p>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <div style={s.viewToggle}>
                            <button 
                                onClick={() => setViewMode("table")} 
                                style={{ ...s.toggleBtn, ...(viewMode === 'table' ? s.toggleActive : {}) }}
                            >
                                <List size={14} />
                            </button>
                            <button 
                                onClick={() => setViewMode("card")} 
                                style={{ ...s.toggleBtn, ...(viewMode === 'card' ? s.toggleActive : {}) }}
                            >
                                <LayoutGrid size={14} />
                            </button>
                        </div>
                        <button onClick={() => setIsLedgerOpen(true)} style={s.printBtn}>
                            <Printer size={14} />
                            Print
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div style={s.filterGrid}>
                    <div style={s.fieldWrap}>
                        <label style={s.label}>Region</label>
                        <select
                            style={s.select}
                            value={filterRegion}
                            onChange={(e) => { setFilterRegion(e.target.value); setFilterCentre(""); setFilterSchool(""); setPage(0); }}
                        >
                            <option value="">All Regions</option>
                            {regions.map(r => <option key={r.regionId} value={r.regionId}>{r.regionName}</option>)}
                        </select>
                    </div>
                    <div style={s.fieldWrap}>
                        <label style={s.label}>Centre</label>
                        <select
                            style={s.select}
                            value={filterCentre}
                            onChange={(e) => { setFilterCentre(e.target.value); setFilterSchool(""); setPage(0); }}
                        >
                            <option value="">All Centres</option>
                            {availableCentres.map(c => <option key={c.centreId} value={c.centreId}>{c.centreName}</option>)}
                        </select>
                    </div>
                    <div style={s.fieldWrap}>
                        <label style={s.label}>School</label>
                        <select
                            style={s.select}
                            value={filterSchool}
                            onChange={(e) => { setFilterSchool(e.target.value); setPage(0); }}
                        >
                            <option value="">All Schools</option>
                            {availableSchools.map(s => <option key={s.schoolId} value={s.schoolId}>{s.schoolName}</option>)}
                        </select>
                    </div>
                    <div style={s.fieldWrap}>
                        <label style={s.label}>Student ID</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="text"
                                style={{ ...s.input, paddingLeft: 30 }}
                                placeholder="Search ID"
                                value={filterStudentId}
                                onChange={(e) => { setFilterStudentId(e.target.value); setPage(0); }}
                            />
                            <Search size={12} style={{ position: 'absolute', left: 10, top: 12, color: '#B0B3C6' }} />
                        </div>
                    </div>
                    <div style={{ ...s.fieldWrap, gridColumn: 'span 2' }}>
                        <label style={s.label}>Search by Name</label>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <input
                                type="text"
                                style={s.input}
                                placeholder="First Name"
                                value={filterFirstName}
                                onChange={(e) => { setFilterFirstName(e.target.value); setPage(0); }}
                            />
                            <input
                                type="text"
                                style={s.input}
                                placeholder="Last Name"
                                value={filterLastName}
                                onChange={(e) => { setFilterLastName(e.target.value); setPage(0); }}
                            />
                        </div>
                    </div>
                </div>
                {(filterRegion || filterCentre || filterSchool || filterFirstName || filterLastName || filterStudentId) && (
                    <button onClick={clearFilters} style={s.resetBtn}>
                        <XCircle size={10} /> Reset Filters
                    </button>
                )}
            </div>

            {/* Results Section */}
            <div>
                {isLoading ? (
                    <div style={s.loadingCell}>Fetching records...</div>
                ) : students.length === 0 ? (
                    <div style={s.card}>
                        <div style={s.emptyCell}>
                            <Users size={32} style={{ color: '#D1D5E8', marginBottom: 10 }} />
                            <p style={s.emptyText}>No students match your criteria</p>
                        </div>
                    </div>
                ) : (
                    <>
                        {viewMode === 'table' ? (
                            <div style={s.card}>
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={s.table}>
                                        <thead>
                                            <tr style={s.thead}>
                                                <th style={s.th}>ID</th>
                                                <th style={s.th}>Student Name</th>
                                                <th style={s.th}>School</th>
                                                <th style={s.th}>Age/Lang</th>
                                                <th style={{ ...s.th, textAlign: 'right' }}>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {students.map((st) => (
                                                <tr key={st.studentId} style={s.tr}>
                                                    <td style={s.tdCode}>#{st.studentId}</td>
                                                    <td style={s.td}>
                                                        <div style={s.studentInfo}>
                                                            <div style={s.studentAvatar}>{st.firstName?.charAt(0)}</div>
                                                            <div>
                                                                <p style={s.studentName}>{st.firstName} {st.lastName}</p>
                                                                <p style={s.studentMeta}>{st.contact || 'No contact'}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td style={s.tdMain}>{st.schoolName || "Self"}</td>
                                                    <td style={s.td}>
                                                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                                            <span style={s.ageBadge}>{st.age}y</span>
                                                            <span style={s.langBadge}>{st.motherTongue}</span>
                                                        </div>
                                                    </td>
                                                    <td style={{ ...s.td, textAlign: 'right' }}>
                                                        <button 
                                                            onClick={() => navigate(`/admin/manage/student/${st.studentId}`)}
                                                            style={s.manageBtnSmall}
                                                        >
                                                            <Settings2 size={12} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ) : (
                            <div style={s.grid}>
                                {students.map((st) => (
                                    <div 
                                        key={st.studentId} 
                                        style={s.studentCard}
                                        onClick={() => navigate(`/admin/manage/student/${st.studentId}`)}
                                    >
                                        <div style={s.cardTop}>
                                            <div style={s.largeAvatar}>{st.firstName?.charAt(0)}</div>
                                            <Settings2 size={14} color="#B0B3C6" />
                                        </div>
                                        <p style={s.cardNameText}>{st.firstName} {st.lastName}</p>
                                        <p style={s.cardIdText}>ID: #{st.studentId}</p>
                                        <div style={s.cardFooter}>
                                            <p style={s.cardSchoolText}>{st.schoolName || "Private"}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {totalPages > 1 && (
                            <div style={{ marginTop: 14 }}>
                                <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
                            </div>
                        )}
                    </>
                )}
            </div>

            {isLedgerOpen && (
                <StudentLedger
                    students={allStudentsData?.content || []}
                    filters={{
                        region: regions.find(r => r.regionId.toString() === filterRegion)?.regionName,
                        centre: centres.find(c => c.centreId.toString() === filterCentre)?.centreName,
                        school: allSchools.find(s => s.schoolId.toString() === filterSchool)?.schoolName,
                    }}
                    onClose={() => setIsLedgerOpen(false)}
                />
            )}
        </div>
    );
};

export default StudentManager;

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
    viewToggle: {
        display: 'flex',
        background: '#FAFBFF',
        padding: 3,
        borderRadius: 8,
        border: '0.5px solid #E8EAF0',
    },
    toggleBtn: {
        padding: '5px 8px',
        borderRadius: 6,
        border: 'none',
        background: 'none',
        cursor: 'pointer',
        color: '#B0B3C6',
        display: 'flex',
        alignItems: 'center',
    },
    toggleActive: {
        background: '#fff',
        color: '#4361EE',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    },
    printBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 14px',
        fontSize: 11,
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        background: '#1B223C',
        color: '#fff',
        border: 'none',
        borderRadius: 8,
        cursor: 'pointer',
    },
    filterGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr) 2fr',
        gap: 12,
        background: '#FAFBFF',
        padding: 16,
        borderRadius: 12,
        border: '0.5px solid #E8EAF0',
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
        width: '100%',
        padding: '8px 10px',
        fontSize: 12,
        border: '0.5px solid #E8EAF0',
        borderRadius: 6,
        outline: 'none',
        color: '#1A1D2E',
        fontFamily: 'inherit',
    },
    select: {
        padding: '8px 10px',
        fontSize: 12,
        border: '0.5px solid #E8EAF0',
        borderRadius: 6,
        outline: 'none',
        color: '#1A1D2E',
        fontFamily: 'inherit',
        background: '#fff',
    },
    resetBtn: {
        marginTop: 10,
        background: 'none',
        border: 'none',
        color: '#FA5252',
        fontSize: 10,
        fontWeight: 700,
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        cursor: 'pointer',
        textTransform: 'uppercase',
        padding: 0,
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
        cursor: 'pointer',
    },
    td: {
        padding: '11px 14px',
    },
    tdCode: {
        padding: '11px 14px',
        fontSize: 11,
        fontWeight: 700,
        color: '#4361EE',
        fontFamily: 'monospace',
    },
    tdMain: {
        padding: '11px 14px',
        fontSize: 13,
        fontWeight: 500,
        color: '#1A1D2E',
    },
    tdMuted: {
        padding: '11px 14px',
        fontSize: 12,
        fontWeight: 600,
        color: '#B0B3C6',
    },
    studentInfo: {
        display: 'flex',
        alignItems: 'center',
        gap: 12,
    },
    studentAvatar: {
        width: 28,
        height: 28,
        borderRadius: 6,
        background: '#EEF3FF',
        color: '#4361EE',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 10,
        fontWeight: 800,
    },
    studentName: {
        fontSize: 13,
        fontWeight: 700,
        color: '#1A1D2E',
        margin: 0,
    },
    studentMeta: {
        fontSize: 10,
        color: '#B0B3C6',
        margin: 0,
        fontWeight: 600,
    },
    ageBadge: {
        fontSize: 10,
        fontWeight: 700,
        color: '#4361EE',
        padding: '2px 6px',
        background: '#EEF3FF',
        borderRadius: 4,
    },
    langBadge: {
        fontSize: 10,
        fontWeight: 700,
        color: '#8B8FA8',
        textTransform: 'uppercase',
    },
    manageBtnSmall: {
        background: 'none',
        border: '0.5px solid #E8EAF0',
        borderRadius: 6,
        padding: 5,
        color: '#B0B3C6',
        cursor: 'pointer',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: 12,
    },
    studentCard: {
        background: '#fff',
        borderRadius: 14,
        padding: 16,
        border: '0.5px solid #E8EAF0',
        cursor: 'pointer',
        transition: 'transform 0.15s, box-shadow 0.15s',
    },
    cardTop: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    largeAvatar: {
        width: 40,
        height: 40,
        borderRadius: 10,
        background: '#EEF3FF',
        color: '#4361EE',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 18,
        fontWeight: 900,
    },
    cardNameText: {
        fontSize: 14,
        fontWeight: 700,
        color: '#1A1D2E',
        margin: 0,
    },
    cardIdText: {
        fontSize: 10,
        color: '#B0B3C6',
        fontWeight: 600,
        margin: '2px 0 0',
    },
    cardFooter: {
        marginTop: 12,
        paddingTop: 10,
        borderTop: '0.5px solid #F0F1F7',
    },
    cardSchoolText: {
        fontSize: 11,
        color: '#8B8FA8',
        margin: 0,
        fontWeight: 500,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
    loadingCell: {
        textAlign: 'center',
        padding: 60,
        color: '#B0B3C6',
        fontSize: 13,
        fontWeight: 600,
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
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
