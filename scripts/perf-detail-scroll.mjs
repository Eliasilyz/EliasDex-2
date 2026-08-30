import { chromium } from 'playwright';

const URL = process.env.PERF_URL || 'http://localhost:3000/anime/1';

async function measureScroll() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Capture console
  page.on('console', msg => console.log('[PAGE]', msg.text()));

  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(2000); // let Lenis + images settle

  // Inject FPS measurement via rAF
  const result = await page.evaluate(async () => {
    return new Promise(resolve => {
      let frames = 0;
      let last = performance.now();
      let janks = 0;
      const start = performance.now();
      const duration = 3000;

      // Scroll smoothly using Lenis-like window.scroll
      const scrollHeight = document.documentElement.scrollHeight;
      const startY = window.scrollY;
      const targetY = Math.min(scrollHeight - window.innerHeight * 0.5, 2000);

      function tick(now) {
        frames++;
        const delta = now - last;
        if (delta > 32) janks++; // >32ms ~ <30fps
        last = now;
        if (now - start < duration) {
          requestAnimationFrame(tick);
        } else {
          resolve({ frames, janks, fps: Math.round(frames / (duration/1000)), duration });
        }
      }
      requestAnimationFrame(tick);

      // Trigger scroll during measurement
      window.scrollTo({ top: targetY, behavior: 'smooth' });
      setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 1200);
    });
  });

  console.log(`[PERF] url=${URL} fps=${result.fps} janks=${result.janks} frames=${result.frames}`);
  // Tight signal: janks > 10 = red (scroll lag), fps < 45 = red
  const isLaggy = result.janks > 10 || result.fps < 45;
  console.log(`[PERF] verdict=${isLaggy ? 'RED_LAGGY' : 'GREEN_SMOOTH'}`);

  await browser.close();
  process.exit(isLaggy ? 1 : 0);
}

measureScroll().catch(e => {
  console.error(e);
  process.exit(2);
});
