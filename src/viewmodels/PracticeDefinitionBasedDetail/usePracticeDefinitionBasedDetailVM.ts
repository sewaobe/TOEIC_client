import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { PracticeDefinitionBasedDetailVM } from "./PracticeDefinitionBasedDetailVM";
import { useViewModel } from "../useViewModel";

export const usePracticeDefinitionBasedDetailVM = () => {
    const location = useLocation();
    const practice_id = location.pathname.split("/").pop();
    const vm = useViewModel(PracticeDefinitionBasedDetailVM);

    const [showGuider, setShowGuider] = useState(() => {
        return localStorage.getItem("definition_based_tour_seen") !== "true";
    });

    useEffect(() => {
        if (practice_id) {
            vm.fetchVocabularies(practice_id);
        }
    }, [practice_id]);

    const vocab = vm.getCurrentVocabulary();

    // Lấy attempt mới nhất cho từ vựng hiện tại
    const latestAttempt = vm.user_attempts
        .filter((a) => a.vocabulary_id === vocab?._id)
        .slice(-1)[0];

    const hasAttemptedCurrent = !!latestAttempt;
    const isCorrect = latestAttempt?.is_correct ?? false;
    const accuracyScore = latestAttempt?.accuracy_score ?? 0;

    const navigate = useNavigate();
    const handleCompleted = async () => {
        await vm.completedPractice();
        setTimeout(() => {
            navigate(-1);
        }, 500)
    }
    return {
        vm,
        hasAttemptedCurrent,
        isCorrect,
        accuracyScore,
        vocab,
        handleCompleted,

        showGuider,
        setShowGuider
    };
}