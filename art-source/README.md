# Source art

The original PNG exports of the world backgrounds. **Not served**: `vite.config.ts`
sets `publicDir: 'images'`, so anything in `images/` is copied verbatim into
`dist/` whether the app references it or not -- these three were adding 8.5MB to
every build for nothing.

The app loads the WebP versions in `images/`, re-encoded from these at quality
0.95 (mean per-channel error 1.95/255, i.e. under 1%). Keep these as the masters:
re-encode from here, never from a WebP.

Worth knowing if you regenerate them: at 793x1983 these are smaller than the box
they are drawn into. On a 1600px-wide window the art area is about 1337px, so
`background-size: cover` upscales them ~1.7x. Regenerating nearer 1600x4000 is
the single biggest available improvement to how the app looks.
