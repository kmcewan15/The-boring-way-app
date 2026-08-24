import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  /* Serve `images/` as the static root, so a file dropped in there is reachable
     at `/its-name.jpg` with no import and no second copy. Keeps every image in
     the one folder. */
  publicDir: 'images',
  server: { port: 5173, open: true },
});
