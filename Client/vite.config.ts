import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import fs from "fs";
import path from "path";

export default defineConfig({
  plugins: [tailwindcss()],

  server: {
    port: 5173,
    https: {
      key: fs.readFileSync(path.resolve(__dirname, "cert/server.key")),
      cert: fs.readFileSync(path.resolve(__dirname, "cert/server.crt")),
    },
  },

  preview: {
    port: 5173,
    https: {
      key: fs.readFileSync(path.resolve(__dirname, "cert/server.key")),
      cert: fs.readFileSync(path.resolve(__dirname, "cert/server.crt")),
    },
  },
});
