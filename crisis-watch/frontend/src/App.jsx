import React, { useState, useCallback, useMemo } from 'react';
import CrisisMap from './components/Map/CrisisMap';
import ThreatPanel from './components/Sidebar/ThreatPanel';
import EvacuationTools from './components/Sidebar/EvacuationTools';
import GlobalStatus from './components/TopBar/GlobalStatus';
import AlertTicker from './components/TopBar/AlertTicker';
import EmergencyContacts from './components/shared/EmergencyContacts';
import CountryComparisonModal from './components/Modals/CountryComparisonModal';
import { useReliefWeb } from './hooks/useReliefWeb';
import { useOpenSky } from './hooks/useOpenSky';
import { useUNHCR } from './hooks/useUNHCR';
import { useCasualties } from './hooks/useCasualties';
import { useNews } from './hooks/useNews';
import useTensions from './hooks/useTensions';
import { useACLED } from './hooks/useACLED';
import { useCyber } from './hooks/useCyber';
import { REGIONS } from './utils/regionBounds';

function calculateGlobalThreat(reports = [], disasters = []) {
    if (!reports.length && !disasters.length) return { level: 'LOW' };
    let score = reports.length * 2 + disasters.length * 5;
    reports.forEach(r => {
        const t = (r.title || '').toLowerCase();
        if (t.includes('killed') || t.includes('massacre')) score += 10;
        else if (t.includes('attack') || t.includes('airstrike')) score += 7;
        else if (t.includes('conflict') || t.includes('violence')) score += 5;
    });
    const norm = Math.min(100, score / Math.max(1, reports.length));
    if (norm >= 60) return { level: 'CRITICAL' };
    if (norm >= 40) return { level: 'HIGH' };
    if (norm >= 20) return { level: 'MODERATE' };
    return { level: 'LOW' };
}

