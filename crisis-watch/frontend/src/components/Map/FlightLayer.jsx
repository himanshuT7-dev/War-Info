import React, { useMemo } from 'react';
import { Marker, Polygon, Polyline, Popup, Tooltip, Circle } from 'react-leaflet';
import L from 'leaflet';

// Create airplane icon as a rotated SVG divIcon
function createAircraftIcon(heading = 0, isMilitary = false) {
    const color = isMilitary ? '#ff7b00' : '#00b4ff';
    const size = isMilitary ? 22 : 18;
    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="${size}" height="${size}" 
      style="transform: rotate(${heading}deg); filter: drop-shadow(0 1px 3px rgba(0,0,0,0.6));">
      <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"
        fill="${color}" stroke="${isMilitary ? '#cc5500' : '#0088cc'}" stroke-width="0.5"/>
    </svg>`;

    return L.divIcon({
        html: svg,
        className: 'aircraft-icon',
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2]
    });
}

// Calculate a point along a heading from start coordinates
function projectPoint(lat, lng, heading, distanceKm) {
    const R = 6371; // Earth's radius in km
    const d = distanceKm / R;
    const brng = (heading * Math.PI) / 180;
    const lat1 = (lat * Math.PI) / 180;
    const lng1 = (lng * Math.PI) / 180;

    const lat2 = Math.asin(
        Math.sin(lat1) * Math.cos(d) + Math.cos(lat1) * Math.sin(d) * Math.cos(brng)
    );
    const lng2 = lng1 + Math.atan2(
        Math.sin(brng) * Math.sin(d) * Math.cos(lat1),
        Math.cos(d) - Math.sin(lat1) * Math.sin(lat2)
    );

    return [(lat2 * 180) / Math.PI, (lng2 * 180) / Math.PI];
}

// Estimate a trail (past path) behind the aircraft
function getTrailPoints(lat, lng, heading, velocity, count = 5) {
    const points = [[lat, lng]];
    const reverseHeading = (heading + 180) % 360;
    // Each point represents ~30 seconds of flight in the past
    const speedKm = velocity ? velocity * 0.001 : 0.1; // m/s to km/s
    for (let i = 1; i <= count; i++) {
        const dist = speedKm * 30 * i; // distance in km
        points.push(projectPoint(lat, lng, reverseHeading, dist));
    }
    return points;
}

// Get projected route (future heading)
function getProjectedRoute(lat, lng, heading, velocity) {
    const points = [[lat, lng]];
    const speedKm = velocity ? velocity / 1000 : 0.2;
    // Project 3 points ahead (30s, 60s, 90s)
    for (let i = 1; i <= 4; i++) {
        const dist = speedKm * 45 * i;
        points.push(projectPoint(lat, lng, heading, dist));
    }
    return points;
}

// Known airport coordinates for common destinations
const AIRPORTS = {
    WAW: { name: 'Warsaw', lat: 52.17, lng: 20.97 },
    PRG: { name: 'Prague', lat: 50.10, lng: 14.26 },
    BUD: { name: 'Budapest', lat: 47.43, lng: 19.26 },
    VIE: { name: 'Vienna', lat: 48.11, lng: 16.57 },
    IST: { name: 'Istanbul', lat: 41.28, lng: 28.75 },
    TLV: { name: 'Tel Aviv', lat: 32.01, lng: 34.88 },
    ATH: { name: 'Athens', lat: 37.94, lng: 23.94 },
    CAI: { name: 'Cairo', lat: 30.12, lng: 31.41 },
    AMM: { name: 'Amman', lat: 31.72, lng: 35.99 },
    ADD: { name: 'Addis Ababa', lat: 8.98, lng: 38.80 },
    NBO: { name: 'Nairobi', lat: -1.32, lng: 36.93 },
    JED: { name: 'Jeddah', lat: 21.68, lng: 39.16 },
    DXB: { name: 'Dubai', lat: 25.25, lng: 55.36 },
    FRA: { name: 'Frankfurt', lat: 50.03, lng: 8.57 },
    CDG: { name: 'Paris CDG', lat: 49.00, lng: 2.55 },
    LHR: { name: 'London', lat: 51.47, lng: -0.46 },
};

// Estimate destination from callsign and heading
function estimateDestination(callsign, heading, lat, lng) {
    if (!callsign || !heading) return null;

    // Find the nearest airport in the heading direction
    let bestAirport = null;
    let bestScore = Infinity;

    for (const [code, airport] of Object.entries(AIRPORTS)) {
        const dlat = airport.lat - lat;
        const dlng = airport.lng - lng;
        const dist = Math.sqrt(dlat * dlat + dlng * dlng);

        // Calculate bearing to airport
        const bearing = (Math.atan2(dlng, dlat) * 180 / Math.PI + 360) % 360;
        const headingDiff = Math.abs(((bearing - heading) + 180) % 360 - 180);

        // Score: prefer airports that are in the heading direction and not too close
        if (headingDiff < 45 && dist > 1) {
            const score = headingDiff + dist * 0.5;
            if (score < bestScore) {
                bestScore = score;
                bestAirport = { code, ...airport };
            }
        }
    }

    return bestAirport;
}

export default function FlightLayer({ aircraft = [], noFlyZones = [], visible = true, isGlobal = false }) {
    const processedAircraft = useMemo(() => {
        if (!visible) return [];
        return aircraft
            .filter(a => a.latitude && a.longitude && !a.onGround)
            .map(ac => {
                const isMilitary = !ac.callsign || ac.callsign.trim() === '' ||
                    ac.squawk === '7700' || ac.squawk === '7600' ||
                    ac.altitude > 12000;

                let trail = null;
                let projected = null;
                let destination = null;

                // For global view we simplify to markers only (no trails/projections)
                if (!isGlobal) {
                    trail = ac.heading != null && ac.velocity
                        ? getTrailPoints(ac.latitude, ac.longitude, ac.heading, ac.velocity)
                        : null;

                    projected = ac.heading != null
                        ? getProjectedRoute(ac.latitude, ac.longitude, ac.heading, ac.velocity)
                        : null;

                    destination = estimateDestination(
                        ac.callsign, ac.heading, ac.latitude, ac.longitude
                    );
                }

                return { ...ac, isMilitary, trail, projected, destination };
            });
    }, [aircraft, visible, isGlobal]);

    if (!visible) return null;

    return (
        <>
            {/* No-fly zone polygons */}
            {noFlyZones.map((zone, i) => (
                <Polygon
                    key={`nfz-${i}`}
                    positions={zone.coords}
                    pathOptions={{
                        color: '#ff2b2b',
                        fillColor: '#ff2b2b',
                        fillOpacity: 0.08,
                        weight: 2,
                        dashArray: '8, 6'
                    }}
                >
                    <Tooltip sticky direction="center" className="nfz-tooltip" permanent={false}>
                        <span style={{ color: '#ff2b2b', fontWeight: 'bold', fontSize: '11px' }}>⛔ NO-FLY ZONE</span>
                    </Tooltip>
                    <Popup>
                        <div className="text-sm min-w-[160px]">
                            <div className="font-bold text-[#ff2b2b] text-base mb-1">⛔ NO-FLY ZONE</div>
                            <div className="text-xs">{zone.name}</div>
                            <div className="text-[10px] text-gray-400 mt-1">Active conflict airspace — Civilian flights prohibited</div>
                        </div>
                    </Popup>
                </Polygon>
            ))}

            {/* Flight trails, projections, and markers */}
            {processedAircraft.map((ac, i) => {
                const color = ac.isMilitary ? '#ff7b00' : '#00b4ff';
                const icon = createAircraftIcon(ac.heading || 0, ac.isMilitary);
                const altFt = ac.altitude ? Math.round(ac.altitude * 3.281) : null;
                const speedKts = ac.velocity ? Math.round(ac.velocity * 1.944) : null;

                return (
                    <React.Fragment key={ac.icao24 || i}>
                        {/* Past trail — fading dotted line behind aircraft (disabled in global view) */}
                        {!isGlobal && ac.trail && (
                            <Polyline
                                positions={ac.trail}
                                pathOptions={{
                                    color,
                                    weight: 2,
                                    opacity: 0.35,
                                    dashArray: '4, 6'
                                }}
                            />
                        )}

                        {/* Projected route — dashed line ahead (disabled in global view) */}
                        {!isGlobal && ac.projected && (
                            <Polyline
                                positions={ac.projected}
                                pathOptions={{
                                    color,
                                    weight: 1.5,
                                    opacity: 0.2,
                                    dashArray: '8, 8'
                                }}
                            />
                        )}

                        {/* Aircraft marker */}
                        <Marker
                            position={[ac.latitude, ac.longitude]}
                            icon={icon}
                        >
                            <Tooltip direction="top" offset={[0, -12]} className="flight-tooltip">
                                <span style={{
                                    color,
                                    fontWeight: 'bold',
                                    fontSize: '10px',
                                    fontFamily: 'Share Tech Mono, monospace'
                                }}>
                                    ✈ {ac.callsign?.trim() || 'N/A'} {altFt ? `· ${(altFt / 1000).toFixed(1)}k ft` : ''}
                                    {ac.destination ? ` → ${ac.destination.name}` : ''}
                                </span>
                            </Tooltip>
                            <Popup>
                                <div className="min-w-[220px] text-sm">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-xl">✈️</span>
                                        <div>
                                            <div className="font-bold text-base" style={{ color }}>
                                                {ac.callsign?.trim() || 'UNKNOWN'}
                                            </div>
                                            <div className="text-[10px] font-bold uppercase" style={{ color }}>
                                                {ac.isMilitary ? '⚠ Military / Unknown' : '✓ Commercial'}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-1 text-xs border-t border-gray-600 pt-2">
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">ICAO</span>
                                            <span className="font-mono">{ac.icao24}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Origin</span>
                                            <span>{ac.originCountry}</span>
                                        </div>
                                        {ac.destination && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-400">Est. Destination</span>
                                                <span className="font-bold" style={{ color }}>
                                                    {ac.destination.name} ({ac.destination.code})
                                                </span>
                                            </div>
                                        )}
                                        {altFt && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-400">Altitude</span>
                                                <span className="font-mono">{altFt.toLocaleString()} ft ({Math.round(ac.altitude)}m)</span>
                                            </div>
                                        )}
                                        {speedKts && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-400">Speed</span>
                                                <span className="font-mono">{speedKts} kts ({Math.round(ac.velocity)} m/s)</span>
                                            </div>
                                        )}
                                        {ac.heading != null && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-400">Heading</span>
                                                <span className="font-mono">{Math.round(ac.heading)}°</span>
                                            </div>
                                        )}
                                        {ac.verticalRate != null && ac.verticalRate !== 0 && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-400">Vertical Rate</span>
                                                <span className="font-mono" style={{ color: ac.verticalRate > 0 ? '#00e676' : '#ff7b00' }}>
                                                    {ac.verticalRate > 0 ? '↑' : '↓'} {Math.abs(Math.round(ac.verticalRate * 3.281))} ft/min
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    {ac.destination && (
                                        <div className="mt-2 pt-2 border-t border-gray-600 text-[10px] text-gray-400">
                                            📍 Estimated destination based on heading trajectory
                                        </div>
                                    )}
                                </div>
                            </Popup>
                        </Marker>
                    </React.Fragment>
                );
            })}
        </>
    );
}
