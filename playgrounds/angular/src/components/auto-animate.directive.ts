import {
  afterNextRender,
  Directive,
  ElementRef,
  inject,
  input,
} from '@angular/core';
import autoAnimate, { type AutoAnimateOptions } from '@formkit/auto-animate';

/**
 * Directive that enables auto-animate on the host element.
 */
@Directive({
  selector: '[auto-animate]',
  standalone: true,
})
export class AutoAnimateDirective {
  readonly options = input<Partial<AutoAnimateOptions>>();

  constructor() {
    const el = inject<ElementRef<HTMLElement>>(ElementRef);
    afterNextRender(() => {
      autoAnimate(el.nativeElement, this.options() ?? {});
    });
  }
}
