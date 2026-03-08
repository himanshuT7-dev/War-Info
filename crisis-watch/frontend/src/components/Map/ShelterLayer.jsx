import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

const shelterIcon = L.divIcon({
    className: 'custom-icon',
    html: `<div style="
    width: 24px; height: 24px; 
    background: #00e676; 
    border: 2px solid #fff; 
    border-radius: 50%; 
    display: flex; align-items: center; justify-content: center;
    font-size: 12px; color: #000; font-weight: bold;
    box-shadow: 0 0 8px rgba(0,230,118,0.5);
  ">🏥</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -14]
});

const campIcon = L.divIcon({
    className: 'custom-icon',
    html: `<div style="
    width: 24px; height: 24px; 
    background: #00b4ff; 
    border: 2px solid #fff; 
    border-radius: 50%; 
    display: flex; align-items: center; justify-content: center;
    font-size: 12px; color: #000; font-weight: bold;
    box-shadow: 0 0 8px rgba(0,180,255,0.5);
  ">⛺</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -14]
});

const foodIcon = L.divIcon({
    className: 'custom-icon',
    html: `<div style="
    width: 24px; height: 24px; 
    background: #ff7b00; 
    border: 2px solid #fff; 
    border-radius: 50%; 
    display: flex; align-items: center; justify-content: center;
    font-size: 12px; color: #000; font-weight: bold;
    box-shadow: 0 0 8px rgba(255,123,0,0.5);
  ">🍞</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -14]
});

function getIcon(type) {
    if (!type) return campIcon;
    const t = type.toLowerCase();
    if (t.includes('hospital') || t.includes('health') || t.includes('medical')) return shelterIcon;
    if (t.includes('food') || t.includes('water') || t.includes('distribution')) return foodIcon;
    return campIcon;
}

export default function ShelterLayer({ shelters = [], visible = true }) {
    if (!visible) return null;

    return (
        <>
            {shelters.map((shelter, i) => {
                const lat = parseFloat(shelter.lat || shelter.latitude);
                const lon = parseFloat(shelter.lon || shelter.longitude);
                if (!lat || !lon || isNaN(lat) || isNaN(lon)) return null;

                return (
                    <Marker
                        key={i}
                        position={[lat, lon]}
                        icon={getIcon(shelter.type)}
                    >
                        <Popup>
                            <div className="min-w-[200px] text-sm">
                                <div className="font-bold text-[#00e676] text-base mb-1">
                                    {shelter.name || 'Aid Location'}
                                </div>
                                <div className="space-y-1 text-xs">
                                    {shelter.type && <div><strong>Type:</strong> {shelter.type}</div>}
                                    {shelter.capacity && <div><strong>Capacity:</strong> {shelter.capacity}</div>}
                                    {shelter.status && (
                                        <div>
                                            <strong>Status:</strong>{' '}
                                            <span className={shelter.status === 'open' ? 'text-[#00e676]' : shelter.status === 'full' ? 'text-[#ff2b2b]' : 'text-[#ff7b00]'}>
                                                {shelter.status.toUpperCase()}
                                            </span>
                                        </div>
                                    )}
                                    {shelter.contact && <div><strong>Contact:</strong> {shelter.contact}</div>}
                                    {shelter.distance && <div><strong>Distance:</strong> {shelter.distance} km</div>}
                                    {shelter.directionsUrl && (
                                        <a
                                            href={shelter.directionsUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-block mt-1 px-2 py-1 bg-[#00e676] text-black font-bold rounded text-xs"
                                        >
                                            📍 Get Directions
                                        </a>
                                    )}
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                );
            })}
        </>
    );
}
