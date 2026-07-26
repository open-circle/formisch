import { component$, type PropsOf } from '@qwik.dev/core';

export const AngularLogo = component$<PropsOf<'svg'>>((props) => (
  <svg viewBox="0 0 128 48" role="img" aria-label="Angular logo" {...props}>
    <defs>
      <linearGradient
        id="Ng7l"
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
      fill="url(#Ng7l)"
      transform="translate(8 8) scale(1.3333)"
      d="M16.712 17.711H7.288l-1.204 2.916L12 24l5.916-3.373-1.204-2.916ZM14.692 0l7.832 16.855.814-12.856L14.692 0ZM9.308 0 .662 3.999l.814 12.856L9.308 0Zm-.405 13.93h6.198L12 6.396 8.903 13.93Z"
    />
    <path
      class="text-[#1a1a1a] dark:text-[#e1e1e1]"
      fill="currentColor"
      transform="translate(6.644 -5.7)"
      d="M37.356 37.3V23.773h1.74l8.27 10.893V23.773h1.654V37.3h-1.74L39 26.3v11h-1.654zm25.137-.537a10.05 10.05 0 0 1-3.523.623c-4.898 0-7.348-2.342-7.348-7.047 0-4.447 2.363-6.682 7.1-6.682 1.354 0 2.62.193 3.78.56v1.504c-1.16-.45-2.363-.666-3.588-.666-3.695 0-5.543 1.762-5.543 5.242 0 3.76 1.826 5.63 5.457 5.63.58 0 1.225-.086 1.934-.236v-4.533h1.74v5.607zm2.793-4.684v-8.314h1.74v8.314c0 2.6 1.3 3.9 3.9 3.9 2.578 0 3.9-1.3 3.9-3.9v-8.314h1.74v8.314c0 3.545-1.87 5.328-5.63 5.328s-5.63-1.783-5.63-5.328zM81.4 23.773V35.9h7.1v1.418h-8.83V23.773h1.74zm9.604 13.535h-1.826L95.9 22l6.725 15.318h-1.934l-1.74-4.254h-4.47l.473-1.418h3.416l-2.535-6.123L91 37.318zm13.492 0V23.773h5.78c2.578 0 3.867 1.074 3.867 3.244 0 1.762-1.268 3.072-3.78 3.9l4.64 6.38h-2.3l-4.297-6.08V30.1c2.578-.408 3.9-1.396 3.9-2.986 0-1.246-.7-1.87-2.148-1.87h-3.867V37.3h-1.783z"
    />
  </svg>
));
