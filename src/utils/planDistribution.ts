import { Weekday, WeeklyPlan } from "../types/PlanWizard";

export const WEEKDAYS: Weekday[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const clamp = (v: number, lo: number, hi: number) =>
    Math.max(lo, Math.min(hi, v));

/** Redistribute minutes when adjusting 1 week total */
export function redistributeWeeks(
    arr: number[], // weeklyTotals
    idx: number,
    newVal: number,
    lo: number,
    hi: number
): number[] {
    const n = arr.length;
    const oldVal = arr[idx];
    const next = arr.slice();
    next[idx] = clamp(newVal, lo, hi);
    let delta = next[idx] - oldVal;

    if (delta === 0 || n <= 1) return next;
    const others = Array.from({ length: n }, (_, i) => i).filter((i) => i !== idx);

    if (delta > 0) {
        // reduce other weeks
        let remaining = delta;
        while (remaining > 0.0001) {
            const caps = others.map((i) => next[i] - lo);
            const totalCap = caps.reduce((a, b) => a + Math.max(0, b), 0);
            if (totalCap <= 0) break;
            for (let k = 0; k < others.length && remaining > 0; k++) {
                const i = others[k];
                const cap = Math.max(0, next[i] - lo);
                if (cap <= 0) continue;
                const take = Math.min(cap, (cap / totalCap) * remaining);
                next[i] -= take;
                remaining -= take;
            }
        }
    } else {
        // delta < 0 → increase other weeks
        let remaining = -delta;
        while (remaining > 0.0001) {
            const caps = others.map((i) => hi - next[i]);
            const totalCap = caps.reduce((a, b) => a + Math.max(0, b), 0);
            if (totalCap <= 0) break;
            for (let k = 0; k < others.length && remaining > 0; k++) {
                const i = others[k];
                const cap = Math.max(0, hi - next[i]);
                if (cap <= 0) continue;
                const add = Math.min(cap, (cap / totalCap) * remaining);
                next[i] += add;
                remaining -= add;
            }
        }
    }

    return next.map((v) => clamp(Math.round(v), lo, hi));
}

/** Redistribute minutes when adjusting 1 day inside a WeeklyPlan */
export function redistributeDays(
    week: WeeklyPlan,
    dayKey: Weekday,
    newVal: number,
    lo: number,
    hi: number
): WeeklyPlan {
    const next: WeeklyPlan = { ...week };
    const old = week[dayKey];
    next[dayKey] = clamp(newVal, lo, hi);
    let delta = next[dayKey] - old;
    if (delta === 0) return next;

    const others = WEEKDAYS.filter((d) => d !== dayKey);

    if (delta > 0) {
        let remaining = delta;
        while (remaining > 0.0001) {
            const caps = others.map((d) => next[d] - lo);
            const totalCap = caps.reduce((a, b) => a + Math.max(0, b), 0);
            if (totalCap <= 0) break;
            for (let k = 0; k < others.length && remaining > 0; k++) {
                const d = others[k];
                const cap = Math.max(0, next[d] - lo);
                if (cap <= 0) continue;
                const take = Math.min(cap, (cap / totalCap) * remaining);
                next[d] -= take;
                remaining -= take;
            }
        }
    } else {
        let remaining = -delta;
        while (remaining > 0.0001) {
            const caps = others.map((d) => hi - next[d]);
            const totalCap = caps.reduce((a, b) => a + Math.max(0, b), 0);
            if (totalCap <= 0) break;
            for (let k = 0; k < others.length && remaining > 0; k++) {
                const d = others[k];
                const cap = Math.max(0, hi - next[d]);
                if (cap <= 0) continue;
                const add = Math.min(cap, (cap / totalCap) * remaining);
                next[d] += add;
                remaining -= add;
            }
        }
    }

    WEEKDAYS.forEach((d) => {
        next[d] = clamp(Math.round(next[d]), lo, hi);
    });
    return next;
}
