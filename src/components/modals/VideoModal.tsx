import React from "react";
import {
  Modal,
  Fade,
  Backdrop,
  IconButton,
  Box,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

interface VideoModalProps {
  open: boolean;
  onClose: () => void;
  videoUrl: string;
  title?: string;
}

export const VideoModal: React.FC<VideoModalProps> = ({
  open,
  onClose,
  videoUrl,
  title,
}) => {
  // Kiểm tra có phải link online (YouTube, Vimeo, HTTP...) không
  const isExternalUrl = /^https?:\/\//i.test(videoUrl);

  // Nếu là YouTube link ngắn (youtu.be) → convert sang embed
  const getEmbedUrl = (url: string) => {
    if (url.includes("youtu.be")) {
      const id = url.split("youtu.be/")[1];
      return `https://www.youtube.com/embed/${id}`;
    } else if (url.includes("watch?v=")) {
      const id = new URL(url).searchParams.get("v");
      return `https://www.youtube.com/embed/${id}`;
    }
    return url;
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
      slots={{ backdrop: Backdrop }}
      slotProps={{
        backdrop: {
          timeout: 400,
          sx: {
            background:
              "radial-gradient(circle at center, rgba(255,255,255,0.4) 0%, rgba(0,0,0,0.4) 100%)",
            backdropFilter: "blur(6px)",
          },
        },
      }}
    >
      <Fade in={open}>
        <Box
          className="
            fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
            bg-white dark:bg-gray-900 rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.25)]
            w-[95%] sm:w-[80%] md:w-[70%] lg:w-[60%] xl:w-[50%]
            transition-all duration-300
            p-5
          "
        >
          {/* Header */}
          <Box
            className="
              flex items-center justify-between 
              px-3 pb-2 border-b border-gray-200 dark:border-gray-700
            "
          >
            {title && (
              <Typography
                variant="h6"
                className="
                  font-semibold text-gray-800 dark:text-gray-100 
                  tracking-wide
                "
              >
                {title}
              </Typography>
            )}
            <IconButton
              onClick={onClose}
              className="
                text-gray-600 dark:text-gray-300 
                hover:text-red-500 transition-all
              "
            >
              <CloseIcon fontSize="medium" />
            </IconButton>
          </Box>

          {/* Video Section */}
          <Box
            className="
              w-full mt-4
              rounded-2xl overflow-hidden shadow-lg 
              bg-gray-50 dark:bg-gray-800
              border border-gray-200 dark:border-gray-700
              p-[6px]
            "
          >
            {isExternalUrl ? (
              <iframe
                src={getEmbedUrl(videoUrl)}
                className="w-full aspect-video rounded-xl"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="Video player"
              />
            ) : (
              <video
                src={videoUrl}
                controls
                autoPlay
                className="
                  w-full h-full rounded-xl 
                  object-contain
                  bg-black
                "
              />
            )}
          </Box>
        </Box>
      </Fade>
    </Modal>
  );
};
