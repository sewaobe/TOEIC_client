import { uiFeedbackEmitter } from "../utils/uiFeedback.emitter";

type Listener = () => void;

export abstract class BaseViewModel {
    private listeners = new Set<Listener>();
    __version = 0; // ⚡ version counter để React detect thay đổi

    subscribe(listener: Listener): () => void {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    protected notify() {
        this.__version++; // tăng mỗi lần có thay đổi
        for (const l of this.listeners) l();
    }

    protected emitSuccess(message: string) {
        uiFeedbackEmitter.emit({ type: "success", message });
    }
    protected emitError(message: string) {
        uiFeedbackEmitter.emit({ type: "error", message });
    }
    protected emitInfo(message: string) {
        uiFeedbackEmitter.emit({ type: "info", message });
    }
    protected emitWarning(message: string) {
        uiFeedbackEmitter.emit({ type: "warning", message });
    }
}
