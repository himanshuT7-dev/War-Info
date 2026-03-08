import React from 'react';
import ThreatBadge from '../shared/ThreatBadge';
import DataTimestamp from '../shared/DataTimestamp';
import { REGIONS, REGION_KEYS } from '../../utils/regionBounds';

const REGION_ICONS = {
    ukraine: '🇺🇦',
    gaza: '🇵🇸',
    iran: '🇮🇷',
    sudan: '🇸🇩',
    afghanistan: '🇦🇫',
    myanmar: '🇲🇲',
    ethiopia: '🇪🇹',
    drc: '🇨🇩',
    somalia: '🇸🇴',
    yemen: '🇾🇪',
    global: '🌍'
};

function calculateRegionThreat(reports = [], disasters = []) {
    if (!reports.length && !disasters.length) return { level: 'LOW', color: '#00e676', score: 0 };
    let score = reports.length * 2 + disasters.length * 5;
    reports.forEach(r => {
        const t = (r.title || '').toLowerCase();
        if (t.includes('killed') || t.includes('massacre')) score += 10;
        else if (t.includes('attack') || t.includes('airstrike')) score += 7;
        else if (t.includes('conflict') || t.includes('violence')) score += 5;
    });
    const norm = Math.min(100, score / Math.max(1, reports.length));
    if (norm >= 60) return { level: 'CRITICAL', color: '#ff2b2b', score: norm };
    if (norm >= 40) return { level: 'HIGH', color: '#ff7b00', score: norm };
    if (norm >= 20) return { level: 'MODERATE', color: '#ff7b00', score: norm };
    return { level: 'LOW', color: '#00e676', score: norm };
}

function formatNumber(num) {
    if (!num && num !== 0) return '—';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
}

function daysSince(dateStr) {
    if (!dateStr) return null;
    const start = new Date(dateStr);
    const now = new Date();
    return Math.floor((now - start) / (1000 * 60 * 60 * 24));
}

