import { useState, useEffect, useCallback } from 'react';

export function useUNHCR(region) {
    const [shelters, setShelters] = useState([]);
    const [loading, setLoading] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [isCached, setIsCached] = useState(false);

    const fetchShelters = useCallback(async () => {
        if (!region) return;
        setLoading(true);

        try {
            const country = region.countries?.[0] || '';
            const res = await fetch(`/api/shelters/camps?country=${encodeURIComponent(country)}&limit=50`);

            if (!res.ok) {
                console.warn(`[useUNHCR] HTTP ${res.status}`);
                return;
            }

            const json = await res.json();

            if (json.data) {
                setShelters(Array.isArray(json.data) ? json.data : []);
                setLastUpdated(json.timestamp);
                setIsCached(json.cached || false);
            }
        } catch (err) {
            console.warn('[useUNHCR] Error:', err.message);
        } finally {
            setLoading(false);
        }
    }, [region]);

    useEffect(() => {
        fetchShelters();
    }, [fetchShelters]);

    return { shelters, loading, lastUpdated, isCached, refetch: fetchShelters };
}

export function useNearbyShelters() {
    const [shelters, setShelters] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const searchNearby = useCallback(async (lat, lon) => {
        setLoading(true);
        setError(null);

        try {
            const res = await fetch(`/api/shelters/nearby?lat=${lat}&lon=${lon}&radius=100`);

            if (!res.ok) {
                setError('Search service temporarily unavailable');
                return;
            }

            const json = await res.json();

            if (json.data && Array.isArray(json.data) && json.data.length > 0) {
                setShelters(json.data);
            } else {
                setError('No shelters found nearby');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    return { shelters, loading, error, searchNearby };
}
