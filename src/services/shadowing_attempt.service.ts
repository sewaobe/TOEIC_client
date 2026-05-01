import axiosClient from "./axiosClient";
import {
  SaveShadowingAttemptPayload,
  ShadowingAttempt,
} from "../types/ShadowingAttempt";

const BASE_URL = "/shadowing-attempts";

export const shadowingAttemptService = {
  getBySession: async (sessionId: string): Promise<ShadowingAttempt | null> => {
    const res = await axiosClient.get(`${BASE_URL}/session/${sessionId}`);
    return res.data;
  },

  saveDraft: async (
    sessionId: string,
    payload: SaveShadowingAttemptPayload,
  ): Promise<ShadowingAttempt> => {
    const res = await axiosClient.post(`${BASE_URL}/session/${sessionId}/save-draft`, {
      payload,
    });
    return res.data;
  },

  complete: async (
    sessionId: string,
    payload: SaveShadowingAttemptPayload,
    audioBlob: Blob,
  ): Promise<ShadowingAttempt> => {
    const formData = new FormData();
    formData.append("payload", JSON.stringify(payload));
    formData.append("audio", audioBlob, "shadowing-attempt.webm");

    const res = await axiosClient.post(`${BASE_URL}/session/${sessionId}/complete`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  deleteBySession: async (sessionId: string): Promise<void> => {
    await axiosClient.delete(`${BASE_URL}/session/${sessionId}`);
  },
};
