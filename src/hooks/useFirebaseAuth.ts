import { signInWithPopup, UserCredential } from "firebase/auth";
import { auth, googleProvider } from "../services/firebaseConfig";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

// ===== Đăng nhập bằng Google =====
export const signInWithGoogle = async (): Promise<UserCredential | null> => {
  const result = await signInWithPopup(auth, googleProvider);
  return result;
};

// ===== Upload file lên Firebase Storage =====
export const uploadFileToFirebase = async (
  file: File,
  folder: string = "uploads"
): Promise<string> => {
  try {
    if (!file) throw new Error("Không có tệp để tải lên.");

    // Kiểm tra dung lượng (giới hạn 5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error("Tệp vượt quá dung lượng tối đa 5MB.");
    }

    // Tạo storage instance
    const storage = getStorage();

    // Tạo đường dẫn file (ví dụ: uploads/1698781234567_resume.pdf)
    const filePath = `${folder}/${Date.now()}_${file.name}`;

    // Tạo reference tới file
    const storageRef = ref(storage, filePath);

    // Upload file
    const snapshot = await uploadBytes(storageRef, file);

    // Lấy URL tải về (có thể mở trực tiếp trong browser)
    const downloadURL = await getDownloadURL(snapshot.ref);

    console.log("✅ Uploaded file:", downloadURL);
    return downloadURL;
  } catch (error) {
    console.error("❌ Lỗi upload file:", error);
    throw error;
  }
};
