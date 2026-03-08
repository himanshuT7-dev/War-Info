import React from 'react';

export default function AlertTicker({ reports = [] }) {
    if (!reports.length) {
        return (
            <div className="w-full bg-[var(--color-bg-primary)] border-b border-[var(--color-border)] py-1.5 px-3">
                <span className="text-[11px] font-[family-name:var(--font-mono)] text-[var(--color-text-dim)]">
                    ⚠️ Loading crisis reports...
                </span>
            </div>
        );
    }

    const tickerItems = reports.slice(0, 20).map(r => {
        const date = r.date ? new Date(r.date) : null;
        const timeStr = date ? date.toUTCString().slice(5, 22) : '';
        return `⚠️ ${timeStr} — ${r.title?.substring(0, 80)} — ${r.country} — Source: ${r.source || 'GDELT'}`;
    });

    const tickerText = tickerItems.join('    ●    ');

    return (
        <div className="w-full bg-[var(--color-bg-primary)] border-b border-[var(--color-danger-dim)] overflow-hidden py-1.5">
            <div className="ticker-scroll whitespace-nowrap">
                <span className="text-[11px] font-[family-name:var(--font-mono)] text-[var(--color-danger)]">
                    {tickerText}    ●    {tickerText}
                </span>
            </div>
        </div>
    );
}
