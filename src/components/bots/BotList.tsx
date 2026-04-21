import { useStore } from '../../store/useStore';

export function BotList() {
    const bots = useStore((s) => s.bots);

    return (
        <section
            style={{
                border: '2px solid #4a90e2',
                borderRadius: 8,
                padding: 12,
                background: '#fff',
                marginTop: 16,
            }}
        >
            <header
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    marginBottom: 10,
                }}
            >
                <h2 style={{ margin: 0, fontSize: 16, color: '#4a90e2' }}>
                    Bots
                </h2>
                <span style={{ fontSize: 12, color: '#888' }}>
                    {bots.length} bot{bots.length === 1 ? '' : 's'}
                </span>
            </header>

            {bots.length === 0 ? (
                <div style={{ color: '#aaa', fontSize: 13, fontStyle: 'italic' }}>
                    No bots. Click "+ Bot" to add one.
                </div>
            ) : (
                <div
                    style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 8,
                    }}
                >
                    {bots.map((bot) => {
                        const working = bot.status === 'WORKING';
                        return (
                            <div
                                key={bot.id}
                                style={{
                                    padding: '8px 12px',
                                    borderRadius: 6,
                                    border: `1px solid ${
                                        working ? '#4a90e2' : '#c0c0c0'
                                    }`,
                                    background: working ? '#e7f0fb' : '#fafafa',
                                    fontSize: 14,
                                    minWidth: 140,
                                }}
                            >
                                <div style={{ fontWeight: 600 }}>
                                    Bot #{bot.id}
                                </div>
                                <div style={{ fontSize: 12, color: '#555' }}>
                                    {working
                                        ? `Working on #${bot.currentOrderId}`
                                        : 'Idle'}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </section>
    );
}
