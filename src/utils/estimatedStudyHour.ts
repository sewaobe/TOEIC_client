// TOEIC progression table (chỉ lưu từ các mốc chuẩn)
const HOURS_TABLE: Record<number, Record<number, number>> = {
    200: { 300: 100, 400: 250, 500: 450, 600: 700, 700: 1000, 800: 1350, 900: 1750 },
    300: { 400: 150, 500: 350, 600: 600, 700: 900, 800: 1250, 900: 1650 },
    400: { 500: 200, 600: 450, 700: 750, 800: 1100, 900: 1500 },
    500: { 600: 250, 700: 550, 800: 900, 900: 1300 },
    600: { 700: 300, 800: 650, 900: 1050 },
    700: { 800: 350, 900: 750 },
    800: { 900: 400 }
};
const LEVELS = [200, 300, 400, 500, 600, 700, 800, 900];

const clampScore = (score: number) =>
    Math.max(LEVELS[0], Math.min(LEVELS[LEVELS.length - 1], score));

export const getHoursNeeded = (from: number, to: number) => {
    if (from >= to) return 0;

    const start = clampScore(from);
    const target = clampScore(to);
    let totalHours = 0;

    for (let i = 0; i < LEVELS.length - 1; i++) {
        const bandStart = LEVELS[i];
        const bandEnd = LEVELS[i + 1];

        if (target <= bandStart || start >= bandEnd) continue;

        const overlapStart = Math.max(start, bandStart);
        const overlapEnd = Math.min(target, bandEnd);
        const bandHours = HOURS_TABLE[bandStart]?.[bandEnd] ?? 0;
        const ratio = (overlapEnd - overlapStart) / (bandEnd - bandStart);

        totalHours += bandHours * ratio;
    }

    return Math.round(totalHours);
};
