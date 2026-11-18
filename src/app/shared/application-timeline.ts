import { Component, Input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Application, Status } from '../core/models';
import { TranslatePipe } from '../core/preferences';
@Component({
  selector: 's2w-application-timeline',
  imports: [TranslatePipe, DatePipe],
  template: `<section class="journey-panel" [attr.aria-label]="'Application journey' | t">
    <div class="row">
      <h3>{{ 'Your application journey' | t }}</h3>
      <span class="badge status-badge" [attr.data-status]="application.status">{{
        application.status | t
      }}</span>
    </div>
    <p class="muted">
      {{ 'Only recorded events are shown as reached. Other stages are possible next steps.' | t }}
    </p>
    <ol class="application-timeline">
      @for (stage of stages; track stage) {
        <li
          [class.is-current]="application.status === stage"
          [class.is-recorded]="recorded(stage)"
          [attr.aria-current]="application.status === stage ? 'step' : null"
        >
          <span class="timeline-node" aria-hidden="true">{{
            application.status === stage ? '●' : recorded(stage) ? '✓' : '○'
          }}</span>
          <div>
            <strong>{{ stage | t }}</strong>
            @if (application.status === stage) {
              <span class="timeline-caption">{{ 'Current stage' | t }}</span>
            } @else if (stage === 'Applied') {
              <span class="timeline-caption">{{ application.date | date: 'mediumDate' }}</span>
            } @else if (stage === 'Interview' && application.interview) {
              <span class="timeline-caption"
                >{{ 'Interview scheduled' | t }} ·
                {{ application.interview.date | date: 'medium' }}</span
              >
            } @else {
              <span class="timeline-caption">{{ 'Not recorded' | t }}</span>
            }
          </div>
        </li>
      }
    </ol>
  </section>`,
})
export class ApplicationTimeline {
  @Input({ required: true }) application!: Application;
  get stages(): Status[] {
    return [
      'Applied',
      'Shortlisted',
      'Interview',
      'Offer',
      this.application.status === 'Rejected' ? 'Rejected' : 'Hired',
    ];
  }
  recorded(stage: Status) {
    return (
      stage === 'Applied' ||
      stage === this.application.status ||
      (stage === 'Interview' && !!this.application.interview)
    );
  }
}
