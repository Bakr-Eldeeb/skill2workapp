import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Logo } from '../../shared/ui';
import { Preferences, TranslatePipe } from '../../core/preferences';
import { DemoRepository } from '../../core/store';
@Component({
  selector: 's2w-auth',
  imports: [ReactiveFormsModule, RouterLink, Logo, TranslatePipe],
  templateUrl: './auth.html',
  styleUrl: './auth.css',
})
export class Auth {
  s = inject(DemoRepository);
  p = inject(Preferences);
  route = inject(ActivatedRoute);
  r = inject(Router);
  fb = inject(FormBuilder);
  kind = this.route.snapshot.data['kind'] as string;
  error = '';
  form = this.fb.nonNullable.group({
    name: [''],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmation: [''],
    universityId: [''],
    track: ['Frontend Development'],
  });
  get signing() {
    return this.kind !== 'login';
  }
  get company() {
    return this.kind === 'company';
  }
  constructor() {
    if (this.signing) {
      this.form.controls.name.addValidators(Validators.required);
      this.form.controls.confirmation.addValidators(Validators.required);
      if (!this.company) this.form.controls.universityId.addValidators(Validators.required);
    }
  }
  submit() {
    this.error = '';
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.error =
        'Complete all required fields with a valid email and a password of at least 8 characters.';
      return;
    }
    const v = this.form.getRawValue();
    if (this.signing && v.password !== v.confirmation) {
      this.error = 'Passwords do not match.';
      return;
    }
    try {
      const u = this.signing
        ? this.s.signup(this.company ? 'company' : 'candidate', v)
        : this.s.login(v.email, v.password);
      this.r.navigateByUrl(
        u.role === 'company' && this.s.company(u.entityId).status !== 'Approved'
          ? '/account-status'
          : '/' + u.role + (u.role === 'admin' ? '/companies' : '/dashboard'),
      );
    } catch (e) {
      this.error = (e as Error).message;
    }
  }
}
