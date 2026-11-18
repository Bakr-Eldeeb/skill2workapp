import { Injectable, effect, inject, signal } from '@angular/core';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { DemoRepository } from './store';
import { Role } from './models';

import { parentRoute } from './navigation-rules';
/** Only role-scoped application URLs are eligible; never browser history to an auth/external page. */
@Injectable({ providedIn: 'root' })
export class NavigationHistory {
  private router = inject(Router);
  private store = inject(DemoRepository);
  readonly current = signal(this.router.url);
  private entries: string[] = [];
  private popstate = false;
  private returning = false;
  private replacing = false;
  constructor() {
    effect(() => {
      this.store.session();
      this.entries = [];
    });
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.popstate = event.navigationTrigger === 'popstate';
        this.replacing = !!this.router.getCurrentNavigation()?.extras.replaceUrl;
      }
      if (event instanceof NavigationEnd) {
        const url = event.urlAfterRedirects;
        this.current.set(url);
        if (!this.returning) {
          const index = this.entries.lastIndexOf(url);
          if (this.replacing && !this.popstate && this.entries.length)
            this.entries[this.entries.length - 1] = url;
          else if (this.popstate && index >= 0) this.entries.splice(index + 1);
          else if (this.entries.at(-1) !== url) this.entries.push(url);
        }
      }
    });
  }
  get role(): Role | undefined {
    return this.store.user()?.role;
  }
  get visible() {
    const role = this.role;
    if (!role || !this.current().startsWith('/' + role + '/')) return false;
    return !['/' + role + '/dashboard', '/admin/companies'].includes(this.current().split('?')[0]);
  }
  async back() {
    const role = this.role;
    if (!role) return;
    const current = this.router.url;
    const previous = this.entries
      .slice(0, -1)
      .reverse()
      .find((url) => url !== current && url.startsWith('/' + role + '/'));
    const target = previous ?? parentRoute(current, role);
    this.returning = true;
    try {
      const ok = await this.router.navigateByUrl(target);
      if (ok) {
        const index = this.entries.lastIndexOf(target);
        this.entries = index >= 0 ? this.entries.slice(0, index + 1) : [target];
      }
    } finally {
      this.returning = false;
    }
  }
}
