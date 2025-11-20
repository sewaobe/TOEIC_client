import { Weekday, WeeklyPlan } from "../types/PlanWizard";

export const WEEKDAYS: Weekday[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const clamp = (v: number, lo: number, hi: number) =>
    Math.max(lo, Math.min(hi, v));

/** Redistribute minutes when adjusting 1 week total */
export function redistributeWeeks(
    arr: number[],
    idx: number,
    newVal: number,
    lo: number,
    hi: number
): number[] {
    const n = arr.length;
    const oldVal = arr[idx];
    newVal = clamp(newVal, lo, hi);

    // Không thay đổi
    if (newVal === oldVal || n <= 1) return arr.slice();

    const diff = newVal - oldVal;
    const result = arr.slice();
    result[idx] = newVal;

    const others = [];
    for (let i = 0; i < n; i++) {
        if (i !== idx) others.push(i);
    }

    // Tổng dung lượng tuần khác có thể tăng/giảm
    const totalCap = others.reduce((sum, i) => {
        const cap = diff > 0 ? result[i] - lo : hi - result[i];
        return sum + Math.max(cap, 0);
    }, 0);

    if (totalCap <= 0) return result;

    // phân phối theo tỉ lệ
    for (const i of others) {
        const cap = diff > 0 ? result[i] - lo : hi - result[i];
        const capClamped = Math.max(cap, 0);
        const delta = (capClamped / totalCap) * Math.abs(diff);
        result[i] += diff > 0 ? -delta : +delta;
    }

    // làm tròn + clamp
    for (let i = 0; i < n; i++) {
        result[i] = clamp(Math.round(result[i]), lo, hi);
    }

    return result;
}


/** Redistribute minutes when adjusting 1 day inside a WeeklyPlan */
export function redistributeDays(
    week: WeeklyPlan,
    dayKey: Weekday,
    newVal: number,
    lo: number,
    hi: number
): WeeklyPlan {
    const oldVal = week[dayKey];
    newVal = clamp(newVal, lo, hi);

    if (newVal === oldVal) return { ...week };

    const diff = newVal - oldVal;
    const result = { ...week };

    result[dayKey] = newVal;

    const others = WEEKDAYS.filter((d) => d !== dayKey);

    const totalCap = others.reduce((sum, d) => {
        const cap = diff > 0 ? result[d] - lo : hi - result[d];
        return sum + Math.max(cap, 0);
    }, 0);

    if (totalCap <= 0) return result;

    for (const d of others) {
        const cap = diff > 0 ? result[d] - lo : hi - result[d];
        const capClamped = Math.max(cap, 0);
        const delta = (capClamped / totalCap) * Math.abs(diff);
        result[d] += diff > 0 ? -delta : +delta;
    }

    // làm tròn + đảm bảo min/max
    WEEKDAYS.forEach((d) => {
        result[d] = clamp(Math.round(result[d]), lo, hi);
    });

    return result;
}

