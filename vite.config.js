import { defineConfig } from 'vite'

const isCodeSandbox =
  "SANDBOX_URL" in process.env || "CODESANDBOX_HOST" in process.env

// https://vitejs.dev/config/
export default defineConfig({
  base: "./",
  publicDir: './public',
  server: {
    host: true,
    open: !isCodeSandbox, // Open if it's not a CodeSandbox
    port: 5173,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          three: ["three"]
        },
      },
    },
  },
})