import { useState, useEffect, useCallback, useRef } from 'react';

export function useReliefWeb(region, settings) {
    const [reports, setReports] = useState([]);
    const [disasters, setDisasters] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [isCached, setIsCached] = useState(false);
    const intervalRef = useRef(null);

    const fetchReports = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ limit: 100 });

            if (region?.countries?.length) {
                region.countries.forEach(c => params.append('country', c));
            }

            const res = await fetch(`/api/reliefweb/reports?${params}`);

            if (!res.ok) {
                console.warn(`[useReliefWeb] Reports HTTP ${res.status}`);
                return; // Keep existing data
            }

            const json = await res.json();

            if (json.data && Array.isArray(json.data)) {
                setReports(json.data);
                setLastUpdated(json.timestamp);
                setIsCached(json.cached || false);
                setError(null);
            }
        } catch (err) {
            console.warn('[useReliefWeb] Reports error:', err.message);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [region]);

    const fetchDisasters = useCallback(async () => {
        try {
            const params = new URLSearchParams({ limit: 30 });

            if (region?.countries?.length) {
                region.countries.forEach(c => params.append('country', c));
            }

            const res = await fetch(`/api/reliefweb/disasters?${params}`);

            if (!res.ok) {
                console.warn(`[useReliefWeb] Disasters HTTP ${res.status}`);
                return;
            }

            const json = await res.json();

            if (json.data && Array.isArray(json.data)) {
                setDisasters(json.data);
            }
        } catch (err) {
            console.warn('[useReliefWeb] Disasters error:', err.message);
        }
    }, [region]);

    useEffect(() => {
        fetchReports();
        fetchDisasters();

        const rate = (settings?.refreshRate || 120) * 1000;
        intervalRef.current = setInterval(() => {
            fetchReports();
            fetchDisasters();
        }, rate);

        return () => clearInterval(intervalRef.current);
    }, [fetchReports, fetchDisasters, settings?.refreshRate]);

    // Build stats from GDELT reports
    const stats = {
        totalReports: reports.length,
        totalDisasters: disasters.length,
        byCountry: {},
        byType: {},
        recentReports: reports.slice(0, 10)
    };

    reports.forEach(r => {
        stats.byCountry[r.country] = (stats.byCountry[r.country] || 0) + 1;
        if (r.disasterType) {
            stats.byType[r.disasterType] = (stats.byType[r.disasterType] || 0) + 1;
        }
        (r.themes || []).forEach(t => {
            stats.byType[t] = (stats.byType[t] || 0) + 1;
        });
    });

    return {
        reports,
        disasters,
        stats,
        loading,
        error,
        lastUpdated,
        isCached,
        refetch: fetchReports
    };
}
