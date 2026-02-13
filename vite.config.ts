
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // Vite does not define process.env by default. 
    // This mapping ensures the application can access environment variables as expected.
    'process.env': process.env
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-utils': ['@google/genai', '@supabase/supabase-js'],
        },
      },
    },
  },
});
