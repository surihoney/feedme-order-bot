import { useStore } from '../../store/useStore';

const buttonStyle: React.CSSProperties = {
    padding: '8px 14px',
    marginRight: 8,
    border: '1px solid #4a90e2',
    borderRadius: 6,
    background: '#e7f0fb',
    cursor: 'pointer',
    fontSize: 14,
};

export function BotControls() {
    const addBot = useStore((state) => state.addBot);
    const removeBot = useStore((state) => state.removeBot);

    return (
        <div>
            <h2 style={{ margin: '0 0 8px', fontSize: 14, color: '#555' }}>
                Bots
            </h2>
            <button style={buttonStyle} onClick={addBot}>
                + Bot
            </button>
            <button style={buttonStyle} onClick={removeBot}>
                - Bot
            </button>
        </div>
    );
}
