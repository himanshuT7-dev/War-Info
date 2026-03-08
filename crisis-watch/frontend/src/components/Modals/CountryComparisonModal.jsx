import React, { useState, useEffect } from 'react';

export default function CountryComparisonModal({ isOpen, onClose }) {
    const [countryStats, setCountryStats] = useState({});
    const [country1, setCountry1] = useState('');
    const [country2, setCountry2] = useState('');
    const [country1History, setCountry1History] = useState(null);
    const [country2History, setCountry2History] = useState(null);

    useEffect(() => {
        if (isOpen && Object.keys(countryStats).length === 0) {
            fetch('/api/countries')
                .then(res => res.json())
                .then(json => {
                    if (json.data) setCountryStats(json.data);
                })
                .catch(err => console.error('Failed to fetch country stats for comparison:', err));
        }
    }, [isOpen, countryStats]);

    useEffect(() => {
        if (country1) {
            setCountry1History('Fetching Wikipedia context...');
            fetch(`/api/countries/${country1}`)
                .then(res => res.json())
                .then(json => {
                    const ctx = json.data?.conflictContext || json.data?.history;
                    setCountry1History(ctx && typeof ctx === 'string' ? ctx : null);
                })
                .catch(() => setCountry1History(null));
        } else {
            setCountry1History(null);
        }
    }, [country1]);

    useEffect(() => {
        if (country2) {
            setCountry2History('Fetching Wikipedia context...');
            fetch(`/api/countries/${country2}`)
                .then(res => res.json())
                .then(json => {
                    const ctx = json.data?.conflictContext || json.data?.history;
                    setCountry2History(ctx && typeof ctx === 'string' ? ctx : null);
                })
                .catch(() => setCountry2History(null));
        } else {
            setCountry2History(null);
        }
    }, [country2]);

    if (!isOpen) return null;

    const countriesList = Object.entries(countryStats)
        .map(([code, stats]) => ({ code, name: stats.name || code }))
        .sort((a, b) => a.name.localeCompare(b.name));

    const stats1 = country1 ? countryStats[country1] : null;
    const stats2 = country2 ? countryStats[country2] : null;

    const formatNumber = (num) => {
        if (!num) return 'Data Unavailable';
        if (typeof num === 'string') return num;
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toLocaleString();
    };

    const getComparisonColor = (val1, val2, invert = false) => {
        if (!val1 || !val2 || typeof val1 !== 'number' || typeof val2 !== 'number') return 'text-[var(--color-text-primary)]';
        if (val1 === val2) return 'text-[var(--color-text-primary)]';

        const isHigher = val1 > val2;
        const colorClass = (invert ? !isHigher : isHigher) ? 'text-[#00ff00]' : 'text-[#ff2b2b]';
        return colorClass;
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 fade-in">
            <div className="bg-[var(--color-bg-panel)] border border-[var(--color-border)] rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)] bg-[var(--color-bg-card)] rounded-t-2xl">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">⚖️</span>
                        <div>
                            <h2 className="text-lg font-bold text-[var(--color-text-primary)]">Country Power Comparison</h2>
                            <p className="text-xs text-[var(--color-text-dim)]">Compare military, economic, and demographic statistics.</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-[var(--color-border)] rounded-full transition-colors"
                    >
                        ✕
                    </button>
                </div>

                {/* Selectors */}
                <div className="grid grid-cols-2 gap-4 p-4 border-b border-[var(--color-border)] bg-[var(--color-bg-primary)]">
                    <div>
                        <label className="block text-[10px] font-bold text-[var(--color-text-dim)] uppercase tracking-wide mb-1">Country 1</label>
                        <select
                            value={country1}
                            onChange={(e) => setCountry1(e.target.value)}
                            className="w-full bg-[var(--color-bg-card)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-sm rounded-lg p-2.5 focus:border-[var(--color-accent)] outline-none"
                        >
                            <option value="">Select a country...</option>
                            {countriesList.map(c => (
                                <option key={c.code} value={c.code}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-[var(--color-text-dim)] uppercase tracking-wide mb-1">Country 2</label>
                        <select
                            value={country2}
                            onChange={(e) => setCountry2(e.target.value)}
                            className="w-full bg-[var(--color-bg-card)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-sm rounded-lg p-2.5 focus:border-[var(--color-accent)] outline-none"
                        >
                            <option value="">Select a country...</option>
                            {countriesList.map(c => (
                                <option key={c.code} value={c.code}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Comparison Grid */}
                <div className="flex-1 overflow-y-auto p-4">
                    {country1 && country2 ? (
                        <div className="space-y-6">

                            {/* Military Power */}
                            <div className="space-y-3">
                                <h3 className="text-xs font-bold text-[var(--color-accent)] uppercase tracking-widest border-b border-[var(--color-border)] pb-2">Military Power</h3>

                                <div className="grid grid-cols-3 items-center gap-4 p-3 bg-[var(--color-bg-card)] rounded-xl">
                                    <div className={`text-right font-bold text-lg ${getComparisonColor(stats1?.activePersonnel, stats2?.activePersonnel)}`}>
                                        {formatNumber(stats1?.activePersonnel)}
                                    </div>
                                    <div className="text-center text-[10px] font-bold text-[var(--color-text-dim)] uppercase tracking-wider">Active Personnel</div>
                                    <div className={`text-left font-bold text-lg ${getComparisonColor(stats2?.activePersonnel, stats1?.activePersonnel)}`}>
                                        {formatNumber(stats2?.activePersonnel)}
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 items-center gap-4 p-3 bg-[var(--color-bg-card)] rounded-xl">
                                    <div className="text-right font-bold text-base text-[var(--color-text-secondary)]">
                                        {formatNumber(stats1?.reservePersonnel)}
                                    </div>
                                    <div className="text-center text-[10px] font-bold text-[var(--color-text-dim)] uppercase tracking-wider">Reserve Personnel</div>
                                    <div className="text-left font-bold text-base text-[var(--color-text-secondary)]">
                                        {formatNumber(stats2?.reservePersonnel)}
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 items-center gap-4 p-3 bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-danger)]/20 relative overflow-hidden">
                                    <div className={`text-right font-bold text-xl ${getComparisonColor(stats1?.warheads, stats2?.warheads)}`}>
                                        {formatNumber(stats1?.warheads) || '0'}
                                    </div>
                                    <div className="text-center text-[10px] font-bold text-[var(--color-danger)] uppercase tracking-wider">Nuclear Warheads</div>
                                    <div className={`text-left font-bold text-xl ${getComparisonColor(stats2?.warheads, stats1?.warheads)}`}>
                                        {formatNumber(stats2?.warheads) || '0'}
                                    </div>
                                    {/* Radioactive background glow if either has nukes */}
                                    {(stats1?.warheads > 0 || stats2?.warheads > 0) && (
                                        <div className="absolute inset-0 bg-[var(--color-danger)]/5 pointer-events-none custom-pulse"></div>
                                    )}
                                </div>
                            </div>

                            {/* Economy & Defense */}
                            <div className="space-y-3 mt-6">
                                <h3 className="text-xs font-bold text-[#00b4ff] uppercase tracking-widest border-b border-[var(--color-border)] pb-2">Economy & Defense Budget</h3>

                                <div className="grid grid-cols-3 items-center gap-4 p-3 bg-[var(--color-bg-card)] rounded-xl">
                                    <div className={`text-right font-bold text-base ${getComparisonColor(stats1?.gdp, stats2?.gdp)}`}>
                                        {stats1?.gdp ? formatNumber(stats1.gdp) : 'Data Unavailable'}
                                    </div>
                                    <div className="text-center text-[10px] font-bold text-[var(--color-text-dim)] uppercase tracking-wider">GDP (USD)</div>
                                    <div className={`text-left font-bold text-base ${getComparisonColor(stats2?.gdp, stats1?.gdp)}`}>
                                        {stats2?.gdp ? formatNumber(stats2.gdp) : 'Data Unavailable'}
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 items-center gap-4 p-3 bg-[var(--color-bg-card)] rounded-xl">
                                    <div className={`text-right font-bold text-base ${getComparisonColor(stats1?.budget, stats2?.budget)}`}>
                                        {stats1?.budget ? formatNumber(stats1.budget) : 'Data Unavailable'}
                                    </div>
                                    <div className="text-center text-[10px] font-bold text-[var(--color-text-dim)] uppercase tracking-wider">Defense Budget</div>
                                    <div className={`text-left font-bold text-base ${getComparisonColor(stats2?.budget, stats1?.budget)}`}>
                                        {stats2?.budget ? formatNumber(stats2.budget) : 'Data Unavailable'}
                                    </div>
                                </div>
                            </div>

                            {/* Known Conflicts */}
                            <div className="space-y-3 mt-6">
                                <h3 className="text-xs font-bold text-[var(--color-warning)] uppercase tracking-widest border-b border-[var(--color-border)] pb-2">Known History</h3>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="bg-[var(--color-bg-card)] rounded-xl p-4">
                                        <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                                            {country1History || `${country1} has not been explicitly analyzed for active major conflicts in our index, or Wikipedia data is currently unavailable.`}
                                        </p>
                                    </div>
                                    <div className="bg-[var(--color-bg-card)] rounded-xl p-4">
                                        <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                                            {country2History || `${country2} has not been explicitly analyzed for active major conflicts in our index, or Wikipedia data is currently unavailable.`}
                                        </p>
                                    </div>
                                </div>
                            </div>

                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-[var(--color-text-dim)] space-y-4 py-12">
                            <span className="text-6xl opacity-50">⚖️</span>
                            <p className="text-sm">Select two countries above to compare metrics side-by-side.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
