import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  esbuild: {
    drop: ["console", "debugger"]
  },

  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom", "react-router-dom"],

          mui: [
            "@mui/material",
            "@mui/icons-material",
            "@emotion/react",
            "@emotion/styled"
          ],

          charts: [
            "recharts",
            "d3",
            "@mui/x-charts"
          ],

          editor: [
            "@milkdown/crepe",
            "@milkdown/react",
            "@milkdown/kit",
            "react-quill",
            "quill",
            "@uiw/react-md-editor"
          ],

          media: [
            "video.js",
            "videojs-youtube",
            "lottie-web"
          ],

          utils: [
            "axios",
            "zod",
            "socket.io-client"
          ]
        }
      }
    }
  }
});