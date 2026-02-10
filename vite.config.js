import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: {
      'react': 'C:/Users/SUMIT/Desktop/mrb/MRB-DEMO-FRONTEND/node_modules/react',
      'react-dom': 'C:/Users/SUMIT/Desktop/mrb/MRB-DEMO-FRONTEND/node_modules/react-dom',
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080', // Your backend URL
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      // Since your backend endpoints don't seem to have a common /api prefix
      // based on your Swagger, you might need to proxy everything or specific routes:
      '/getStudentResults': 'http://localhost:8080',
      '/getAllApplications': 'http://localhost:8080',
      '/getAllResults': 'http://localhost:8080',
      '/addStudent': 'http://localhost:8080',
      '/getAllStudents': 'http://localhost:8080',
      '/getStudent': 'http://localhost:8080',
      '/addExam': 'http://localhost:8080',
      '/getAllExams': 'http://localhost:8080',
      '/fill-form': 'http://localhost:8080',
      '/get-form': 'http://localhost:8080',
    }
  }
})