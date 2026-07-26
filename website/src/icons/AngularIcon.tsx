import { component$, type PropsOf } from '@qwik.dev/core';

export const AngularIcon = component$<PropsOf<'svg'>>((props) => (
  <svg viewBox="0 0 24 24" role="img" aria-label="Angular icon" {...props}>
    <defs>
      <linearGradient
        id="Ng4t"
        x1="0"
        x2="1"
        y1="0"
        y2="1"
        gradientUnits="objectBoundingBox"
      >
        <stop offset="0" stop-color="#e40035" />
        <stop offset=".24" stop-color="#f60a48" />
        <stop offset=".49" stop-color="#f20755" />
        <stop offset=".72" stop-color="#dc087e" />
        <stop offset="1" stop-color="#a233b5" />
      </linearGradient>
    </defs>
    <path
      fill="url(#Ng4t)"
      d="M16.712 17.711H7.288l-1.204 2.916L12 24l5.916-3.373-1.204-2.916ZM14.692 0l7.832 16.855.814-12.856L14.692 0ZM9.308 0 .662 3.999l.814 12.856L9.308 0Zm-.405 13.93h6.198L12 6.396 8.903 13.93Z"
    />
  </svg>
));
