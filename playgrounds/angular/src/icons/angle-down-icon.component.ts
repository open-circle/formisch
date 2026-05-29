import { Component, input } from '@angular/core';

@Component({
  selector: 'app-angle-down-icon',
  standalone: true,
  template: `
    <svg
      [attr.class]="class()"
      viewBox="0 0 36 48"
      role="img"
      aria-label="Angle down icon"
      fill="none"
      stroke="currentColor"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="4"
    >
      <path d="m4.1 17 13.92 13.96L31.78 17" />
    </svg>
  `,
})
export class AngleDownIconComponent {
  readonly class = input<string>('');
}
