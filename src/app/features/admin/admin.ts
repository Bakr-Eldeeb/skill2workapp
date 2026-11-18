import { Component, inject } from '@angular/core';
import { FormsModule, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DemoRepository } from '../../core/store';
import { TranslatePipe } from '../../core/preferences';
import { PageHeader, EmptyState } from '../../shared/ui';
@Component({
  selector: 's2w-admin',
  imports: [FormsModule, ReactiveFormsModule, TranslatePipe, PageHeader, EmptyState],
  templateUrl: './admin.html',
  styleUrl: './admin.css',
})
export class Admin {
  s = inject(DemoRepository);
  route = inject(ActivatedRoute);
  fb = inject(FormBuilder);
  universities = !!this.route.snapshot.data['universities'];
  reasons: Record<string, string> = {};
  filter = 'Pending';
  editingId = '';
  showForm = false;
  error = '';
  form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    location: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });
  get companies() {
    return this.s.state().companies.filter((c) => !this.filter || c.status === this.filter);
  }
  edit(id = '') {
    this.editingId = id;
    this.showForm = true;
    this.error = '';
    this.form.controls.password.setValidators(
      id ? [Validators.minLength(8)] : [Validators.required, Validators.minLength(8)],
    );
    this.form.controls.password.updateValueAndValidity();
    if (id) {
      const u = this.s.state().universities.find((u) => u.id === id)!;
      const user = this.s.state().users.find((u) => u.entityId === id)!;
      this.form.setValue({
        name: u.name,
        location: u.location,
        email: user.email,
        password: '',
      });
    } else this.form.reset({ name: '', location: '', email: '', password: '' });
  }
  save() {
    try {
      const v = this.form.getRawValue();
      this.s.saveUniversity(
        this.editingId || this.s.id('u'),
        v.name,
        v.location,
        v.email,
        v.password,
      );
      this.showForm = false;
      this.error = '';
    } catch (e) {
      this.error = (e as Error).message;
    }
  }
}
