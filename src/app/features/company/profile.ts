import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { Company, Institution } from '../../core/models';
import { DemoRepository } from '../../core/store';
import { TranslatePipe } from '../../core/preferences';
import { PageHeader, EmptyState, JobCard } from '../../shared/ui';
import { ProfileMedia } from '../../shared/profile-media';
import { safeUrl, validateLinks, validEmail } from '../../core/profile-tools';
type Organization = Company & Institution;
@Component({
  selector: 's2w-company-profile',
  imports: [
    FormsModule,
    RouterLink,
    DatePipe,
    TranslatePipe,
    PageHeader,
    EmptyState,
    JobCard,
    ProfileMedia,
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class CompanyProfile {
  s = inject(DemoRepository);
  params = toSignal(inject(ActivatedRoute).paramMap);
  editing = false;
  draft: Organization | null = null;
  error = '';
  safeUrl = safeUrl;
  get university() {
    return this.s.user()?.role === 'university';
  }
  get readonly() {
    return this.s.user()?.role === 'candidate';
  }
  get company() {
    const id = this.readonly ? this.params()?.get('id') : this.s.user()?.entityId;
    return (
      this.university
        ? this.s.state().universities.find((u) => u.id === id)
        : this.s
            .state()
            .companies.find((c) => c.id === id && (!this.readonly || c.status === 'Approved'))
    ) as Organization | undefined;
  }
  get jobs() {
    return this.s.state().jobs.filter((j) => j.companyId === this.company?.id && j.published);
  }
  get fairs() {
    return this.s
      .state()
      .fairs.filter(
        (f) => f.universityId === this.company?.id && new Date(f.date).getTime() >= Date.now(),
      );
  }
  edit() {
    this.draft = {
      ...structuredClone(this.company!),
      socialLinks: [...(this.company!.socialLinks ?? [])],
    };
    this.editing = true;
    this.error = '';
  }
  save() {
    if (!this.draft || this.readonly) return;
    try {
      const d = this.draft;
      if (!d.name.trim() || !d.location.trim()) throw Error('Name and location are required.');
      validateLinks([d.website, ...(d.socialLinks ?? [])]);
      if (!validEmail(d.contactEmail ?? '')) throw Error('Enter a valid contact email.');
      if (this.university)
        this.s.commit((state) => {
          const i = state.universities.findIndex((u) => u.id === d.id);
          state.universities[i] = d;
          const user = state.users.find((u) => u.entityId === d.id);
          if (user) user.name = d.name;
        });
      else this.s.saveCompany(d);
      this.editing = false;
      this.error = '';
    } catch (e) {
      this.error = (e as Error).message;
    }
  }
  explore() {
    document.getElementById('organization-openings')?.scrollIntoView({ behavior: 'smooth' });
    document.getElementById('organization-openings')?.focus();
  }
}
