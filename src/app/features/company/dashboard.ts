import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DemoRepository } from '../../core/store';
import { TranslatePipe } from '../../core/preferences';
import { PageHeader } from '../../shared/ui';
@Component({
  selector: 's2w-company-dashboard',
  imports: [RouterLink, TranslatePipe, PageHeader],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class CompanyDashboard {
  s = inject(DemoRepository);
  get company() {
    return this.s.company(this.s.user()!.entityId);
  }
  get jobs() {
    return this.s.state().jobs.filter((j) => j.companyId === this.company.id);
  }
  get published() {
    return this.jobs.filter((j) => j.published);
  }
  get applications() {
    return this.s.state().applications.filter((a) => this.jobs.some((j) => j.id === a.jobId));
  }
  get interviews() {
    return this.applications.filter(
      (a) => a.interview && new Date(a.interview.date).getTime() > Date.now(),
    );
  }
}
