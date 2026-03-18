import React, { useState, useMemo } from 'react';
import { FileText, Filter, XCircle, Search, Printer, List, LayoutGrid, Award, ArrowRight, CheckCircle, RefreshCw } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import ApplicationLedger from '../ApplicationLedger';
import Pagination from '../../../common/components/Pagination';
import { getRegions, getExamCentres, getSchools, getExamApplications } from '../../../api';
import { searchExams as getExams } from '../../../api/exam-api';
import { batchGenerateHallTickets } from '../../../api/exam-application-api';
import { toast } from 'react-hot-toast';

const ApplicationManager = ({ isDashboard = false, onPublishWithFilters, selectApplication, reviewApplication }) => {
    const [filterExam, setFilterExam] = useState("");
    const [filterRegion, setFilterRegion] = useState("");
    const [filterCentre, setFilterCentre] = useState("");
    const [filterSchool, setFilterSchool] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [page, setPage] = useState(0);
    const [size] = useState(isDashboard ? 5 : 12);
    const [viewMode, setViewMode] = useState("table");
    const [isLedgerOpen, setIsLedgerOpen] = useState(false);
    const queryClient = useQueryClient();

    // Queries
    const { data: examsPage } = useQuery({ queryKey: ['exams'], queryFn: () => getExams({ size: 1000 }) });
    const exams = examsPage?.content || [];

    const { data: regionsPage } = useQuery({ queryKey: ['regions'], queryFn: () => getRegions({ size: 1000 }) });
    const regions = regionsPage?.content || [];

    const { data: centresPage } = useQuery({ queryKey: ['examCentres'], queryFn: () => getExamCentres({ size: 1000 }) });
    const centres = centresPage?.content || [];

    const { data: schoolsPage } = useQuery({ queryKey: ['schools'], queryFn: () => getSchools({ size: 1000 }) });
    const schools = schoolsPage?.content || [];

    const { data: applicationsData, isLoading, refetch } = useQuery({
        queryKey: ['applications', filterExam, filterRegion, filterCentre, filterSchool, filterStatus, page, size],
        queryFn: () => getExamApplications({
            examNo: filterExam || undefined,
            regionId: filterRegion || undefined,
            examCentre: filterCentre || undefined,
            schoolId: filterSchool || undefined,
            status: filterStatus || undefined,
            page,
            size,
        }),
        keepPreviousData: true
    });

    const applications = applicationsData?.content || [];
    const totalPages = applicationsData?.totalPages ?? (applicationsData?.totalElements ? Math.ceil(applicationsData.totalElements / size) : 0);

    // Cascading Logic
    const availableCentres = useMemo(() => {
        if (!filterRegion) return centres;
        return centres.filter(c => c.regionId?.toString() === filterRegion);
    }, [filterRegion, centres]);

    const availableSchools = useMemo(() => {
        if (!filterCentre) return schools;
        return schools.filter(s => s.centreId?.toString() === filterCentre);
    }, [filterCentre, schools]);

    const clearFilters = () => {
        setFilterExam("");
        setFilterRegion("");
        setFilterCentre("");
        setFilterSchool("");
        setFilterStatus("");
        setPage(0);
    };

    const handleBatchGenerate = async () => {
        if (!window.confirm("Generate hall tickets for all APPROVED applications?")) return;
        const loadingToast = toast.loading("Generating hall tickets...");
        try {
            await batchGenerateHallTickets();
            toast.success("Hall tickets generated successfully.", { id: loadingToast });
            queryClient.invalidateQueries({ queryKey: ['applications'] });
        } catch (error) {
            toast.error("Generation failed.", { id: loadingToast });
        }
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'APPROVED': return { bg: '#EBFBEE', color: '#2F9E44', border: '#D3F9D8' };
            case 'REJECTED': return { bg: '#FFF5F5', color: '#FA5252', border: '#FFE3E3' };
            case 'PENDING': return { bg: '#FFF9DB', color: '#F59F00', border: '#FFF3BF' };
            case 'SUBMITTED': return { bg: '#E7F2FF', color: '#228BE6', border: '#D0EBFF' };
            default: return { bg: '#F8F9FA', color: '#868E96', border: '#E9ECEF' };
        }
    };

    if (isDashboard) {
        return (
            <div style={s.card}>
                <div style={s.cardHeader}>
                    <div>
                        <p style={s.cardTitle}>Recent Applications</p>
                        <p style={s.cardSub}>Latest submissions requiring review</p>
                    </div>
                </div>
                {applications.length === 0 ? (
                    <div style={s.emptyCell}>No applications found</div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={s.table}>
                            <thead>
                                <tr style={s.thead}>
                                    <th style={s.th}>ID</th>
                                    <th style={s.th}>Student Name</th>
                                    <th style={s.th}>Status</th>
                                    <th style={{ ...s.th, textAlign: 'right' }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {applications.map((app) => {
                                    const style = getStatusStyle(app.status);
                                    return (
                                        <tr key={app.applicationId} style={s.tr} onClick={() => reviewApplication(app)}>
                                            <td style={s.tdCode}>#{app.applicationId}</td>
                                            <td style={s.tdMain}>{app.studentName}</td>
                                            <td style={s.td}>
                                                <span style={{ ...s.pill, background: style.bg, color: style.color, borderColor: style.border }}>
                                                    {app.status}
                                                </span>
                                            </td>
                                            <td style={{ ...s.td, textAlign: 'right' }}>
                                                <ArrowRight size={12} color="#B0B3C6" />
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div style={s.page}>
            {/* Header Card */}
            <div style={s.card}>
                <div style={s.cardHeader}>
                    <div>
                        <p style={s.cardTitle}>Exam Applications</p>
                        <p style={s.cardSub}>Process, review, and manage all student applications</p>
                    </div>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <div style={s.viewToggle}>
                            <button onClick={() => setViewMode("table")} style={{ ...s.toggleBtn, ...(viewMode === 'table' ? s.toggleActive : {}) }}>
                                <List size={14} />
                            </button>
                            <button onClick={() => setViewMode("card")} style={{ ...s.toggleBtn, ...(viewMode === 'card' ? s.toggleActive : {}) }}>
                                <LayoutGrid size={14} />
                            </button>
                        </div>
                        <button onClick={() => setIsLedgerOpen(true)} style={s.iconBtnAction} title="Print List">
                            <Printer size={14} />
                        </button>
                        <button 
                            onClick={() => onPublishWithFilters({ region: filterRegion, centre: filterCentre, school: filterSchool, status: filterStatus, exam: filterExam })} 
                            style={s.publishBtn}
                        >
                            <Award size={14} />
                            Publish
                        </button>
                        <button onClick={handleBatchGenerate} style={s.hallTicketBtn}>
                            <CheckCircle size={14} />
                            Hall Tickets
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div style={s.filterGrid}>
                    <div style={s.fieldWrap}>
                        <label style={s.label}>Exam</label>
                        <select style={s.select} value={filterExam} onChange={(e) => { setFilterExam(e.target.value); setPage(0); }}>
                            <option value="">All Exams</option>
                            {exams.map(ex => <option key={ex.examNo} value={ex.examNo}>{ex.exam_name}</option>)}
                        </select>
                    </div>
                    <div style={s.fieldWrap}>
                        <label style={s.label}>Region</label>
                        <select style={s.select} value={filterRegion} onChange={(e) => { setFilterRegion(e.target.value); setFilterCentre(""); setFilterSchool(""); setPage(0); }}>
                            <option value="">All Regions</option>
                            {regions.map(r => <option key={r.regionId} value={r.regionId}>{r.regionName}</option>)}
                        </select>
                    </div>
                    <div style={s.fieldWrap}>
                        <label style={s.label}>Centre</label>
                        <select style={s.select} value={filterCentre} onChange={(e) => { setFilterCentre(e.target.value); setFilterSchool(""); setPage(0); }}>
                            <option value="">All Centres</option>
                            {availableCentres.map(c => <option key={c.centreId} value={c.centreId}>{c.centreName}</option>)}
                        </select>
                    </div>
                    <div style={s.fieldWrap}>
                        <label style={s.label}>School</label>
                        <select style={s.select} value={filterSchool} onChange={(e) => { setFilterSchool(e.target.value); setPage(0); }}>
                            <option value="">All Schools</option>
                            {availableSchools.map(s => <option key={s.schoolId} value={s.schoolId}>{s.schoolName}</option>)}
                        </select>
                    </div>
                    <div style={s.fieldWrap}>
                        <label style={s.label}>Status</label>
                        <select style={s.select} value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(0); }}>
                            <option value="">All Statuses</option>
                            <option value="SUBMITTED">SUBMITTED</option>
                            <option value="APPROVED">APPROVED</option>
                            <option value="REJECTED">REJECTED</option>
                            <option value="PENDING">PENDING</option>
                        </select>
                    </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, alignItems: 'center' }}>
                    <div style={s.resultCount}>
                        <Search size={10} />
                        Found {applicationsData?.totalElements || 0} applications
                    </div>
                    {(filterExam || filterRegion || filterCentre || filterSchool || filterStatus) && (
                        <button onClick={clearFilters} style={s.resetBtn}>
                            <XCircle size={10} /> Reset Filters
                        </button>
                    )}
                </div>
            </div>

            {/* List/Grid View */}
            <div>
                {isLoading ? (
                    <div style={s.loadingCell}>Fetching applications...</div>
                ) : applications.length === 0 ? (
                    <div style={s.card}><div style={s.emptyCell}>No records found</div></div>
                ) : (
                    <>
                        {viewMode === 'table' ? (
                            <div style={s.card}>
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={s.table}>
                                        <thead>
                                            <tr style={s.thead}>
                                                <th style={s.th}>App ID</th>
                                                <th style={s.th}>Student Name</th>
                                                <th style={s.th}>Exam Name</th>
                                                <th style={s.th}>Status</th>
                                                <th style={{ ...s.th, textAlign: 'right' }}>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {applications.map((app) => {
                                                const style = getStatusStyle(app.status);
                                                return (
                                                    <tr key={app.applicationId} style={s.tr} onClick={() => reviewApplication(app)}>
                                                        <td style={s.tdCode}>#{app.applicationId}</td>
                                                        <td style={s.td}>
                                                            <div style={s.appIdentity}>
                                                                <div style={s.appAvatar}>{app.studentName?.charAt(0)}</div>
                                                                <div>
                                                                    <p style={s.appNameText}>{app.studentName}</p>
                                                                    <p style={s.appMetaText}>SID: {app.studentId}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td style={s.tdMain}>{app.examName}</td>
                                                        <td style={s.td}>
                                                            <span style={{ ...s.pill, background: style.bg, color: style.color, borderColor: style.border }}>
                                                                {app.status}
                                                            </span>
                                                        </td>
                                                        <td style={{ ...s.td, textAlign: 'right' }}>
                                                            <button style={s.reviewBtnSmall}>Review</button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ) : (
                            <div style={s.grid}>
                                {applications.map((app) => {
                                    const style = getStatusStyle(app.status);
                                    return (
                                        <div key={app.applicationId} style={s.appCard} onClick={() => reviewApplication(app)}>
                                            <div style={s.cardTop}>
                                                <div style={s.appAvatarLarge}>{app.studentName?.charAt(0)}</div>
                                                <span style={{ ...s.pill, background: style.bg, color: style.color, borderColor: style.border }}>
                                                    {app.status}
                                                </span>
                                            </div>
                                            <p style={s.appNameTextLarge}>{app.studentName}</p>
                                            <p style={s.appMetaTextLarge}>App: #{app.applicationId} • SID: {app.studentId}</p>
                                            <p style={s.cardExamTag}>{app.examName}</p>
                                            <div style={s.cardFooter}>
                                                <span style={s.reviewLink}>Review Details</span>
                                                <ArrowRight size={14} color="#4361EE" />
                                            </div>
                                        </div>
                                    );
                                })}
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
                <ApplicationLedger
                    applications={ledgerApplications}
                    filters={{
                        region: regions.find(r => r.regionId.toString() === filterRegion)?.regionName,
                        centre: centres.find(c => c.centreId.toString() === filterCentre)?.centreName,
                        school: schools.find(s => s.schoolId.toString() === filterSchool)?.schoolName,
                        status: filterStatus,
                        exam: exams.find(e => e.examNo.toString() === filterExam)?.exam_name
                    }}
                    onClose={() => setIsLedgerOpen(false)}
                />
            )}
        </div>
    );
};

export default ApplicationManager;

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
    iconBtnAction: {
        background: '#fff',
        border: '0.5px solid #E8EAF0',
        borderRadius: 8,
        padding: '8px 10px',
        cursor: 'pointer',
        color: '#1B223C',
        display: 'flex',
        alignItems: 'center',
    },
    publishBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '8px 16px',
        fontSize: 11,
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        background: '#4361EE',
        color: '#fff',
        border: 'none',
        borderRadius: 8,
        cursor: 'pointer',
    },
    hallTicketBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '8px 16px',
        fontSize: 11,
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        background: '#2F9E44',
        color: '#fff',
        border: 'none',
        borderRadius: 8,
        cursor: 'pointer',
    },
    filterGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
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
    resultCount: {
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        fontSize: 10,
        fontWeight: 700,
        color: '#fff',
        background: '#4361EE',
        padding: '4px 10px',
        borderRadius: 6,
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
    },
    resetBtn: {
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
        padding: '12px 14px',
    },
    tdCode: {
        padding: '12px 14px',
        fontSize: 11,
        fontWeight: 700,
        color: '#4361EE',
        fontFamily: 'monospace',
    },
    tdMain: {
        padding: '12px 14px',
        fontSize: 13,
        fontWeight: 500,
        color: '#1A1D2E',
    },
    appIdentity: {
        display: 'flex',
        alignItems: 'center',
        gap: 12,
    },
    appAvatar: {
        width: 30,
        height: 30,
        borderRadius: 8,
        background: '#EEF3FF',
        color: '#4361EE',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 12,
        fontWeight: 800,
    },
    appNameText: {
        fontSize: 13,
        fontWeight: 700,
        color: '#1A1D2E',
        margin: 0,
    },
    appMetaText: {
        fontSize: 10,
        color: '#B0B3C6',
        margin: 0,
        fontWeight: 600,
    },
    pill: {
        fontSize: 9,
        fontWeight: 800,
        padding: '3px 10px',
        borderRadius: 20,
        border: '1px solid',
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
    },
    reviewBtnSmall: {
        padding: '5px 12px',
        fontSize: 9,
        fontWeight: 800,
        textTransform: 'uppercase',
        background: '#FAFBFF',
        color: '#4361EE',
        border: '0.5px solid #C5D0FF',
        borderRadius: 6,
        cursor: 'pointer',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        gap: 12,
    },
    appCard: {
        background: '#fff',
        borderRadius: 14,
        padding: 18,
        border: '0.5px solid #E8EAF0',
        cursor: 'pointer',
        transition: 'transform 0.15s, box-shadow 0.15s',
    },
    cardTop: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 14,
    },
    appAvatarLarge: {
        width: 44,
        height: 44,
        borderRadius: 12,
        background: '#EEF3FF',
        color: '#4361EE',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 20,
        fontWeight: 900,
    },
    appNameTextLarge: {
        fontSize: 15,
        fontWeight: 700,
        color: '#1A1D2E',
        margin: 0,
    },
    appMetaTextLarge: {
        fontSize: 10,
        color: '#B0B3C6',
        fontWeight: 600,
        margin: '3px 0 0',
    },
    cardExamTag: {
        fontSize: 11,
        fontWeight: 700,
        color: '#4361EE',
        background: '#EEF3FF',
        padding: '4px 8px',
        borderRadius: 4,
        marginTop: 14,
        display: 'inline-block',
        maxWidth: '100%',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    },
    cardFooter: {
        marginTop: 16,
        paddingTop: 12,
        borderTop: '0.5px solid #F0F1F7',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    reviewLink: {
        fontSize: 11,
        fontWeight: 700,
        color: '#4361EE',
    },
    loadingCell: {
        textAlign: 'center',
        padding: 60,
        color: '#B0B3C6',
        fontSize: 13,
        fontWeight: 600,
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
