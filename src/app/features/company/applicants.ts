import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DemoRepository } from '../../core/store';
import { TranslatePipe } from '../../core/preferences';
import { Status } from '../../core/models';
import { PageHeader, EmptyState } from '../../shared/ui';
@Component({
  selector: 's2w-applicants',
  imports: [FormsModule, DatePipe, RouterLink, TranslatePipe, PageHeader, EmptyState],
  templateUrl: './applicants.html',
  styleUrl: './applicants.css',
})
export class Applicants {
  s = inject(DemoRepository);
  route = inject(ActivatedRoute);
  pipeline = !!this.route.snapshot.data['pipeline'];
  jobFilter = this.route.snapshot.queryParamMap.get('job') ?? '';
  statusFilter = '';
  dates: Record<string, string> = {};
  statuses: Record<string, Status> = {};
  errors: Record<string, string> = {};
  statusOptions: Status[] = ['Applied', 'Shortlisted', 'Interview', 'Offer', 'Hired', 'Rejected'];
  get jobs() {
    return this.s.state().jobs.filter((j) => j.companyId === this.s.user()?.entityId);
  }
  get applications() {
    return this.s
      .state()
      .applications.filter(
        (a) =>
          this.jobs.some((j) => j.id === a.jobId) &&
          (!this.jobFilter || a.jobId === this.jobFilter) &&
          (!this.statusFilter || a.status === this.statusFilter),
      );
  }
  schedule(id: string) {
    try {
      this.s.schedule(id, this.dates[id]);
      this.errors[id] = '';
    } catch (e) {
      this.errors[id] = (e as Error).message;
    }
  }
}
