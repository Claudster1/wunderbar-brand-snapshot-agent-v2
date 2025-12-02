// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

// Vite config for the Brand Snapshot agent UI
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: 'localhost',
  },
});
