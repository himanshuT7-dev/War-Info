import { useState, useCallback } from 'react';

export function useGeolocation() {
    const [position, setPosition] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const getPosition = useCallback(() => {
        if (!navigator.geolocation) {
            setError('Geolocation not supported by your browser');
            return;
        }

        setLoading(true);
        setError(null);

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setPosition({
                    lat: pos.coords.latitude,
                    lon: pos.coords.longitude,
                    accuracy: pos.coords.accuracy
                });
                setLoading(false);
            },
            (err) => {
                setError(err.message);
                setLoading(false);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    }, []);

    const geocodeAddress = useCallback(async (address) => {
        setLoading(true);
        setError(null);

        try {
            const res = await fetch(`/api/geocode/search?q=${encodeURIComponent(address)}&limit=1`);
            const json = await res.json();

            if (json.data && json.data.length > 0) {
                const loc = json.data[0];
                setPosition({ lat: loc.lat, lon: loc.lon, name: loc.name });
            } else {
                setError('Location not found');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    return { position, loading, error, getPosition, geocodeAddress, setPosition };
}
