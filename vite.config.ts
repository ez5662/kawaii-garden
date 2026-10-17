import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

// https://vite.dev/config/
// The build inlines all JS/CSS into one index.html so it opens straight from disk (file://).
export default defineConfig({
  base: './', // relative URLs so the site works under /kawaii-garden/ and from disk
  plugins: [react(), tailwindcss(), viteSingleFile()],
})
