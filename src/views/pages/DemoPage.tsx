import { useState } from "react";
import { WelcomeModal } from "../../components/welcome/WelcomeModal";
import { FeedbackLessonModal } from "../../components/modals/FeedbackLessonModal";

export default function DemoPage() {
    const [open, setOpen] = useState(true);
    return <FeedbackLessonModal open={open} onClose={() => setOpen(false)} />
}