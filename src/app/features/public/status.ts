import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DemoRepository } from '../../core/store';
import { TranslatePipe } from '../../core/preferences';
import { Logo } from '../../shared/ui';
@Component({
  selector: 's2w-status',
  imports: [TranslatePipe, Logo, RouterLink],
  template: `<main class="status">
    <div class="card">
      <s2w-logo />
      <h1 class="spaced">
        {{ (company()?.status === 'Rejected' ? 'Account rejected' : 'Pending Admin Approval') | t }}
      </h1>
      <p>
        {{
          company()?.reason ||
            'A System Admin must approve this company before recruitment features become available.'
            | t
        }}
      </p>
      @if (company()?.status === 'Approved') {
        <a class="primary" routerLink="/company/dashboard">{{ 'Continue' | t }}</a>
      }
      <a class="secondary" routerLink="/">← {{ 'Back to home' | t }}</a>
      <button class="secondary" (click)="logout()">{{ 'Sign out' | t }}</button>
    </div>
  </main>`,
  styles: [
    `
      .status {
        min-height: 100vh;
        display: grid;
        place-items: center;
        padding: 25px;
      }
      .card {
        max-width: 550px;
      }
      .secondary {
        margin-inline-start: 12px;
      }
    `,
  ],
})
export class AccountStatus {
  s = inject(DemoRepository);
  r = inject(Router);
  company() {
    return this.s.state().companies.find((c) => c.id === this.s.user()?.entityId);
  }
  logout() {
    this.s.logout();
    this.r.navigateByUrl('/sign-in');
  }
}
@Component({
  selector: 's2w-not-found',
  imports: [RouterLink, TranslatePipe],
  template: `<main class="empty">
    <h1>404 · {{ 'Page not found' | t }}</h1>
    <a class="primary" routerLink="/">{{ 'Return home' | t }}</a>
  </main>`,
})
export class NotFound {}
