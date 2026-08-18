// Import core-js polyfills for cross-browser runtime compatibility
import 'core-js/stable';

if (typeof window !== 'undefined') {
  // Ensure polyfills are attached on client side runtime
  console.log('[core-js] Polyfills initialized.');
}
