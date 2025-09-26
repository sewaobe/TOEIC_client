import { set, get, del, keys } from "idb-keyval";

// Lưu file vào IndexedDB với key duy nhất
export async function saveImageToDB(key: string, file: File) {
    await set(key, file);
}

// Lấy file từ IndexedDB
export async function getImageFromDB(key: string): Promise<File | undefined> {
    return await get<File>(key);
}

// Xoá file
export async function deleteImageFromDB(key: string) {
    await del(key);
}

// Liệt kê key
export async function listImageKeys(): Promise<IDBValidKey[]> {
    return await keys();
}
