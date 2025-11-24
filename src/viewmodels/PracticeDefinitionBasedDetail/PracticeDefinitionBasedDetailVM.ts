import { VocabularyWord } from "../../types/PracticeDefinition";
import { practiceDefinitionService } from "../../services/practice_definition.service";
import { practiceSessionService } from "../../services/practice_session.service";
import { VocabularyDefinitionAttempt } from "../../types/Vocabulary_Definition_Attempt";
import { PracticeSession } from "../../types/PracticeSession";
import { BaseViewModel } from "../BaseVM";

export class PracticeDefinitionBasedDetailVM extends BaseViewModel {
  vocabularies: VocabularyWord[] = [];
  current_index: number = 0;
  current_answer: string = "";
  current_accuracy_score: number = 0;
  current_feedback: string = "";
  current_standard_definition: string = ""; // Định nghĩa chuẩn từ Gemini
  user_attempts: VocabularyDefinitionAttempt[] = [];
  currentSession: PracticeSession | null = null;
  showResumeModal: boolean = false;
  pendingPracticeId: string = "";
  mode: "definition" | "guess" = "definition"; // Chế độ luyện tập

  setMode = (mode: "definition" | "guess") => {
    this.mode = mode;
    this.notify();
  };

  fetchVocabularies = async (practice_id: string, skipResumeCheck = false) => {
    try {
      this.setLoading("fetchVocabularies", true);
      this.pendingPracticeId = practice_id;

      // 1. Fetch vocabularies từ API mới
      const words = await practiceDefinitionService.getRandomVocabularyWords(
        practice_id,
        20
      );
      this.vocabularies = words;

      // 2. Check có session in_progress không
      const existingSession = await practiceSessionService.getByTopic(
        practice_id,
        "definition_based"
      );

      if (existingSession && !skipResumeCheck) {
        // Có session in_progress → Hiển thị modal hỏi
        this.currentSession = existingSession;
        this.showResumeModal = true;
        this.notify();
        this.setLoading("fetchVocabularies", false);
        return;
      }

      // 3. Không có session hoặc user chọn bắt đầu lại → Tạo mới
      await this.startNewSession(practice_id, words.length);
    } catch (err) {
      this.emitError("Failed to fetch vocabularies.");
    } finally {
      this.setLoading("fetchVocabularies", false);
    }
  };

  startNewSession = async (practice_id: string, totalItems: number) => {
    try {
      const sessionResponse = await practiceSessionService.startOrResume({
        practice_type: "definition_based",
        topic_id: practice_id,
        total_items: totalItems,
      });

      this.currentSession = sessionResponse.session;
      this.current_index = 0;
      this.user_attempts = [];
      this.current_answer = "";
      this.current_accuracy_score = 0;

      this.emitSuccess("Bắt đầu bài luyện tập mới!");
      this.notify();
    } catch (err) {
      this.emitError("Failed to start new session.");
    }
  };

  resumeSession = async () => {
    try {
      this.setLoading("resumeSession", true);
      this.showResumeModal = false;

      if (!this.currentSession) return;

      // Load lại attempts
      const attempts = await practiceSessionService.getSessionAttempts(
        this.currentSession._id
      );
      this.user_attempts = attempts;
      this.current_index = this.currentSession.current_index;

      // Restore current answer nếu đang ở câu đã làm
      const attemptAtCurrentIndex = this.user_attempts.find(
        (a) => a.vocabulary_id === this.vocabularies[this.current_index]?._id
      );
      if (attemptAtCurrentIndex) {
        this.current_answer = attemptAtCurrentIndex.answer;
        this.current_accuracy_score = attemptAtCurrentIndex.accuracy_score;
      }

      this.emitSuccess(
        `Resume luyện tập từ câu ${this.current_index + 1}/${
          this.vocabularies.length
        }`
      );
      this.notify();
    } catch (err) {
      this.emitError("Failed to resume session.");
    } finally {
      this.setLoading("resumeSession", false);
    }
  };

  cancelAndStartNew = async () => {
    try {
      this.setLoading("cancelSession", true);
      this.showResumeModal = false;

      // Cancel session cũ
      if (this.currentSession) {
        await practiceSessionService.cancel(this.currentSession._id);
      }

      // Tạo session mới
      await this.startNewSession(
        this.pendingPracticeId,
        this.vocabularies.length
      );
    } catch (err) {
      this.emitError("Failed to cancel session.");
    } finally {
      this.setLoading("cancelSession", false);
    }
  };

  getCurrentVocabulary = (): VocabularyWord | null => {
    return this.vocabularies[this.current_index] || null;
  };

