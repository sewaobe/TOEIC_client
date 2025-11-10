import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { PracticeDefinitionBasedDetailVM } from "./PracticeDefinitionBasedDetailVM";
import { useViewModel } from "../useViewModel";

export const usePracticeDefinitionBasedDetailVM = () => {
    const location = useLocation();
    const practice_id = location.pathname.split("/").pop();
    const vm = useViewModel(PracticeDefinitionBasedDetailVM);

    useEffect(() => {
        if (practice_id) {
            vm.fetchVocabularies(practice_id);
        }
    }, [practice_id]);


    return { vm };
}