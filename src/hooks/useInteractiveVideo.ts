import { useEffect, useState, useRef } from "react";
import videojs from "video.js";
import type Player from "video.js/dist/types/player";
import "video.js/dist/video-js.css";
import "videojs-youtube";

export interface QuestionMarker {
  time: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

type WarningState = { open: boolean; message: string };

const MAX_SEEK_SECONDS = 15;
const EPS = 0.3; // Ngưỡng để khớp thời gian marker

export const useInteractiveVideo = (
  videoRef: React.RefObject<HTMLVideoElement>,
  markers: QuestionMarker[],
  videoUrl: string,
  onVideoEnd?: () => void
) => {
  const [player, setPlayer] = useState<Player | null>(null);
  const [activeQuestion, setActiveQuestion] = useState<QuestionMarker | null>(
    null
  );
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [warning, setWarning] = useState<WarningState>({
    open: false,
    message: "",
  });

  const warningRef = useRef(warning);
  const shownMarkersRef = useRef<Set<number>>(new Set());
  const seekStartPosRef = useRef<number>(0);
  const isSeekingRef = useRef(false);
  const isLockedRef = useRef(false);
  // 🔽 THÊM DÒNG NÀY
  const maxWatchedTimeRef = useRef<number>(0);

  useEffect(() => {
    warningRef.current = warning;
  }, [warning]);

  useEffect(() => {
    if (!videoRef.current) return;

    const isYouTube =
      videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be");

    const vjsPlayer = videojs(videoRef.current, {
      controls: true,
      preload: "auto",
      fluid: true,
      playbackRates: [0.75, 1, 1.25, 1.5],
      techOrder: ["youtube", "html5"],
      sources: [
        {
          src: videoUrl,
          type: isYouTube ? "video/youtube" : "video/mp4",
        },
      ],
    });

    setPlayer(vjsPlayer);

    /** 🎯 Vẽ marker trên thanh progress */
    const renderMarkers = () => {
      const bar = vjsPlayer
        .el()
        ?.querySelector(".vjs-progress-holder") as HTMLElement | null;
      if (!bar) return;
      bar.querySelectorAll(".vjs-marker").forEach((el) => el.remove());
      const duration = vjsPlayer.duration();
      if (!duration || duration === Infinity) return;

      markers.forEach((m) => {
        const left = (m.time / duration) * 100;
        const el = document.createElement("div");
        const isDone = shownMarkersRef.current.has(m.time);
        Object.assign(el.style, {
          position: "absolute",
          left: `${left}%`,
          bottom: "5px",
          width: "10px",
          height: "10px",
          borderRadius: "50%",
          transform: "translateX(-50%)",
          background: isDone
            ? "linear-gradient(135deg, #16a34a, #4ade80)"
            : "linear-gradient(135deg, #dc2626, #f87171)",
          boxShadow: isDone
            ? "0 0 8px rgba(34,197,94,0.6)"
            : "0 0 8px rgba(239,68,68,0.6)",
          zIndex: 10,
        });
        el.className = "vjs-marker";
        bar.appendChild(el);
      });
    };

    /** 🕹 Khi bắt đầu tua */
    const onSeeking = () => {
      seekStartPosRef.current = vjsPlayer.currentTime() ?? 0;
      isSeekingRef.current = true;
      vjsPlayer.pause();
    };

    // 🔽 THAY THẾ TOÀN BỘ HÀM NÀY
    /** 🕹 Khi tua xong */
    const onSeeked = () => {
      const newTime = vjsPlayer.currentTime() ?? 0;
      const start = seekStartPosRef.current;
      const delta = newTime - start;
      const maxWatched = maxWatchedTimeRef.current; // Lấy max time đã xem

      isSeekingRef.current = false; // Đánh dấu là đã tua xong

      // Chỉ check 15s_rule NẾU:
      // 1. Tua tiến (delta > 0)
      // 2. Và tua đến điểm MỚI (newTime > maxWatched)
      if (delta > 0 && newTime > maxWatched) {
        // Tính delta "hiệu dụng" (phần tua vào vùng chưa xem)
        const effectiveStart = Math.max(start, maxWatched);
        const effectiveDelta = newTime - effectiveStart;

        // Check 15s rule với delta hiệu dụng
        if (effectiveDelta > MAX_SEEK_SECONDS) {
          // -----------------------------------------------------------------
          // YÊU CẦU 1: Xử lý tua KHÔNG HỢP LỆ (Tua quá 15s vào vùng mới)
          // -----------------------------------------------------------------
          vjsPlayer.currentTime(start); // Reset về vị trí BẮT ĐẦU TUA
          vjsPlayer.pause();
          isLockedRef.current = true;

          setWarning({
            open: true,
            message:
              "⚠️ Bạn chỉ được phép tua tối đa 15 giây vào vùng chưa học. Hãy học tuần tự nhé!",
          });

          setTimeout(() => {
            vjsPlayer.pause();
            isLockedRef.current = false;
          }, 300);

          return; // Dừng hàm
        }
      }

      // -----------------------------------------------------------------
      // YÊU CẦU 2: Xử lý tua HỢP LỆ
      // (Tua lùi, tua trong vùng đã xem, hoặc tua tiến < 15s vào vùng mới)
      // -> Check xem có bỏ lỡ marker nào không
      // -----------------------------------------------------------------
      const firstUnwatchedMarker = markers
        .filter(
          (m) => m.time <= newTime && !shownMarkersRef.current.has(m.time)
        )
        .sort((a, b) => a.time - b.time)[0];

      if (firstUnwatchedMarker) {
        // 🛑 PHÁT HIỆN TUA LỐ MARKER
        const rewindTime = Math.max(0, firstUnwatchedMarker.time - 3);
        vjsPlayer.currentTime(rewindTime);

        if (!warningRef.current.open) {
          setTimeout(() => vjsPlayer.play(), 100);
        }
      } else {
        // ✅ Tua hợp lệ VÀ không bỏ lỡ marker nào
        vjsPlayer.pause();
        if (!warningRef.current.open) {
          setTimeout(() => vjsPlayer.play(), 200);
        }
      }
    };

    // 🔽 THAY THẾ TOÀN BỘ HÀM NÀY
    /** ⏱ Khi thời gian video thay đổi */
    const onTimeUpdate = () => {
      if (isSeekingRef.current || isLockedRef.current) return;
      const current = vjsPlayer.currentTime() ?? 0;

      // THÊM LOGIC MỚI: Cập nhật maxWatchedTime
      if (current > maxWatchedTimeRef.current) {
        maxWatchedTimeRef.current = current;
      }

      const hit = markers.find(
        (m) =>
          Math.abs(current - m.time) <= EPS &&
          !shownMarkersRef.current.has(m.time)
      );
      if (hit) {
        vjsPlayer.pause();
        setActiveQuestion(hit);
        shownMarkersRef.current.add(hit.time);
        renderMarkers();
      }
    };

    /** 🚫 Nếu cảnh báo đang mở, chặn play */
    const onPlay = () => {
      if (warningRef.current.open || isLockedRef.current) {
        vjsPlayer.pause();
      }
    };

    /** 🎬 Khi video kết thúc */
    const onEnded = () => {
      if (onVideoEnd) {
        onVideoEnd();
      }
    };

    vjsPlayer.on("loadedmetadata", renderMarkers);
    vjsPlayer.on("seeking", onSeeking);
    vjsPlayer.on("seeked", onSeeked);
    vjsPlayer.on("timeupdate", onTimeUpdate);
    vjsPlayer.on("play", onPlay);
    vjsPlayer.on("ended", onEnded);

    const onFullscreenChange = () => {
      setIsFullscreen(vjsPlayer.isFullscreen() ?? false);
    };
    vjsPlayer.on("fullscreenchange", onFullscreenChange);

    return () => {
      [
        "loadedmetadata",
        "seeking",
        "seeked",
        "timeupdate",
        "play",
        "ended",
        "fullscreenchange",
      ].forEach((e) => vjsPlayer.off(e));

      if (vjsPlayer && !vjsPlayer.isDisposed()) {
        vjsPlayer.dispose();
        setPlayer(null);
      }
    };
  }, [videoUrl, markers, onVideoEnd]);

  /** ▶️ Tiếp tục video sau khi trả lời */
  const resumeVideo = () => {
    if (player && player.el()?.isConnected) {
      setActiveQuestion(null);
      setTimeout(() => player.play(), 200);
    }
  };

  /** ❌ Đóng cảnh báo */
  const closeWarning = () => setWarning({ open: false, message: "" });

  return {
    player,
    activeQuestion,
    resumeVideo,
    isFullscreen,
    warning,
    closeWarning,
  };
};
