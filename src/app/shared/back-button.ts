import { Component, inject } from '@angular/core';
import { NavigationHistory } from '../core/navigation-history';
import { TranslatePipe } from '../core/preferences';
@Component({
  selector: 's2w-back',
  imports: [TranslatePipe],
  template: `@if (navigation.visible) {
    <button
      class="back-button"
      type="button"
      (click)="navigation.back()"
      [attr.aria-label]="'Back' | t"
    >
      <svg class="back-arrow" aria-hidden="true" viewBox="0 0 20 20" width="16" height="16">
        <path
          d="m11.5 4-6 6 6 6M6 10h11"
          fill="none"
          stroke="currentColor"
          stroke-width="1.6"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
      <span>{{ 'Back' | t }}</span>
    </button>
  }`,
})
export class BackButton {
  navigation = inject(NavigationHistory);
}
