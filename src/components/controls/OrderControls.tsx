import { useStore } from '../../store/useStore';

const buttonStyle: React.CSSProperties = {
    padding: '8px 14px',
    marginRight: 8,
    border: '1px solid #c0c0c0',
    borderRadius: 6,
    background: '#fff',
    cursor: 'pointer',
    fontSize: 14,
};

export function OrderControls() {
    const addOrder = useStore((state) => state.addOrder);

    return (
        <div>
            <h2 style={{ margin: '0 0 8px', fontSize: 14, color: '#555' }}>
                Orders
            </h2>
            <button style={buttonStyle} onClick={() => addOrder('NORMAL')}>
                New Normal Order
            </button>
            <button
                style={{
                    ...buttonStyle,
                    borderColor: '#e0b000',
                    background: '#fff7d6',
                }}
                onClick={() => addOrder('VIP')}
            >
                New VIP Order
            </button>
        </div>
    );
}
