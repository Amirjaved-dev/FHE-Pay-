// Polyfills for browser environment
// This file is imported in layout.tsx to ensure polyfills are loaded before other modules

// Set up global polyfill for FHE SDK and other Node.js modules
if (typeof window !== 'undefined') {
  // Define global on window - this is the main fix for Zama FHE SDK
  if (typeof (window as any).global === 'undefined') {
    (window as any).global = window;
  }

  // Ensure globalThis is available and matches window
  if (typeof (window as any).globalThis === 'undefined') {
    (window as any).globalThis = window;
  }

  // Also set global on globalThis for broader compatibility
  if (typeof globalThis !== 'undefined' && typeof globalThis.global === 'undefined') {
    (globalThis as any).global = globalThis;
  }

  // Set global directly if it doesn't exist
  if (typeof global === 'undefined') {
    (globalThis as any).global = globalThis;
  }

  // Ensure Buffer is available
  if (typeof Buffer === 'undefined') {
    // @ts-ignore - Buffer will be available through polyfill
    const { Buffer } = require('buffer');
    (window as any).Buffer = Buffer;
  }

  // Ensure process is available with basic properties
  if (typeof (window as any).process === 'undefined') {
    (window as any).process = {
      env: {},
      version: '',
      platform: 'browser',
      browser: true,
      next: {},
    };
  }

  // Additional polyfills that might be needed by Node.js modules
  if (typeof (window as any).setImmediate === 'undefined') {
    (window as any).setImmediate = (fn: Function) => setTimeout(fn, 0);
  }

  if (typeof (window as any).clearImmediate === 'undefined') {
    (window as any).clearImmediate = (id: number) => clearTimeout(id);
  }

  // Console log for debugging
  console.log('🔧 Browser polyfills loaded');
}