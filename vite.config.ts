import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), "");

    return {
        server: {
            host: "::",
            port: 8080,
            proxy: {
                "/api/uptime": {
                    target: "http://167.172.229.221:3026",
                    changeOrigin: true,
                    rewrite: (path) => path.replace(/^\/api\/uptime/, ""),
                },
                "/api/portainer": {
                    target: "http://167.172.229.221:9000",
                    changeOrigin: true,
                    configure: (proxy) => {
                        proxy.on("proxyReq", (proxyReq) => {
                            proxyReq.setHeader("X-API-Key", env.PORTAINER_API_KEY);
                        });
                    },
                    rewrite: (path) => path.replace(/^\/api\/portainer/, "/api"),
                },
                "/api/do": {
                    target: "https://api.digitalocean.com",
                    changeOrigin: true,
                    rewrite: (path) => path.replace(/^\/api\/do/, ""),
                    configure: (proxy) => {
                        proxy.on("proxyReq", (proxyReq) => {
                            proxyReq.setHeader("Authorization", `Bearer ${env.DO_TOKEN}`);
                        });
                    },
                },
            },
        },
        plugins: [react()],
        resolve: {
            alias: {
                "@": path.resolve(__dirname, "./src"),
            },
        },
    };
});
