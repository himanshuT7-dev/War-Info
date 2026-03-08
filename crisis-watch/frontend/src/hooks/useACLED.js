import { useState, useEffect, useCallback, useRef } from 'react';

export function useACLED(region, settings) {
    const [events, setEvents] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [isCached, setIsCached] = useState(false);
    const intervalRef = useRef(null);

    const fetchEvents = useCallback(async () => {
        if (!settings?.acledKey || !settings?.acledEmail) {
            // Provide realistic mock data for the heatmap if no API key is present
            if (region?.center) {
                const mockEvents = Array.from({ length: 150 }).map((_, i) => {
                    // Create clustered distributions around the region center
                    const radius = i < 50 ? 1 : i < 100 ? 3 : 6;
                    const angle = Math.random() * Math.PI * 2;
                    const r = Math.random() * radius;
                    return {
                        latitude: region.center[0] + Math.sin(angle) * r,
                        longitude: region.center[1] + Math.cos(angle) * r,
                        fatalities: Math.floor(Math.random() * (i < 20 ? 15 : i < 50 ? 5 : 2)),
                        event_type: 'Explosions/Remote violence',
                        country: region.name
                    };
                });
                setEvents(mockEvents);
                setStats({
                    totalEvents: 150,
                    totalFatalities: mockEvents.reduce((acc, curr) => acc + curr.fatalities, 0)
                });
                setLoading(false);
            }
            return;
        }

        setLoading(true);
        try {
            const params = new URLSearchParams({
                key: settings.acledKey,
                email: settings.acledEmail,
                days: 7,
                limit: 500
            });
            if (region?.acledRegion) params.set('region', region.acledRegion);

            const res = await fetch(`/api/acled/events?${params}`);
            const json = await res.json();

            if (json.data) {
                const filtered = region?.countries?.length
                    ? json.data.filter(e => region.countries.some(c =>
                        e.country?.toLowerCase().includes(c.toLowerCase())
                    ))
                    : json.data;
                setEvents(filtered);
                setLastUpdated(json.timestamp);
                setIsCached(json.cached || false);
                setError(null);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [region, settings?.acledKey, settings?.acledEmail]);

    const fetchStats = useCallback(async () => {
        if (!settings?.acledKey || !settings?.acledEmail) return;

        try {
            const params = new URLSearchParams({
                key: settings.acledKey,
                email: settings.acledEmail,
                days: 1
            });
            if (region?.acledRegion) params.set('region', region.acledRegion);

            const res = await fetch(`/api/acled/stats?${params}`);
            const json = await res.json();
            if (json.data) setStats(json.data);
        } catch (err) {
            console.error('[useACLED] Stats error:', err);
        }
    }, [region, settings?.acledKey, settings?.acledEmail]);

    useEffect(() => {
        fetchEvents();
        fetchStats();

        const rate = (settings?.refreshRate || 60) * 1000;
        intervalRef.current = setInterval(() => {
            fetchEvents();
            fetchStats();
        }, rate);

        return () => clearInterval(intervalRef.current);
    }, [fetchEvents, fetchStats, settings?.refreshRate]);

    return { events, stats, loading, error, lastUpdated, isCached, refetch: fetchEvents };
}
