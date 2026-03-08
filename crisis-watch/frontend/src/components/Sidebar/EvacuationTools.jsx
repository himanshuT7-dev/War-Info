import React, { useState } from 'react';
import { useGeolocation } from '../../hooks/useGeolocation';
import { useNearbyShelters } from '../../hooks/useUNHCR';
import EmergencyContacts from '../shared/EmergencyContacts';
import { REGIONS } from '../../utils/regionBounds';

const VEHICLE_TYPES = [
    { id: 'car', icon: '🚗', label: 'Car', mapMode: 'driving' },
    { id: 'bus', icon: '🚌', label: 'Bus', mapMode: 'driving' },
    { id: 'walk', icon: '🚶', label: 'On Foot', mapMode: 'walking' },
    { id: 'bike', icon: '🚲', label: 'Bicycle', mapMode: 'bicycling' }
];

const AMENITY_TYPES = [
    { id: 'fuel', icon: '⛽', label: 'Fuel Stations', query: 'gas station fuel' },
    { id: 'rest', icon: '🏨', label: 'Rest / Hotels', query: 'hotel shelter rest stop' },
    { id: 'food', icon: '🍲', label: 'Food / Water', query: 'restaurant food distribution' },
    { id: 'medical', icon: '🏥', label: 'Medical Aid', query: 'hospital clinic pharmacy' },
    { id: 'mechanic', icon: '🔧', label: 'Vehicle Repair', query: 'car repair mechanic garage' }
];

