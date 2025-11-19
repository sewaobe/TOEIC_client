import { FlashcardItem } from "../../components/modals/CreateFlashcardItemModal";
import { AI_API_SERVICE } from "../../services/ai_api.service";
import { topicService } from "../../services/topic.service";
import { practiceSessionService } from "../../services/practice_session.service";
import { VocabularyDefinitionAttempt } from "../../types/Vocabulary_Definition_Attempt";
import { PracticeSession } from "../../types/PracticeSession";
import { BaseViewModel } from "../BaseVM";

export class PracticeDefinitionBasedDetailVM extends BaseViewModel {
  vocabularies: FlashcardItem[] = [];
  current_index: number = 0;
  current_answer: string = "";
  current_accuracy_score: number = 0;
  current_feedback: string = "";
  user_attempts: VocabularyDefinitionAttempt[] = [];
  currentSession: PracticeSession | null = null;
  showResumeModal: boolean = false;
  pendingPracticeId: string = "";

  fetchVocabularies = async (practice_id: string, skipResumeCheck = false) => {
    try {
      this.setLoading("fetchVocabularies", true);
      this.pendingPracticeId = practice_id;

      // 1. Check có session in_progress không
      const existingSession = await practiceSessionService.getByTopic(
        practice_id,
        "definition_based"
      );

      if (existingSession && !skipResumeCheck) {
        // Có session in_progress → Resume (sẽ trigger batch fetch) trước khi load vocab
        this.currentSession = existingSession;
        this.showResumeModal = true;

        // Load vocabularies SAU khi đã có session (để backend kịp fetch definition_en)
        const res = await topicService.getTopicVocabularyDetail(
          practice_id,
          1,
          100
        );
        this.vocabularies = res.items;

        this.notify();
        this.setLoading("fetchVocabularies", false);
        return;
      }

      // 2. Không có session → Tạo mới TRƯỚC (để backend fetch definition_en)
      const res = await topicService.getTopicVocabularyDetail(
        practice_id,
        1,
        100
      );
      const totalItems = res.items.length;

      // 3. Start session TRƯỚC khi load vocab detail (backend sẽ fetch 10 từ đầu đồng bộ)
      await this.startNewSession(practice_id, totalItems);

      // 4. Fetch lại vocabularies để lấy definition_en mới (sau khi backend đã fetch)
      const updatedRes = await topicService.getTopicVocabularyDetail(
        practice_id,
        1,
        100
      );
      this.vocabularies = updatedRes.items;
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

      // Fetch lại vocabularies để lấy definition_en mới (backend đã fetch lúc resume)
      const updatedRes = await topicService.getTopicVocabularyDetail(
        this.pendingPracticeId,
        1,
        100
      );
      this.vocabularies = updatedRes.items;

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

      // Tạo session mới (backend sẽ fetch definition_en)
      await this.startNewSession(
        this.pendingPracticeId,
        this.vocabularies.length
      );

      // Fetch lại vocabularies để lấy definition_en mới
      const updatedRes = await topicService.getTopicVocabularyDetail(
        this.pendingPracticeId,
        1,
        100
      );
      this.vocabularies = updatedRes.items;
      this.notify();
    } catch (err) {
      this.emitError("Failed to cancel session.");
    } finally {
      this.setLoading("cancelSession", false);
    }
  };

  getCurrentVocabulary = (): FlashcardItem | null => {
    return this.vocabularies[this.current_index] || null;
  };

  submitAnswer = async () => {
    const currentVocab = this.getCurrentVocabulary();
    if (!currentVocab || !currentVocab._id) return;

    // Ưu tiên dùng definition_en (tiếng Anh) cho AI scorer
    // Nếu không có definition_en → fallback về definition (tiếng Việt)
    const correctDefinition =
      (currentVocab as any).definition_en || currentVocab.definition;

    if (!correctDefinition) {
      this.emitError("Không tìm thấy định nghĩa tham chiếu cho từ này.");
      return;
    }

    try {
      this.setLoading("submitAnswer", true);
      const result = await AI_API_SERVICE.submit_sentence_eval(
        this.current_answer,
        correctDefinition
      );
      const is_correct = result.similarity >= 0.65;
      this.current_accuracy_score = result.similarity;
      this.current_feedback = result.feedback;

      const attempt: VocabularyDefinitionAttempt = {
        vocabulary_id: currentVocab._id,
        session_id: this.currentSession?._id,
        answer: this.current_answer,
        is_correct,
        accuracy_score: result.similarity,
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
        this.current_answer = "";
        this.current_accuracy_score = 0;
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
