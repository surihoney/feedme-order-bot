import { Order } from '../store/types';

export function insertOrder(queue: Order[], newOrder: Order): Order[] {
    if (newOrder.type === 'VIP') {
        const index = queue.findIndex(o => o.type === 'NORMAL');

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