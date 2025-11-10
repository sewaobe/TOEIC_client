import { useEffect } from "react";
import { toast } from "sonner";
import { uiFeedbackEmitter } from "../../utils/uiFeedback.emitter";

export const GlobalToastListener = () => {
    useEffect(() => {
        const unsubscribe = uiFeedbackEmitter.subscribe(({ type, message }) => {
            switch (type) {
                case "success":
                    toast.success(message);
                    break;
                case "error":
                    toast.error(message);
                    break;
                case "warning":
                    toast.warning(message);
                    break;
                default:
                    toast(message);
            }
        });
        return unsubscribe;
    }, []);

    return null;
};
