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
