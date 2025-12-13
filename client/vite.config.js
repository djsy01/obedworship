import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: '0.0.0.0',

    // 🔥 핵심
    allowedHosts: [
      'transurethral-frederic-elmy.ngrok-free.dev',
      '.ngrok-free.dev', // ⭐ 이 줄 중요 (도메인 바뀌어도 대응)
    ],

    // ngrok + https 환경 안정화
    hmr: {
      clientPort: 443,
    },
  },
})
