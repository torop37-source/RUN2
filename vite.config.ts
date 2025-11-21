import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Charge les variables d'environnement pour qu'elles soient accessibles
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    build: {
      outDir: 'dist',
      sourcemap: true
    },
    define: {
      // Cette ligne est CRITIQUE : elle permet à l'application de lire ta Clé API sur Vercel
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    }
  };
});