export default function ThreatPanel({
    selectedRegion, onSelectRegion,
    selectedCountry, onSelectCountry,
    reports = [], disasters = [], stats,
    lastUpdated, isCached,
    casualties, casualtiesLoading,
    news = [], newsLoading,
    tensions = [], tensionsLoading,
    cyberEvents = []
}) {
    const regionThreat = calculateRegionThreat(reports, disasters);
    const region = REGIONS[selectedRegion] || REGIONS.global;

    const availableCountries = React.useMemo(() => {
        if (region.countries && region.countries.length > 0) return region.countries;
        const countries = new Set();
        reports.forEach(r => { if (r.country) countries.add(r.country); });
        disasters.forEach(d => { if (d.country) countries.add(d.country); });
        return Array.from(countries).sort();
    }, [region.countries, reports, disasters]);

    const recentReports = [...reports].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 6);
    const conflictDays = casualties?.startDate ? daysSince(casualties.startDate) : null;

    return (
        <div className="h-full w-full flex flex-col sidebar border-r border-[var(--color-border)]">
            {/* Header */}
            <div className="sidebar-header">
                <span className="text-base">📡</span>
                <span>Threat Intelligence</span>
            </div>

            {/* Region Tabs (War Situations) */}
            <div className="bg-[var(--color-bg-primary)]">
                <div className="px-3 pt-2 text-[10px] font-bold text-[var(--color-text-dim)] uppercase tracking-widest border-b border-[var(--color-border)] pb-1">Select War Situation</div>
                <div className="grid grid-cols-5 border-b border-[var(--color-border)]">
                    {REGION_KEYS.map(key => (
                        <button
                            key={key}
                            onClick={() => onSelectRegion(key)}
                            className={`flex flex-col items-center gap-0.5 py-2.5 text-center transition-all border-b-2 ${selectedRegion === key
                                ? 'bg-[var(--color-accent-dim)] border-[var(--color-accent)] text-[var(--color-accent)]'
                                : 'border-transparent text-[var(--color-text-dim)] hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-card)]'
                                }`}
                            id={`region-tab-${key}`}
                        >
                            <span className="text-base leading-none">{REGION_ICONS[key]}</span>
                            <span className="text-[9px] font-bold uppercase tracking-wider leading-tight">
                                {({ ukraine: 'UKR', gaza: 'GAZA', iran: 'IRAN', sudan: 'SUDAN', afghanistan: 'AFG', myanmar: 'MMR', ethiopia: 'ETH', drc: 'DRC', somalia: 'SOM', yemen: 'YMN', global: 'ALL' })[key] || key.toUpperCase()}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Country Filter */}
            {availableCountries.length > 0 && (
                <div className="p-3 border-b border-[var(--color-border)] bg-[var(--color-bg-panel)]">
                    <label className="block text-[10px] font-bold text-[var(--color-text-dim)] uppercase tracking-widest mb-1.5 flex items-center justify-between">
                        <span>Filter by Country</span>
                        {selectedCountry !== 'All' && <span className="text-[8px] bg-[var(--color-accent)] text-black px-1.5 py-0.5 rounded">ACTIVE FILTER</span>}
                    </label>
                    <select
                        value={selectedCountry || 'All'}
                        onChange={e => onSelectCountry(e.target.value)}
                        className="w-full bg-[var(--color-bg-primary)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-xs rounded py-1.5 px-2 focus:border-[var(--color-accent)] focus:outline-none"
                    >
                        <option value="All">All Countries in Region</option>
                        {availableCountries.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
            )}

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {/* Threat Level Card */}
                <div className="panel-card flex items-center justify-between">
                    <div>
                        <div className="text-[10px] font-bold text-[var(--color-text-dim)] uppercase tracking-widest mb-1">Region Status</div>
                        <div className="text-lg font-bold text-[var(--color-text-primary)]">{region.name}</div>
                    </div>
                    <ThreatBadge level={regionThreat.level} size="lg" />
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-2 gap-2">
                    <div className="panel-card text-center">
                        <div className="text-[9px] font-bold text-[var(--color-text-dim)] uppercase tracking-widest mb-1.5">Reports (24h)</div>
                        <div className="text-3xl font-bold text-[var(--color-accent)] font-[family-name:var(--font-mono)] leading-none">
                            {stats?.totalReports || reports.length || 0}
                        </div>
                    </div>
                    <div className="panel-card text-center">
                        <div className="text-[9px] font-bold text-[var(--color-text-dim)] uppercase tracking-widest mb-1.5">Active Crises</div>
                        <div className="text-3xl font-bold text-[var(--color-danger)] font-[family-name:var(--font-mono)] leading-none">
                            {stats?.totalDisasters || disasters.length || 0}
                        </div>
                    </div>
                </div>

                <DataTimestamp timestamp={lastUpdated} cached={isCached} />

                {/* Casualties Card — Dynamic from Wikipedia */}
                {casualties && (
                    <div>
                        <div className="panel-section-title">☠️ Casualties — {casualties.conflictName}</div>
                        <div className="panel-card space-y-2">
                            <div className="grid grid-cols-2 gap-2">
                                <div className="bg-[var(--color-danger-dim)] rounded p-2 text-center">
                                    <div className="text-[8px] font-bold text-[var(--color-danger)] uppercase tracking-widest mb-0.5">Total Killed</div>
                                    <div className="text-xl font-bold text-[var(--color-danger)] font-[family-name:var(--font-mono)]">
                                        {formatNumber(casualties.totalKilled)}
                                    </div>
                                </div>
                                <div className="bg-[var(--color-warning-dim)] rounded p-2 text-center">
                                    <div className="text-[8px] font-bold text-[var(--color-warning)] uppercase tracking-widest mb-0.5">Displaced</div>
                                    <div className="text-xl font-bold text-[var(--color-warning)] font-[family-name:var(--font-mono)]">
                                        {formatNumber(casualties.totalDisplaced)}
                                    </div>
                                </div>
                            </div>
                            {casualties.totalWounded && (
                                <div className="bg-[var(--color-bg-primary)] rounded p-2 text-center">
                                    <div className="text-[8px] font-bold text-[var(--color-text-dim)] uppercase tracking-widest mb-0.5">Wounded</div>
                                    <div className="text-lg font-bold text-[var(--color-text-primary)] font-[family-name:var(--font-mono)]">
                                        {formatNumber(casualties.totalWounded)}
                                    </div>
                                </div>
                            )}
                            <div className="flex items-center justify-between text-[9px] text-[var(--color-text-dim)] mt-1">
                                <span>Since {casualties.startDate ? new Date(casualties.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}</span>
                                {conflictDays && <span className="font-[family-name:var(--font-mono)]">Day {conflictDays.toLocaleString()}</span>}
                            </div>
                            {casualties.parties && (
                                <div className="flex gap-1 flex-wrap">
                                    {casualties.parties.map(p => (
                                        <span key={p} className="text-[8px] px-1.5 py-0.5 rounded bg-[var(--color-bg-primary)] text-[var(--color-text-secondary)] border border-[var(--color-border)]">{p}</span>
                                    ))}
                                </div>
                            )}
                            {casualties.sourceUrl && (
                                <a href={casualties.sourceUrl} target="_blank" rel="noopener noreferrer"
                                    className="block text-[8px] text-[var(--color-accent)] hover:underline mt-1">
                                    📖 Source: {casualties.source} →
                                </a>
                            )}
                        </div>
                    </div>
                )}
                {casualtiesLoading && (
                    <div className="panel-card text-center py-4">
                        <div className="text-xl mb-1">⏳</div>
                        <div className="text-[10px] text-[var(--color-text-dim)]">Loading casualties data...</div>
                    </div>
                )}

                {/* Active Crises */}
                {disasters.length > 0 && (
                    <div>
                        <div className="panel-section-title">Active Crises</div>
                        <div className="space-y-1.5">
                            {disasters.slice(0, 4).map((d, i) => (
                                <div key={d.id || i} className="panel-card !py-2.5 !px-3 flex items-center gap-3" style={{ borderLeftColor: '#ff2b2b', borderLeftWidth: '3px' }}>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-[12px] font-bold text-[var(--color-text-primary)] leading-snug truncate">{d.name}</div>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="status-badge text-[8px] px-1.5 py-0" style={{ background: 'var(--color-warning-dim)', color: 'var(--color-warning)' }}>{d.type}</span>
                                            <span className="text-[10px] font-[family-name:var(--font-mono)] text-[var(--color-text-dim)]">{d.country}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Cyber & Infrastructure Alerts */}
                {cyberEvents.length > 0 && (
                    <div>
                        <div className="panel-section-title">🔌 Infrastructure Alerts</div>
                        <div className="space-y-1.5">
                            {cyberEvents.map((event, i) => (
                                <div key={event.id || i} className="panel-card !py-2.5 !px-3 flex items-start gap-3 fade-in" style={{ borderLeftColor: event.severity === 'critical' ? '#ff2b2b' : event.severity === 'high' ? '#ff7b00' : '#d4d400', borderLeftWidth: '3px' }}>
                                    <div className="text-lg shrink-0 mt-0.5">{event.type.includes('Telecom') ? '📡' : event.type.includes('Power') ? '⚡' : '💻'}</div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-[12px] font-bold text-[var(--color-text-primary)] leading-snug truncate">{event.type}</div>
                                        <div className="text-[10px] text-[var(--color-text-secondary)] mt-1 mb-1.5 leading-relaxed">{event.description}</div>
                                        <div className="flex items-center gap-2">
                                            <span className="status-badge text-[8px] px-1.5 py-0 uppercase tracking-widest" style={{
                                                background: event.severity === 'critical' ? 'var(--color-danger-dim)' : event.severity === 'high' ? 'var(--color-warning-dim)' : 'var(--color-bg-primary)',
                                                color: event.severity === 'critical' ? 'var(--color-danger)' : event.severity === 'high' ? 'var(--color-warning)' : 'var(--color-text-secondary)'
                                            }}>Severity: {event.severity}</span>
                                            <span className="text-[9px] font-[family-name:var(--font-mono)] text-[var(--color-text-dim)]">{new Date(event.timestamp).toLocaleTimeString()}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Latest Reports */}
                <div>
                    <div className="panel-section-title">Latest Reports</div>
                    <div className="space-y-1.5">
                        {recentReports.length > 0 ? recentReports.map((report, i) => (
                            <a
                                key={report.id || i}
                                href={report.url || '#'}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block panel-card !py-2.5 !px-3 hover:!border-[var(--color-accent)] cursor-pointer fade-in group"
                            >
                                <div className="text-[11px] font-bold text-[var(--color-text-primary)] leading-snug line-clamp-2 group-hover:text-[var(--color-accent)] transition-colors">
                                    {report.title}
                                </div>
                                <div className="flex items-center gap-1.5 mt-1.5">
                                    <span className="text-[9px] font-[family-name:var(--font-mono)] text-[var(--color-accent)]">{report.source}</span>
                                    <span className="text-[var(--color-text-dim)]">·</span>
                                    <span className="text-[9px] font-[family-name:var(--font-mono)] text-[var(--color-text-dim)]">{report.country}</span>
                                    <span className="text-[var(--color-text-dim)]">·</span>
                                    <span className="text-[9px] font-[family-name:var(--font-mono)] text-[var(--color-text-dim)]">
                                        {report.date ? new Date(report.date).toLocaleDateString() : '—'}
                                    </span>
                                </div>
                            </a>
                        )) : (
                            <div className="panel-card text-center py-6">
                                <div className="text-2xl mb-2">📡</div>
                                <div className="text-xs text-[var(--color-text-secondary)]">
                                    {reports.length === 0 ? 'No reports available — API may be unreachable' : 'Fetching reports...'}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Global News Section */}
                {news.length > 0 && (
                    <div>
                        <div className="panel-section-title">🌐 Conflict News</div>
                        <div className="space-y-1.5">
                            {news.slice(0, 8).map((item, i) => (
                                <a
                                    key={item.id || i}
                                    href={item.url || '#'}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block panel-card !py-2 !px-3 hover:!border-[var(--color-accent)] cursor-pointer group"
                                >
                                    <div className="text-[11px] font-bold text-[var(--color-text-primary)] leading-snug line-clamp-2 group-hover:text-[var(--color-accent)] transition-colors">
                                        {item.title}
                                    </div>
                                    {item.snippet && (
                                        <div className="text-[9px] text-[var(--color-text-dim)] mt-1 line-clamp-2 leading-relaxed">
                                            {item.snippet}
                                        </div>
                                    )}
                                    <div className="flex items-center gap-1.5 mt-1">
                                        <span className={`text-[8px] px-1 py-0 rounded ${item.type === 'news' ? 'bg-[var(--color-accent-dim)] text-[var(--color-accent)]' : 'bg-[var(--color-bg-primary)] text-[var(--color-text-dim)]'}`}>
                                            {item.type === 'news' ? '📰 NEWS' : '📖 WIKI'}
                                        </span>
                                        <span className="text-[9px] font-[family-name:var(--font-mono)] text-[var(--color-text-dim)]">{item.source}</span>
                                        {item.date && (
                                            <>
                                                <span className="text-[var(--color-text-dim)]">·</span>
                                                <span className="text-[9px] font-[family-name:var(--font-mono)] text-[var(--color-text-dim)]">
                                                    {new Date(item.date).toLocaleDateString()}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>
                )}
                {newsLoading && news.length === 0 && (
                    <div className="panel-card text-center py-4">
                        <div className="text-xl mb-1">📰</div>
                        <div className="text-[10px] text-[var(--color-text-dim)]">Loading conflict news...</div>
                    </div>
                )}

                {/* Geopolitical Tensions */}
                {tensions.length > 0 && (
                    <div>
                        <div className="panel-section-title">⚡ Geopolitical Tensions</div>
                        <div className="space-y-1.5">
                            {tensions.slice(0, 6).map((item, i) => (
                                <a
                                    key={item.id || i}
                                    href={item.url || '#'}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block panel-card !py-2 !px-3 hover:!border-[var(--color-accent)] cursor-pointer group"
                                >
                                    <div className="text-[11px] font-bold text-[var(--color-text-primary)] leading-snug line-clamp-2 group-hover:text-[var(--color-accent)] transition-colors">
                                        {item.title}
                                    </div>
                                    {item.snippet && (
                                        <div className="text-[9px] text-[var(--color-text-dim)] mt-1 line-clamp-2 leading-relaxed">
                                            {item.snippet}
                                        </div>
                                    )}
                                    {item.date && (
                                        <div className="text-[9px] font-[family-name:var(--font-mono)] text-[var(--color-text-dim)] mt-1">
                                            {new Date(item.date).toLocaleDateString()}
                                        </div>
                                    )}
                                </a>
                            ))}
                        </div>
                    </div>
                )}
                {tensionsLoading && tensions.length === 0 && (
                    <div className="panel-card text-center py-4">
                        <div className="text-xl mb-1">⚡</div>
                        <div className="text-[10px] text-[var(--color-text-dim)]">Loading geopolitical tensions...</div>
                    </div>
                )}

                {/* Border Crossings */}
                {region.borderCrossings?.length > 0 && (
                    <div>
                        <div className="panel-section-title">Border Crossings</div>
                        <div className="panel-card !p-0 overflow-hidden">
                            <table className="w-full text-xs">
                                <thead>
                                    <tr className="bg-[var(--color-bg-primary)]">
                                        <th className="text-left py-2 px-3 text-[9px] font-bold text-[var(--color-text-dim)] uppercase tracking-widest">Crossing</th>
                                        <th className="text-center py-2 px-2 text-[9px] font-bold text-[var(--color-text-dim)] uppercase tracking-widest">Status</th>
                                        <th className="text-right py-2 px-3 text-[9px] font-bold text-[var(--color-text-dim)] uppercase tracking-widest">Wait</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {region.borderCrossings.map((c, i) => (
                                        <tr key={i} className="border-t border-[var(--color-border)] hover:bg-[var(--color-bg-panel-hover)] transition-colors">
                                            <td className="py-2 px-3">
                                                <div className="font-medium text-[var(--color-text-primary)]">{c.name}</div>
                                                <div className="text-[9px] text-[var(--color-text-dim)]">{c.country}</div>
                                            </td>
                                            <td className="py-2 px-2 text-center">
                                                <span className={`status-badge text-[8px] ${c.status === 'open' ? 'bg-[var(--color-safe-dim)] text-[var(--color-safe)]' :
                                                    c.status === 'closed' ? 'bg-[var(--color-danger-dim)] text-[var(--color-danger)]' :
                                                        'bg-[var(--color-warning-dim)] text-[var(--color-warning)]'
                                                    }`}>
                                                    {c.status}
                                                </span>
                                            </td>
                                            <td className="py-2 px-3 text-right font-[family-name:var(--font-mono)] text-[var(--color-text-secondary)] text-[10px]">
                                                {c.waitTime}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Disclaimer */}
                <div className="panel-card !bg-[var(--color-warning-dim)] !border-[var(--color-warning)]/20 text-[10px] text-[var(--color-warning)] leading-relaxed flex items-start gap-2">
                    <span className="text-sm leading-none mt-px">⚠️</span>
                    <span>Data sourced from Wikipedia, GDELT & OpenSky. Always verify with local authorities. This tool does not replace official emergency services.</span>
                </div>
            </div>
        </div>
    );
}
