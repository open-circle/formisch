import '@testing-library/jest-dom/vitest';
import { enableAutoUnmount } from '@vue/test-utils';
import { afterEach } from 'vitest';

// Auto-unmount every wrapper after each test so reactive effects, watchers,
// and DOM nodes from one test don't leak into the next.
enableAutoUnmount(afterEach);
