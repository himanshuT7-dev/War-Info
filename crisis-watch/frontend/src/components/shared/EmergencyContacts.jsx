import React from 'react';

export default function EmergencyContacts({ contacts, regionName }) {
    if (!contacts) return null;

    const items = [
        { label: 'ICRC — Red Cross Hotline', number: contacts.icrc, icon: '🔴', color: '#ff2b2b' },
        { label: 'UNHCR — Refugee Agency', number: contacts.unhcr, icon: '🔵', color: '#00b4ff' },
        { label: 'Local Emergency Number', number: contacts.local, icon: '🟡', color: '#ff7b00' },
        { label: 'MSF — Doctors Without Borders', number: contacts.msf, icon: '🟢', color: '#00e676' }
    ];

    return (
        <div className="space-y-2">
            {items.map((item, i) => (
                <a
                    key={i}
                    href={`tel:${item.number}`}
                    className="panel-card !py-3 !px-3 flex items-center gap-3 hover:!border-[var(--color-accent)] transition-all group cursor-pointer"
                    style={{ borderLeftWidth: '3px', borderLeftColor: item.color }}
                >
                    <div className="flex-1 min-w-0">
                        <div className="text-[10px] font-bold text-[var(--color-text-dim)] uppercase tracking-wider">{item.label}</div>
                        <div className="text-base font-bold font-[family-name:var(--font-mono)] text-[var(--color-text-primary)] group-hover:text-[var(--color-accent)] transition-colors mt-0.5">
                            {item.number}
                        </div>
                    </div>
                    <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all group-hover:scale-110" style={{ background: `${item.color}22` }}>
                        <svg className="w-4 h-4" style={{ color: item.color }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                    </div>
                </a>
            ))}
        </div>
    );
}
