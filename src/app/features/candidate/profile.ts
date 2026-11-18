import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { Candidate, CareerEntry, PortfolioProject } from '../../core/models';
import { DemoRepository } from '../../core/store';
import { safeUrl, validateLinks, validEmail } from '../../core/profile-tools';
import { TranslatePipe } from '../../core/preferences';
import { PageHeader, EmptyState, ScoreCard } from '../../shared/ui';
import { ProfileMedia } from '../../shared/profile-media';
@Component({
  selector: 's2w-profile',
  imports: [
    FormsModule,
    RouterLink,
    TranslatePipe,
    DatePipe,
    PageHeader,
    EmptyState,
    ScoreCard,
    ProfileMedia,
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class CandidateProfile {
  s = inject(DemoRepository);
  params = toSignal(inject(ActivatedRoute).paramMap);
  editing = false;
  draft: Candidate | null = null;
  error = '';
  safeUrl = safeUrl;
  get readonly() {
    return this.s.user()?.role !== 'candidate';
  }
  get c() {
    return this.s.candidate(
      this.readonly ? (this.params()?.get('id') ?? '') : this.s.user()?.entityId,
    );
  }
  edit() {
    this.draft = {
      ...structuredClone(this.c),
      portfolio: structuredClone(this.c.portfolio ?? []),
      educationEntries: structuredClone(this.c.educationEntries ?? []),
      experienceEntries: structuredClone(this.c.experienceEntries ?? []),
    };
    this.editing = true;
    this.error = '';
  }
  entry(list: CareerEntry[]) {
    list.push({
      id: crypto.randomUUID(),
      title: '',
      organization: '',
      start: '',
      end: '',
      description: '',
    });
  }
  addProject() {
    this.draft!.portfolio!.push({
      id: crypto.randomUUID(),
      title: '',
      description: '',
      skills: '',
      team: 'Solo',
    });
  }
  media(field: 'photo' | 'cover', ref: string) {
    if (this.draft) this.draft[field] = ref;
  }
  save() {
    if (this.readonly || !this.draft) return;
    try {
      const c = this.draft;
      if (
        !c.name.trim() ||
        !c.location.trim() ||
        !this.s.state().universities.some((u) => u.id === c.universityId)
      )
        throw Error('Complete all required fields.');
      if (!validEmail(c.contactEmail ?? '') || (c.phone && !/^[+\d ()-]{6,24}$/.test(c.phone)))
        throw Error('Enter a valid contact email and phone.');
      validateLinks([
        c.github,
        c.website,
        ...(c.portfolio ?? []).flatMap((p) => [p.github, p.website, p.caseStudy, p.video]),
      ]);
      if (c.portfolio?.some((p) => !p.title.trim() || !p.description.trim()))
        throw Error('Each project needs a title and description.');
      if (
        [...(c.educationEntries ?? []), ...(c.experienceEntries ?? [])].some(
          (e) => !e.title.trim() || !e.organization.trim() || (e.start && e.end && e.start > e.end),
        )
      )
        throw Error('Entries need a title, organization and valid date range.');
      this.s.saveCandidate(c);
      this.editing = false;
      this.error = '';
    } catch (e) {
      this.error = (e as Error).message;
    }
  }
}
