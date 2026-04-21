import { describe, it, expect } from 'vitest';
import { insertOrder, reinsertCancelledOrder } from '../utils/queue';
import { Order, OrderType } from '../store/types';

let nextId = 1;
function makeOrder(type: OrderType): Order {
    return {
        id: nextId++,
        type,
        status: 'PENDING',
        createdAt: Date.now(),
    };
}

const ids = (orders: Order[]) => orders.map((o) => o.id);
const types = (orders: Order[]) => orders.map((o) => o.type);

describe('insertOrder', () => {
    it('appends a NORMAL order to an empty queue', () => {
        const normal = makeOrder('NORMAL');
        expect(insertOrder([], normal)).toEqual([normal]);
    });

    it('appends a NORMAL order after existing NORMAL orders', () => {
        const a = makeOrder('NORMAL');
        const b = makeOrder('NORMAL');
        const c = makeOrder('NORMAL');
        const queue = insertOrder(insertOrder([a], b), c);
        expect(ids(queue)).toEqual([a.id, b.id, c.id]);
    });

    it('appends a NORMAL order after any existing VIP orders', () => {
        const vip = makeOrder('VIP');
        const normal = makeOrder('NORMAL');
        const queue = insertOrder([vip], normal);
        expect(types(queue)).toEqual(['VIP', 'NORMAL']);
    });

    it('places a VIP order ahead of every NORMAL order', () => {
        const n1 = makeOrder('NORMAL');
        const n2 = makeOrder('NORMAL');
        const vip = makeOrder('VIP');
        const queue = insertOrder([n1, n2], vip);
        expect(ids(queue)).toEqual([vip.id, n1.id, n2.id]);
    });

    it('places a VIP order behind existing VIP orders but ahead of NORMAL orders', () => {
        const v1 = makeOrder('VIP');
        const n1 = makeOrder('NORMAL');
        const v2 = makeOrder('VIP');
        const queue = insertOrder([v1, n1], v2);
        expect(ids(queue)).toEqual([v1.id, v2.id, n1.id]);
        expect(types(queue)).toEqual(['VIP', 'VIP', 'NORMAL']);
    });

    it('appends a VIP order to the end of an all-VIP queue', () => {
        const v1 = makeOrder('VIP');
        const v2 = makeOrder('VIP');
        const v3 = makeOrder('VIP');
        const queue = insertOrder(insertOrder([v1], v2), v3);
        expect(ids(queue)).toEqual([v1.id, v2.id, v3.id]);
    });

    it('maintains FIFO order among VIPs across repeated inserts', () => {
        let queue: Order[] = [];
        const inserted: Order[] = [];
        for (let i = 0; i < 5; i++) {
            const o = makeOrder('VIP');
            queue = insertOrder(queue, o);
            inserted.push(o);
        }
        expect(ids(queue)).toEqual(ids(inserted));
    });
});

describe('reinsertCancelledOrder', () => {
    it('places a returned VIP ahead of later VIPs (by id)', () => {
        const v1 = { ...makeOrder('VIP'), id: 1 } as Order;
        const v3 = { ...makeOrder('VIP'), id: 3 } as Order;
        const queue: Order[] = [v3];
        const result = reinsertCancelledOrder(queue, v1);
        expect(ids(result)).toEqual([1, 3]);
    });

    it('places a returned VIP behind earlier VIPs and ahead of NORMALs', () => {
        const v1 = { ...makeOrder('VIP'), id: 1 } as Order;
        const v2 = { ...makeOrder('VIP'), id: 2 } as Order;
        const n4 = { ...makeOrder('NORMAL'), id: 4 } as Order;
        const queue: Order[] = [v1, n4];
        const result = reinsertCancelledOrder(queue, v2);
        expect(ids(result)).toEqual([1, 2, 4]);
    });

    it('places a returned NORMAL behind all VIPs and ahead of newer NORMALs', () => {
        const v5 = { ...makeOrder('VIP'), id: 5 } as Order;
        const n2 = { ...makeOrder('NORMAL'), id: 2 } as Order;
        const n3 = { ...makeOrder('NORMAL'), id: 3 } as Order;
        const queue: Order[] = [v5, n3];
        const result = reinsertCancelledOrder(queue, n2);
        expect(ids(result)).toEqual([5, 2, 3]);
    });

    it('appends when nothing in the queue outranks it', () => {
        const v1 = { ...makeOrder('VIP'), id: 1 } as Order;
        const v2 = { ...makeOrder('VIP'), id: 2 } as Order;
        const queue: Order[] = [v1];
        const result = reinsertCancelledOrder(queue, v2);
        expect(ids(result)).toEqual([1, 2]);
    });

    it('handles an empty queue', () => {
        const v1 = { ...makeOrder('VIP'), id: 1 } as Order;
        expect(reinsertCancelledOrder([], v1)).toEqual([v1]);
    });
});
