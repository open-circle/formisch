import build from '@hono/vite-build/node';
import tailwindcss from '@tailwindcss/vite';
import honox from 'honox/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    // Hint: The client input replaces the HonoX default instead of extending
    // it, so `/app/client.ts` has to be listed next to the Tailwind entry.
    honox({ client: { input: ['/app/client.ts', '/app/style.css'] } }),
    tailwindcss(),
    build(),
  ],
});
