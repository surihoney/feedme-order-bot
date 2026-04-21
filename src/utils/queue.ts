import { Order, OrderType } from '../store/types';

const typeRank = (t: OrderType) => (t === 'VIP' ? 0 : 1);

export function insertOrder(queue: Order[], newOrder: Order): Order[] {
    if (newOrder.type === 'VIP') {
        const index = queue.findIndex((o) => o.type === 'NORMAL');

        if (index === -1) {
            return [...queue, newOrder];
        }

        return [
            ...queue.slice(0, index),
            newOrder,
            ...queue.slice(index),
        ];
    }

    return [...queue, newOrder];
}

/**
 * Re-insert an order that was previously picked up and then cancelled.
 * Places the order at its *original* position: VIPs ahead of NORMALs,
 * and within each type class, ordered by id (FIFO by creation).
 */
export function reinsertCancelledOrder(
    queue: Order[],
    order: Order,
): Order[] {
    const targetRank = typeRank(order.type);

    let idx = queue.findIndex((o) => {
        const rank = typeRank(o.type);
        if (rank > targetRank) return true;
        if (rank === targetRank && o.id > order.id) return true;
        return false;
    });

    if (idx === -1) idx = queue.length;

    return [...queue.slice(0, idx), order, ...queue.slice(idx)];
}
