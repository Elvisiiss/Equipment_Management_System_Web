import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
// import vueDevTools from 'vite-plugin-vue-devtools'
// TODO: 这个devTools在App.vue修改之后貌似就变到左上角去了，可以解决吗
// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    // vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    host: '0.0.0.0', // 监听所有 IPv4 地址
    port: 5555,      // 指定端口（默认 5173）
    strictPort: true, // 如果端口被占用，直接退出
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:9999',
        changeOrigin: true,
        secure: false,
        // rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})


// netstat -ano | findstr "5173"
// TCP    0.0.0.0:5173           0.0.0.0:0              LISTENING       12345
// taskkill /PID 12345 /F
