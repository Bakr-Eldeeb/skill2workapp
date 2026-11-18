import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { DemoRepository } from '../../core/store';
import { TranslatePipe } from '../../core/preferences';
import { JobCard, PageHeader, EmptyState } from '../../shared/ui';
import { OnboardingChecklist } from '../../shared/onboarding';
import { ExperienceStateStore, profileCompletion } from '../../core/experience-state';
@Component({
  selector: 's2w-candidate-dashboard',
  imports: [
    RouterLink,
    DatePipe,
    TranslatePipe,
    JobCard,
    PageHeader,
    EmptyState,
    OnboardingChecklist,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class CandidateDashboard {
  s = inject(DemoRepository);
  experience = inject(ExperienceStateStore);
  get c() {
    return this.s.candidate();
  }
  get assessed() {
    return this.c.skills.filter((s) => s.score !== undefined).length;
  }
  get completion() {
    return profileCompletion(this.c);
  }
  get jobs() {
    return this.s
      .state()
      .jobs.filter((j) => j.published)
      .sort((a, b) => (this.s.score(this.c, b) ?? -1) - (this.s.score(this.c, a) ?? -1))
      .slice(0, 3);
  }
  get applications() {
    return this.s
      .state()
      .applications.filter((a) => a.candidateId === this.c.id)
      .sort((a, b) => b.date.localeCompare(a.date));
  }
  get fair() {
    return this.s
      .state()
      .fairs.filter(
        (f) => f.universityId === this.c.universityId && new Date(f.date).getTime() >= Date.now(),
      )
      .sort((a, b) => a.date.localeCompare(b.date))[0];
  }
  get next() {
    if (this.completion < 100)
      return {
        path: '/candidate/profile',
        label: 'Complete your profile',
        copy: 'Give a team a better picture of you.',
      };
    if (!this.c.skills.length)
      return {
        path: '/candidate/skills',
        label: 'Add your skills',
        copy: 'Start with what you know and what you enjoy building.',
      };
    if (this.assessed === 0 && this.experience.forUser(this.s.user()!.id).exploredJobs)
      return {
        path: '/candidate/assessments',
        label: 'Verify your skills',
        copy: 'Add evaluated evidence when you feel ready. Applying stays open.',
      };
    return {
      path: '/candidate/jobs',
      label: 'Explore jobs',
      copy: 'Find a role that gives your skills somewhere to grow.',
    };
  }
}
