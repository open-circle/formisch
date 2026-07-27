import { component$, type PropsOf } from '@qwik.dev/core';

export const AngularIcon = component$<PropsOf<'svg'>>((props) => (
  <svg viewBox="0 0 48 48" role="img" aria-label="Angular icon" {...props}>
    <mask
      id="a3uw"
      width="43"
      height="45"
      x="3"
      y="2"
      maskUnits="userSpaceOnUse"
      style="mask-type:luminance"
    >
      <path fill="#fff" d="M3 2h42.52v45H3z" />
    </mask>
    <g mask="url(#a3uw)">
      <path
        fill="url(#b7q1)"
        d="m45.35 9.47-1.53 24.01L29.2 2zM35.22 40.52l-11.05 6.3-11.04-6.3 2.24-5.44h17.6zM24.17 13.95l5.8 14.07H18.37zM4.51 33.48 3 9.48 19.15 2z"
      />
      <path
        fill="url(#cj7s)"
        d="m45.35 9.47-1.53 24.01L29.2 2zM35.22 40.52l-11.05 6.3-11.04-6.3 2.24-5.44h17.6zM24.17 13.95l5.8 14.07H18.37zM4.51 33.48 3 9.48 19.15 2z"
      />
    </g>
    <defs>
      <linearGradient
        id="b7q1"
        x1="12.34"
        x2="46.06"
        y1="42.76"
        y2="26.74"
        gradientUnits="userSpaceOnUse"
      >
        <stop stop-color="#e40035" />
        <stop offset=".24" stop-color="#f60a48" />
        <stop offset=".35" stop-color="#f20755" />
        <stop offset=".49" stop-color="#dc087d" />
        <stop offset=".74" stop-color="#9717e7" />
        <stop offset="1" stop-color="#6c00f5" />
      </linearGradient>
      <linearGradient
        id="cj7s"
        x1="10.82"
        x2="32.89"
        y1="7.4"
        y2="32.57"
        gradientUnits="userSpaceOnUse"
      >
        <stop stop-color="#ff31d9" />
        <stop offset="1" stop-color="#ff5be1" stop-opacity="0" />
      </linearGradient>
    </defs>
  </svg>
));
