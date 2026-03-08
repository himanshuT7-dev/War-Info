import { useState, useEffect } from 'react';
import axios from 'axios';

const CACHE_KEY = 'crisis_tensions_cache';
const CACHE_DURATION = 1000 * 60 * 30; // 30 mins

export default function useTensions() {
    const [tensions, setTensions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [isCached, setIsCached] = useState(false);

    useEffect(() => {
        let mounted = true;

        const loadTensions = async () => {
            try {
                // Check local cache
                const cached = localStorage.getItem(CACHE_KEY);
                if (cached) {
                    const parsed = JSON.parse(cached);
                    if (Date.now() - parsed.timestamp < CACHE_DURATION) {
                        if (mounted) {
                            setTensions(parsed.data);
                            setLastUpdated(parsed.timestamp);
                            setIsCached(true);
                            setLoading(false);
                        }
                    }
                }

                // Fetch fresh data
                const res = await axios.get('/api/tensions', { timeout: 10000 });
                const data = res.data?.data || [];

                if (mounted) {
                    setTensions(data);
                    setLastUpdated(Date.now());
                    setIsCached(res.data?.cached || false);
                    setLoading(false);
                    setError(null);

                    localStorage.setItem(CACHE_KEY, JSON.stringify({
                        data,
                        timestamp: Date.now()
                    }));
                }
            } catch (err) {
                console.error('Failed to fetch tensions:', err);
                if (mounted && tensions.length === 0) {
                    setError(err.message);
                    setLoading(false);
                }
            }
        };

        loadTensions();

        return () => { mounted = false; };
    }, []);

    return { tensions, loading, error, lastUpdated, isCached };
}
