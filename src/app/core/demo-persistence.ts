import { Injectable, InjectionToken, inject } from '@angular/core';
import { DemoState } from './models';
import { seed } from './seed';
import { migrateState } from './state-migration';
export const STORE_KEY = 'skill2work.demo.v1';
export interface DemoPersistence {
  load(): DemoState;
  save(state: DemoState): void;
  session(): string | null;
  setSession(id: string | null): void;
}
@Injectable({ providedIn: 'root' })
export class LocalDemoPersistence implements DemoPersistence {
  load() {
    try {
      const d = JSON.parse(localStorage.getItem(STORE_KEY) || 'null');
      if ((d?.version === 1 || d?.version === 2) && Array.isArray(d.users)) {
        const migrated = migrateState(d);
        try {
          this.save(migrated);
        } catch {
          /* Keep migrated data in memory if storage is full; never replace it with seed. */
        }
        return migrated;
      }
    } catch {}
    return seed();
  }
  save(state: DemoState) {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(state));
    } catch {
      throw Error('Unable to save demo data. Free browser storage and retry.');
    }
  }
  session() {
    try {
      return localStorage.getItem('s2w.session');
    } catch {
      return null;
    }
  }
  setSession(id: string | null) {
    if (id) localStorage.setItem('s2w.session', id);
    else localStorage.removeItem('s2w.session');
  }
}
/** Demo storage is replaceable independently of the domain facade. Not a production API. */
export const DEMO_PERSISTENCE = new InjectionToken<DemoPersistence>('DEMO_PERSISTENCE', {
  providedIn: 'root',
  factory: () => inject(LocalDemoPersistence),
});
