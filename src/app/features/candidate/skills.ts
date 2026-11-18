import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DemoRepository } from '../../core/store';
import { TranslatePipe } from '../../core/preferences';
import { PageHeader, ScoreCard, EmptyState } from '../../shared/ui';
import { key } from '../../core/matching';
@Component({
  selector: 's2w-skills',
  imports: [FormsModule, DatePipe, RouterLink, TranslatePipe, PageHeader, ScoreCard, EmptyState],
  templateUrl: './skills.html',
  styleUrl: './skills.css',
})
export class Skills {
  s = inject(DemoRepository);
  route = inject(ActivatedRoute);
  router = inject(Router);
  name = '';
  error = '';
  tab = 'skills';
  constructor() {
    this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe((p) => {
      const value = p.get('tab') ?? this.route.snapshot.data['tab'] ?? 'skills';
      this.tab = value === 'results' ? 'results' : 'skills';
    });
  }
  get c() {
    return this.s.candidate();
  }
  get assessed() {
    return this.c.skills.filter((s) => s.score !== undefined).length;
  }
  get results() {
    return this.s.state().results.filter((r) => r.candidateId === this.c.id);
  }
  latest(name: string) {
    return this.results.find((r) => key(r.skill) === key(name));
  }
  select(tab: string) {
    this.router.navigate(['/candidate/skills'], { queryParams: { tab }, replaceUrl: true });
  }
  focusAdd() {
    document.getElementById('add-skill-input')?.focus();
  }
  add() {
    this.error = '';
    try {
      this.s.addSkill(this.name);
      this.name = '';
    } catch (e) {
      this.error = (e as Error).message;
    }
  }
  remove(name: string) {
    if (confirm('Remove this skill and its visible assessment result?')) {
      try {
        this.s.removeSkill(name);
      } catch (e) {
        this.error = (e as Error).message;
      }
    }
  }
}
