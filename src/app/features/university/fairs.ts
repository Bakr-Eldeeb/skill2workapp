import { FairTickets } from '../../shared/fair-tickets';
import { toSignal } from '@angular/core/rxjs-interop';
import { Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DemoRepository } from '../../core/store';
import { TranslatePipe } from '../../core/preferences';
import { Fair } from '../../core/models';
import { PageHeader, EmptyState, JobCard } from '../../shared/ui';
@Component({
  selector: 's2w-fairs',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    DatePipe,
    RouterLink,
    TranslatePipe,
    PageHeader,
    EmptyState,
    JobCard,
    FairTickets,
  ],
  templateUrl: './fairs.html',
  styleUrl: './fairs.css',
})
export class Fairs {
  s = inject(DemoRepository);
  route = inject(ActivatedRoute);
  params = toSignal(this.route.paramMap);
  router = inject(Router);
  fb = inject(FormBuilder);
  role = this.s.user()!.role;
  editing = !!this.route.snapshot.data['editor'];
  studentIds: Record<string, string> = {};
  selected: Record<string, boolean> = {};
  error = '';
  query = toSignal(this.route.queryParamMap);
  get tab() {
    const value = this.query()?.get('tab') ?? 'overview';
    return this.detailTabs.includes(value) ? value : 'overview';
  }
  readonly tabs = ['overview', 'companies', 'registrations', 'jobs'];
  get fairRegistrations() {
    return this.s.state().registrations.filter((r) => r.fairId === this.id);
  }
  setTab(tab: string) {
    if (!this.detailTabs.includes(tab)) return;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab: tab === 'overview' ? null : tab },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }
  universityName(id: string) {
    return this.s.state().universities.find((u) => u.id === id)?.name ?? '';
  }
  get detailTabs() {
    return this.role === 'university' ? this.tabs : ['overview', 'companies', 'jobs'];
  }
  get id() {
    return this.params()?.get('id') ?? null;
  }
  get fairs() {
    return this.s
      .state()
      .fairs.filter(
        (f) =>
          this.role === 'company' ||
          f.universityId ===
            (this.role === 'candidate' ? this.s.candidate().universityId : this.s.user()?.entityId),
      );
  }
  get fair() {
    return this.fairs.find((f) => f.id === this.id);
  }
  get ownJobs() {
    return this.s
      .state()
      .jobs.filter((j) => j.companyId === this.s.user()?.entityId && j.published);
  }
  get base() {
    return '/' + this.role + '/fairs';
  }
  form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    date: ['', Validators.required],
    location: ['', Validators.required],
    description: ['', Validators.required],
  });
  constructor() {
    if (this.fair) this.form.patchValue(this.fair);
    for (const f of this.fairs) {
      for (const id of f.companies.find((c) => c.companyId === this.s.user()?.entityId)?.jobIds ??
        [])
        this.selected[f.id + id] = true;
    }
  }
  save() {
    try {
      if (this.id && !this.fair) throw Error('Fair not found.');
      const f: Fair = {
        ...this.form.getRawValue(),
        id: this.id ?? this.s.id('f'),
        universityId: this.s.user()!.entityId,
        companies: this.fair?.companies ?? [],
      };
      this.s.saveFair(f);
      this.router.navigateByUrl(this.base + '/' + f.id);
    } catch (e) {
      this.error = (e as Error).message;
    }
  }
  participating(f: Fair) {
    return f.companies.some((c) => c.companyId === this.s.user()?.entityId);
  }
  registered(id: string) {
    return this.s
      .state()
      .registrations.some((r) => r.fairId === id && r.candidateId === this.s.user()?.entityId);
  }
  showTicket() {
    document.getElementById('tickets-title')?.scrollIntoView({ behavior: 'smooth' });
    document.getElementById('tickets-title')?.focus();
  }
  register(id: string) {
    try {
      this.s.registerFair(id, this.studentIds[id] ?? '');
      this.error = '';
    } catch (e) {
      this.error = (e as Error).message;
    }
  }
  join(f: Fair) {
    try {
      this.s.joinFair(
        f.id,
        this.ownJobs.filter((j) => this.selected[f.id + j.id]).map((j) => j.id),
      );
      this.error = '';
    } catch (e) {
      this.error = (e as Error).message;
    }
  }
  registrations(id: string) {
    return this.s.state().registrations.filter((r) => r.fairId === id).length;
  }
  applications(id: string) {
    return this.s.state().applications.filter((a) => a.fairId === id).length;
  }
  jobs(f: Fair) {
    return f.companies
      .flatMap((c) => c.jobIds)
      .map((id) => this.s.job(id))
      .filter((j) => j?.published);
  }
}
