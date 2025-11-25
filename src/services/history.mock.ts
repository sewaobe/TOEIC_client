import { BaseAttemptSummary, HistoryLessonType } from "../components/history/HistoryModalShell";

export function fetchLessonHistoryMock(
  lessonType: HistoryLessonType,
  lessonId: string
): Promise<BaseAttemptSummary[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const base: BaseAttemptSummary[] = [];

      if (lessonType === "flash_card") {
        base.push(
          {
            id: "fc-1",
            type: "flash_card",
            started_at: new Date().toISOString(),
            finished_at: new Date().toISOString(),
            durationSec: 600,
            scoreLabel: "85%",
            scoreValue: 85,
            submit_type: "practice",
            meta: {
              wordsReviewed: 30,
              easy: 10,
              medium: 15,
              hard: 5,
              skip: 0,
              avgResponseTime: 3.2,
              wordSummaries: [
                { vocabText: "apple", eval_type: "easy", response_time: 2.1 },
                { vocabText: "banana", eval_type: "medium", response_time: 3.5 },
                { vocabText: "cherry", eval_type: "hard", response_time: 4.8 },
              ],
            },
          },
          {
            id: "fc-2",
            type: "flash_card",
            started_at: new Date(Date.now() - 86400000).toISOString(),
            finished_at: new Date(
              Date.now() - 86400000 + 8 * 60 * 1000
            ).toISOString(),
            durationSec: 480,
            scoreLabel: "92%",
            scoreValue: 92,
            submit_type: "test",
            meta: {
              wordsReviewed: 40,
              easy: 20,
              medium: 15,
              hard: 5,
              skip: 0,
              avgResponseTime: 2.8,
              wordSummaries: [
                { vocabText: "desk", eval_type: "easy", response_time: 2.0 },
                { vocabText: "chair", eval_type: "medium", response_time: 3.0 },
              ],
            },
          }
        );
      } else if (lessonType === "quiz") {
        base.push({
          id: "qz-1",
          type: "quiz",
          started_at: new Date().toISOString(),
          finished_at: new Date().toISOString(),
          durationSec: 900,
          scoreLabel: "90 điểm",
          scoreValue: 90,
          submit_type: "test",
          meta: {
            totalQuestions: 5,
            correct: 4,
            perQuestion: [
              {
                index: 1,
                questionText: "What is the capital of France?",
                chosenKey: "A",
                chosenText: "Paris",
                correctKey: "A",
                correctText: "Paris",
                correct: true,
              },
              {
                index: 2,
                questionText: "He _____ to work every day.",
                chosenKey: "B",
                chosenText: "go",
                correctKey: "C",
                correctText: "goes",
                correct: false,
              },
            ],
          },
        });
      } else if (lessonType === "dictation") {
        base.push({
          id: "dc-1",
          type: "dictation",
          started_at: new Date().toISOString(),
          finished_at: new Date().toISOString(),
          durationSec: 900,
          scoreLabel: "78% chính xác",
          scoreValue: 78,
          submit_type: "practice",
          meta: {
            mistakes: 3,
            totalSegments: 4,
            segments: [
              {
                index: 1,
                correctText: "I like learning English.",
                userText: "I like learning English.",
                isCorrect: true,
              },
              {
                index: 2,
                correctText: "She goes to school every day.",
                userText: "She go to school everyday.",
                isCorrect: false,
              },
            ],
          },
        });
      } else if (lessonType === "shadowing") {
        base.push({
          id: "sh-1",
          type: "shadowing",
          started_at: new Date().toISOString(),
          finished_at: new Date().toISOString(),
          durationSec: 900,
          scoreLabel: "82% similarity",
          scoreValue: 82,
          submit_type: "practice",
          meta: {
            overall_feedback:
              "Good rhythm, improve stress on long words.",
            audioUrl:
              "https://www2.cs.uic.edu/~i101/SoundFiles/taunt.wav", // mock audio
            scores: {
              accuracy: 80,
              fluency: 85,
              intonation: 78,
            },
            wordFeedback: [
              { word: "information", score: 75 },
              { word: "technology", score: 82 },
              { word: "development", score: 88 },
            ],
          },
        });
      }

      resolve(base);
    }, 400);
  });
}
