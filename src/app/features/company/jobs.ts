import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DemoRepository } from '../../core/store';
import { TranslatePipe } from '../../core/preferences';
import { Job, JobSkill } from '../../core/models';
import { PageHeader, EmptyState } from '../../shared/ui';
import { jobErrors } from '../../core/matching';
@Component({
  selector: 's2w-company-jobs',
  imports: [ReactiveFormsModule, RouterLink, TranslatePipe, PageHeader, EmptyState],
  templateUrl: './jobs.html',
  styleUrl: './jobs.css',
})
export class CompanyJobs {
  s = inject(DemoRepository);
  route = inject(ActivatedRoute);
  router = inject(Router);
  fb = inject(FormBuilder);
  editing = !!this.route.snapshot.data['editor'];
  jobId = this.route.snapshot.paramMap.get('id');
  existing = this.jobId ? this.s.job(this.jobId) : undefined;
  denied = !!this.jobId && (!this.existing || this.existing.companyId !== this.s.user()?.entityId);
  error = '';
  form = this.fb.nonNullable.group({
    title: [this.existing?.title ?? '', Validators.required],
    description: [this.existing?.description ?? '', Validators.required],
    location: [this.existing?.location ?? 'Cairo', Validators.required],
    mode: [this.existing?.mode ?? 'Hybrid'],
    type: [this.existing?.type ?? 'Full-time'],
    experience: [this.existing?.experience ?? '0–2 years'],
    salary: [this.existing?.salary ?? ''],
    skills: this.fb.array(
      (this.existing?.skills ?? [{ name: '', must: true, minimum: 60 }]).map((s) =>
        this.skillGroup(s),
      ),
    ),
  });
  get skills() {
    return this.form.controls.skills;
  }
  get validation() {
    return jobErrors(this.skills.getRawValue());
  }
  skillGroup(s: JobSkill = { name: '', must: true, minimum: 60 }) {
    return this.fb.nonNullable.group({
      name: [s.name],
      must: [s.must],
      minimum: [s.minimum ?? 60],
    });
  }
  get jobs() {
    return this.s.state().jobs.filter((j) => j.companyId === this.s.user()?.entityId);
  }
  save(publish: boolean) {
    this.error = '';
    if (this.denied) return;
    try {
      const raw = this.form.getRawValue();
      const job: Job = {
        ...raw,
        skills: raw.skills.map((r) => ({
          name: r.name,
          must: r.must,
          ...(r.must ? { minimum: r.minimum } : {}),
        })),
        id: this.existing?.id ?? this.s.id('j'),
        companyId: this.s.user()!.entityId,
        published: publish,
      };
      this.s.saveJob(job, publish);
      this.router.navigateByUrl('/company/jobs');
    } catch (e) {
      this.error = (e as Error).message;
    }
  }
}
