import React, { useMemo } from 'react';
import { CircleMarker, Popup } from 'react-leaflet';
import DataTimestamp from '../shared/DataTimestamp';

// Generate approximate coordinates for reports based on known country centroids
const COUNTRY_COORDS = {
    'Ukraine': [48.5, 31.2], 'Russia': [55.75, 37.6],
    'Palestine': [31.5, 34.45], 'Israel': [31.8, 35.2],
    'Lebanon': [33.9, 35.5], 'Syria': [34.8, 38.0],
    'Iraq': [33.3, 44.4], 'Iran': [35.7, 51.4],
    'Yemen': [15.35, 44.2], 'Sudan': [15.6, 32.5],
    'South Sudan': [6.8, 31.6], 'Chad': [12.1, 15.0],
    'Ethiopia': [9.0, 38.7], 'Eritrea': [15.3, 38.9],
    'Central African Republic': [6.6, 20.9],
    'Democratic Republic of the Congo': [-4.3, 15.3],
    'Somalia': [5.2, 46.2], 'Myanmar': [19.8, 96.2],
    'Afghanistan': [34.5, 69.2], 'Mali': [17.6, -2.0],
    'Burkina Faso': [12.4, -1.5], 'Niger': [13.5, 2.1],
    'Nigeria': [9.1, 7.5], 'Mozambique': [-15.0, 40.7],
    'Colombia': [4.7, -74.1], 'Haiti': [18.5, -72.3],
    'Pakistan': [30.3753, 69.3451], 'United Arab Emirates': [23.4241, 53.8478],
    'Saudi Arabia': [23.8859, 45.0792], 'Jordan': [31.2400, 36.5100],
    'Egypt': [26.8206, 30.8025]
};

function getJitteredCoords(country) {
    const base = COUNTRY_COORDS[country];
    if (!base) return null;
    // Add small random offset so markers don't stack
    const jitter = () => (Math.random() - 0.5) * 2;
    return [base[0] + jitter(), base[1] + jitter()];
}

function getReportSeverity(report) {
    const title = (report.title || '').toLowerCase();
    const type = (report.disasterType || '').toLowerCase();

    if (title.includes('killed') || title.includes('massacre') || title.includes('airstrike') || title.includes('bombing')) {
        return { radius: 20, color: '#ff0000', opacity: 0.85, level: 'critical' };
    }
    if (title.includes('attack') || title.includes('conflict') || title.includes('violence') || title.includes('explosion')) {
        return { radius: 16, color: '#ff2b2b', opacity: 0.75, level: 'high' };
    }
    if (title.includes('displacement') || title.includes('refugee') || title.includes('crisis') || type.includes('complex')) {
        return { radius: 13, color: '#ff5555', opacity: 0.65, level: 'moderate' };
    }
    if (title.includes('humanitarian') || title.includes('aid') || title.includes('relief')) {
        return { radius: 10, color: '#ff7b00', opacity: 0.55, level: 'info' };
    }
    return { radius: 8, color: '#ff9999', opacity: 0.5, level: 'low' };
}

export default function StrikeLayer({ events = [], visible = true }) {
    const markers = useMemo(() => {
        if (!visible) return [];
        return events.map(report => {
            const coords = getJitteredCoords(report.country);
            if (!coords) return null;
            const severity = getReportSeverity(report);
            return { ...report, lat: coords[0], lng: coords[1], severity };
        }).filter(Boolean);
    }, [events, visible]);

    if (!visible) return null;

    return (
        <>
            {markers.map((report, i) => (
                <React.Fragment key={report.id || i}>
                    {/* Outer pulse ring */}
                    <CircleMarker
                        center={[report.lat, report.lng]}
                        radius={report.severity.radius + 8}
                        pathOptions={{
                            color: report.severity.color,
                            fillColor: report.severity.color,
                            fillOpacity: 0.15,
                            weight: 0,
                            className: report.severity.level === 'critical' ? 'pulse-danger' : ''
                        }}
                    />
                    {/* Inner solid circle */}
                    <CircleMarker
                        center={[report.lat, report.lng]}
                        radius={report.severity.radius}
                        pathOptions={{
                            color: report.severity.color,
                            fillColor: report.severity.color,
                            fillOpacity: report.severity.opacity,
                            weight: 1
                        }}
                    >
                        <Popup>
                            <div className="min-w-[220px] max-w-[300px] text-sm">
                                <div className="font-bold text-[#ff2b2b] text-base mb-1 leading-tight">
                                    {report.title}
                                </div>
                                <div className="space-y-1 text-xs">
                                    <div><strong>Country:</strong> {report.country}</div>
                                    <div><strong>Date:</strong> {new Date(report.date).toLocaleDateString()}</div>
                                    {report.disasterType && <div><strong>Type:</strong> {report.disasterType}</div>}
                                    {report.disaster && <div><strong>Crisis:</strong> {report.disaster}</div>}
                                    <div><strong>Source:</strong> {report.source}</div>
                                    {report.url && (
                                        <a href={report.url} target="_blank" rel="noopener noreferrer"
                                            className="inline-block mt-1 text-[#00b4ff] underline text-[10px]">
                                            Read full report →
                                        </a>
                                    )}
                                </div>
                            </div>
                        </Popup>
                    </CircleMarker>
                </React.Fragment>
            ))}
        </>
    );
}
