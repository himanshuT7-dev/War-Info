import React, { useMemo } from 'react';
import { HeatmapLayer } from 'react-leaflet-heatmap-layer-v3';

export default function ConflictHeatmap({ events }) {
    const heatmapData = useMemo(() => {
        if (!events || events.length === 0) return [];

        return events
            .filter(e => e.latitude && e.longitude)
            .map(e => {
                // ACLED 'fatalities' field is typically a string number
                const fatalities = parseInt(e.fatalities) || 0;

                // Base weight of 1 for incidents with 0 fatalities
                // Increase weight based on fatalities (max 5)
                const weight = Math.min(5, 1 + fatalities * 0.5);

                return [
                    parseFloat(e.latitude),
                    parseFloat(e.longitude),
                    weight
                ];
            });
    }, [events]);

    if (!heatmapData.length) return null;

    return (
        <HeatmapLayer
            fitBoundsOnLoad={false}
            fitBoundsOnUpdate={false}
            points={heatmapData}
            longitudeExtractor={m => m[1]}
            latitudeExtractor={m => m[0]}
            intensityExtractor={m => m[2]}
            radius={25}
            blur={20}
            maxZoom={12}
            minOpacity={0.4}
            gradient={{
                0.2: '#00d2ff', // light blue
                0.4: '#00ff00', // green
                0.6: '#ffff00', // yellow
                0.8: '#ff8c00', // orange
                1.0: '#ff0000'  // red
            }}
        />
    );
}
