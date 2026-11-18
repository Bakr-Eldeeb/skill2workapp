import { Component, Input } from '@angular/core';
import { TranslatePipe } from '../core/preferences';
@Component({
  selector: 's2w-loading',
  imports: [TranslatePipe],
  template: `<div class="loading-state" role="status" aria-live="polite">
    <p>{{ label | t }}</p>
    <div class="skeleton" aria-hidden="true"></div>
    <div class="skeleton short" aria-hidden="true"></div>
  </div>`,
})
export class LoadingState {
  @Input() label = 'Preparing simulated results…';
}
