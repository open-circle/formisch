import type { Framework } from './index.ts';

/**
 * The current framework being used.
 */
export const framework: Framework = 'react-native';

// Hint: React Native shares React's rendering core, so the React adapter's
// signal implementation is re-exported as is and only the framework
// identifier differs. This keeps a single implementation to maintain.
export {
  batch,
  createId,
  createSignal,
  type Listener,
  setListener,
  untrack,
} from './index.react.ts';
