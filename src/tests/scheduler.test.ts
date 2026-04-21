import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { startJob, cancelJob, _clearAllJobs } from '../store/scheduler';

describe('scheduler', () => {
    beforeEach(() => {
        vi.useFakeTimers();
        _clearAllJobs();
    });

    afterEach(() => {
        vi.clearAllTimers();
        vi.useRealTimers();
    });

    it('invokes onComplete once the duration has elapsed', () => {
        const onComplete = vi.fn();
        startJob(1, 10_000, onComplete);

        vi.advanceTimersByTime(9_999);
        expect(onComplete).not.toHaveBeenCalled();

        vi.advanceTimersByTime(1);
        expect(onComplete).toHaveBeenCalledTimes(1);
    });

    it('cancelJob prevents the onComplete callback from firing', () => {
        const onComplete = vi.fn();
        startJob(2, 10_000, onComplete);

        vi.advanceTimersByTime(5_000);
        cancelJob(2);
        vi.advanceTimersByTime(100_000);

        expect(onComplete).not.toHaveBeenCalled();
    });

    it('ignores a second startJob for the same orderId (idempotent)', () => {
        const first = vi.fn();
        const second = vi.fn();

        startJob(3, 10_000, first);
        startJob(3, 10_000, second);

        vi.advanceTimersByTime(10_000);

        expect(first).toHaveBeenCalledTimes(1);
        expect(second).not.toHaveBeenCalled();
    });

    it('cancelJob on an unknown orderId is a no-op', () => {
        expect(() => cancelJob(9999)).not.toThrow();
    });

    it('supports multiple concurrent jobs independently', () => {
        const a = vi.fn();
        const b = vi.fn();

        startJob(10, 10_000, a);
        startJob(11, 10_000, b);

        cancelJob(10);
        vi.advanceTimersByTime(10_000);

        expect(a).not.toHaveBeenCalled();
        expect(b).toHaveBeenCalledTimes(1);
    });
});
