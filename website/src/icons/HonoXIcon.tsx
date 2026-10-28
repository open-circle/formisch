import { component$, type PropsOf } from '@qwik.dev/core';

export const HonoXIcon = component$<PropsOf<'svg'>>((props) => (
  <svg viewBox="0 0 48 48" role="img" aria-label="HonoX icon" {...props}>
    <defs>
      <linearGradient id="honox-icon-gradient" x2="0%" y2="100%">
        <stop stop-color="#f84" />
        <stop offset="100%" stop-color="#f30" />
      </linearGradient>
    </defs>
    <g transform="translate(8.49 4) scale(0.4082)">
      <path
        fill="url(#honox-icon-gradient)"
        d="m11 25 7 9s9-18 22-34c17 20 36 48 36 64 0 20-19 34-37 34C17 98 0 81 0 61c0-6 3-24 11-36Z"
      />
      <path fill="#f95" d="M39 21c47 51 14 66 0 66-11 0-51-11 0-66Z" />
    </g>
  </svg>
));
