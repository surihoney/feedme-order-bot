import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useStore } from '../store/useStore';
import { _clearAllJobs } from '../store/scheduler';
import { Order } from '../store/types';

const ORDER_DURATION_MS = 10_000;

const pending = () =>
    useStore.getState().orders.filter((o) => o.status === 'PENDING');
const processing = () =>
    useStore.getState().orders.filter((o) => o.status === 'PROCESSING');
const completed = () =>
    useStore.getState().orders.filter((o) => o.status === 'COMPLETED');

const ids = (orders: Order[]) => orders.map((o) => o.id);
const types = (orders: Order[]) => orders.map((o) => o.type);

beforeEach(() => {
    vi.useFakeTimers();
    _clearAllJobs();
    useStore.setState({
        orders: [],
        bots: [],
        nextOrderId: 1,
        nextBotId: 1,
    });
});

afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
});

describe('Requirement 1: New Normal Order lands in PENDING', () => {
    it('addOrder("NORMAL") places a new order in PENDING', () => {
        useStore.getState().addOrder('NORMAL');

        expect(pending()).toHaveLength(1);
        expect(pending()[0].type).toBe('NORMAL');
        expect(pending()[0].status).toBe('PENDING');
    });
});

describe('Requirement 2: VIP priority within PENDING', () => {
    it('a VIP order is placed in front of existing NORMAL orders', () => {
        const s = useStore.getState();
        s.addOrder('NORMAL');
        s.addOrder('NORMAL');
        s.addOrder('VIP');

        expect(types(pending())).toEqual(['VIP', 'NORMAL', 'NORMAL']);
    });

    it('a VIP order is placed behind existing VIP orders', () => {
        const s = useStore.getState();
        s.addOrder('VIP');
        s.addOrder('VIP');
        s.addOrder('VIP');

        const queue = pending();
        expect(types(queue)).toEqual(['VIP', 'VIP', 'VIP']);
        expect(ids(queue)).toEqual([1, 2, 3]);
    });

    it('mixed inserts produce VIPs ahead of NORMALs with FIFO inside each class', () => {
        const s = useStore.getState();
        s.addOrder('NORMAL');
        s.addOrder('VIP');
        s.addOrder('NORMAL');
        s.addOrder('VIP');

        const queue = pending();
        expect(types(queue)).toEqual(['VIP', 'VIP', 'NORMAL', 'NORMAL']);
        expect(ids(queue)).toEqual([2, 4, 1, 3]);
    });
});

describe('Requirement 3: order numbers are unique and monotonically increasing', () => {
    it('assigns ids 1, 2, 3, ... regardless of type', () => {
        const s = useStore.getState();
        s.addOrder('NORMAL');
        s.addOrder('VIP');
        s.addOrder('NORMAL');
        s.addOrder('VIP');

        const allIds = useStore.getState().orders.map((o) => o.id).sort();
        expect(allIds).toEqual([1, 2, 3, 4]);
        expect(new Set(allIds).size).toBe(4);
    });

    it('ids continue to increase after some orders are processed', () => {
        const s = useStore.getState();
        s.addOrder('NORMAL');
        s.addBot();
        vi.advanceTimersByTime(ORDER_DURATION_MS);
        s.addOrder('NORMAL');

        expect(useStore.getState().nextOrderId).toBe(3);
        const latest = useStore.getState().orders.find((o) => o.id === 2);
        expect(latest?.status).toBe('PROCESSING');
    });
});

describe('Requirement 4: a bot picks up a PENDING order and completes it after 10s', () => {
    it('adding a bot when a PENDING order exists moves it to PROCESSING', () => {
        const s = useStore.getState();
        s.addOrder('NORMAL');
        s.addBot();

        expect(processing()).toHaveLength(1);
        expect(pending()).toHaveLength(0);
        expect(useStore.getState().bots[0]).toMatchObject({
            status: 'WORKING',
            currentOrderId: 1,
        });
    });

    it('after exactly 10s the order moves to COMPLETED and the bot becomes IDLE', () => {
        const s = useStore.getState();
        s.addOrder('NORMAL');
        s.addBot();

        vi.advanceTimersByTime(ORDER_DURATION_MS - 1);
        expect(completed()).toHaveLength(0);

        vi.advanceTimersByTime(1);

        expect(completed()).toHaveLength(1);
        expect(completed()[0].id).toBe(1);
        expect(useStore.getState().bots[0]).toMatchObject({
            status: 'IDLE',
            currentOrderId: undefined,
        });
    });

    it('after completing one order the bot automatically picks up the next PENDING order', () => {
        const s = useStore.getState();
        s.addOrder('NORMAL');
        s.addOrder('NORMAL');
        s.addBot();

        vi.advanceTimersByTime(ORDER_DURATION_MS);

        expect(completed()).toHaveLength(1);
        expect(processing()).toHaveLength(1);
        expect(processing()[0].id).toBe(2);
        expect(useStore.getState().bots[0]).toMatchObject({
            status: 'WORKING',
            currentOrderId: 2,
        });

        vi.advanceTimersByTime(ORDER_DURATION_MS);
        expect(completed().map((o) => o.id)).toEqual([1, 2]);
        expect(useStore.getState().bots[0].status).toBe('IDLE');
    });

    it('a bot always picks up the highest-priority (VIP-first) order', () => {
        const s = useStore.getState();
        s.addOrder('NORMAL');
        s.addOrder('VIP');
        s.addBot();

        expect(processing()).toHaveLength(1);
        expect(processing()[0].type).toBe('VIP');
        expect(processing()[0].id).toBe(2);
    });
});

