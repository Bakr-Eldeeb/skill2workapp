import { Injectable, Pipe, PipeTransform, inject, signal } from '@angular/core';
import { AR as LEGACY_AR } from './translations';
import { V4_AR } from './translations-v4';
const AR = { ...LEGACY_AR, ...V4_AR };
@Injectable({ providedIn: 'root' })
export class Preferences {
  readonly language = signal(localStorage.getItem('s2w.language') === 'ar' ? 'ar' : 'en');
  readonly dark = signal(localStorage.getItem('s2w.theme') === 'dark');
  constructor() {
    this.apply();
  }
  toggleLanguage() {
    this.language.update((x) => (x === 'en' ? 'ar' : 'en'));
    this.apply();
  }
  toggleTheme() {
    this.dark.update((x) => !x);
    this.apply();
  }
  apply() {
    document.documentElement.lang = this.language();
    document.documentElement.dir = this.language() === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.dataset['theme'] = this.dark() ? 'dark' : 'light';
    localStorage.setItem('s2w.language', this.language());
    localStorage.setItem('s2w.theme', this.dark() ? 'dark' : 'light');
  }
  text(s: string) {
    if (this.language() !== 'ar') return s;
    if (AR[s]) return AR[s];
    const prefix = Object.keys(AR).find((k) => k.endsWith(': ') && s.startsWith(k));
    if (prefix)
      return (
        AR[prefix] +
        s
          .slice(prefix.length)
          .split(' · ')
          .map((part) => AR[part] ?? part)
          .join(' · ')
      );
    return s
      .split(/(?<=\.)\s+/)
      .map((part) => AR[part] ?? part)
      .join(' ');
  }
}
@Pipe({ name: 't', pure: false })
export class TranslatePipe implements PipeTransform {
  p = inject(Preferences);
  transform(s: string | null | undefined) {
    return s ? this.p.text(s) : '';
  }
}
