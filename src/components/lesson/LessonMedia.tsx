import { Box } from "@mui/material";

interface LessonMediaProps {
  src: string;                // link media
  type?: "video" | "audio";   // mặc định video
}

export default function LessonMedia({
  src,
  type = "video",
}: LessonMediaProps) {
  // Hàm chuyển link YouTube thành link embed
  const getYoutubeEmbedUrl = (url: string) => {
    try {
      if (url.includes("youtube.com/watch?v=")) {
        const urlObj = new URL(url);
        const videoId = urlObj.searchParams.get("v");
        const listId = urlObj.searchParams.get("list");
        if (!videoId) return url;
        return `https://www.youtube.com/embed/${videoId}${
          listId ? `?list=${listId}` : ""
        }`;
      }
      if (url.includes("youtu.be/")) {
        const parts = url.split("/");
        const videoId = parts.pop()?.split("?")[0];
        const listMatch = url.match(/list=([^&]+)/);
        if (!videoId) return url;
        return `https://www.youtube.com/embed/${videoId}${
          listMatch ? `?list=${listMatch[1]}` : ""
        }`;
      }
      return url;
    } catch {
      return url;
    }
  };

  const isYoutube = src.includes("youtu");

  return (
    <Box
      sx={{
        width: "90%",
        aspectRatio: type === "video" ? "16/9" : "auto",
        borderRadius: "16px",
        overflow: "hidden",
        bgcolor: "#000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: 3,
        mb: 2
      }}
    >
      {isYoutube ? (
        <iframe
          width="100%"
          height="100%"
          src={getYoutubeEmbedUrl(src)}
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : type === "video" ? (
        <video
          src={src}
          controls
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        >
          Trình duyệt của bạn không hỗ trợ video.
        </video>
      ) : (
        <audio src={src} controls style={{ width: "100%" }}>
          Trình duyệt của bạn không hỗ trợ audio.
        </audio>
      )}
    </Box>
  );
}
