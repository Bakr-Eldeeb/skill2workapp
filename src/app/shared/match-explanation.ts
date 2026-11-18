import { Component, Input } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Candidate, Job, JobSkill } from '../core/models';
import { evidence, eligible, match, requiredCoverage } from '../core/matching';
import { TranslatePipe } from '../core/preferences';
import { ScoreCard } from './ui';
@Component({
  selector: 's2w-match-explanation',
  imports: [DecimalPipe, TranslatePipe, ScoreCard],
  templateUrl: './match-explanation.html',
})
export class MatchExplanation {
  @Input({ required: true }) candidate!: Candidate;
  @Input({ required: true }) job!: Job;
  coverage() {
    return requiredCoverage(this.candidate, this.job);
  }
  requirements(must: boolean) {
    return this.job.skills.filter((r) => r.must === must);
  }
  eligibilityText() {
    if (this.eligible()) return 'All required thresholds met.';
    const below = this.requirements(true).some(
      (r) => this.evidence(r)?.score !== undefined && this.evidence(r)!.score! < (r.minimum ?? 0),
    );
    return below
      ? 'Some assessed skills are below the employer minimum.'
      : 'Some Must-Have skills are unassessed or missing.';
  }
  score() {
    return match(this.candidate, this.job);
  }
  eligible() {
    return eligible(this.candidate, this.job);
  }
  evidence(r: JobSkill) {
    return evidence(this.candidate, r.name);
  }
  state(r: JobSkill) {
    const s = this.evidence(r);
    return s?.score !== undefined
      ? r.must && s.score < (r.minimum ?? 0)
        ? 'Below minimum'
        : 'Assessed'
      : s
        ? 'Claimed, not assessed'
        : 'Missing from profile';
  }
  points(r: JobSkill) {
    return (this.evidence(r)?.score ?? 0) / (this.coverage().total || 1);
  }
}
