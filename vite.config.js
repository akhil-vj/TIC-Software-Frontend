import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { transformWithEsbuild } from "vite";

// Treat .js files in src/ as JSX (CRA compatibility)
const jsxPlugin = {
    name: "treat-js-as-jsx",
    enforce: "pre",
    async transform(code, id) {
        if (!id.match(/src\/.*\.js$/)) return;
        return transformWithEsbuild(code, id + "x", {
            loader: "jsx",
            jsx: "automatic",
        });
    },
};

export default defineConfig({
    plugins: [jsxPlugin, react()],
    envPrefix: "REACT_APP_",
    optimizeDeps: {
        esbuildOptions: {
            loader: { ".js": "jsx" },
        },
    },
    server: {
        port: 3000,
        open: true,
        proxy: {
            "/api": {
                target: "http://127.0.0.1:3000",
                changeOrigin: true,
            },
        },
    },
    build: {
        outDir: "build",
        sourcemap: false,
    },
    define: {
        "process.env": {},
    },
});
