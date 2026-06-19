import https from 'node:https'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Agente sem keep-alive: cada requisicao abre uma conexao TLS nova,
// evitando reaproveitar uma conexao "morta" apos o backend reiniciar.
const backendAgent = new https.Agent({ keepAlive: false })

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://localhost:3001',
        changeOrigin: true,
        secure: false,
        agent: backendAgent,
        configure: (proxy) => {

          proxy.on('error', (error) => {
            if (error.code === 'ECONNRESET' || error.code === 'ECONNREFUSED') {
              console.warn(
                `[proxy] conexao transitoria com o backend (${error.code}). O frontend tentara novamente.`,
              )
              return
            }

            console.error('[proxy] erro inesperado:', error.message)
          })
        },
      },
    },
  },
})
