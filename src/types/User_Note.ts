export type User_Note = {
    _id: string;
    user_id: string;
    title: string;
    content: string;
    related_object?: {
        related_id: string;
        week_no: string;
        day_id: string;
    } | null;
    created_at: string;
    updated_at: string;
}