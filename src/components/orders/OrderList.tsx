import { Order, OrderStatus } from '../../store/types';
import { OrderItem } from './OrderItem';

interface Props {
    title: string;
    orders: Order[];
    status: OrderStatus;
    accent: string;
}

export function OrderList({ title, orders, status, accent }: Props) {
    const filtered = orders.filter((o) => o.status === status);

    return (
        <section
            style={{
                flex: 1,
                minWidth: 240,
                border: `2px solid ${accent}`,
                borderRadius: 8,
                padding: 12,
                background: '#fff',
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
                <h2 style={{ margin: 0, fontSize: 16, color: accent }}>{title}</h2>
                <span style={{ fontSize: 12, color: '#888' }}>
                    {filtered.length} order{filtered.length === 1 ? '' : 's'}
                </span>
            </header>

            {filtered.length === 0 ? (
                <div style={{ color: '#aaa', fontSize: 13, fontStyle: 'italic' }}>
                    No orders
                </div>
            ) : (
                filtered.map((o) => <OrderItem key={o.id} order={o} />)
            )}
        </section>
    );
}
