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

// Lấy mốc "chuẩn" gần nhất phía dưới
function normalizeScore(score: number) {
    for (let i = LEVELS.length - 1; i >= 0; i--) {
        if (score >= LEVELS[i]) return LEVELS[i];
    }
    return 200;
}

export const getHoursNeeded = (from: number, to: number) => {
    if (from >= to) return 0;

    const fromNorm = normalizeScore(from);
    const toNorm = normalizeScore(to);

    // Nếu to không khớp 100% (ví dụ target = 465), thì làm tròn lên
    const toFinal = LEVELS.find((lv) => lv >= toNorm) ?? 900;

    return HOURS_TABLE[fromNorm]?.[toFinal] ?? 0;
};
