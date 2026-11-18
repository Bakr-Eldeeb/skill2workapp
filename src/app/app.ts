import { BRAND } from './core/brand';
import { Component, inject, effect } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { DemoRepository } from './core/store';
import { TranslatePipe, Preferences } from './core/preferences';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TranslatePipe],
  template: `<router-outlet />
    @if (s.toast()) {
      <div class="toast" role="status">{{ s.toast() | t }}</div>
    }`,
})
export class App {
  s = inject(DemoRepository);
  p = inject(Preferences);
  router = inject(Router);
  constructor() {
    document.title = `${BRAND.name} | ${BRAND.tagline}`;
    effect(() => {
      const u = this.s.user();
      const path = this.router.url.split('/')[1];
      if (['candidate', 'company', 'university', 'admin'].includes(path)) {
        if (!u) this.router.navigateByUrl('/sign-in');
        else if (u.role !== path)
          this.router.navigateByUrl(
            '/' + u.role + (u.role === 'admin' ? '/companies' : '/dashboard'),
          );
        else if (u.role === 'company' && this.s.company(u.entityId)?.status !== 'Approved')
          this.router.navigateByUrl('/account-status');
      }
    });
  }
}
