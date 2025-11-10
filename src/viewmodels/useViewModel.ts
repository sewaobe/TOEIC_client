// src/viewmodels/useViewModel.ts
import { useMemo, useSyncExternalStore } from "react";
import { BaseViewModel } from "./BaseVM";

/**
 * Kết nối ViewModel (class OOP) với React component.
 * React sẽ tự re-render khi ViewModel gọi notify().
 */
export function useViewModel<T extends BaseViewModel>(VMClass: new () => T): T {
    // ✅ Tạo ViewModel duy nhất
    const vm = useMemo(() => new VMClass(), []);

    // ✅ Một trick nhỏ: tạo "version" counter để React nhận thấy thay đổi
    const snapshot = useSyncExternalStore(
        (listener) => vm.subscribe(listener),
        () => vm.__version ?? 0 // mỗi notify() tăng version → snapshot khác
    );

    // 🔧 Gắn thêm field version cho BaseViewModel (lát mình nói ở dưới)
    return vm;
}
