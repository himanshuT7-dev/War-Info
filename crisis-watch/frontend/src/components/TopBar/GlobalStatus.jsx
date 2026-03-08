import React, { useState, useEffect } from 'react';
import ThreatBadge from '../shared/ThreatBadge';

export default function GlobalStatus({ threatLevel, onOpenSettings, onOpenComparison }) {
    const [utcTime, setUtcTime] = useState('');

    useEffect(() => {
        const update = () => {
            const now = new Date();
            const h = String(now.getUTCHours()).padStart(2, '0');
            const m = String(now.getUTCMinutes()).padStart(2, '0');
            const s = String(now.getUTCSeconds()).padStart(2, '0');
            setUtcTime(`${h}:${m}:${s}`);
        };
        update();
        const interval = setInterval(update, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <header className="flex items-center justify-between px-5 py-2.5 bg-[var(--color-bg-panel)] border-b border-[var(--color-border)]">
            {/* Logo */}
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-danger)] opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-[var(--color-danger)]"></span>
                    </span>
                    <h1 className="text-xl font-bold tracking-widest uppercase">
                        <span className="text-[var(--color-danger)]">WAR</span>
                        <span className="text-[var(--color-text-primary)]">INFO</span>
                    </h1>
                </div>
                <div className="hidden md:block h-4 w-px bg-[var(--color-border-bright)]" />
                <span className="hidden md:block text-[11px] text-[var(--color-text-dim)] tracking-widest uppercase">
                    Global Conflict Monitor
                </span>
            </div>

            {/* Center */}
            <div className="flex items-center gap-5">
                <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-[var(--color-bg-primary)] border border-[var(--color-border)]">
                    <svg className="w-3.5 h-3.5 text-[var(--color-accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span className="text-sm font-[family-name:var(--font-mono)] text-[var(--color-accent)] tracking-wider">
                        {utcTime}
                    </span>
                    <span className="text-[9px] text-[var(--color-text-dim)] font-bold">UTC</span>
                </div>

                <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-lg bg-[var(--color-bg-primary)] border border-[var(--color-border)]">
                    <span className="text-[10px] text-[var(--color-text-dim)] font-bold uppercase tracking-wider">Threat</span>
                    <ThreatBadge level={threatLevel?.level || 'LOW'} size="sm" />
                </div>
            </div>

            {/* Right */}
            <div className="flex items-center gap-2">
                <button
                    onClick={onOpenComparison}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--color-bg-primary)] border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] group"
                    title="Compare Countries"
                    id="compare-button"
                >
                    <span className="text-sm">⚖️</span>
                    <span className="hidden sm:inline text-[11px] font-bold uppercase tracking-wider">Compare</span>
                </button>
                <button
                    onClick={onOpenSettings}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--color-bg-primary)] border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] group"
                    title="Settings"
                    id="settings-button"
                >
                    <svg className="w-4 h-4 transition-transform group-hover:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="hidden sm:inline text-[11px] font-bold uppercase tracking-wider">Settings</span>
                </button>
            </div>
        </header>
    );
}
