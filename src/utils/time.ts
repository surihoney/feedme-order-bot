export function getRemainingTime(order: {
    startedAt?: number;
    duration?: number;
}, now: number): number {
    if (!order.startedAt || !order.duration) return 0;

    const elapsed = now - order.startedAt;
    return Math.max(0, order.duration - elapsed);
}