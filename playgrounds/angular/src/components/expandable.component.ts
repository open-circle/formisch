import {
  afterRenderEffect,
  Component,
  computed,
  ElementRef,
  HostListener,
  input,
  viewChild,
} from '@angular/core';
import clsx from 'clsx';

/**
 * Wrapper component to vertically expand or collapse content.
 */
@Component({
  selector: 'app-expandable',
  standalone: true,
  template: `
    <div
      #el
      [class]="classes()"
      [attr.aria-hidden]="!expanded()"
    >
      <ng-content />
    </div>
  `,
})
export class ExpandableComponent {
  readonly expanded = input.required<boolean>();

  private readonly el = viewChild<ElementRef<HTMLDivElement>>('el');

  protected readonly classes = computed(() =>
    clsx(
      'm-0! h-0 origin-top overflow-hidden duration-200',
      !this.expanded() && 'invisible -translate-y-2 scale-y-75 opacity-0'
    )
  );

  constructor() {
    afterRenderEffect(() => {
      this.updateHeight(this.expanded());
    });
  }

  @HostListener('window:resize')
  onResize(): void {
    this.updateHeight(this.expanded());
  }

  private updateHeight(expanded: boolean): void {
    const el = this.el()?.nativeElement;
    if (!el) return;
    el.style.height = expanded ? `${el.scrollHeight}px` : '0';
  }
}