export default function App() {
    const [selectedRegion, setSelectedRegion] = useState('ukraine');
    const [selectedCountry, setSelectedCountry] = useState('All');
    const [showSettings, setShowSettings] = useState(false);
    const [showComparison, setShowComparison] = useState(false);
    const [showAbout, setShowAbout] = useState(false);
    const [mobilePanel, setMobilePanel] = useState(null);
    const [settings, setSettings] = useState(() => {
        const saved = localStorage.getItem('warinfo_settings');
        return saved ? JSON.parse(saved) : { notificationsAlerts: true, hardwareAcceleration: true };
    });
    const [layers, setLayers] = useState({
        strikes: true,
        corridors: true,
        shelters: true,
        flights: false,
        heatmap: false,
        cyber: true
    });

    const region = REGIONS[selectedRegion] || REGIONS.global;

    // Data hooks
    const { reports, disasters, stats, loading: rwLoading, lastUpdated: rwUpdated, isCached: rwCached } = useReliefWeb(region, settings);
    const { aircraft, lastUpdated: flightsUpdated, isCached: flightsCached } = useOpenSky(region);
    const { shelters, lastUpdated: sheltersUpdated, isCached: sheltersCached } = useUNHCR(region);
    // Casualties refresh with same cadence as other intel (uses settings.refreshRate seconds, fallback 30 min)
    const { casualties, loading: casualtiesLoading } = useCasualties(selectedRegion, settings.refreshRate || 1800);
    const { news, loading: newsLoading } = useNews(selectedRegion);
    const { tensions, loading: tensionsLoading } = useTensions();
    const { events: acledEvents, loading: acledLoading } = useACLED(region, settings);
    const { cyberEvents, loading: cyberLoading } = useCyber(region);

    const filteredReports = useMemo(() => {
        let list = reports;
        if (selectedCountry !== 'All') {
            list = reports.filter(r => r.countries?.includes(selectedCountry) || r.country === selectedCountry);
        }
        // Cap displayed reports for global view to reduce lag
        if (selectedRegion === 'global' && list.length > 25) {
            return list.slice(0, 25);
        }
        return list;
    }, [reports, selectedCountry, selectedRegion]);

    const filteredDisasters = useMemo(() => {
        if (selectedCountry === 'All') return disasters;
        return disasters.filter(d => d.countries?.includes(selectedCountry) || d.country === selectedCountry);
    }, [disasters, selectedCountry]);

    const filteredAircraft = useMemo(() => {
        let list = aircraft;
        if (selectedCountry !== 'All') {
            list = aircraft.filter(a => a.originCountry === selectedCountry || (a.originCountry && selectedCountry.includes(a.originCountry)));
        }
        // Cap displayed aircraft for global view to reduce lag
        if (selectedRegion === 'global' && list.length > 25) {
            return list.slice(0, 25);
        }
        return list;
    }, [aircraft, selectedCountry, selectedRegion]);

    const filteredShelters = useMemo(() => {
        if (selectedCountry === 'All') return shelters;
        return shelters.filter(s => s.country === selectedCountry);
    }, [shelters, selectedCountry]);

    const globalThreat = useMemo(() => calculateGlobalThreat(reports, disasters), [reports, disasters]);

    const handleRegionChange = useCallback((newRegion) => {
        setSelectedRegion(newRegion);
        setSelectedCountry('All');
        // In global view, default flights off to reduce visual noise & lag
        setLayers(prev => ({
            ...prev,
            flights: newRegion === 'global' ? false : prev.flights
        }));
    }, []);

    const toggleLayer = useCallback((layer) => {
        setLayers(prev => ({ ...prev, [layer]: !prev[layer] }));
    }, []);

    const saveSettings = useCallback((newSettings) => {
        setSettings(newSettings);
        localStorage.setItem('warinfo_settings', JSON.stringify(newSettings));
    }, []);

    const layerToggles = [
        { key: 'strikes', label: '🔴 Strikes', active: layers.strikes },
        { key: 'corridors', label: '🟡 Corridors', active: layers.corridors },
        { key: 'shelters', label: '🟢 Shelters', active: layers.shelters },
        { key: 'flights', label: '✈️ Flights', active: layers.flights },
        { key: 'heatmap', label: '🔥 Heatmap', active: layers.heatmap },
        { key: 'cyber', label: '🔌 Cyber', active: layers.cyber }
    ];

    return (
        <div className="h-full w-full flex flex-col bg-[var(--color-bg-primary)]">
            {/* Top Bar */}
            <GlobalStatus
                threatLevel={globalThreat}
                onOpenSettings={() => setShowSettings(true)}
                onOpenComparison={() => setShowComparison(true)}
                onOpenAbout={() => setShowAbout(true)}
            />
            <AlertTicker reports={reports} />

            {/* Main Content */}
            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
                {/* Left Sidebar - Threat Intel (Desktop Only / Mobile Bottom Sheet) */}
                <div className="hidden lg:flex w-80 border-r border-[var(--color-border)] flex-col bg-[var(--color-bg-panel)] z-10 shadow-2xl overflow-hidden relative">
                    <ThreatPanel
                        selectedRegion={selectedRegion}
                        onSelectRegion={handleRegionChange}
                        selectedCountry={selectedCountry}
                        onSelectCountry={setSelectedCountry}
                        reports={reports}
                        disasters={disasters}
                        casualties={casualties}
                        casualtiesLoading={casualtiesLoading}
                        news={news}
                        newsLoading={newsLoading}
                        tensions={tensions}
                        tensionsLoading={tensionsLoading}
                        stats={stats}
                        lastUpdated={rwUpdated}
                        isCached={rwCached}
                        cyberEvents={cyberEvents}
                        regionOptions={Object.keys(REGIONS).map(k => ({ id: k, name: REGIONS[k].name }))}
                    />
                </div>

                {/* Map Area */}
                <div className="flex-1 relative pb-[60px] lg:pb-0">
                    <CrisisMap
                        region={region}
                        events={filteredReports}
                        aircraft={filteredAircraft}
                        shelters={filteredShelters}
                        acledEvents={acledEvents}
                        cyberEvents={cyberEvents}
                        layers={layers}
                    />

                    {/* Layer Toggles - Floating */}
                    <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-1">
                        {layerToggles.map(layer => (
                            <button
                                key={layer.key}
                                onClick={() => toggleLayer(layer.key)}
                                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold backdrop-blur-sm transition-all ${layer.active
                                    ? 'bg-[var(--color-bg-panel)]/90 text-[var(--color-text-primary)] border border-[var(--color-accent)]/50'
                                    : 'bg-[var(--color-bg-panel)]/50 text-[var(--color-text-dim)] border border-[var(--color-border)]'
                                    }`}
                                id={`layer-toggle-${layer.key}`}
                            >
                                {layer.label}
                            </button>
                        ))}
                    </div>

                    {/* Mobile: Bottom Navigation Bar */}
                    <div className="lg:hidden absolute bottom-0 left-0 right-0 bg-[var(--color-bg-panel)] border-t border-[var(--color-border)] z-[2000] flex justify-around items-center pb-safe pt-1">
                        <button
                            onClick={() => setMobilePanel(mobilePanel === 'threat' ? null : 'threat')}
                            className={`flex flex-col items-center justify-center w-full py-2 transition-colors ${mobilePanel === 'threat' ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-dim)]'}`}
                        >
                            <span className="text-xl mb-1">📡</span>
                            <span className="text-[10px] font-bold uppercase tracking-wider">Intel</span>
                        </button>
                        <button
                            onClick={() => setMobilePanel(mobilePanel === 'evac' ? null : 'evac')}
                            className={`flex flex-col items-center justify-center w-full py-2 transition-colors ${mobilePanel === 'evac' ? 'text-[var(--color-safe)]' : 'text-[var(--color-text-dim)]'}`}
                        >
                            <span className="text-xl mb-1">🗺️</span>
                            <span className="text-[10px] font-bold uppercase tracking-wider">Evac</span>
                        </button>
                        <button
                            onClick={() => setMobilePanel(mobilePanel === 'layers' ? null : 'layers')}
                            className={`flex flex-col items-center justify-center w-full py-2 transition-colors ${mobilePanel === 'layers' ? 'text-[var(--color-warning)]' : 'text-[var(--color-text-dim)]'}`}
                        >
                            <span className="text-xl mb-1">⚙️</span>
                            <span className="text-[10px] font-bold uppercase tracking-wider">Layers</span>
                        </button>
                    </div>

                    {/* Mobile bottom sheet */}
                    {mobilePanel && (
                        <div className="lg:hidden absolute bottom-[60px] left-0 right-0 z-[1999] h-[65vh] flex flex-col bg-[var(--color-bg-panel)] border-t border-[var(--color-border)] rounded-t-2xl shadow-[0_-10px_40px_rgba(0,0,0,0.8)] slide-up overflow-hidden">
                            <div className="flex-none p-2 flex justify-center border-b border-[var(--color-border)]/50">
                                <div className="w-12 h-1.5 rounded-full bg-[var(--color-border-bright)]" />
                            </div>
                            <div className="flex-1 overflow-y-auto w-full relative">
                                {mobilePanel === 'threat' && (
                                    <ThreatPanel
                                        selectedRegion={selectedRegion}
                                        onSelectRegion={handleRegionChange}
                                        selectedCountry={selectedCountry}
                                        onSelectCountry={setSelectedCountry}
                                        reports={filteredReports}
                                        disasters={filteredDisasters}
                                        stats={stats}
                                        lastUpdated={rwUpdated}
                                        isCached={rwCached}
                                        casualties={casualties}
                                        casualtiesLoading={casualtiesLoading}
                                        news={news}
                                        newsLoading={newsLoading}
                                        tensions={tensions}
                                        tensionsLoading={tensionsLoading}
                                    />
                                )}
                                {mobilePanel === 'evac' && (
                                    <EvacuationTools selectedRegion={selectedRegion} />
                                )}
                                {mobilePanel === 'layers' && (
                                    <div className="p-4 space-y-2">
                                        <h3 className="text-sm font-bold text-[var(--color-text-secondary)] uppercase mb-2">Map Layers</h3>
                                        {layerToggles.map(layer => (
                                            <button
                                                key={layer.key}
                                                onClick={() => toggleLayer(layer.key)}
                                                className={`w-full px-4 py-2.5 rounded-lg text-sm font-bold text-left transition-all ${layer.active
                                                    ? 'bg-[var(--color-accent-dim)] text-[var(--color-accent)] border border-[var(--color-accent)]/30'
                                                    : 'bg-[var(--color-bg-primary)] text-[var(--color-text-dim)] border border-[var(--color-border)]'
                                                    }`}
                                            >
                                                {layer.label} {layer.active ? '✓' : ''}
                                            </button>
                                        ))}
                                        <div className="mt-4 pt-3 border-t border-[var(--color-border)]">
                                            <EmergencyContacts contacts={region.emergencyContacts} regionName={region.name} />
                                        </div>
                                    </div>
                                )}
                                <button
                                    onClick={() => setMobilePanel(null)}
                                    className="absolute top-2 right-4 text-[var(--color-text-dim)] hover:text-white"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Sidebar - Evacuation Tools (Desktop Only / Mobile Bottom Sheet) */}
                <div className="hidden lg:flex w-80 bg-[var(--color-bg-panel)] z-10 shadow-[-10px_0_15px_-3px_rgba(0,0,0,0.5)]">
                    <EvacuationTools selectedRegion={selectedRegion} />
                </div>
            </div>

            {/* Settings Modal */}
            {showSettings && (
                <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/60 backdrop-blur-sm fade-in">
                    <div className="w-full max-w-md mx-4 bg-[var(--color-bg-panel)] border border-[var(--color-border)] rounded-xl shadow-2xl overflow-hidden">
                        <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)]">
                            <h2 className="text-lg font-bold uppercase tracking-wider">⚙️ Settings</h2>
                            <button
                                onClick={() => setShowSettings(false)}
                                className="p-1 rounded hover:bg-[var(--color-bg-panel-hover)] text-[var(--color-text-secondary)]"
                                id="close-settings-btn"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="p-4 space-y-4">
                            <div className="p-3 rounded bg-[var(--color-safe-dim)] border border-[var(--color-safe)]/20 text-xs text-[var(--color-safe)]">
                                ✅ All data sources are free, dynamic, and require no API keys. Casualties data sourced from Wikipedia.
                            </div>
                            <div>
                                <label className="block text-xs text-[var(--color-text-secondary)] uppercase tracking-wider mb-1">
                                    Data Refresh Rate
                                </label>
                                <select
                                    value={settings.refreshRate}
                                    onChange={e => saveSettings({ ...settings, refreshRate: parseInt(e.target.value) })}
                                    className="w-full px-3 py-2 rounded bg-[var(--color-bg-primary)] border border-[var(--color-border)]
                    text-[var(--color-text-primary)] text-sm focus:border-[var(--color-accent)] focus:outline-none"
                                    id="refresh-rate-select"
                                >
                                    <option value={60}>1 minute</option>
                                    <option value={120}>2 minutes</option>
                                    <option value={300}>5 minutes</option>
                                    <option value={600}>10 minutes</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs text-[var(--color-text-secondary)] uppercase tracking-wider mb-1">
                                    Language (Coming Soon)
                                </label>
                                <select
                                    value={settings.language}
                                    onChange={e => saveSettings({ ...settings, language: e.target.value })}
                                    disabled
                                    className="w-full px-3 py-2 rounded bg-[var(--color-bg-primary)] border border-[var(--color-border)]
                    text-[var(--color-text-primary)] text-sm focus:border-[var(--color-accent)] focus:outline-none opacity-60 cursor-not-allowed"
                                    id="language-select"
                                >
                                    <option value="en">English</option>
                                    <option value="ar">العربية (Arabic)</option>
                                    <option value="uk">Українська (Ukrainian)</option>
                                    <option value="fr">Français (French)</option>
                                </select>
                            </div>
                            <div className="p-3 rounded bg-[var(--color-bg-primary)] border border-[var(--color-border)]">
                                <div className="text-xs text-[var(--color-text-secondary)] uppercase tracking-wider mb-2">Data Sources</div>
                                <div className="space-y-1 text-[11px]">
                                    <div className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-safe)]" />
                                        <span className="text-[var(--color-text-primary)]">Wikipedia — Casualties & conflict data</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-safe)]" />
                                        <span className="text-[var(--color-text-primary)]">Wikipedia — Real-time crisis reports</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-safe)]" />
                                        <span className="text-[var(--color-text-primary)]">OpenSky — Live flight tracking</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-safe)]" />
                                        <span className="text-[var(--color-text-primary)]">HDX / UNHCR — Shelter locations</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-safe)]" />
                                        <span className="text-[var(--color-text-primary)]">Nominatim — Geocoding</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 border-t border-[var(--color-border)] flex justify-end">
                            <button
                                onClick={() => setShowSettings(false)}
                                className="px-6 py-2 rounded-lg bg-[var(--color-accent)] text-black font-bold text-sm hover:bg-[var(--color-accent)]/80 transition-all"
                                id="save-settings-btn"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Developer About Modal */}
            {showAbout && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 fade-in">
                    <div className="bg-[var(--color-bg-panel)] border border-[var(--color-border)] rounded-2xl w-full max-w-md shadow-2xl flex flex-col overflow-hidden relative">
                        <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)] bg-[var(--color-bg-card)]">
                            <h2 className="text-lg font-bold text-[var(--color-text-primary)] tracking-wide">About WarInfo</h2>
                            <button onClick={() => setShowAbout(false)} className="p-2 hover:bg-[var(--color-border)] rounded-full transition-colors text-xl">✕</button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex flex-col items-center justify-center space-y-2 mb-6">
                                <div className="w-16 h-16 rounded-full bg-[var(--color-bg-primary)] border-2 border-[#00b4ff] flex items-center justify-center text-2xl shadow-[0_0_15px_rgba(0,180,255,0.3)]">👨‍💻</div>
                                <h3 className="text-xl font-bold text-[var(--color-text-primary)]">Himanshu Tokekar</h3>
                                <p className="text-xs font-bold text-[#00b4ff] uppercase tracking-widest">Student at Fergusson College</p>
                            </div>
                            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed text-center">
                                WarInfo is a real-time global conflict monitor developed to aggregate and visualize critical humanitarian and tactical intelligence.
                            </p>
                            <div className="text-center pt-4 border-t border-[var(--color-border)]">
                                <p className="text-[10px] text-[var(--color-text-dim)] uppercase tracking-widest">
                                    All Rights Reserved © 2026<br />Developed for Educational / Portfolio Purposes
                                </p>
                            </div>
                        </div>
                        <div className="p-4 bg-[var(--color-bg-primary)] border-t border-[var(--color-border)] flex justify-center">
                            <a href="https://github.com/himanshuT7-dev" target="_blank" rel="noopener noreferrer" className="text-xs text-[#00b4ff] hover:underline font-bold">Visit GitHub Profile</a>
                        </div>
                    </div>
                </div>
            )}

            {/* Persistent Developer Watermark (Desktop Only) */}
            <div
                className="hidden lg:flex fixed bottom-4 right-4 z-[9999] opacity-40 hover:opacity-100 transition-opacity cursor-pointer group flex-col items-end"
                onClick={() => setShowAbout(true)}
            >
                <div className="text-[9px] lg:text-[10px] uppercase font-bold text-[var(--color-text-dim)] group-hover:text-[#00b4ff] tracking-widest bg-black/50 px-2 py-1 rounded backdrop-blur-md border border-transparent group-hover:border-[#00b4ff]/30 transition-colors pointer-events-auto">
                    Developed by Himanshu Tokekar
                </div>
            </div>

            <CountryComparisonModal
                isOpen={showComparison}
                onClose={() => setShowComparison(false)}
            />
        </div>
    );
}
