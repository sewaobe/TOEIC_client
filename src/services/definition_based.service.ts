import { VocabularyDefinitionAttempt } from "../types/Vocabulary_Definition_Attempt";
import axiosClient from "./axiosClient";

const BASE_URL = "/vocabulary-definition-attempts";

export const definitionBasedService = {
    async submitDefinitionAttempt(data: VocabularyDefinitionAttempt[]) {
        const res = await axiosClient.post(`${BASE_URL}`, data);

        return res.data;
    }
}