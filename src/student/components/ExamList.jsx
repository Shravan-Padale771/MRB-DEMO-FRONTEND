import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, FileText, IndianRupee } from 'lucide-react';

const ExamList = ({ exams, openApplyModal }) => {
    return (
        <div style={s.container}>
            <div style={s.header}>
                <div>
                    <p style={s.cardTitle}>Administrative Overview</p>
                    <p style={s.cardSub}>Data grouped by examination type</p>
                </div>
            </div>

            {exams.length === 0 ? (
                <div style={s.emptyWrap}>
                    <BookOpen size={30} style={{ color: '#D1D5E8', marginBottom: 8 }} />
                    <span style={s.emptyText}>No exams registered yet</span>
                </div>
            ) : (
                <div style={s.regionGrid}>
                    {exams.map((exam) => (
                        <motion.div
                            key={exam.examNo}
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            style={s.regionCard}
                        >
                            <div style={s.regionCardTop}>
                                <div style={s.regionAvatar}>
                                    {exam.exam_name?.charAt(0).toUpperCase() || 'E'}
                                </div>
                                <div>
                                    <p style={s.regionName}>{exam.exam_name}</p>
                                    <p style={s.regionId}>Exam ID: #{exam.examNo}</p>
                                </div>
                            </div>

                            <div style={{ marginTop: 12 }}>
                                <p style={s.centreLabel}>Structure & Fees</p>
                                <div style={s.centreTagWrap}>
                                    <span style={s.centreTag}><FileText size={10} /> {exam.no_of_papers} Papers</span>
                                    <span style={{ ...s.centreTag, background: '#EEF3FF', color: '#4361EE' }}><IndianRupee size={10} /> ₹{exam.exam_fees} Fee</span>
                                </div>
                            </div>

                            <div style={s.regionCardFooter}>
                                <button
                                    onClick={() => openApplyModal(exam)}
                                    style={s.manageBtn}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = '#4361EE';
                                        e.currentTarget.style.color = '#fff';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = '#fff';
                                        e.currentTarget.style.color = '#4361EE';
                                    }}
                                >
                                    START APPLICATION
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

const s = {
    container: {
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    },
    header: {
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
    emptyWrap: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '30px 0',
        background: '#fff',
        borderRadius: 14,
        border: '0.5px solid #E8EAF0',
    },
    emptyText: {
        fontSize: 12,
        color: '#B0B3C6',
        fontStyle: 'italic',
    },
    regionGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: 12,
    },
    regionCard: {
        border: '0.5px solid #E8EAF0',
        borderRadius: 12,
        padding: '16px 18px',
        display: 'flex',
        flexDirection: 'column',
        background: '#FAFBFF',
        transition: 'all 0.15s ease',
    },
    regionCardTop: {
        display: 'flex',
        alignItems: 'center',
        gap: 12,
    },
    regionAvatar: {
        width: 32,
        height: 32,
        borderRadius: 8,
        background: '#EEF3FF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 14,
        fontWeight: 800,
        color: '#4361EE',
        flexShrink: 0,
    },
    regionName: {
        fontSize: 13,
        fontWeight: 700,
        color: '#1A1D2E',
        margin: 0,
        textTransform: 'uppercase',
        letterSpacing: '0.03em',
        lineHeight: 1.2,
    },
    regionId: {
        fontSize: 10,
        color: '#8B8FA8',
        fontWeight: 600,
        margin: '2px 0 0',
    },
    centreLabel: {
        fontSize: 10,
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        color: '#8B8FA8',
        margin: '0 0 6px',
    },
    centreTagWrap: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: 5,
    },
    centreTag: {
        fontSize: 10,
        fontWeight: 700,
        padding: '2px 8px',
        background: '#EEF3FF',
        color: '#4361EE',
        borderRadius: 4,
        display: 'flex',
        alignItems: 'center',
        gap: 4,
    },
    regionCardFooter: {
        marginTop: 14,
        paddingTop: 12,
        borderTop: '0.5px solid #E8EAF0',
    },
    manageBtn: {
        width: '100%',
        padding: '7px 0',
        fontSize: 10,
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.07em',
        background: '#fff',
        color: '#4361EE',
        border: '0.5px solid #C5D0FF',
        borderRadius: 8,
        cursor: 'pointer',
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
        transition: 'all 0.15s ease',
    },
};

export default ExamList;
