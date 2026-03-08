import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Create a custom HTML marker for pulsing cyber alerts
const createCyberIcon = (severity) => {
    let baseColor;
    if (severity === 'critical') baseColor = 'rgba(255, 0, 0, 0.9)'; // Red
    else if (severity === 'high') baseColor = 'rgba(255, 100, 0, 0.9)'; // Orange
    else baseColor = 'rgba(200, 200, 0, 0.9)'; // Yellow

    const html = `
        <div style="
            width: 16px;
            height: 16px;
            background: ${baseColor};
            border-radius: 50%;
            border: 2px solid white;
            box-shadow: 0 0 10px ${baseColor};
            animation: cyber-pulse 1.5s infinite;
        ">
        </div>
    `;

    return L.divIcon({
        html,
        className: 'cyber-event-marker',
        iconSize: [16, 16],
        iconAnchor: [8, 8],
        popupAnchor: [0, -10]
    });
};

export default function CyberLayer({ events, visible }) {
    if (!visible || !events || events.length === 0) return null;

    return (
        <>
            {events.map((event) => (
                <Marker
                    key={event.id}
                    position={[event.lat, event.lon]}
                    icon={createCyberIcon(event.severity)}
                >
                    <Popup className="cyber-popup warinfo-popup">
                        <div className="font-sans text-white p-1">
                            <h3 className="font-bold text-sm mb-1 text-[var(--color-danger)] uppercase tracking-wider flex items-center gap-2">
                                🔌 {event.type}
                            </h3>
                            <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed border-b border-[var(--color-border)] pb-2 mb-2">
                                {event.description}
                            </p>
                            <div className="flex justify-between items-center text-[10px] text-[var(--color-text-dim)] uppercase tracking-wider">
                                <span>Severity: {event.severity}</span>
                                <span>{new Date(event.timestamp).toLocaleTimeString()}</span>
                            </div>
                        </div>
                    </Popup>
                </Marker>
            ))}
        </>
    );
}
