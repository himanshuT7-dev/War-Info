export function calculateThreatLevel(events = []) {
    if (!events.length) return { level: 'LOW', color: '#00e676', score: 0 };

    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;

    let score = 0;

    events.forEach(event => {
        const eventTime = new Date(event.event_date || event.timestamp).getTime();
        const ageHours = (now - eventTime) / (1000 * 60 * 60);
        const recencyMultiplier = ageHours < 6 ? 3 : ageHours < 12 ? 2 : ageHours < 24 ? 1.5 : 1;

        const fatalities = parseInt(event.fatalities) || 0;
        const fatalityScore = fatalities >= 50 ? 10 : fatalities >= 20 ? 7 : fatalities >= 5 ? 4 : fatalities > 0 ? 2 : 1;

        const typeMultiplier = getEventTypeWeight(event.event_type);

        score += fatalityScore * recencyMultiplier * typeMultiplier;
    });

    const normalizedScore = Math.min(100, score / Math.max(1, events.length) * 10);

    if (normalizedScore >= 75) return { level: 'CRITICAL', color: '#ff2b2b', score: normalizedScore };
    if (normalizedScore >= 50) return { level: 'HIGH', color: '#ff7b00', score: normalizedScore };
    if (normalizedScore >= 25) return { level: 'MODERATE', color: '#ff7b00', score: normalizedScore };
    return { level: 'LOW', color: '#00e676', score: normalizedScore };
}

function getEventTypeWeight(type) {
    const weights = {
        'Battles': 3,
        'Explosions/Remote violence': 4,
        'Violence against civilians': 5,
        'Strategic developments': 2,
        'Protests': 1,
        'Riots': 1.5
    };
    return weights[type] || 1;
}

export function getStrikeIntensity(fatalities) {
    const f = parseInt(fatalities) || 0;
    if (f >= 50) return { radius: 25, color: '#ff0000', opacity: 0.9 };
    if (f >= 20) return { radius: 20, color: '#ff2b2b', opacity: 0.8 };
    if (f >= 5) return { radius: 15, color: '#ff5555', opacity: 0.7 };
    if (f > 0) return { radius: 12, color: '#ff7777', opacity: 0.6 };
    return { radius: 8, color: '#ff9999', opacity: 0.5 };
}

export function calculateRouteRisk(route, events) {
    if (!route || !events.length) return 'unknown';

    let dangerPoints = 0;

    route.forEach(([lat, lng]) => {
        events.forEach(event => {
            const elat = parseFloat(event.latitude);
            const elng = parseFloat(event.longitude);
            const dist = getDistanceKm(lat, lng, elat, elng);
            if (dist < 20) dangerPoints += 3;
            else if (dist < 50) dangerPoints += 2;
            else if (dist < 100) dangerPoints += 1;
        });
    });

    const avgDanger = dangerPoints / route.length;
    if (avgDanger >= 5) return 'extreme';
    if (avgDanger >= 3) return 'high';
    if (avgDanger >= 1) return 'moderate';
    return 'low';
}

function getDistanceKm(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function formatTimeAgo(timestamp) {
    if (!timestamp) return 'Unknown';
    const now = Date.now();
    const then = new Date(timestamp).getTime();
    const diffMs = now - then;
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}
