import { timeAgo } from '@surihoney/time-ago';
import { Order } from '../../store/types';
import { useNow } from '../../hooks/useNow';
import { getRemainingTime } from '../../utils/time';

interface Props {
    order: Order;
}

export function OrderItem({ order }: Props) {
    const now = useNow();
    const remaining = getRemainingTime(order, now);

    const isVip = order.type === 'VIP';

    return (
        <div
            style={{
                padding: '8px 12px',
                marginBottom: 6,
                borderRadius: 6,
                border: `1px solid ${isVip ? '#e0b000' : '#d0d0d0'}`,
                background: isVip ? '#fff7d6' : '#fafafa',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontFamily: 'system-ui, sans-serif',
                fontSize: 14,
            }}
        >
            <span>
                <strong>#{order.id}</strong>{' '}
                <span
                    style={{
                        fontSize: 11,
                        fontWeight: 600,
                        padding: '1px 6px',
                        borderRadius: 4,
                        background: isVip ? '#e0b000' : '#c0c0c0',
                        color: '#fff',
                        marginLeft: 4,
                    }}
                >
                    {order.type}
                </span>
            </span>

            {order.status === 'PROCESSING' && (
                <span style={{ color: '#555', fontVariantNumeric: 'tabular-nums' }}>
                    ⏱ {Math.ceil(remaining / 1000)}s
                </span>
            )}

            {order.status === 'COMPLETED' && order.completedAt !== undefined && (
                <span
                    style={{ color: '#22a06b', fontSize: 12 }}
                    title={new Date(order.completedAt).toLocaleString()}
                >
                    ✓ {timeAgo(order.completedAt)}
                </span>
            )}
        </div>
    );
}
