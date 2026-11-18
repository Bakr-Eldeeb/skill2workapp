import { Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { DemoRepository } from '../../core/store';
import { TranslatePipe } from '../../core/preferences';
import { PageHeader, ScoreCard, EmptyState } from '../../shared/ui';
import { Job } from '../../core/models';
import { key } from '../../core/matching';
@Component({
  selector: 's2w-talent',
  imports: [FormsModule, RouterLink, TranslatePipe, PageHeader, ScoreCard, EmptyState],
  templateUrl: './talent.html',
  styleUrl: './talent.css',
})
export class Talent {
  s = inject(DemoRepository);
  route = inject(ActivatedRoute);
  router = inject(Router);
  recommended =
    !!this.route.snapshot.data['recommended'] ||
    this.route.snapshot.queryParamMap.get('view') === 'recommended';
  selectedJob = this.route.snapshot.queryParamMap.get('job') ?? '';
  search = '';
  skill = '';
  track = '';
  location = '';
  filter = '';
  constructor() {
    this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      this.recommended =
        !!this.route.snapshot.data['recommended'] || params.get('view') === 'recommended';
      const job = params.get('job');
      if (job) this.selectedJob = job;
    });
  }
  setView(recommended: boolean) {
    this.recommended = recommended;
    this.router.navigate(['/company/talent'], {
      queryParams: {
        view: recommended ? 'recommended' : null,
        job: recommended ? this.selectedJob || this.job?.id : null,
      },
      replaceUrl: true,
    });
  }
  resetFilters() {
    this.search = this.skill = this.track = this.location = this.filter = '';
  }
  get jobs() {
    return this.s
      .state()
      .jobs.filter((j) => j.companyId === this.s.user()?.entityId && j.published);
  }
  get job(): Job | undefined {
    return this.jobs.find((j) => j.id === this.selectedJob) ?? this.jobs[0];
  }
  get detail() {
    const id = this.route.snapshot.paramMap.get('id');
    return id ? this.s.state().candidates.find((c) => c.id === id) : undefined;
  }
  get candidates() {
    const list = this.recommended
      ? this.job
        ? this.s.recommendations(this.job)
        : []
      : this.s.state().candidates;
    return list.filter(
      (c) =>
        key(c.name).includes(key(this.search)) &&
        (!this.track || c.track === this.track) &&
        (!this.location || key(c.location).includes(key(this.location))) &&
        (!this.skill || c.skills.some((s) => key(s.name).includes(key(this.skill)))) &&
        (!this.filter ||
          c.skills.some((s) =>
            this.filter === 'assessed' ? s.score !== undefined : s.score === undefined,
          )),
    );
  }
}
