// src/utils/questions.ts

import { CurrentLesson, QCQuestion } from "../types/Lesson";

export const QUIZ_A: QCQuestion[] = [
    {
        id: "q1", text: "Chọn từ đồng nghĩa với “rapidly”", options: [
            { key: "A", text: "slowly" }, { key: "B", text: "quickly" },
            { key: "C", text: "softly" }, { key: "D", text: "quietly" }
        ], answer: "B"
    },
    {
        id: "q2", text: "Điền mạo từ đúng: ___ hour", options: [
            { key: "A", text: "a" }, { key: "B", text: "an" }, { key: "C", text: "the" }, { key: "D", text: "no article" }
        ], answer: "B"
    },
    // ...
];

export const MINI_TEST_1: QCQuestion[] = [
    {
        id: "m1", text: "[Listening] Người nói dự định làm gì tiếp theo?", options: [
            { key: "A", text: "Gọi điện cho khách hàng" }, { key: "B", text: "Gửi email xác nhận" },
            { key: "C", text: "Đi họp" }, { key: "D", text: "In tài liệu" }
        ], answer: "C"
    },
    // ...
];

export const CORE_CHECK: QCQuestion[] = [
    {
        id: "c1", text: "Chọn từ đồng nghĩa với “assist”", options: [
            { key: "A", text: "help" }, { key: "B", text: "hinder" },
            { key: "C", text: "ignore" }, { key: "D", text: "refuse" }
        ], answer: "A"
    },
    // ...
];

export function getQuestionSet(lesson: CurrentLesson | null): QCQuestion[] {
    if (!lesson) return [];
    if (lesson.type === "quiz") return QUIZ_A;
    if (lesson.type === "mini") return MINI_TEST_1;
    return [];
}

export function grade(questions: QCQuestion[], answers: Record<string, string>): number {
    if (questions.length === 0) return 0;
    const correct = questions.filter((q) => answers[q.id] === q.answer).length;
    return Math.round((correct / questions.length) * 100);
}

export function getDurationMinutes(lesson: CurrentLesson | null): number {
    if (!lesson) return 0;
    if (lesson.type === "quiz") return 1;
    if (lesson.type === "mini") return 25;
    return 0;
}
