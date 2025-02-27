import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  server: {
    proxy: {
      // 字符串简写写法：
      // http://localhost:5173/foo 
      // -> http://localhost:4567/foo
      '/api': {
        target: 'http://127.0.0.1:8000', // 注意这里不要直接加上/login/路径
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/'),
      },
      },
    }
  
})
