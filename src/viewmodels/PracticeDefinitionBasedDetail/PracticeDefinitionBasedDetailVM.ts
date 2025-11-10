import { FlashcardItem } from "../../components/modals/CreateFlashcardItemModal";
import { topicService } from "../../services/topic.service";
import { VocabularyDefinitionAttempt } from "../../types/Vocabulary_Definition_Attempt";
import { BaseViewModel } from "../BaseVM";

export class PracticeDefinitionBasedDetailVM extends BaseViewModel {
    vocabularies: FlashcardItem[] = [];
    loading: boolean = false;
    current_index: number = 0;
    current_answer: string = "";
    current_accuracy_score: number = 0;
    user_attempts: VocabularyDefinitionAttempt[] = [];

    fetchVocabularies = async (practice_id: string) => {
        try {
            this.loading = true;
            this.notify();

            const res = await topicService.getTopicVocabularyDetail(practice_id, 1, 100);
            this.vocabularies = res.items;
            this.emitSuccess("Vocabularies fetched successfully.");
        } catch (err) {
            this.emitError("Failed to fetch vocabularies.");
        } finally {
            this.loading = false;
            this.notify();
        }
    }

    getCurrentVocabulary = (): FlashcardItem | null => {
        return this.vocabularies[this.current_index] || null;
    }

    submitAnswer = () => {
        const currentVocab = this.getCurrentVocabulary();
        if (!currentVocab || !currentVocab._id) return;

        // Kiểm tra cơ bản để test, sẽ gắn API sentence transform sau.
        const is_correct = this.current_answer.trim().toLowerCase() === currentVocab?.definition?.trim().toLowerCase();
        const accuracy_score = is_correct ? 1 : 0;

        this.current_accuracy_score = accuracy_score;

        const attempt: VocabularyDefinitionAttempt = {
            vocabulary_id: currentVocab._id,
            answer: this.current_answer,
            is_correct,
            accuracy_score,
            attempt_at: new Date()
        }

        this.user_attempts.push(attempt);
        this.notify();
        console.log("Submitted attempt:", attempt);
    }

    goToNextVocabulary = () => {
        if (this.current_index < this.vocabularies.length - 1) {
            this.current_index++;

            if (this.user_attempts[this.current_index]) {
                this.current_answer = this.user_attempts[this.current_index].answer;
                this.current_accuracy_score = this.user_attempts[this.current_index].accuracy_score;
            } else {
                this.current_answer = "";
                this.current_accuracy_score = 0;
            }

            this.notify();
        }
    }

    goToPreviousVocabulary = () => {
        if (this.current_index > 0) {
            this.current_index--;
            this.current_answer = this.user_attempts[this.current_index].answer;
            this.current_accuracy_score = this.user_attempts[this.current_index].accuracy_score;
            this.notify();
        }
    }

    onChangeCurrentAnswer = (answer: string) => {
        this.current_answer = answer;
        this.notify();
    }

    getProgress = () => {
        return ((this.current_index + 1) / this.vocabularies.length) * 100;
    }
}