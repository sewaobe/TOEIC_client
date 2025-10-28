import axiosClient from "./axiosClient";

const BASE_URL = "/admin/request-collaborators";
export const requestCollaboratorService = {
    submitRequestCollaborator: async (data: any) => {
        const res = await axiosClient.post(`${BASE_URL}`, data);
        return res.data;
    },
    getRequestCollaboratorByUser: async () => {
        const res = await axiosClient.get(`${BASE_URL}/by-user`);
        return res.data;
    },
}