import { BackButton } from './back-button';
import { BRAND } from '../core/brand';
import { Component, Input, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslatePipe, Preferences } from '../core/preferences';
import { Candidate, Job } from '../core/models';
import { requiredCoverage } from '../core/matching';
import { DemoRepository } from '../core/store';
@Component({
  selector: 's2w-logo',
  template: `<img
    class="brand-logo"
    [src]="'assets/skill2work-logo-' + (p.dark() ? 'dark' : 'light') + '.svg'"
    [alt]="brand.name"
  />`,
})
export class Logo {
  readonly brand = BRAND;
  p = inject(Preferences);
}
@Component({
  selector: 's2w-header',
  imports: [TranslatePipe, BackButton],
  template: `<s2w-back />
    <div class="page-heading">
      <div>
        <p class="eyebrow">{{ eyebrow | t }}</p>
        <h1>{{ title | t }}</h1>
        <p class="muted">{{ subtitle | t }}</p>
      </div>
      <ng-content />
    </div>`,
})
export class PageHeader {
  @Input() title = '';
  @Input() eyebrow: string = BRAND.name;
  @Input() subtitle = '';
}
@Component({
  selector: 's2w-empty',
  imports: [TranslatePipe],
  template: `<section class="empty smart-empty">
    <svg
      class="empty-illustration"
      aria-hidden="true"
      width="104"
      height="77"
      viewBox="0 0 104 77"
      fill="none"
    >
      <ellipse cx="52" cy="64" rx="38" ry="6" fill="currentColor" opacity=".05" />
      <rect x="29" y="17" width="46" height="43" rx="12" fill="currentColor" opacity=".08" />
      <path
        d="M42 41c2-11 14-14 22-11-1 10-10 14-20 13m0 11V42m0 0-10-8"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
      />
      <circle cx="78" cy="15" r="5" fill="var(--coral)" />
      <circle cx="22" cy="43" r="3" fill="var(--mint)" opacity=".65" />
    </svg>
    <h3>{{ text | t }}</h3>
    @if (description) {
      <p>{{ description | t }}</p>
    }
    <div class="empty-action"><ng-content /></div>
  </section>`,
})
export class EmptyState {
  @Input() text = 'No matching results.';
  @Input() description = '';
}
@Component({
  selector: 's2w-score',
  imports: [TranslatePipe, DecimalPipe],
  template: `<div class="score" [class.unassessed]="value === null">
      <strong>{{ value === null ? '—' : (value | number: '1.0-1') }}</strong>
      @if (value !== null) {
        <small>/100</small>
      }
    </div>
    <span class="muted">{{ (value === null ? 'Not Assessed Yet' : label) | t }} </span>
    @if (coverage) {
      <small class="coverage-note"
        >{{ coverage.assessed }} {{ 'of' | t }} {{ coverage.total }}
        {{ 'Must-Haves assessed' | t }}</small
      >
    }
    @if (value !== null && label === 'Required Skill Evidence Score') {
      <div class="match-track" aria-hidden="true"><i [style.width.%]="value"></i></div>
    }`,
})
export class ScoreCard {
  @Input() value: number | null = null;
  @Input() label = 'Required Skill Evidence Score';
  @Input() coverage?: { assessed: number; total: number };
}
@Component({
  selector: 's2w-job-card',
  imports: [RouterLink, TranslatePipe, ScoreCard],
  templateUrl: './job-card.html',
})
export class JobCard {
  coverage = requiredCoverage;
  @Input({ required: true }) job!: Job;
  @Input() candidate?: Candidate;
  @Input() fairId?: string;
  s = inject(DemoRepository);
}
