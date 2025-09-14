export function diffInDays(fromISO: string, toISO: string) {
    const a = new Date(fromISO);
    const b = new Date(toISO);
    return Math.max(0, Math.ceil((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24)));
}
export function diffInWeeks(fromISO: string, toISO: string) {
    return Math.max(1, Math.ceil(diffInDays(fromISO, toISO) / 7));
}
export function addDays(iso: string, days: number) {
    const d = new Date(iso);
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
}