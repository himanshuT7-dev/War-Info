import React, { useState, useEffect } from 'react';
import { GeoJSON, Popup, useMap } from 'react-leaflet';
import axios from 'axios';

export default function CountryHistoryLayer({ visible }) {
    const map = useMap();
    const [geoData, setGeoData] = useState(null);
    const [activeCountry, setActiveCountry] = useState(null);
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState(null);

    // Fetch GeoJSON on mount
    useEffect(() => {
        fetch('/data/countries.geo.json')
            .then(res => res.json())
            .then(data => setGeoData(data))
            .catch(err => console.error("Failed to load GeoJSON:", err));
    }, []);

    if (!visible || !geoData) return null;

    const fetchCountryStats = async (isoCode, name) => {
        setLoading(true);
        setStats(null);
        try {
            const res = await axios.get(`/api/countries/${isoCode}?name=${encodeURIComponent(name)}`);
            setStats(res.data.data);
        } catch (error) {
            console.error('Failed to fetch country stats:', error);
            setStats({ error: true });
        } finally {
            setLoading(false);
        }
    };

    const style = (feature) => {
        return {
            fillColor: 'transparent',
            weight: 1.2,
            opacity: 0.5,
            color: '#6688aa',
            fillOpacity: 0.05
        };
    };

    const onEachFeature = (feature, layer) => {
        layer.on({
            mouseover: (e) => {
                const layer = e.target;
                layer.setStyle({
                    weight: 2,
                    color: '#ff2b2b',
                    opacity: 0.8,
                    fillOpacity: 0.2
                });
                layer.bringToFront();
            },
            mouseout: (e) => {
                const layer = e.target;
                layer.setStyle(style(feature));
            },
            click: (e) => {
                const isoCode = feature.id; // Usually ISO A3 like 'USA'
                const name = feature.properties.name;
                setActiveCountry({ code: isoCode, name, latlng: e.latlng });
                fetchCountryStats(isoCode, name);
                map.flyTo(e.latlng, Math.max(map.getZoom(), 4));
            }
        });
    };

    return (
        <>
            <GeoJSON
                data={geoData}
                style={style}
                onEachFeature={onEachFeature}
            />
            {activeCountry && (
                <Popup
                    position={activeCountry.latlng}
                    onClose={() => setActiveCountry(null)}
                    className="custom-popup"
                    maxWidth={320}
                >
                    <div className="p-2 space-y-3">
                        <div className="flex justify-between items-center border-b border-[var(--color-border)] pb-2">
                            <h3 className="text-lg font-bold text-white m-0">{activeCountry.name}</h3>
                            <span className="text-[10px] text-[var(--color-text-dim)] bg-[var(--color-bg-primary)] px-1.5 py-0.5 rounded border border-[var(--color-border)]">
                                {activeCountry.code}
                            </span>
                        </div>

                        {loading ? (
                            <div className="flex justify-center items-center py-4">
                                <div className="animate-spin h-5 w-5 border-2 border-[var(--color-accent)] border-t-transparent rounded-full"></div>
                            </div>
                        ) : stats && !stats.error ? (
                            <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div className="bg-[var(--color-bg-primary)] p-1.5 rounded">
                                        <div className="text-[9px] text-[var(--color-text-dim)] uppercase">Tier</div>
                                        <div className="font-bold whitespace-nowrap overflow-hidden text-ellipsis">{stats.tier}</div>
                                    </div>
                                    <div className="bg-[var(--color-bg-primary)] p-1.5 rounded">
                                        <div className="text-[9px] text-[var(--color-text-dim)] uppercase">GDP</div>
                                        <div className="font-mono text-[#00e676]">{stats.gdp}</div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-2 text-xs">
                                    <div className="bg-[var(--color-bg-primary)] p-1.5 rounded text-center">
                                        <div className="text-[9px] text-[var(--color-text-dim)] uppercase">Active</div>
                                        <div className="font-mono text-[var(--color-text-secondary)]">{stats.activePersonnel}</div>
                                    </div>
                                    <div className="bg-[var(--color-bg-primary)] p-1.5 rounded text-center">
                                        <div className="text-[9px] text-[var(--color-text-dim)] uppercase">Reserve</div>
                                        <div className="font-mono text-[var(--color-text-secondary)]">{stats.reservePersonnel}</div>
                                    </div>
                                    <div className="bg-[var(--color-danger)]/20 border border-[var(--color-danger)]/50 p-1.5 rounded text-center">
                                        <div className="text-[9px] text-[var(--color-danger)] uppercase">Nukes</div>
                                        <div className="font-mono text-[var(--color-danger)] font-bold">{stats.warheads}</div>
                                    </div>
                                </div>

                                <div className="bg-[var(--color-bg-primary)] p-2 rounded text-xs space-y-1">
                                    <div className="text-[10px] text-[var(--color-text-dim)] font-bold uppercase mb-1 border-b border-[var(--color-border)] pb-1">Geopolitical Context</div>
                                    <p className="text-[var(--color-text-secondary)] leading-relaxed italic m-0">
                                        {stats.conflictContext || stats.history || "No recent conflict data found."}
                                    </p>
                                    <a href={stats.wikiUrl} target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] hover:underline block mt-1 text-[10px]">
                                        Read more on Wikipedia →
                                    </a>
                                </div>
                            </div>
                        ) : (
                            <div className="text-sm text-[var(--color-danger)] text-center py-2">Failed to load statistics.</div>
                        )}
                    </div>
                </Popup>
            )}
        </>
    );
}
