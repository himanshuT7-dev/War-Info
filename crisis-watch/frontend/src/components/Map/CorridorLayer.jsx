import React from 'react';
import { Polyline, Marker, Popup, Tooltip } from 'react-leaflet';
import L from 'leaflet';

const STATUS_COLORS = {
    safe: '#00e676',
    caution: '#ff7b00',
    danger: '#ff2b2b'
};

const STATUS_CONFIG = {
    safe: { label: '✓ SAFE ROUTE', emoji: '🟢', dash: null, description: 'Confirmed safe — actively monitored' },
    caution: { label: '⚠ USE CAUTION', emoji: '🟡', dash: '12, 6', description: 'Reports of activity nearby — stay alert' },
    danger: { label: '✕ HIGH RISK', emoji: '🔴', dash: '6, 8', description: 'Active conflict zone — avoid if possible' }
};

// Create directional arrow markers along the polyline
function createArrowIcon(color) {
    return L.divIcon({
        html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16">
      <circle cx="12" cy="12" r="5" fill="${color}" stroke="${color}" stroke-width="0.5" opacity="0.8"/>
    </svg>`,
        className: 'corridor-arrow',
        iconSize: [16, 16],
        iconAnchor: [8, 8]
    });
}

// Create label icon for corridor name
function createLabelIcon(name, color, status) {
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.caution;
    return L.divIcon({
        html: `<div style="
      background: rgba(13,18,25,0.92);
      border: 1.5px solid ${color};
      border-radius: 6px;
      padding: 3px 8px;
      white-space: nowrap;
      font-family: 'Barlow Condensed', sans-serif;
      font-size: 10px;
      font-weight: 700;
      color: ${color};
      letter-spacing: 0.5px;
      text-transform: uppercase;
      box-shadow: 0 2px 8px rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      gap: 4px;
    ">${cfg.emoji} ${name}</div>`,
        className: 'corridor-label',
        iconSize: [0, 0],
        iconAnchor: [-8, 12]
    });
}

export default function CorridorLayer({ corridors = [], visible = true }) {
    if (!visible || !corridors.length) return null;

    return (
        <>
            {corridors.map((corridor, i) => {
                const color = STATUS_COLORS[corridor.status] || '#ff7b00';
                const cfg = STATUS_CONFIG[corridor.status] || STATUS_CONFIG.caution;

                // Get the midpoint for the label
                const points = corridor.points || [];
                const midIdx = Math.floor(points.length / 2);
                const labelPos = points[midIdx] || points[0];

                return (
                    <React.Fragment key={i}>
                        {/* Wide glow effect */}
                        <Polyline
                            positions={points}
                            pathOptions={{
                                color,
                                weight: 12,
                                opacity: 0.12,
                                lineCap: 'round',
                                lineJoin: 'round'
                            }}
                        />
                        {/* Medium glow */}
                        <Polyline
                            positions={points}
                            pathOptions={{
                                color,
                                weight: 6,
                                opacity: 0.25,
                                lineCap: 'round',
                                lineJoin: 'round'
                            }}
                        />
                        {/* Main line */}
                        <Polyline
                            positions={points}
                            pathOptions={{
                                color,
                                weight: 3,
                                opacity: 0.9,
                                dashArray: cfg.dash,
                                lineCap: 'round',
                                lineJoin: 'round'
                            }}
                        >
                            <Popup>
                                <div className="min-w-[200px] text-sm">
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <span className="text-lg">{cfg.emoji}</span>
                                        <div>
                                            <div className="font-bold text-base" style={{ color }}>{corridor.name}</div>
                                            <div className="text-[10px] font-bold uppercase" style={{ color }}>{cfg.label}</div>
                                        </div>
                                    </div>
                                    <div className="text-xs text-gray-400 border-t border-gray-600 pt-1.5 mt-1">
                                        {cfg.description}
                                    </div>
                                    <div className="mt-2 text-[10px] text-gray-500">
                                        Click corridor label or line for details
                                    </div>
                                </div>
                            </Popup>
                        </Polyline>

                        {/* Inline label at midpoint */}
                        {labelPos && (
                            <Marker
                                position={labelPos}
                                icon={createLabelIcon(corridor.name, color, corridor.status)}
                                interactive={true}
                            >
                                <Popup>
                                    <div className="min-w-[200px] text-sm">
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <span className="text-lg">{cfg.emoji}</span>
                                            <div>
                                                <div className="font-bold text-base" style={{ color }}>{corridor.name}</div>
                                                <div className="text-[10px] font-bold uppercase" style={{ color }}>{cfg.label}</div>
                                            </div>
                                        </div>
                                        <div className="text-xs text-gray-400 pt-1.5 mt-1 border-t border-gray-600">
                                            {cfg.description}
                                        </div>
                                    </div>
                                </Popup>
                            </Marker>
                        )}

                        {/* Waypoint dots at each point */}
                        {points.map((pt, j) => (
                            j === 0 || j === points.length - 1 ? (
                                <Marker
                                    key={`wp-${i}-${j}`}
                                    position={pt}
                                    icon={createArrowIcon(color)}
                                >
                                    <Tooltip direction="top" offset={[0, -8]} permanent={false}>
                                        <span style={{ fontSize: '10px', fontWeight: 'bold', color }}>
                                            {j === 0 ? '▶ Start' : '⬛ End'}
                                        </span>
                                    </Tooltip>
                                </Marker>
                            ) : null
                        ))}
                    </React.Fragment>
                );
            })}
        </>
    );
}
