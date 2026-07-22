import path from 'path'
import { defineConfig, loadEnv } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'

const envDir = path.resolve(__dirname, '..')

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, envDir, '')
  const apiUrl =
    process.env.VITE_API_URL ||
    env.VITE_API_URL ||
    process.env.BACKEND_URL ||
    env.BACKEND_URL ||
    'http://localhost:5001'

  return {
    envDir,
    define: {
      'import.meta.env.VITE_API_URL': JSON.stringify(apiUrl),
      'import.meta.env.BACKEND_URL': JSON.stringify(apiUrl)
    },
    plugins: [
      tailwindcss(),
      react(),
      babel({ presets: [reactCompilerPreset()] })
    ]
  }
})
