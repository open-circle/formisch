import { createClient } from 'honox/client';
import { disableTransitions } from './utils';

createClient();

// Disable CSS transitions while the window is resized
window.addEventListener('resize', disableTransitions);
