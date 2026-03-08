import React from 'react';

export default class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('[WarInfo Error Boundary]', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    height: '100%', width: '100%', background: '#070a0f', color: '#e0e8f0',
                    fontFamily: "'Barlow Condensed', sans-serif", padding: '2rem', textAlign: 'center'
                }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
                    <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px', color: '#ff2b2b' }}>
                        SYSTEM ERROR
                    </h1>
                    <p style={{ fontSize: '14px', color: '#8899aa', maxWidth: '400px', marginBottom: '16px' }}>
                        A critical error occurred in the WarInfo monitoring system.
                        This may be due to a network issue or data corruption.
                    </p>
                    <code style={{
                        fontSize: '11px', color: '#ff7b00', background: '#0d1219',
                        padding: '8px 16px', borderRadius: '8px', border: '1px solid #1a2332',
                        maxWidth: '500px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                    }}>
                        {this.state.error?.message || 'Unknown error'}
                    </code>
                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            marginTop: '24px', padding: '10px 32px', borderRadius: '10px',
                            background: '#00b4ff', color: '#000', fontWeight: 700, fontSize: '14px',
                            border: 'none', cursor: 'pointer', fontFamily: "'Barlow Condensed', sans-serif"
                        }}
                    >
                        🔄 RELOAD SYSTEM
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}
