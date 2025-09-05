import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
    server: {
        host: "::",
        port: 8080,
        proxy: {
            '/api/uptime': {
                target: 'http://167.172.229.221:3026',
                changeOrigin: true,
                // CORRIGIDO: Remove o prefixo /api/uptime para que a chamada completa seja enviada
                rewrite: (path) => path.replace(/^\/api\/uptime/, ''),
            },
            '/api/portainer': {
                target: 'http://167.172.229.221:9000',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api\/portainer/, '/api'),
            },
        }
    },
    plugins: [
        react(),
        mode === 'development' &&
        componentTagger(),
    ].filter(Boolean),
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
}));