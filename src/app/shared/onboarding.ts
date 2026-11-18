import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DemoRepository } from '../core/store';
import { ExperienceStateStore, profileCompletion } from '../core/experience-state';
import { TranslatePipe } from '../core/preferences';
@Component({
  selector: 's2w-onboarding',
  imports: [RouterLink, TranslatePipe],
  template: `@if (!e.forUser(userId).dismissed) {
      <section class="onboarding-panel" aria-labelledby="getting-started">
        <div class="row">
          <div>
            <p class="eyebrow">{{ 'A little direction' | t }}</p>
            <h2 id="getting-started">{{ 'Make yourself at home' | t }}</h2>
          </div>
          <button
            class="quiet"
            (click)="e.dismiss(userId)"
            [attr.aria-label]="'Dismiss getting started' | t"
          >
            ×
          </button>
        </div>
        <p class="muted">{{ 'A few small steps. Take them in your own order.' | t }}</p>
        <ul class="checklist">
          @for (step of steps; track step.path) {
            <li [class.is-done]="step.done">
              <span class="step-check" aria-hidden="true">{{ step.done ? '✓' : '○' }}</span><a
                [routerLink]="step.path"
                >{{ step.label | t }}
                @if (step.optional) {
                  <small>{{ 'Optional' | t }}</small>
                }</a
              ><span class="sr-only">{{ (step.done ? 'Completed' : 'Not completed') | t }}</span>
            </li>
          }
        </ul>
        <p class="form-help">
          {{ 'Assessment is optional. You can browse and apply at any time.' | t }}
        </p>
        @if (e.error()) {
          <p class="muted" role="status">{{ e.error() | t }}</p>
        }
      </section>
    } @else {
      <button class="quiet checklist-restore" (click)="e.restore(userId)">
        {{ 'Show getting started' | t }} ↗
      </button>
    }`,
})
export class OnboardingChecklist {
  s = inject(DemoRepository);
  e = inject(ExperienceStateStore);
  get userId() {
    return this.s.user()!.id;
  }
  get steps() {
    const c = this.s.candidate();
    return [
      {
        path: '/candidate/profile',
        label: 'Complete your profile',
        done: profileCompletion(c) === 100,
        optional: false,
      },
      {
        path: '/candidate/skills',
        label: 'Add your skills',
        done: c.skills.length > 0,
        optional: false,
      },
      {
        path: '/candidate/jobs',
        label: 'Explore jobs',
        done: this.e.forUser(this.userId).exploredJobs,
        optional: false,
      },
      {
        path: '/candidate/assessments',
        label: 'Optionally verify skills',
        done: c.skills.some((s) => s.score !== undefined),
        optional: true,
      },
    ];
  }
}
