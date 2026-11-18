import { toSignal } from '@angular/core/rxjs-interop';
import { ExperienceStateStore } from '../../core/experience-state';
import { MatchExplanation } from '../../shared/match-explanation';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DemoRepository } from '../../core/store';
import { TranslatePipe } from '../../core/preferences';
import { EmptyState, PageHeader, JobCard, ScoreCard } from '../../shared/ui';
import { evidence, key } from '../../core/matching';
@Component({
  selector: 's2w-jobs',
  imports: [
    FormsModule,
    RouterLink,
    TranslatePipe,
    EmptyState,
    PageHeader,
    JobCard,
    ScoreCard,
    MatchExplanation,
  ],
  templateUrl: './jobs.html',
  styleUrl: './jobs.css',
})
export class CandidateJobs {
  s = inject(DemoRepository);
  experience = inject(ExperienceStateStore);
  constructor() {
    if (!this.id) this.experience.explore(this.s.user()!.id);
  }
  route = inject(ActivatedRoute);
  params = toSignal(this.route.paramMap);
  search = '';
  location = '';
  mode = '';
  type = '';
  skill = '';
  letter = '';
  error = '';
  success = false;
  get c() {
    return this.s.candidate();
  }
  get id() {
    return this.params()?.get('id') ?? null;
  }
  get job() {
    return this.id ? this.s.job(this.id) : undefined;
  }
  get applying() {
    return !!this.route.snapshot.data['apply'];
  }
  get fairId() {
    return this.route.snapshot.queryParamMap.get('fair') ?? undefined;
  }
  get applied() {
    return this.s
      .state()
      .applications.some((a) => a.jobId === this.id && a.candidateId === this.c.id);
  }
  get locations() {
    return [
      ...new Set(
        this.s
          .state()
          .jobs.filter((j) => j.published)
          .map((j) => j.location),
      ),
    ];
  }
  get allSkills() {
    return [...new Set(this.s.state().jobs.flatMap((j) => j.skills.map((s) => s.name)))];
  }
  get hasFilters() {
    return !!(this.search || this.location || this.mode || this.type || this.skill);
  }
  get jobs() {
    return this.s
      .state()
      .jobs.filter(
        (j) =>
          j.published &&
          key(j.title + ' ' + this.s.company(j.companyId).name).includes(key(this.search)) &&
          (!this.location || j.location === this.location) &&
          (!this.mode || j.mode === this.mode) &&
          (!this.type || j.type === this.type) &&
          (!this.skill || j.skills.some((s) => s.name === this.skill)),
      )
      .sort((a, b) => (this.s.score(this.c, b) ?? -1) - (this.s.score(this.c, a) ?? -1));
  }
  skillState(name: string) {
    const s = evidence(this.c, name);
    return s?.score !== undefined ? 'Verified · Demo' : s ? 'Claimed' : 'Missing';
  }
  skillScore(name: string) {
    return evidence(this.c, name)?.score;
  }
  apply() {
    try {
      this.s.apply(this.id!, this.letter, this.fairId);
      this.success = true;
      this.error = '';
    } catch (e) {
      this.error = (e as Error).message;
    }
  }
  reset() {
    this.search = this.location = this.mode = this.type = this.skill = '';
  }
}
