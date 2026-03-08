import { useState, useEffect, useCallback, useRef } from 'react';

export function useCyber(regionKey, refreshSeconds = 60) {
    const [cyberEvents, setCyberEvents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const intervalRef = useRef(null);

    const fetchCyberEvents = useCallback(async () => {
        if (!regionKey) {
            setCyberEvents([]);
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`/api/cyber/${regionKey}`);
            if (!res.ok) {
                setError(`HTTP ${res.status}`);
                return;
            }
            const json = await res.json();

            // If data is available, update state
            if (json.data && Array.isArray(json.data)) {
                setCyberEvents(json.data);
                setError(null);
            } else {
                setCyberEvents([]);
            }
        } catch (err) {
            console.warn('[useCyber] Error:', err.message);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [regionKey]);

    useEffect(() => {
        fetchCyberEvents();

        const rate = (refreshSeconds || 60) * 1000;
        intervalRef.current = setInterval(fetchCyberEvents, rate);
        return () => clearInterval(intervalRef.current);
    }, [fetchCyberEvents, refreshSeconds]);

    return { events: cyberEvents, loading, error, refetch: fetchCyberEvents };
}
