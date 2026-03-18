import React, { useState } from 'react';

/*
  Props:
  - stats: { totalStudents, totalExams, activeApplications, totalResults }
  - applicationTrends: [{ label: 'Mar 12', value: 4 }, ...]
  - regionData: [{ name: 'Nashik', pct: 40 }, ...]
  - recentApplications: [{ name, meta, status, initials, original }, ...]
  - recentResults: [{ exam, date, score, original }, ...]
  - onViewAllApplications: fn
  - onViewAllResults: fn
  - onReviewApplication: fn
  - onViewResult: fn
*/
export default function ModernAdminDashboard({
    stats = {},
    applicationTrends = [],
    regionData = [],
    recentApplications = [],
    recentResults = [],
    onViewAllApplications,
    onViewAllResults,
    onReviewApplication,
    onViewResult,
}) {
    const [hoveredBar, setHoveredBar] = useState(null);

    const { totalStudents = 0, totalExams = 0, activeApplications = 0, totalResults = 0 } = stats;

    const kpis = [
        { label: 'Total Students', value: totalStudents, accent: '#4361EE' },
        { label: 'Total Exams', value: totalExams, accent: '#F59F00' },
        { label: 'Active Applications', value: activeApplications, accent: '#2F9E44' },
        { label: 'Total Results', value: totalResults, accent: '#AE3EC9' },
    ];

    const maxVal = Math.max(...applicationTrends.map(d => d.value), 1);

    return (
        <div style={s.page}>

            {/* TOP ROW */}
            <div style={s.topRow}>

                <div style={s.kpiStrip}>
                    {kpis.map((k, i) => (
                        <div key={i} style={{ ...s.kpiCard, borderLeftColor: k.accent }}>
                            <span style={s.kpiLabel}>{k.label}</span>
                            <span style={s.kpiValue}>{k.value.toLocaleString()}</span>
                        </div>
                    ))}
                </div>

                <div style={s.card}>
                    <div style={s.cardHeader}>
                        <div>
                            <p style={s.cardTitle}>Application Trends</p>
                            <p style={s.cardSub}>Daily applications · last 7 days</p>
                        </div>
                        <span style={s.badge}>7 DAYS</span>
                    </div>

                    {applicationTrends.length === 0 ? (
                        <EmptyState />
                    ) : (
                        <div style={s.chartWrap}>
                            {applicationTrends.map((d, i) => {
                                const heightPct = (d.value / maxVal) * 100;
                                const isHov = hoveredBar === i;
                                return (
                                    <div key={i} style={s.barCol}>
                                        <div style={s.barTrack}>
                                            <div
                                                style={{
                                                    ...s.bar,
                                                    height: `${heightPct}%`,
                                                    background: isHov ? '#3451D1' : '#4361EE',
                                                    opacity: isHov ? 1 : 0.82,
                                                }}
                                                onMouseEnter={() => setHoveredBar(i)}
                                                onMouseLeave={() => setHoveredBar(null)}
                                            />
                                        </div>
                                        <span style={s.barLabel}>{d.label}</span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* BOTTOM ROW */}
            <div style={s.midRow}>

                <div style={s.card}>
                    <div style={s.cardHeader}>
                        <p style={s.cardTitle}>Region Distribution</p>
                        <span style={s.badge}>STUDENTS</span>
                    </div>
                    {regionData.length === 0 ? (
                        <EmptyState />
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                            {regionData.map((r, i) => (
                                <div key={i}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                                        <span style={s.regionName}>{r.name}</span>
                                        <span style={s.regionPct}>{r.pct}%</span>
                                    </div>
                                    <div style={s.trackBar}>
                                        <div style={{ ...s.fillBar, width: `${r.pct}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div style={s.card}>
                    <div style={s.cardHeader}>
                        <p style={s.cardTitle}>Recent Applications</p>
                        {onViewAllApplications && (
                            <button style={s.viewAll} onClick={onViewAllApplications}>View All</button>
                        )}
                    </div>
                    {recentApplications.length === 0 ? (
                        <EmptyState label="No applications found" />
                    ) : (
                        recentApplications.map((a, i) => (
                            <div key={i} style={{ ...s.listRow, cursor: onReviewApplication ? 'pointer' : 'default' }} onClick={() => onReviewApplication?.(a.original)}>
                                <div style={s.avatar}>{a.initials || initials(a.name)}</div>
                                <div style={{ flex: 1 }}>
                                    <p style={s.listName}>{a.name}</p>
                                    <p style={s.listMeta}>{a.meta}</p>
                                </div>
                                <StatusPill status={a.status} />
                            </div>
                        ))
                    )}
                </div>

                <div style={s.card}>
                    <div style={s.cardHeader}>
                        <p style={s.cardTitle}>Recent Results</p>
                        {onViewAllResults && (
                            <button style={s.viewAll} onClick={onViewAllResults}>View All</button>
                        )}
                    </div>
                    {recentResults.length === 0 ? (
                        <EmptyState label="No results found" />
                    ) : (
                        recentResults.map((r, i) => (
                            <div key={i} style={{ ...s.listRow, cursor: onViewResult ? 'pointer' : 'default' }} onClick={() => onViewResult?.(r.original)}>
                                <div style={{ flex: 1 }}>
                                    <p style={s.listName}>{r.exam}</p>
                                    <p style={s.listMeta}>{r.date}</p>
                                </div>
                                <span style={{ ...s.resultScore, color: r.score >= 80 ? '#2F9E44' : '#E67700' }}>
                                    {r.score}%
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

function EmptyState({ label = 'No data' }) {
    return (
        <div style={s.empty}>
            <span style={s.emptyText}>{label}</span>
        </div>
    );
}

function StatusPill({ status }) {
    const map = {
        Pending: { bg: '#EEF3FF', color: '#3451D1' },
        Approved: { bg: '#EBFBEE', color: '#2F9E44' },
        Review: { bg: '#FFF9DB', color: '#E67700' },
    };
    const t = map[status] || map.Pending;
    return (
        <span style={{ ...s.pill, background: t.bg, color: t.color }}>{status}</span>
    );
}

function initials(name = '') {
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

const s = {
    page: {
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    },
    topRow: {
        display: 'grid',
        gridTemplateColumns: '220px 1fr',
        gap: 14,
        alignItems: 'stretch',
    },
    kpiStrip: {
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
    },
    kpiCard: {
        flex: 1,
        background: '#fff',
        borderRadius: 12,
        padding: '14px 16px',
        border: '0.5px solid #E8EAF0',
        borderLeft: '3px solid',
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
    },
    kpiLabel: {
        fontSize: 10,
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.07em',
        color: '#8B8FA8',
    },
    kpiValue: {
        fontSize: 24,
        fontWeight: 700,
        color: '#1A1D2E',
        lineHeight: 1,
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
    badge: {
        fontSize: 10,
        fontWeight: 700,
        padding: '3px 8px',
        borderRadius: 6,
        background: '#EEF3FF',
        color: '#3451D1',
        letterSpacing: '0.04em',
    },
    chartWrap: {
        display: 'flex',
        alignItems: 'flex-end',
        gap: 8,
        height: 90,
        marginBottom: 8,
    },
    barCol: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        height: '100%',
        gap: 4,
    },
    barTrack: {
        flex: 1,
        width: '100%',
        display: 'flex',
        alignItems: 'flex-end',
    },
    bar: {
        width: '100%',
        borderRadius: '4px 4px 0 0',
        cursor: 'pointer',
        transition: 'background 0.15s, opacity 0.15s',
        minHeight: 4,
    },
    barLabel: {
        fontSize: 9,
        color: '#8B8FA8',
        textAlign: 'center',
        whiteSpace: 'nowrap',
    },
    midRow: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: 14,
    },
    regionName: { fontSize: 12, color: '#3D405B', fontWeight: 500 },
    regionPct: { fontSize: 12, fontWeight: 700, color: '#4361EE' },
    trackBar: {
        height: 4,
        borderRadius: 2,
        background: '#F0F1F7',
    },
    fillBar: {
        height: 4,
        borderRadius: 2,
        background: '#4361EE',
    },
    listRow: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '9px 0',
        borderBottom: '0.5px solid #F0F1F7',
    },
    avatar: {
        width: 30,
        height: 30,
        borderRadius: '50%',
        background: '#EEF3FF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 10,
        fontWeight: 700,
        color: '#3451D1',
        flexShrink: 0,
    },
    listName: { fontSize: 13, fontWeight: 500, color: '#1A1D2E', margin: 0 },
    listMeta: { fontSize: 11, color: '#8B8FA8', margin: '2px 0 0' },
    pill: {
        fontSize: 10,
        fontWeight: 700,
        padding: '3px 9px',
        borderRadius: 20,
        whiteSpace: 'nowrap',
    },
    resultScore: {
        fontSize: 15,
        fontWeight: 800,
    },
    empty: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '28px 0',
    },
    emptyText: {
        fontSize: 13,
        color: '#B0B3C6',
        fontStyle: 'italic',
    },
    viewAll: {
        fontSize: 11,
        fontWeight: 600,
        color: '#4361EE',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: 0,
    },
};