describe('Requirement 5: with no PENDING orders a bot stays IDLE', () => {
    it('addBot with no orders leaves the bot IDLE', () => {
        useStore.getState().addBot();
        expect(useStore.getState().bots[0].status).toBe('IDLE');
        expect(processing()).toHaveLength(0);
    });

    it('an IDLE bot picks up a new order as soon as one arrives', () => {
        const s = useStore.getState();
        s.addBot();
        expect(useStore.getState().bots.length).toBe(1);
        expect(useStore.getState().bots[0].status).toBe('IDLE');

        s.addOrder('NORMAL');
        expect(useStore.getState().bots[0]).toMatchObject({
            status: 'WORKING',
            currentOrderId: 1,
        });
        expect(processing()).toHaveLength(1);
    });
});

describe('Requirement 6: removeBot destroys the newest bot and re-queues its order', () => {
    it('does nothing when there are no bots', () => {
        expect(() => useStore.getState().removeBot()).not.toThrow();
        expect(useStore.getState().bots).toEqual([]);
    });

    it('removes the newest bot when the bot is IDLE', () => {
        const s = useStore.getState();
        s.addBot();
        s.addBot();
        s.removeBot();

        const bots = useStore.getState().bots;
        expect(bots).toHaveLength(1);
        expect(bots[0].id).toBe(1);
    });

    it('removes an IDLE newest bot while keeping a busy older bot working', () => {
        const s = useStore.getState();
        s.addOrder('NORMAL');
        s.addBot();
        s.addBot();

        expect(useStore.getState().bots).toHaveLength(2);
        const working = useStore
            .getState()
            .bots.find((b) => b.status === 'WORKING');
        expect(working?.id).toBe(1);

        s.removeBot();

        const remaining = useStore.getState().bots;
        expect(remaining).toHaveLength(1);
        expect(remaining[0].id).toBe(1);
        expect(remaining[0].status).toBe('WORKING');
        expect(processing()).toHaveLength(1);
    });

    it('cancels the running job and returns the order to PENDING when the newest bot is removed', () => {
        const s = useStore.getState();
        s.addOrder('NORMAL');
        s.addBot();

        expect(processing()).toHaveLength(1);

        s.removeBot();

        expect(useStore.getState().bots).toHaveLength(0);
        expect(processing()).toHaveLength(0);
        expect(pending()).toHaveLength(1);
        expect(pending()[0].id).toBe(1);
        expect(pending()[0].startedAt).toBeUndefined();
    });

    it('the cancelled order never completes, even if 10+ seconds pass after removal', () => {
        const s = useStore.getState();
        s.addOrder('NORMAL');
        s.addBot();

        vi.advanceTimersByTime(5_000);
        s.removeBot();
        vi.advanceTimersByTime(60_000);

        expect(completed()).toHaveLength(0);
        expect(pending()).toHaveLength(1);
    });

    it('preserves VIP/Normal priority when an order is returned to PENDING', () => {
        const s = useStore.getState();
        s.addOrder('NORMAL');
        s.addOrder('NORMAL');
        s.addBot();

        expect(processing()[0].id).toBe(1);

        s.addOrder('VIP');
        s.removeBot();

        const queue = pending();
        expect(types(queue)).toEqual(['VIP', 'NORMAL', 'NORMAL']);
        expect(queue.find((o) => o.id === 1)?.type).toBe('NORMAL');
    });

    it('a VIP order returned to PENDING sits ahead of NORMALs but behind other VIPs', () => {
        const s = useStore.getState();
        s.addOrder('VIP');
        s.addOrder('NORMAL');
        s.addBot();

        expect(processing()[0].id).toBe(1);
        expect(processing()[0].type).toBe('VIP');

        s.addOrder('VIP');
        s.removeBot();

        const queue = pending();
        expect(types(queue)).toEqual(['VIP', 'VIP', 'NORMAL']);
        expect(queue.map((o) => o.id)).toEqual([3, 1, 2]);
    });
});

describe('End-to-end workflow', () => {
    it('simulates multiple bots and orders through a full lifecycle', () => {
        const s = useStore.getState();

        s.addOrder('NORMAL');
        s.addOrder('VIP');
        s.addOrder('NORMAL');
        s.addBot();
        s.addBot();

        expect(processing().map((o) => o.id).sort()).toEqual([1, 2]);
        expect(processing().find((o) => o.type === 'VIP')?.id).toBe(2);

        vi.advanceTimersByTime(ORDER_DURATION_MS);

        expect(completed().map((o) => o.id).sort()).toEqual([1, 2]);
        expect(processing().map((o) => o.id)).toEqual([3]);

        vi.advanceTimersByTime(ORDER_DURATION_MS);

        expect(completed().map((o) => o.id).sort()).toEqual([1, 2, 3]);
        expect(useStore.getState().bots.every((b) => b.status === 'IDLE')).toBe(
            true,
        );
    });
});
