const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export const uploadToCloudinary = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: "POST", body: formData }
  );

  const data = await res.json();
  return data.secure_url;
};

export const uploadToCloudinaryFromString = async (
  imageString: string | null
): Promise<string | null> => {
  if (!imageString) return null;

  // ✅ Nếu là URL (ảnh cũ) → không upload lại
  if (imageString.startsWith("http")) {
    return imageString;
  }

  // ✅ Nếu là base64 → convert sang Blob rồi upload
  if (imageString.startsWith("data:image")) {
    const res = await fetch(imageString);
    const blob = await res.blob();

    const formData = new FormData();
    formData.append("file", blob);
    formData.append("upload_preset", UPLOAD_PRESET);

    const uploadRes = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      { method: "POST", body: formData }
    );

    const data = await uploadRes.json();
    return data.secure_url || null;
  }

  // ❌ Nếu không phải base64 cũng không phải URL → bỏ qua
  console.warn("Unsupported image string format:", imageString);
  return null;
};

export const uploadDocumentToCloudinary = async (
  file: File
): Promise<{ url: string; type: string }> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  const validTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ];

  if (!validTypes.includes(file.type)) {
    throw new Error("Định dạng tệp không được hỗ trợ!");
  }

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`,
    { method: "POST", body: formData }
  );

  const data = await res.json();

  if (!data.secure_url) throw new Error("Upload thất bại!");

  console.log("📄 Uploaded document:", data.secure_url);

  let fileType = "DOCUMENT";
  if (file.type === "application/pdf") fileType = "PDF";
  else if (file.type.includes("word")) fileType = "WORD";
  else if (file.type.includes("excel")) fileType = "EXCEL";

  return { url: data.secure_url, type: fileType };
};

/**
 * 📡 Upload file (audio, video, image, pdf...) tự động nhận dạng loại
 * Dùng cho Shadowing, Dictation, Speaking...
 */
export const uploadAuto = async (file: File | Blob): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  try {
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`,
      { method: "POST", body: formData }
    );

    const data = await res.json();
    if (!data.secure_url) throw new Error(data.error?.message || "Upload thất bại!");
    console.log("☁️ Uploaded (auto):", data.secure_url);
    return data.secure_url;
  } catch (err) {
    console.error("❌ Lỗi uploadAuto:", err);
    throw err;
  }
};
