import React from 'react';
import { Polyline, CircleMarker, Tooltip } from 'react-leaflet';

const FLASHPOINTS = [
    { id: 'taiwan', name: 'Cross-Strait Tensions', positions: [[25.0330, 121.5654], [39.9042, 116.4074]], color: '#ff7b00', status: 'High' },
    { id: 'korea', name: 'Korean Peninsula', positions: [[37.5665, 126.9780], [39.0392, 125.7625]], color: '#ff2b2b', status: 'Critical' },
    { id: 'india-pak', name: 'Kashmir Border Tensions', positions: [[28.6139, 77.2090], [33.7294, 73.0931]], color: '#ff7b00', status: 'High' },
    { id: 'iran-israel', name: 'Middle East Turmoil', positions: [[35.6892, 51.3890], [31.7683, 35.2137]], color: '#ff2b2b', status: 'Critical' },
    { id: 'russia-nato', name: 'Eastern Europe / NATO', positions: [[55.7558, 37.6173], [52.2297, 21.0122]], color: '#ff7b00', status: 'High' },
    { id: 'sudan', name: 'Sudan Conflict', positions: [[15.5007, 32.5599], [12.7909, 24.3820]], color: '#ff2b2b', status: 'Active' },
    { id: 'myanmar', name: 'Myanmar Turmoil', positions: [[19.7633, 96.0785], [21.9162, 95.9560]], color: '#ff7b00', status: 'High' }
];

export default function TensionLayer() {
    return (
        <>
            {FLASHPOINTS.map((fp) => (
                <React.Fragment key={fp.id}>
                    {/* Glowing Arc Line */}
                    <Polyline
                        positions={fp.positions}
                        pathOptions={{
                            color: fp.color,
                            weight: 2,
                            dashArray: "8, 12",
                            opacity: 0.8
                        }}
                        className="tension-arc"
                    />

                    {/* Origin Node */}
                    <CircleMarker
                        center={fp.positions[0]}
                        radius={4}
                        pathOptions={{ color: fp.color, fillColor: fp.color, fillOpacity: 1, weight: 1 }}
                        className="tension-node"
                    >
                        <Tooltip direction="top" className="custom-tooltip">
                            <div className="font-bold text-[var(--color-text-primary)]">{fp.name}</div>
                            <div className="text-[10px] uppercase text-[var(--color-danger)] tracking-wide">{fp.status} Alert</div>
                        </Tooltip>
                    </CircleMarker>

                    {/* Destination Node */}
                    <CircleMarker
                        center={fp.positions[1]}
                        radius={4}
                        pathOptions={{ color: fp.color, fillColor: fp.color, fillOpacity: 1, weight: 1 }}
                        className="tension-node"
                    >
                        <Tooltip direction="top" className="custom-tooltip">
                            <div className="font-bold text-[var(--color-text-primary)]">{fp.name}</div>
                            <div className="text-[10px] uppercase text-[var(--color-danger)] tracking-wide">{fp.status} Alert</div>
                        </Tooltip>
                    </CircleMarker>
                </React.Fragment>
            ))}
        </>
    );
}