export default function EvacuationTools({ selectedRegion }) {
    const region = REGIONS[selectedRegion] || REGIONS.global;
    const { position, loading: geoLoading, error: geoError, getPosition, geocodeAddress } = useGeolocation();
    const { shelters: nearbyShelters, loading: shelterLoading, searchNearby } = useNearbyShelters();
    const [manualLocation, setManualLocation] = useState('');
    const [routeFrom, setRouteFrom] = useState('');
    const [routeTo, setRouteTo] = useState('');
    const [vehicleType, setVehicleType] = useState('car');
    const [avoidHighways, setAvoidHighways] = useState(false);
    const [preferSafeRoutes, setPreferSafeRoutes] = useState(true);
    const [selectedAmenities, setSelectedAmenities] = useState(['fuel', 'food', 'medical']);
    const [amenityResults, setAmenityResults] = useState([]);
    const [amenityLoading, setAmenityLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('shelter');

    const handleManualSearch = async (e) => {
        e.preventDefault();
        if (manualLocation.trim()) {
            await geocodeAddress(manualLocation);
        }
    };

    React.useEffect(() => {
        if (position) {
            searchNearby(position.lat, position.lon);
        }
    }, [position]);

    const toggleAmenity = (id) => {
        setSelectedAmenities(prev =>
            prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
        );
    };

    const openRouteInMaps = () => {
        if (!routeFrom || !routeTo) return;
        const vehicle = VEHICLE_TYPES.find(v => v.id === vehicleType);
        const avoid = avoidHighways ? '&dirflg=r' : '';
        const url = `https://www.google.com/maps/dir/${encodeURIComponent(routeFrom)}/${encodeURIComponent(routeTo)}/@?travelmode=${vehicle.mapMode}${avoid}`;
        window.open(url, '_blank');
    };

    const searchAmenities = async () => {
        if (!routeFrom) return;
        setAmenityLoading(true);
        const selected = AMENITY_TYPES.filter(a => selectedAmenities.includes(a.id));
        const results = [];

        for (const amenity of selected) {
            try {
                const searchArea = routeTo ? `${routeFrom} to ${routeTo}` : routeFrom;
                const res = await fetch(`/api/geocode/search?q=${encodeURIComponent(amenity.query + ' near ' + searchArea)}&limit=3`);
                const json = await res.json();
                if (json.data) {
                    json.data.forEach(place => {
                        results.push({
                            name: place.display_name?.split(',')[0] || place.name,
                            fullAddress: place.display_name || '',
                            type: amenity.label,
                            icon: amenity.icon,
                            lat: place.lat,
                            lon: place.lon,
                            directionsUrl: `https://www.google.com/maps/dir/${encodeURIComponent(routeFrom)}/${place.lat},${place.lon}`
                        });
                    });
                }
            } catch (err) {
                console.error(`Amenity search failed for ${amenity.label}:`, err);
            }
        }
        setAmenityResults(results);
        setAmenityLoading(false);
    };

    const tabs = [
        { id: 'shelter', label: 'Shelters', icon: '🏥' },
        { id: 'route', label: 'Routes', icon: '🗺️' },
        { id: 'border', label: 'Borders', icon: '🚧' },
        { id: 'emergency', label: 'SOS', icon: '📞' }
    ];

    return (
        <div className="h-full w-full flex flex-col sidebar border-l border-[var(--color-border)]">
            {/* Header */}
            <div className="sidebar-header">
                <span className="text-base">🛡️</span>
                <span>Evacuation Tools</span>
            </div>

            {/* Tab Navigation */}
            <div className="grid grid-cols-4 border-b border-[var(--color-border)]">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex flex-col items-center gap-0.5 py-2.5 transition-all border-b-2 ${activeTab === tab.id
                                ? 'bg-[var(--color-accent-dim)] border-[var(--color-accent)] text-[var(--color-accent)]'
                                : 'border-transparent text-[var(--color-text-dim)] hover:text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-card)]'
                            }`}
                        id={`evac-tab-${tab.id}`}
                    >
                        <span className="text-base leading-none">{tab.icon}</span>
                        <span className="text-[9px] font-bold uppercase tracking-wider">{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {/* ── SHELTER TAB ── */}
                {activeTab === 'shelter' && (
                    <>
                        <div className="panel-card space-y-3">
                            <div>
                                <div className="panel-section-title">Find Shelter Near Me</div>
                                <p className="text-[11px] text-[var(--color-text-secondary)] leading-relaxed">
                                    Locate the nearest shelters, hospitals, and aid centers to your current position.
                                </p>
                            </div>

                            <button
                                onClick={getPosition}
                                disabled={geoLoading}
                                className="btn-primary bg-[var(--color-safe)] text-black"
                                id="find-shelter-btn"
                            >
                                {geoLoading ? (
                                    <><span className="animate-spin">⏳</span> Locating...</>
                                ) : (
                                    <><span>📍</span> Use My Current Location</>
                                )}
                            </button>

                            <div className="flex items-center gap-2 text-[9px] text-[var(--color-text-dim)] uppercase tracking-widest">
                                <div className="flex-1 h-px bg-[var(--color-border)]" />
                                <span>or search manually</span>
                                <div className="flex-1 h-px bg-[var(--color-border)]" />
                            </div>

                            <form onSubmit={handleManualSearch} className="flex gap-2">
                                <input
                                    type="text"
                                    value={manualLocation}
                                    onChange={e => setManualLocation(e.target.value)}
                                    placeholder="City, address, or place name..."
                                    className="input-field flex-1"
                                    id="manual-location-input"
                                />
                                <button type="submit" className="px-4 rounded-lg bg-[var(--color-accent)] text-black font-bold text-sm hover:opacity-90 transition-opacity">
                                    Go
                                </button>
                            </form>

                            {geoError && (
                                <div className="panel-card !bg-[var(--color-danger-dim)] !border-[var(--color-danger)]/20 text-[11px] text-[var(--color-danger)] flex items-center gap-2">
                                    <span>⚠️</span> {geoError}
                                </div>
                            )}

                            {position && (
                                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--color-safe-dim)] border border-[var(--color-safe)]/20">
                                    <span className="text-sm">📌</span>
                                    <div className="text-[11px] font-[family-name:var(--font-mono)] text-[var(--color-safe)]">
                                        {position.lat?.toFixed(4)}, {position.lon?.toFixed(4)}
                                        {position.name && <div className="text-[10px] text-[var(--color-text-secondary)] truncate mt-0.5">{position.name}</div>}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Results */}
                        {(shelterLoading || nearbyShelters.length > 0) && (
                            <div>
                                <div className="panel-section-title">
                                    {shelterLoading ? 'Searching...' : `${nearbyShelters.length} Nearest Locations`}
                                </div>
                                <div className="space-y-2">
                                    {nearbyShelters.map((shelter, i) => (
                                        <div key={i} className="panel-card fade-in">
                                            <div className="flex items-start justify-between gap-2 mb-2">
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-[12px] font-bold text-[var(--color-text-primary)] truncate">{shelter.name}</div>
                                                    <div className="text-[10px] text-[var(--color-text-dim)] truncate mt-0.5">{shelter.fullName}</div>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <div className="text-sm font-bold font-[family-name:var(--font-mono)] text-[var(--color-accent)]">{shelter.distance}</div>
                                                    <div className="text-[8px] text-[var(--color-text-dim)] uppercase">km</div>
                                                </div>
                                            </div>
                                            {shelter.directionsUrl && (
                                                <a href={shelter.directionsUrl} target="_blank" rel="noopener noreferrer"
                                                    className="btn-primary !py-2 !text-xs bg-[var(--color-accent)] text-black">
                                                    📍 Get Directions
                                                </a>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* ── ROUTE TAB ── */}
                {activeTab === 'route' && (
                    <>
                        {/* Route Inputs */}
                        <div className="panel-card space-y-3">
                            <div>
                                <div className="panel-section-title">Evacuation Route Planner</div>
                                <p className="text-[11px] text-[var(--color-text-secondary)] leading-relaxed">
                                    Plan your safest route with vehicle options and find amenities along the way.
                                </p>
                            </div>

                            <div>
                                <label className="text-[9px] font-bold text-[var(--color-text-dim)] uppercase tracking-widest block mb-1.5">
                                    📍 From — Your Location
                                </label>
                                <input
                                    type="text"
                                    value={routeFrom}
                                    onChange={e => setRouteFrom(e.target.value)}
                                    placeholder="Enter your city or address..."
                                    className="input-field"
                                    id="route-from-input"
                                />
                            </div>

                            <div>
                                <label className="text-[9px] font-bold text-[var(--color-text-dim)] uppercase tracking-widest block mb-1.5">
                                    🎯 To — Destination / Border
                                </label>
                                <input
                                    type="text"
                                    value={routeTo}
                                    onChange={e => setRouteTo(e.target.value)}
                                    placeholder="Border crossing, city, or country..."
                                    className="input-field"
                                    id="route-to-input"
                                />
                            </div>
                        </div>

                        {/* Vehicle Selection */}
                        <div className="panel-card">
                            <div className="panel-section-title">Travel Mode</div>
                            <div className="grid grid-cols-4 gap-1.5">
                                {VEHICLE_TYPES.map(v => (
                                    <button
                                        key={v.id}
                                        onClick={() => setVehicleType(v.id)}
                                        className={`flex flex-col items-center gap-1 py-2.5 rounded-lg text-center transition-all border ${vehicleType === v.id
                                                ? 'bg-[var(--color-accent-dim)] border-[var(--color-accent)] text-[var(--color-accent)]'
                                                : 'bg-[var(--color-bg-primary)] border-[var(--color-border)] text-[var(--color-text-dim)] hover:border-[var(--color-border-bright)] hover:text-[var(--color-text-secondary)]'
                                            }`}
                                        id={`vehicle-${v.id}`}
                                    >
                                        <span className="text-lg">{v.icon}</span>
                                        <span className="text-[9px] font-bold uppercase tracking-wider">{v.label}</span>
                                    </button>
                                ))}
                            </div>

                            {/* Route Preferences */}
                            <div className="mt-3 space-y-2">
                                <label className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-[var(--color-bg-card)] transition-colors cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={preferSafeRoutes}
                                        onChange={e => setPreferSafeRoutes(e.target.checked)}
                                        className="w-4 h-4 rounded accent-[var(--color-safe)]"
                                    />
                                    <div>
                                        <div className="text-[11px] font-bold text-[var(--color-text-primary)] group-hover:text-[var(--color-safe)] transition-colors">Prefer safe corridors</div>
                                        <div className="text-[9px] text-[var(--color-text-dim)]">Prioritize roads away from active conflict areas</div>
                                    </div>
                                </label>
                                <label className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-[var(--color-bg-card)] transition-colors cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={avoidHighways}
                                        onChange={e => setAvoidHighways(e.target.checked)}
                                        className="w-4 h-4 rounded accent-[var(--color-warning)]"
                                    />
                                    <div>
                                        <div className="text-[11px] font-bold text-[var(--color-text-primary)] group-hover:text-[var(--color-warning)] transition-colors">Avoid highways</div>
                                        <div className="text-[9px] text-[var(--color-text-dim)]">Use secondary roads (may be safer but slower)</div>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Amenities Along Route */}
                        <div className="panel-card">
                            <div className="panel-section-title">Amenities Along Route</div>
                            <p className="text-[10px] text-[var(--color-text-dim)] mb-2.5">
                                Select what you need along the way — we'll find stops near your route.
                            </p>
                            <div className="grid grid-cols-5 gap-1.5">
                                {AMENITY_TYPES.map(a => (
                                    <button
                                        key={a.id}
                                        onClick={() => toggleAmenity(a.id)}
                                        className={`flex flex-col items-center gap-0.5 py-2 rounded-lg text-center transition-all border ${selectedAmenities.includes(a.id)
                                                ? 'bg-[var(--color-accent-dim)] border-[var(--color-accent)] text-[var(--color-accent)]'
                                                : 'bg-[var(--color-bg-primary)] border-[var(--color-border)] text-[var(--color-text-dim)] hover:border-[var(--color-border-bright)]'
                                            }`}
                                        title={a.label}
                                    >
                                        <span className="text-base">{a.icon}</span>
                                        <span className="text-[7px] font-bold uppercase tracking-wide leading-tight">{a.label.split(' ')[0]}</span>
                                    </button>
                                ))}
                            </div>

                            <div className="flex gap-2 mt-3">
                                <button
                                    onClick={searchAmenities}
                                    disabled={!routeFrom || amenityLoading}
                                    className="btn-primary !py-2.5 bg-[var(--color-bg-card)] text-[var(--color-accent)] border border-[var(--color-accent)]/30 
                    disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[var(--color-accent-dim)] flex-1"
                                    id="search-amenities-btn"
                                >
                                    {amenityLoading ? '⏳ Searching...' : '🔍 Find Stops Along Route'}
                                </button>
                            </div>
                        </div>

                        {/* Launch Route Button */}
                        <button
                            onClick={openRouteInMaps}
                            disabled={!routeFrom || !routeTo}
                            className="btn-primary bg-[var(--color-accent)] text-black py-3.5 text-base disabled:opacity-40 disabled:cursor-not-allowed"
                            id="launch-route-btn"
                        >
                            🗺️ Open Route in Google Maps
                        </button>

                        {/* Amenity Results */}
                        {amenityResults.length > 0 && (
                            <div>
                                <div className="panel-section-title">Stops Found Along Route</div>
                                <div className="space-y-1.5">
                                    {amenityResults.map((stop, i) => (
                                        <a
                                            key={i}
                                            href={stop.directionsUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="panel-card !py-2.5 !px-3 flex items-center gap-3 hover:!border-[var(--color-accent)] cursor-pointer fade-in group"
                                        >
                                            <span className="text-xl shrink-0">{stop.icon}</span>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-[11px] font-bold text-[var(--color-text-primary)] truncate group-hover:text-[var(--color-accent)] transition-colors">{stop.name}</div>
                                                <div className="text-[9px] text-[var(--color-text-dim)] truncate">{stop.type}</div>
                                            </div>
                                            <span className="text-[10px] text-[var(--color-accent)] shrink-0">→</span>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Known Corridors */}
                        {region.corridors?.length > 0 && (
                            <div>
                                <div className="panel-section-title">Known Evacuation Corridors</div>
                                <div className="space-y-1.5">
                                    {region.corridors.map((c, i) => (
                                        <div key={i} className="panel-card !py-2.5 !px-3 flex items-center justify-between gap-2"
                                            style={{
                                                borderLeftWidth: '3px',
                                                borderLeftColor: c.status === 'safe' ? '#00e676' : c.status === 'caution' ? '#ff7b00' : '#ff2b2b'
                                            }}
                                        >
                                            <span className="text-[11px] font-medium text-[var(--color-text-primary)] truncate flex-1">{c.name}</span>
                                            <span className={`status-badge text-[8px] ${c.status === 'safe' ? 'bg-[var(--color-safe-dim)] text-[var(--color-safe)]' :
                                                    c.status === 'caution' ? 'bg-[var(--color-warning-dim)] text-[var(--color-warning)]' :
                                                        'bg-[var(--color-danger-dim)] text-[var(--color-danger)]'
                                                }`}>
                                                {c.status === 'safe' ? '✓ Safe' : c.status === 'caution' ? '⚠ Caution' : '✕ Avoid'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* ── BORDER TAB ── */}
                {activeTab === 'border' && (
                    <>
                        <div>
                            <div className="panel-section-title">Border Crossing Status — {region.name}</div>
                            <p className="text-[11px] text-[var(--color-text-secondary)] mb-3 leading-relaxed">
                                Current status of major border crossings in the region.
                            </p>
                        </div>
                        {region.borderCrossings?.length > 0 ? (
                            <div className="space-y-2">
                                {region.borderCrossings.map((crossing, i) => (
                                    <div key={i} className="panel-card !py-3 !px-3">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-[12px] font-bold text-[var(--color-text-primary)]">{crossing.name}</span>
                                            <span className={`status-badge text-[9px] ${crossing.status === 'open' ? 'bg-[var(--color-safe-dim)] text-[var(--color-safe)]' :
                                                    crossing.status === 'closed' ? 'bg-[var(--color-danger-dim)] text-[var(--color-danger)]' :
                                                        'bg-[var(--color-warning-dim)] text-[var(--color-warning)]'
                                                }`}>
                                                {crossing.status === 'open' ? '✓ ' : crossing.status === 'closed' ? '✕ ' : '⏳ '}{crossing.status}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-[10px]">
                                            <span className="text-[var(--color-text-dim)]">{crossing.country}</span>
                                            <span className="font-[family-name:var(--font-mono)] text-[var(--color-text-secondary)]">
                                                Est. wait: {crossing.waitTime}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="panel-card text-center py-8">
                                <div className="text-2xl mb-2">🚧</div>
                                <div className="text-xs text-[var(--color-text-secondary)]">No border crossing data for this region</div>
                            </div>
                        )}
                    </>
                )}

                {/* ── EMERGENCY TAB ── */}
                {activeTab === 'emergency' && (
                    <>
                        <div className="panel-card !bg-[var(--color-danger-dim)] !border-[var(--color-danger)]/20 text-center py-3 mb-1">
                            <div className="text-2xl mb-1">🆘</div>
                            <div className="text-sm font-bold text-[var(--color-danger)]">Emergency Contacts</div>
                            <div className="text-[10px] text-[var(--color-text-secondary)] mt-0.5">Tap a number to call immediately</div>
                        </div>
                        <EmergencyContacts contacts={region.emergencyContacts} regionName={region.name} />
                    </>
                )}
            </div>
        </div>
    );
}