  submitAnswer = async () => {
    const currentVocab = this.getCurrentVocabulary();
    if (!currentVocab || !currentVocab._id) return;

    try {
      this.setLoading("submitAnswer", true);

      let is_correct = false;
      let accuracy_score = 0;
      let feedback = "";

      if (this.mode === "definition") {
        // Mode 1: AI chấm định nghĩa - Gọi BE endpoint mới
        if (
          !currentVocab.definitions ||
          currentVocab.definitions.length === 0
        ) {
          this.emitError("Từ vựng không có định nghĩa chuẩn.");
          return;
        }

        const targetDefinition = currentVocab.definitions[0];
        const result = await practiceDefinitionService.evaluateDefinition(
          currentVocab.word,
          targetDefinition,
          this.current_answer
        );
        is_correct = result.is_correct;
        accuracy_score = result.similarity;
        feedback = result.feedback;
        this.current_standard_definition =
          result.standard_definition || targetDefinition;
      } else {
        // Mode 2: Đoán từ - so khớp trực tiếp
        const normalizedAnswer = this.current_answer.trim().toLowerCase();
        const normalizedWord = currentVocab.word.trim().toLowerCase();
        is_correct = normalizedAnswer === normalizedWord;
        accuracy_score = is_correct ? 1 : 0;
        feedback = is_correct
          ? "✅ Chính xác! Bạn đã đoán đúng từ vựng."
          : `❌ Chưa đúng. Từ đúng là: ${currentVocab.word}`;
      }

      this.current_accuracy_score = accuracy_score;
      this.current_feedback = feedback;

      const attempt: VocabularyDefinitionAttempt = {
        vocabulary_id: currentVocab._id,
        session_id: this.currentSession?._id,
        answer: this.current_answer,
        is_correct,
        accuracy_score,
        mode: this.mode, // Thêm mode
        attempt_at: new Date(),
      };

      // Lưu attempt ngay vào DB
      if (this.currentSession) {
        await practiceSessionService.saveAttempt(
          this.currentSession._id,
          attempt
        );
      }

      this.user_attempts.push(attempt);

      // Update session progress
      if (this.currentSession) {
        await practiceSessionService.updateProgress(this.currentSession._id, {
          current_index: this.current_index,
          completed_items: this.user_attempts.length,
          correct_count: this.user_attempts.filter((a) => a.is_correct).length,
          total_accuracy:
            this.user_attempts.reduce((sum, a) => sum + a.accuracy_score, 0) /
            this.user_attempts.length,
        });
      }

      this.notify();
      console.log("Submitted attempt:", attempt);
    } catch (err) {
      this.emitError("Failed to submit answer.");
    } finally {
      this.setLoading("submitAnswer", false);
    }
  };

  goToNextVocabulary = async () => {
    if (this.current_index < this.vocabularies.length - 1) {
      this.current_index++;

      // Update session current_index
      if (this.currentSession) {
        await practiceSessionService.updateProgress(this.currentSession._id, {
          current_index: this.current_index,
        });
      }

      if (this.user_attempts[this.current_index]) {
        this.current_answer = this.user_attempts[this.current_index].answer;
        this.current_accuracy_score =
          this.user_attempts[this.current_index].accuracy_score;
      } else {
        // Nếu vocab mới chưa có attempt thì xóa nội dung textbox
        this.current_answer = "";
        this.current_accuracy_score = 0;
        this.current_standard_definition = "";
      }

      this.notify();
    }
  };

  goToPreviousVocabulary = () => {
    if (this.current_index > 0) {
      this.current_index--;
      this.current_answer =
        this.user_attempts[this.current_index]?.answer ?? "";
      this.current_accuracy_score =
        this.user_attempts[this.current_index]?.accuracy_score ?? 0;
      this.current_standard_definition = "";
      this.notify();
    }
  };

  onChangeCurrentAnswer = (answer: string) => {
    this.current_answer = answer;
    this.notify();
  };

  getProgress = () => {
    return ((this.current_index + 1) / this.vocabularies.length) * 100;
  };

  completedPractice = async () => {
    if (!this.currentSession) return;

    try {
      this.setLoading("completePractice", true);

      // Complete session và submit attempts
      await practiceSessionService.complete(this.currentSession._id, {
        attempts: this.user_attempts,
      });

      this.emitSuccess("Practice completed and attempts submitted.");
    } catch (err) {
      this.emitError("Failed to complete practice.");
    } finally {
      this.setLoading("completePractice", false);
    }
  };
}
