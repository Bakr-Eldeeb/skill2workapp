import { toSignal } from '@angular/core/rxjs-interop';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe, NgTemplateOutlet } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DemoRepository } from '../../core/store';
import { TranslatePipe } from '../../core/preferences';
import { PageHeader, EmptyState } from '../../shared/ui';
import { ApplicationTimeline } from '../../shared/application-timeline';
@Component({
  selector: 's2w-applications',
  imports: [
    FormsModule,
    DatePipe,
    NgTemplateOutlet,
    RouterLink,
    TranslatePipe,
    PageHeader,
    EmptyState,
    ApplicationTimeline,
  ],
  templateUrl: './applications.html',
  styleUrl: './applications.css',
})
export class CandidateApplications {
  s = inject(DemoRepository);
  route = inject(ActivatedRoute);
  params = toSignal(this.route.paramMap);
  notes: Record<string, string> = {};
  get applications() {
    return this.s
      .state()
      .applications.filter((a) => a.candidateId === this.s.user()?.entityId)
      .sort((a, b) => b.date.localeCompare(a.date));
  }
  get id() {
    return this.params()?.get('id') ?? null;
  }
  get selected() {
    return this.applications.find((a) => a.id === this.id);
  }
  respond(id: string, response: 'Accepted' | 'Declined' | 'Reschedule requested') {
    this.s.respond(id, response, this.notes[id] ?? '');
  }
}
