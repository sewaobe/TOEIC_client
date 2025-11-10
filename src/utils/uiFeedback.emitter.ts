type UIFeedbackType = "success" | "error" | "warning" | "info";

type UIFeedbackEvent = {
    type: UIFeedbackType;
    message: string;
};

type Listener = (event: UIFeedbackEvent) => void;

class UIFeedbackEmitter {
    private listeners: Listener[] = [];

    emit(event: UIFeedbackEvent) {
        this.listeners.forEach((l) => l(event));
    }

    subscribe(listener: Listener) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter((l) => l !== listener);
        };
    }
}

export const uiFeedbackEmitter = new UIFeedbackEmitter();
