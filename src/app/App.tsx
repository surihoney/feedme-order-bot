import { useStore } from '../store/useStore';
import { OrderControls } from '../components/controls/OrderControls';
import { BotControls } from '../components/controls/BotControls';
import { OrderList } from '../components/orders/OrderList';
import { BotList } from '../components/bots/BotList';

export default function App() {
    const orders = useStore((s) => s.orders);

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
