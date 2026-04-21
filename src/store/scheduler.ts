const jobs = new Map<number, ReturnType<typeof setTimeout>>();

export function startJob(
    orderId: number,
    duration: number,
    onComplete: () => void,
) {
    if (jobs.has(orderId)) return;

    const handle = setTimeout(() => {
        jobs.delete(orderId);
        onComplete();
    }, duration);

    jobs.set(orderId, handle);
}

export function cancelJob(orderId: number) {
    const handle = jobs.get(orderId);
    if (handle !== undefined) {
        clearTimeout(handle);
        jobs.delete(orderId);
    }
}

export function _clearAllJobs() {
    for (const handle of jobs.values()) {
        clearTimeout(handle);
    }
    jobs.clear();
}
