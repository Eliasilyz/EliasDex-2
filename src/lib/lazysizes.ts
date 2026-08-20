if (typeof window !== 'undefined') {
  // Dynamically import lazysizes on client side runtime
  import('lazysizes').then(() => {
    if ((window as any).lazySizes) {
      (window as any).lazySizes.cfg = (window as any).lazySizes.cfg || {};
      (window as any).lazySizes.cfg.expand = 300;
      (window as any).lazySizes.cfg.expFactor = 1.5;
      (window as any).lazySizes.cfg.loadMode = 1;
    }
  }).catch((err) => {
    console.warn('[lazysizes] Initialization error:', err);
  });
}

export {};
