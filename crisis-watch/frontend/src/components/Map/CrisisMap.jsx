import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import StrikeLayer from './StrikeLayer';
import CorridorLayer from './CorridorLayer';
import ShelterLayer from './ShelterLayer';
import FlightLayer from './FlightLayer';
import CountryHistoryLayer from './CountryHistoryLayer';
import HeatmapLayer from './HeatmapLayer';
import CyberLayer from './CyberLayer';

function MapUpdater({ center, zoom }) {
    const map = useMap();
    useEffect(() => {
        if (center && zoom) {
            map.flyTo(center, zoom, { duration: 1.5 });
        }
    }, [center, zoom, map]);
    return null;
}

function MapLegend() {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <div className="absolute bottom-4 left-4 z-[1000] map-legend" style={{ minWidth: collapsed ? 'auto' : '160px' }}>
            <button
                onClick={() => setCollapsed(!collapsed)}
                className="flex items-center gap-2 text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-widest w-full"
            >
                <span className="text-sm">🗺️</span>
                {!collapsed && <span>Map Legend</span>}
                <span className="ml-auto text-[var(--color-text-dim)]">{collapsed ? '▶' : '▼'}</span>
            </button>
            {!collapsed && (
                <div className="mt-2 space-y-1.5 text-[10px]">
                    <div className="flex items-center gap-2">
                        <svg width="16" height="16" viewBox="0 0 24 24">
                            <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" fill="#00b4ff" />
                        </svg>
                        <span className="text-[var(--color-text-secondary)]">Commercial Flight</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <svg width="16" height="16" viewBox="0 0 24 24">
                            <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" fill="#ff7b00" />
                        </svg>
                        <span className="text-[var(--color-text-secondary)]">Military / Unknown</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-0" style={{ borderTop: '2px dotted #00b4ff', opacity: 0.5 }} />
                        <span className="text-[var(--color-text-secondary)]">Flight Trail</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-0" style={{ borderTop: '2px dashed #00b4ff', opacity: 0.3 }} />
                        <span className="text-[var(--color-text-secondary)]">Projected Route</span>
                    </div>
                    <div className="h-px bg-[var(--color-border)] my-1" />
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-[3px] rounded bg-[#00e676]" />
                        <span className="text-[var(--color-text-secondary)]">Safe Corridor</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-[3px] rounded bg-[#ff7b00]" style={{ borderTop: '3px dashed #ff7b00', height: 0 }} />
                        <span className="text-[var(--color-text-secondary)]">Caution Corridor</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-[3px] rounded bg-[#ff2b2b]" style={{ borderTop: '3px dotted #ff2b2b', height: 0 }} />
                        <span className="text-[var(--color-text-secondary)]">Danger / Avoid</span>
                    </div>
                    <div className="h-px bg-[var(--color-border)] my-1" />
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded border border-dashed border-[#ff2b2b] bg-[#ff2b2b]/10" />
                        <span className="text-[var(--color-text-secondary)]">No-Fly Zone</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[#ff2b2b]" />
                        <span className="text-[var(--color-text-secondary)]">Conflict Report</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[#00e676]" />
                        <span className="text-[var(--color-text-secondary)]">Shelter / Aid</span>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function CrisisMap({
    region,
    events = [],
    aircraft = [],
    shelters = [],
    acledEvents = [],
    cyberEvents = [],
    layers = {},
}) {
    const center = region?.center || [20, 30];
    const zoom = region?.zoom || 3;

    return (
        <div className="relative h-full w-full">
            <MapContainer
                center={center}
                zoom={zoom}
                className="h-full w-full"
                zoomControl={true}
                attributionControl={false}
            >
                <TileLayer
                    url="https://cartodb-basemaps-a.global.ssl.fastly.net/dark_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                    detectRetina={true}
                />
                <MapUpdater center={center} zoom={zoom} />

                <CountryHistoryLayer visible={true} />

                {layers.heatmap && (
                    <HeatmapLayer events={acledEvents} />
                )}

                {layers.cyber && (
                    <CyberLayer events={cyberEvents} visible={layers.cyber} />
                )}

                {layers.strikes !== false && (
                    <StrikeLayer events={events} visible={layers.strikes !== false} />
                )}
                {layers.corridors !== false && (
                    <CorridorLayer corridors={region?.corridors || []} visible={layers.corridors !== false} />
                )}
                {layers.shelters !== false && (
                    <ShelterLayer shelters={shelters} visible={layers.shelters !== false} />
                )}
                {layers.flights !== false && (
                    <FlightLayer
                        aircraft={aircraft}
                        noFlyZones={region?.noFlyZones || []}
                        visible={layers.flights !== false}
                        isGlobal={region?.name === 'Global'}
                    />
                )}
            </MapContainer>

            {/* Floating Legend */}
            <MapLegend />
        </div>
    );
}
