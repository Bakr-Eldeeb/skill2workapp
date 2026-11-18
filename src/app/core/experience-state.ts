import { Injectable, signal } from '@angular/core';
import { Candidate } from './models';
export const EXPERIENCE_KEY = 's2w.experience.v3';
interface ChecklistState {
  dismissed: boolean;
  exploredJobs: boolean;
}
interface ExperienceState {
  version: 1;
  users: Record<string, ChecklistState>;
}
/** UI-only sidecar: does not change the backend/domain DTOs or gate any workflow. */
@Injectable({ providedIn: 'root' })
export class ExperienceStateStore {
  readonly state = signal<ExperienceState>(this.load());
  readonly error = signal('');
  constructor() {
    window.addEventListener('storage', (e) => {
      if (e.key === EXPERIENCE_KEY) this.state.set(this.load());
    });
  }
  private load(): ExperienceState {
    try {
      const d = JSON.parse(localStorage.getItem(EXPERIENCE_KEY) || 'null');
      if (d?.version === 1 && d.users) return d;
    } catch {}
    return { version: 1, users: {} };
  }
  forUser(id: string): ChecklistState {
    return this.state().users[id] ?? { dismissed: false, exploredJobs: false };
  }
  private update(id: string, patch: Partial<ChecklistState>) {
    const state = structuredClone(this.state());
    state.users[id] = { ...this.forUser(id), ...patch };
    this.state.set(state);
    try {
      localStorage.setItem(EXPERIENCE_KEY, JSON.stringify(state));
      this.error.set('');
    } catch {
      this.error.set('Checklist progress could not be saved in this browser.');
    }
  }
  explore(id: string) {
    if (!this.forUser(id).exploredJobs) this.update(id, { exploredJobs: true });
  }
  dismiss(id: string) {
    this.update(id, { dismissed: true });
  }
  restore(id: string) {
    this.update(id, { dismissed: false });
  }
  reset() {
    this.state.set({ version: 1, users: {} });
    localStorage.removeItem(EXPERIENCE_KEY);
  }
}
export function profileCompletion(c: Candidate) {
  const fields = [
    c.name,
    c.location,
    c.universityId,
    c.track,
    c.bio,
    c.education,
    c.experience,
    c.projects,
  ];
  return Math.round((100 * fields.filter((v) => v.trim()).length) / fields.length);
}
