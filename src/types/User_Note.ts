export type User_Note = {
    _id: string;
    user_id: string;
    title: string;
    content: string;
    related_url?: string | null;
    created_at: string;
    updated_at: string;
}