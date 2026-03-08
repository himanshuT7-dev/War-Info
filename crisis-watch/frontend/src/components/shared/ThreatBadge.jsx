import React from 'react';

const LEVEL_CONFIG = {
    CRITICAL: { bg: '#ff2b2b', text: '#fff', glow: 'rgba(255,43,43,0.3)' },
    HIGH: { bg: '#ff7b00', text: '#fff', glow: 'rgba(255,123,0,0.2)' },
    MODERATE: { bg: '#ff7b00', text: '#fff', glow: 'rgba(255,123,0,0.15)' },
    LOW: { bg: '#00e676', text: '#000', glow: 'rgba(0,230,118,0.15)' }
};

export default function ThreatBadge({ level = 'LOW', size = 'md' }) {
    const config = LEVEL_CONFIG[level] || LEVEL_CONFIG.LOW;
    const sizeClasses = size === 'sm'
        ? 'text-[10px] px-2 py-0.5'
        : size === 'lg'
            ? 'text-sm px-4 py-1.5'
            : 'text-xs px-3 py-1';

    return (
        <span
            className={`status-badge ${sizeClasses}`}
            style={{
                backgroundColor: config.bg,
                color: config.text,
                boxShadow: level === 'CRITICAL' ? `0 0 12px ${config.glow}` : 'none'
            }}
        >
            {level === 'CRITICAL' && (
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            )}
            {level}
        </span>
    );
}
