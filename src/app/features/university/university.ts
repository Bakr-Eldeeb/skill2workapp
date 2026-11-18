import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { DemoRepository } from '../../core/store';
import { TranslatePipe } from '../../core/preferences';
import { PageHeader, EmptyState } from '../../shared/ui';
import { universitySkillGaps } from '../../core/skill-gaps';
@Component({
  selector: 's2w-university',
  imports: [FormsModule, RouterLink, DatePipe, TranslatePipe, PageHeader, EmptyState],
  templateUrl: './university.html',
  styleUrl: './university.css',
})
export class University {
  s = inject(DemoRepository);
  route = inject(ActivatedRoute);
  view = this.route.snapshot.data['view'] ?? 'dashboard';
  filter = '';
  get fairs() {
    return this.s.state().fairs.filter((f) => f.universityId === this.s.user()?.entityId);
  }
  get scopedFairs() {
    return this.fairs.filter((f) => !this.filter || f.id === this.filter);
  }
  get registrations() {
    return this.s
      .state()
      .registrations.filter((r) => this.scopedFairs.some((f) => f.id === r.fairId));
  }
  get applications() {
    return this.s
      .state()
      .applications.filter((a) => a.fairId && this.scopedFairs.some((f) => f.id === a.fairId));
  }
  get companyCount() {
    return new Set(this.scopedFairs.flatMap((f) => f.companies.map((c) => c.companyId))).size;
  }
  get jobs() {
    return [...new Set(this.scopedFairs.flatMap((f) => f.companies.flatMap((c) => c.jobIds)))];
  }
  fairName(id: string) {
    return this.fairs.find((f) => f.id === id)?.name;
  }
  gapMax(g: { total: number; companies: number }) {
    return Math.max(1, g.total, g.companies);
  }
  skillSearch = '';
  gapSort = 'unmet';
  get gaps() {
    const rows = universitySkillGaps(this.s.state(), this.s.user()!.entityId, this.filter).filter(
      (g) => g.name.toLowerCase().includes(this.skillSearch.toLowerCase()),
    );
    return this.gapSort === 'companies' ? rows.sort((a, b) => b.companies - a.companies) : rows;
  }
}
