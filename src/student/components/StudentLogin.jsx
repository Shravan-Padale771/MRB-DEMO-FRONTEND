import React from 'react';
import { motion } from 'framer-motion';
import { User, LogIn, ShieldCheck } from 'lucide-react';

const StudentLogin = ({ students, setCurrentUser }) => {
    return (
        <div style={s.container}>
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={s.card}
            >
                <div style={s.header}>
                    <div style={s.iconWrapper}>
                        <ShieldCheck size={32} color="#4c84ff" />
                    </div>
                    <h2 style={s.title}>Student Identity</h2>
                    <p style={s.subtitle}>
                        SELECT YOUR REGISTERED PROFILE TO ACCESS THE DASHBOARD
                    </p>
                </div>

                <div className="custom-scrollbar" style={s.listContainer}>
                    {students.length === 0 ? (
                        <div style={s.emptyState}>
                            <p>NO ACTIVE SESSIONS FOUND</p>
                        </div>
                    ) : (
                        students.map((st) => (
                            <motion.button
                                key={st.studentId}
                                whileHover={{ scale: 1.01, backgroundColor: '#fdfdfd', borderColor: '#4c84ff' }}
                                whileTap={{ scale: 0.99 }}
                                onClick={() => setCurrentUser(st)}
                                style={s.studentBtn}
                            >
                                <div style={s.studentInfo}>
                                    <div style={s.avatar}>
                                        <User size={18} color="#4c84ff" />
                                    </div>
                                    <div style={s.textStack}>
                                        <span style={s.username}>{st.username}</span>
                                        <span style={s.studentMeta}>System User</span>
                                    </div>
                                </div>
                                <span style={s.idBadge}>UID: {st.studentId}</span>
                            </motion.button>
                        ))
                    )}
                </div>

                <div style={s.footer}>
                    <p style={s.footerText}>Maharashtra Rajya Pariksha Mandal - Secure Portal</p>
                </div>
            </motion.div>
        </div>
    );
};

const s = {
    container: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8fafc',
        padding: '24px',
        fontFamily: 'DM Sans, Segoe UI, sans-serif',
    },
    card: {
        backgroundColor: '#fff',
        padding: '48px 40px',
        borderRadius: '14px',
        border: '1px solid #e2e8f0',
        width: '100%',
        maxWidth: '440px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
    },
    header: {
        textAlign: 'center',
        marginBottom: '40px',
    },
    iconWrapper: {
        width: '64px',
        height: '64px',
        backgroundColor: '#f0f7ff',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 24px auto',
        border: '1px solid #e0e7ff',
    },
    title: {
        fontSize: '26px',
        fontWeight: '900',
        color: '#1e293b',
        margin: '0 0 10px 0',
        letterSpacing: '-0.02em',
    },
    subtitle: {
        fontSize: '10px',
        fontWeight: '800',
        color: '#94a3b8',
        lineHeight: '1.6',
        margin: 0,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
    },
    listContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        maxHeight: '340px',
        overflowY: 'auto',
        paddingRight: '4px',
    },
    emptyState: {
        textAlign: 'center',
        padding: '40px 20px',
        color: '#94a3b8',
        fontSize: '11px',
        fontWeight: '900',
        letterSpacing: '0.05em',
    },
    studentBtn: {
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px',
        backgroundColor: '#f8fafc',
        border: '1px solid #f1f5f9',
        borderRadius: '10px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        textAlign: 'left',
    },
    studentInfo: {
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
    },
    avatar: {
        width: '38px',
        height: '38px',
        backgroundColor: '#fff',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    textStack: { display: 'flex', flexDirection: 'column' },
    username: {
        fontSize: '15px',
        fontWeight: '700',
        color: '#1e293b',
    },
    studentMeta: { fontSize: '11px', color: '#94a3b8', fontWeight: '500' },
    idBadge: {
        fontSize: '10px',
        fontWeight: '900',
        color: '#4c84ff',
        backgroundColor: '#f0f7ff',
        padding: '4px 10px',
        borderRadius: '6px',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        border: '1px solid #e0e7ff',
    },
    footer: {
        marginTop: '40px',
        textAlign: 'center',
        borderTop: '1px solid #f1f5f9',
        paddingTop: '24px',
    },
    footerText: {
        fontSize: '10px',
        fontWeight: '800',
        color: '#94a3b8',
        textTransform: 'uppercase',
        letterSpacing: '0.12em',
        margin: 0,
    }
};

export default StudentLogin;
