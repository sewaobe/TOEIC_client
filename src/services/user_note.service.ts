import { User_Note } from "../types/User_Note"
import axiosClient from "./axiosClient"

const BASE_URL = "/user-notes"

export const user_note_service = {
    async getNotesByUserId(): Promise<User_Note[]> {
        const res = await axiosClient.get(`${BASE_URL}`)
        return res.data;
    },
    async createNote(data: Partial<User_Note>): Promise<User_Note> {
        const res = await axiosClient.post(`${BASE_URL}`, data)
        return res.data;
    },
    async updateNote(data: Partial<User_Note>, note_id: string): Promise<User_Note> {
        const res = await axiosClient.put(`${BASE_URL}/${note_id}`, data)
        return res.data;
    },
    async deleteNote(note_id: string): Promise<{ success: boolean }> {
        const res = await axiosClient.delete(`${BASE_URL}/${note_id}`)
        return res.success;
    }
}