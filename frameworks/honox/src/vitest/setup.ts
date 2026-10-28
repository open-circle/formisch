import '@testing-library/dom';
import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from './render.tsx';

// Cleanup after each test
afterEach(() => {
  cleanup();
});
