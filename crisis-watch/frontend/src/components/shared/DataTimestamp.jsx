import React from 'react';
import { formatTimeAgo } from '../../utils/riskCalculator';

export default function DataTimestamp({ timestamp, cached = false, className = '' }) {
    if (!timestamp) return null;

    const timeAgo = formatTimeAgo(timestamp);
    const utcTime = new Date(timestamp).toUTCString().slice(17, 25);

    return (
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${cached ? 'bg-[var(--color-warning-dim)]' : 'bg-[var(--color-safe-dim)]'} ${className}`}>
            <span className={`w-2 h-2 rounded-full ${cached ? 'bg-[var(--color-warning)] animate-pulse' : 'bg-[var(--color-safe)]'}`} />
            <span className="font-[family-name:var(--font-mono)] text-[10px] text-[var(--color-text-secondary)]">
                {cached ? '⚡ CACHED' : '🔴 LIVE'} · {utcTime} UTC · Updated {timeAgo}
            </span>
        </div>
    );
}
