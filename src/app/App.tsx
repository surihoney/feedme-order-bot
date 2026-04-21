import { useStore } from '../store/useStore';
import { OrderControls } from '../components/controls/OrderControls';
import { BotControls } from '../components/controls/BotControls';
import { OrderList } from '../components/orders/OrderList';
import { BotList } from '../components/bots/BotList';

export default function App() {
    const orders = useStore((s) => s.orders);
    const bots = useStore((s) => s.bots);

    const pendingCount = orders.filter((o) => o.status === 'PENDING').length;
    const showNoBotWarning = pendingCount > 0 && bots.length === 0;

    return (
        <div
            style={{
                fontFamily: 'system-ui, sans-serif',
                padding: 20,
                maxWidth: 1100,
                margin: '0 auto',
                color: '#222',
            }}
        >
            <h1 style={{ marginTop: 0 }}>McDonald's Order Bot System</h1>

            <p
                style={{
                    margin: '0 0 16px',
                    fontSize: 13,
                    color: '#555',
                    lineHeight: 1.5,
                }}
            >
                <strong>How it works:</strong> Create orders with{' '}
                <em>New Normal Order</em> / <em>New VIP Order</em>. Orders stay
                in <strong>PENDING</strong> until a bot is available — click{' '}
                <em>+ Bot</em> to add a bot that will pick up orders (10s per
                order). Click <em>− Bot</em> to remove the newest bot; any
                order it was working on is returned to PENDING.
            </p>

            {showNoBotWarning && (
                <div
                    role="alert"
                    style={{
                        padding: '10px 14px',
                        marginBottom: 16,
                        borderRadius: 6,
                        border: '1px solid #e0b000',
                        background: '#fff7d6',
                        color: '#7a5b00',
                        fontSize: 13,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                    }}
                >
                    <span style={{ fontSize: 16 }} aria-hidden>
                        ⚠️
                    </span>
                    <span>
                        You have {pendingCount} pending order
                        {pendingCount === 1 ? '' : 's'} but no bots. Click{' '}
                        <strong>+ Bot</strong> to start processing.
                    </span>
                </div>
            )}

            <div
                style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 16,
                    marginBottom: 20,
                }}
            >
                <OrderControls />
                <BotControls />
            </div>

            <div
                style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 16,
                }}
            >
                <OrderList
                    title="PENDING"
                    orders={orders}
                    status="PENDING"
                    accent="#d97706"
                />
                <OrderList
                    title="PROCESSING"
                    orders={orders}
                    status="PROCESSING"
                    accent="#4a90e2"
                />
                <OrderList
                    title="COMPLETE"
                    orders={orders}
                    status="COMPLETED"
                    accent="#22a06b"
                />
            </div>

            <BotList />
        </div>
    );
}
