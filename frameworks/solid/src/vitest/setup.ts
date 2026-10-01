import { cleanup } from '@solidjs/testing-library';
import '@testing-library/jest-dom/vitest';
import { flush } from 'solid-js';
import { afterEach } from 'vitest';

// Cleanup after each test
afterEach(() => {
  cleanup();
  // Drain queued disposal work before the next test creates a new owner.
  flush();
});
