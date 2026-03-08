import { useState, useEffect, useCallback, useRef } from 'react';

export function useNews(regionKey) {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);
    const intervalRef = useRef(null);

    const fetchNews = useCallback(async () => {
        setLoading(true);
        try {
            const endpoint = regionKey && regionKey !== 'global'
                ? `/api/news/${regionKey}`
                : '/api/news/global';

            const res = await fetch(endpoint);

            if (!res.ok) {
                console.warn(`[useNews] HTTP ${res.status}`);
                return;
            }

            const json = await res.json();

            if (json.data && Array.isArray(json.data)) {
                setNews(json.data);
                setLastUpdated(json.timestamp);
                setError(null);
            }
        } catch (err) {
            console.warn('[useNews] Error:', err.message);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [regionKey]);

    useEffect(() => {
        fetchNews();

        // Refresh every 5 minutes
        intervalRef.current = setInterval(fetchNews, 300000);
        return () => clearInterval(intervalRef.current);
    }, [fetchNews]);

    return { news, loading, error, lastUpdated, refetch: fetchNews };
}
