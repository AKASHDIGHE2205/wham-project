import tailwindcss from "@tailwindcss/vite";
import fs from "fs";
import path from "path";
import { defineConfig } from "vite";

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

// import tailwindcss from "@tailwindcss/vite";
// import fs from "fs";
// import path from "path";
// import { defineConfig } from "vite";

// // Load SSL files once to avoid repetition
// const ssl = {
//   key: fs.readFileSync(path.resolve(__dirname, "cert/server.key")),
//   cert: fs.readFileSync(path.resolve(__dirname, "cert/server.crt")),
// };

// export default defineConfig({
//   plugins: [tailwindcss()],

//   server: {
//     port: 5173,
//     https: ssl,
//     proxy: {
//       "/api": {
//         target: "https://localhost:5172",
//         changeOrigin: true,
//         secure: false,
//       },
//     },
//   },

//   preview: {
//     port: 5173,
//     https: ssl,
//     proxy: {
//       "/api": {
//         target: "https://localhost:5172",
//         changeOrigin: true,
//         secure: false,
//       },
//     },
//   },
// });
