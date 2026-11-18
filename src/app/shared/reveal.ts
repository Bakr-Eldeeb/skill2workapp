import { Directive, ElementRef, AfterViewInit, OnDestroy, inject } from '@angular/core';
/** Progressive enhancement: no observer or reduced motion leaves content visible. */
@Directive({ selector: '[s2wReveal]' })
export class Reveal implements AfterViewInit, OnDestroy {
  el = inject(ElementRef<HTMLElement>);
  observer?: IntersectionObserver;
  ngAfterViewInit() {
    if (
      typeof IntersectionObserver === 'undefined' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    )
      return;
    this.el.nativeElement.classList.add('reveal-ready');
    this.observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          this.el.nativeElement.classList.add('revealed');
          this.observer?.disconnect();
        }
      },
      { threshold: 0.08 },
    );
    this.observer.observe(this.el.nativeElement);
  }
  ngOnDestroy() {
    this.observer?.disconnect();
  }
}
