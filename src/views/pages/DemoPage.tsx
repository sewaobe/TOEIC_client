import { useState } from "react";
import { WelcomeModal } from "../../components/welcome/WelcomeModal";

export default function DemoPage() {
    const [open, setOpen] = useState(true);
    return <WelcomeModal open={open} onClose={() => setOpen(false)} />
}