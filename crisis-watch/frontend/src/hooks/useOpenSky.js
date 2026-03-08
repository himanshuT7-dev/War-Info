import { useState, useEffect, useCallback, useRef } from 'react';

export function useOpenSky(region) {
    const [aircraft, setAircraft] = useState([]);
    const [loading, setLoading] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [isCached, setIsCached] = useState(false);
    const intervalRef = useRef(null);

    const fetchFlights = useCallback(async () => {
        if (!region?.bounds) return;
        setLoading(true);

        try {
            const { lamin, lomin, lamax, lomax } = region.bounds;
            const res = await fetch(
                `/api/flights/states?lamin=${lamin}&lomin=${lomin}&lamax=${lamax}&lomax=${lomax}`
            );

            if (!res.ok) {
                console.warn(`[useOpenSky] HTTP ${res.status} — OpenSky may be rate-limited, will retry`);
                return; // Keep existing data
            }

            const json = await res.json();

            if (json.data && Array.isArray(json.data)) {
                setAircraft(json.data);
                setLastUpdated(json.timestamp);
                setIsCached(json.cached || false);
            }
        } catch (err) {
            console.warn('[useOpenSky] Error:', err.message);
        } finally {
            setLoading(false);
        }
    }, [region]);

    useEffect(() => {
        fetchFlights();
        // OpenSky free tier: poll every 60s to avoid rate limiting
        intervalRef.current = setInterval(fetchFlights, 60000);
        return () => clearInterval(intervalRef.current);
    }, [fetchFlights]);

    return { aircraft, loading, lastUpdated, isCached, refetch: fetchFlights };
}
