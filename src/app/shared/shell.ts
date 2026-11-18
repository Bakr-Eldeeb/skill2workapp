import { BRAND } from '../core/brand';
import { Component, inject } from '@angular/core';
import { isActive, Router, RouterLink, RouterOutlet } from '@angular/router';
import { DemoRepository } from '../core/store';
import { Preferences, TranslatePipe } from '../core/preferences';
import { Logo } from './ui';
import { MOBILE_NAV, NAV, SECONDARY_NAV } from '../core/navigation';
@Component({
  selector: 's2w-shell',
  imports: [RouterLink, RouterOutlet, TranslatePipe, Logo],
  templateUrl: './shell.html',
  styleUrl: './shell.css',
})
export class AppShell {
  readonly brand = BRAND;
  s = inject(DemoRepository);
  p = inject(Preferences);
  r = inject(Router);
  readonly jobsDirectory = isActive('/candidate/jobs', this.r, {
    paths: 'exact',
    queryParams: 'ignored',
    fragment: 'ignored',
    matrixParams: 'ignored',
  });
  more = false;
  readonly role = this.s.user()?.role ?? 'candidate';
  get allowed() {
    const u = this.s.user();
    return (
      !!u &&
      u.role === this.role &&
      (u.role !== 'company' || this.s.company(u.entityId)?.status === 'Approved')
    );
  }
  get nav() {
    return NAV[this.role];
  }
  get secondaryNav() {
    return SECONDARY_NAV[this.role];
  }
  get mobileNav() {
    return MOBILE_NAV[this.role];
  }
  get moreNav() {
    const primary = new Set(this.mobileNav.map((n) => n.path));
    return [...this.nav, ...this.secondaryNav].filter((n) => !primary.has(n.path));
  }
  get base() {
    return '/' + this.role;
  }
  get currentLabel() {
    const segment = this.r.url.split('?')[0].split('/').filter(Boolean)[1] ?? 'dashboard';
    const canonical: Record<string, string> = {
      passport: 'skills',
      recommendations: 'talent',
      pipeline: 'applicants',
      candidates: 'talent',
    };
    return (
      [...this.nav, ...this.secondaryNav].find((n) => n.path === (canonical[segment] ?? segment))
        ?.label ?? 'Details'
    );
  }
  isActive(path: string) {
    const segment = this.r.url.split('?')[0].split('/')[2];
    const map: Record<string, string> = {
      passport: 'skills',
      results: 'skills',
      assessments: 'skills',
      recommendations: 'talent',
      candidates: 'talent',
      pipeline: 'applicants',
      registrations: 'fairs',
    };
    return (map[segment] ?? segment) === path;
  }
  focusContent(event: Event) {
    event.preventDefault();
    document.getElementById('content')?.focus();
  }
  logout() {
    this.s.logout();
    this.r.navigateByUrl('/sign-in');
  }
  unread() {
    return this.s.state().notifications.filter((n) => n.userId === this.s.user()?.id && !n.read)
      .length;
  }
}
