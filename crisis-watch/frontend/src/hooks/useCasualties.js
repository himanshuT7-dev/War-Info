import { useState, useEffect, useCallback, useRef } from 'react';

export function useCasualties(regionKey, refreshSeconds = 1800) {
    const [casualties, setCasualties] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const intervalRef = useRef(null);

    const fetchCasualties = useCallback(async () => {
        if (!regionKey) {
            setCasualties(null);
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`/api/casualties/${regionKey}`);

            if (!res.ok) {
                console.warn(`[useCasualties] HTTP ${res.status}`);
                setCasualties(null);
                setError(`HTTP ${res.status}`);
                return;
            }

            const json = await res.json();

            if (json.data && typeof json.data === 'object') {
                setCasualties(json.data);
                setError(null);
            } else if (json.error || json.empty) {
                // Backend fallback: show a graceful placeholder instead of nothing
                setCasualties({
                    conflictName: 'Casualty data unavailable',
                    startDate: null,
                    parties: [],
                    totalKilled: null,
                    totalWounded: null,
                    totalDisplaced: null,
                    source: 'Wikipedia',
                    sourceUrl: null
                });
                setError(null);
            }
        } catch (err) {
            console.warn('[useCasualties] Error:', err.message);
            setError(err.message);
            setCasualties(null);
        } finally {
            setLoading(false);
        }
    }, [regionKey]);

    useEffect(() => {
        fetchCasualties();

        // Refresh based on configured interval (fallback 30 minutes)
        const rate = (refreshSeconds || 1800) * 1000;
        intervalRef.current = setInterval(fetchCasualties, rate);
        return () => clearInterval(intervalRef.current);
    }, [fetchCasualties, refreshSeconds]);

    return { casualties, loading, error, refetch: fetchCasualties };
}
