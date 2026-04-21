import { create } from 'zustand';
import { AppState, Order } from './types';
import { insertOrder } from '../utils/queue';
import { startJob, cancelJob } from './scheduler';

const ORDER_DURATION_MS = 10_000;

export const useStore = create<AppState>((set, get) => {
    const completeOrder = (orderId: number, botId: number) => {
        set((state) => ({
            orders: state.orders.map((o) =>
                o.id === orderId
                    ? {
                          ...o,
                          status: 'COMPLETED',
                          startedAt: undefined,
                          duration: undefined,
                      }
                    : o,
            ),
            bots: state.bots.map((b) =>
                b.id === botId
                    ? { ...b, status: 'IDLE', currentOrderId: undefined }
                    : b,
            ),
        }));
        assignOrders();
    };

    const assignOrders = () => {
        const { bots, orders } = get();

        const idleBots = bots.filter((b) => b.status === 'IDLE');
        const pendingOrders = orders.filter((o) => o.status === 'PENDING');

        if (!idleBots.length || !pendingOrders.length) return;

        const pairCount = Math.min(idleBots.length, pendingOrders.length);
        const pairs: { botId: number; orderId: number }[] = [];
        for (let i = 0; i < pairCount; i++) {
            pairs.push({
                botId: idleBots[i].id,
                orderId: pendingOrders[i].id,
            });
        }

        const botToOrder = new Map(pairs.map((p) => [p.botId, p.orderId]));
        const orderToBot = new Map(pairs.map((p) => [p.orderId, p.botId]));
        const startedAt = Date.now();

        set((state) => ({
            bots: state.bots.map((b) =>
                botToOrder.has(b.id)
                    ? {
                          ...b,
                          status: 'WORKING',
                          currentOrderId: botToOrder.get(b.id),
                      }
                    : b,
            ),
            orders: state.orders.map((o) =>
                orderToBot.has(o.id)
                    ? {
                          ...o,
                          status: 'PROCESSING',
                          startedAt,
                          duration: ORDER_DURATION_MS,
                      }
                    : o,
            ),
        }));

        pairs.forEach(({ botId, orderId }) => {
            startJob(orderId, ORDER_DURATION_MS, () => {
                completeOrder(orderId, botId);
            });
        });
    };

    return {
        orders: [],
        bots: [],
        nextOrderId: 1,
        nextBotId: 1,

        addOrder: (type) => {
            set((state) => {
                const newOrder: Order = {
                    id: state.nextOrderId,
                    type,
                    status: 'PENDING',
                    createdAt: Date.now(),
                };
                const pending = state.orders.filter(
                    (o) => o.status === 'PENDING',
                );
                const others = state.orders.filter(
                    (o) => o.status !== 'PENDING',
                );
                return {
                    orders: [...insertOrder(pending, newOrder), ...others],
                    nextOrderId: state.nextOrderId + 1,
                };
            });
            assignOrders();
        },

        addBot: () => {
            set((state) => ({
                bots: [
                    ...state.bots,
                    { id: state.nextBotId, status: 'IDLE' },
                ],
                nextBotId: state.nextBotId + 1,
            }));
            assignOrders();
        },

        removeBot: () => {
            const { bots } = get();
            if (bots.length === 0) return;

            const bot = bots[bots.length - 1];
            const orderId = bot.currentOrderId;

            if (orderId !== undefined) {
                cancelJob(orderId);
            }

            set((state) => {
                const nextBots = state.bots.slice(0, -1);

                if (orderId === undefined) {
                    return { bots: nextBots };
                }

                const target = state.orders.find((o) => o.id === orderId);
                if (!target) {
                    return { bots: nextBots };
                }

                const resetOrder: Order = {
                    ...target,
                    status: 'PENDING',
                    startedAt: undefined,
                    duration: undefined,
                };

                const pending = state.orders.filter(
                    (o) => o.status === 'PENDING' && o.id !== orderId,
                );
                const others = state.orders.filter(
                    (o) => o.status !== 'PENDING' && o.id !== orderId,
                );

                return {
                    bots: nextBots,
                    orders: [
                        ...insertOrder(pending, resetOrder),
                        ...others,
                    ],
                };
            });

            assignOrders();
        },
    };
});
