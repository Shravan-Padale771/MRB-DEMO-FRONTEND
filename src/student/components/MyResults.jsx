import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Award, Calendar, FileText, ArrowRight, CheckCircle, XCircle } from 'lucide-react';
import Marksheet from './Marksheet';

import { getExamApplications } from '../../api';
import { searchExams as getExams } from '../../api/exam-api';
import { useQuery } from '@tanstack/react-query';

const MyResults = ({ myResults, student }) => {
    const [selectedResult, setSelectedResult] = useState(null);

    const { data: examsPage } = useQuery({ queryKey: ['exams'], queryFn: () => getExams({ size: 1000 }) });
    const exams = examsPage?.content || [];
    const { data: applicationsPage } = useQuery({ queryKey: ['applications'], queryFn: () => getExamApplications({ size: 1000 }) });
    const applications = applicationsPage?.content || [];

    // Process results to include full exam/application details for Marksheet
    const processedResults = myResults.map(result => {
        let application = null;
        let exam = null;

        if (result.application && result.application.applicationId) {
            application = applications.find(a => a.applicationId === result.application.applicationId);
        } else if (result.applicationId) {
            application = applications.find(a => a.applicationId === result.applicationId);
        }

        if (application) {
            exam = exams.find(e => e.examNo === application.examNo);
        }

        return {
            ...result,
            application: {
                ...application,
                student: student,
                exam: exam
            }
        };
    });

    return (
        <div style={s.container}>
            <div style={s.header}>
                <div style={s.headerLeft}>
                    <h2 style={s.title}>
                        <Award size={24} style={s.titleIcon} /> Academic Results
                    </h2>
                    <p style={s.subtitle}>VIEW AND DOWNLOAD YOUR PERFORMANCE MARKSHEETS</p>
                </div>
            </div>

            <div style={s.grid}>
                {myResults.length === 0 ? (
                    <div style={s.emptyState}>
                        <Award style={s.emptyIcon} size={48} />
                        <p style={s.emptyText}>No results have been published yet</p>
                        <p style={s.emptySubText}>When exams are graded and finalized, your marksheets will appear here for download.</p>
                    </div>
                ) : (
                    processedResults.map((result) => {
                        let scoreData = { remarks: "Pending", score: "-", totalObtained: 0, totalMax: 0 };
                        try {
                            if (result.resultData) scoreData = JSON.parse(result.resultData);
                        } catch (e) {}

                        const isPass = scoreData.remarks === "Pass";

                        return (
                            <motion.div
                                key={result.id || Math.random()}
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                whileHover={{ y: -4, borderColor: '#4c84ff' }}
                                style={s.card}
                            >
                                <div style={s.cardTop}>
                                    <div style={s.examSection}>
                                        <div style={s.examBadge}>PUBLISHED: {new Date(result.publishedAt).toLocaleDateString()}</div>
                                        <h3 style={s.examName}>{result.application?.exam?.exam_name || "Examination Result"}</h3>
                                        <div style={s.appMeta}>
                                            <FileText size={12} color="#94a3b8" />
                                            <span style={s.appId}>APP ID: #{result.application?.applicationId}</span>
                                        </div>
                                    </div>

                                    <div style={s.scoreBox}>
                                        <div style={s.scoreValueWrapper}>
                                            <span style={s.scoreMain}>{scoreData.score}</span>
                                            <span style={isPass ? s.pills.pass : s.pills.fail}>
                                                {isPass ? <CheckCircle size={10} /> : <XCircle size={10} />}
                                                {scoreData.remarks?.toUpperCase()}
                                            </span>
                                        </div>
                                        <div style={s.scoreStats}>
                                            {scoreData.totalObtained} / {scoreData.totalMax} TOTAL MARKS
                                        </div>
                                    </div>
                                </div>

                                <div style={s.cardFooter}>
                                    <button
                                        onClick={() => setSelectedResult(result)}
                                        style={s.viewBtn}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(76, 132, 255, 0.08)'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(76, 132, 255, 0.04)'}
                                    >
                                        VIEW DETAILED MARKSHEET <ArrowRight size={14} />
                                    </button>
                                </div>
                            </motion.div>
                        );
                    })
                )}
            </div>

            {selectedResult && (
                <Marksheet
                    result={selectedResult}
                    onClose={() => setSelectedResult(null)}
                />
            )}
        </div>
    );
};

const s = {
    container: {
        fontFamily: 'DM Sans, Segoe UI, sans-serif',
    },
    header: {
        marginBottom: '32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        paddingBottom: '20px',
        borderBottom: '1px solid #eee',
    },
    headerLeft: {
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
    },
    title: {
        fontSize: '24px',
        fontWeight: '900',
        color: '#1e293b',
        margin: 0,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
    },
    titleIcon: {
        color: '#4c84ff',
    },
    subtitle: {
        fontSize: '10px',
        fontWeight: '800',
        color: '#94a3b8',
        letterSpacing: '0.2em',
        margin: 0,
    },
    grid: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: '12px',
        border: '1px solid #f1f5f9',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
    },
    cardTop: {
        padding: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    examSection: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
    },
    examBadge: {
        fontSize: '9px',
        fontWeight: '900',
        color: '#94a3b8',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
    },
    examName: {
        fontSize: '18px',
        fontWeight: '800',
        color: '#0f172a',
        margin: 0,
    },
    appMeta: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
    },
    appId: {
        fontSize: '11px',
        fontWeight: '700',
        color: '#94a3b8',
    },
    scoreBox: {
        textAlign: 'right',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
    },
    scoreValueWrapper: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        justifyContent: 'flex-end',
    },
    scoreMain: {
        fontSize: '32px',
        fontWeight: '900',
        color: '#4c84ff',
        lineHeight: '1',
    },
    scoreStats: {
        fontSize: '10px',
        fontWeight: '800',
        color: '#94a3b8',
        letterSpacing: '0.05em',
    },
    pills: {
        pass: {
            backgroundColor: '#EBFBEE',
            color: '#2F9E44',
            border: '1px solid #d3f9d8',
            padding: '4px 10px',
            borderRadius: '6px',
            fontSize: '10px',
            fontWeight: '900',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            letterSpacing: '0.02em',
        },
        fail: {
            backgroundColor: '#FFF5F5',
            color: '#F03E3E',
            border: '1px solid #ffe3e3',
            padding: '4px 10px',
            borderRadius: '6px',
            fontSize: '10px',
            fontWeight: '900',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            letterSpacing: '0.02em',
        }
    },
    cardFooter: {
        padding: '0 24px 24px 24px',
    },
    viewBtn: {
        width: '100%',
        backgroundColor: 'rgba(76, 132, 255, 0.04)',
        color: '#4c84ff',
        padding: '12px',
        borderRadius: '8px',
        border: '1px solid rgba(76, 132, 255, 0.1)',
        fontSize: '11px',
        fontWeight: '900',
        letterSpacing: '0.05em',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        transition: 'all 0.2s ease',
    },
    emptyState: {
        padding: '60px 40px',
        textAlign: 'center',
        backgroundColor: '#fff',
        borderRadius: '16px',
        border: '2px dashed #e2e8f0',
    },
    emptyIcon: {
        color: '#cbd5e1',
        marginBottom: '20px',
    },
    emptyText: {
        fontSize: '18px',
        fontWeight: '800',
        color: '#475569',
        margin: '0 0 8px 0',
    },
    emptySubText: {
        fontSize: '14px',
        color: '#94a3b8',
        maxWidth: '400px',
        margin: '0 auto',
        lineHeight: '1.5',
    }
};

export default MyResults;

