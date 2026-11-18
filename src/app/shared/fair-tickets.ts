import { Component, Input, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import QRCode from 'qrcode';
import { DemoRepository } from '../core/store';
import { Fair, FairRegistration } from '../core/models';
import { TranslatePipe } from '../core/preferences';
import { EmptyState } from './ui';
import { ticketPayload, ticketSvg } from '../core/tickets';
@Component({
  selector: 's2w-fair-tickets',
  imports: [FormsModule, DatePipe, TranslatePipe, EmptyState],
  templateUrl: './fair-tickets.html',
})
export class FairTickets {
  @Input({ required: true }) fair!: Fair;
  s = inject(DemoRepository);
  search = '';
  searchBy = 'all';
  selected = '';
  error = '';
  cache = new Map<string, string>();
  get university() {
    return this.s.user()?.role === 'university';
  }
  get allowed() {
    const u = this.s.user();
    return this.university
      ? u?.entityId === this.fair.universityId
      : u?.role === 'candidate' && this.s.candidate()?.universityId === this.fair.universityId;
  }
  get rows() {
    return !this.allowed
      ? []
      : this.s
          .state()
          .registrations.filter(
            (r) =>
              r.fairId === this.fair.id &&
              (this.university || r.candidateId === this.s.user()?.entityId),
          );
  }
  get visible() {
    const q = this.search.toLowerCase();
    return this.rows.filter((r) => {
      const value =
        this.searchBy === 'name'
          ? this.s.candidate(r.candidateId).name
          : this.searchBy === 'student'
            ? r.studentId
            : this.searchBy === 'registration'
              ? r.id
              : [r.id, r.studentId, this.s.candidate(r.candidateId).name].join(' ');
      return (!this.selected || this.selected === r.id) && (!q || value.toLowerCase().includes(q));
    });
  }
  get universityName() {
    return this.s.state().universities.find((u) => u.id === this.fair.universityId)?.name;
  }
  qr(r: FairRegistration) {
    if (!this.cache.has(r.ticketToken!))
      this.cache.set(
        r.ticketToken!,
        'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(ticketSvg(r)),
      );
    return this.cache.get(r.ticketToken!)!;
  }
  async download(r: FairRegistration) {
    if (!this.rows.some((x) => x.id === r.id)) return;
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1200;
      canvas.height = 640;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw Error('PNG export is unavailable in this browser. Use Print ticket.');
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, 1200, 640);
      ctx.fillStyle = '#6556E8';
      ctx.fillRect(0, 0, 1200, 16);
      ctx.fillStyle = '#111729';
      ctx.font = 'bold 32px sans-serif';
      ctx.fillText('Skill2Work · ' + this.fair.name, 40, 80, 750);
      ctx.font = '23px sans-serif';
      [
        this.universityName ?? '',
        new Date(this.fair.date).toLocaleString(),
        this.fair.location,
        this.s.candidate(r.candidateId).name ?? '',
        'Registration: ' + r.id,
        'Student ID: ' + r.studentId,
        'Registration ticket · no attendance status',
      ].forEach((line, i) => ctx.fillText(line, 40, 140 + i * 60, 750));
      const qr = QRCode.create(ticketPayload(r), { errorCorrectionLevel: 'M' });
      const scale = 7;
      const n = qr.modules.size;
      const x0 = 830,
        y0 = 170;
      ctx.fillStyle = 'white';
      ctx.fillRect(x0 - 28, y0 - 28, (n + 8) * scale, (n + 8) * scale);
      ctx.fillStyle = '#111729';
      for (let y = 0; y < n; y++)
        for (let x = 0; x < n; x++)
          if (qr.modules.get(y, x)) ctx.fillRect(x0 + x * scale, y0 + y * scale, scale, scale);
      const a = document.createElement('a');
      a.download = 'Skill2Work-ticket-' + r.id + '.png';
      a.href = canvas.toDataURL('image/png');
      a.click();
      this.error = '';
    } catch (e) {
      this.error = (e as Error).message;
    }
  }
  printOne(r: FairRegistration) {
    this.selected = r.id;
    this.print();
  }
  printAll() {
    this.search = '';
    this.selected = '';
    this.print();
  }
  print() {
    document.body.classList.add('ticket-print');
    window.addEventListener('afterprint', () => document.body.classList.remove('ticket-print'), {
      once: true,
    });
    setTimeout(() => window.print(), 100);
  }
}
