import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Carrega as variáveis de ambiente com base no modo (development, production)
  // O terceiro parâmetro '' garante que todas as variáveis sejam carregadas, não apenas as com prefixo VITE_
  // FIX: Cast `process` to `any` to bypass the TypeScript error for `cwd`.
  const env = loadEnv(mode, (process as any).cwd(), '');

  return {
    plugins: [react()],
    define: {
      // Expõe a variável de ambiente para o código do cliente,
      // permitindo que `process.env.API_KEY` funcione como esperado.
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
    },
  }
});