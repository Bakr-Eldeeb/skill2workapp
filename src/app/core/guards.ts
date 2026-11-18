import { inject } from '@angular/core';
import { CanActivateFn, CanDeactivateFn, Router } from '@angular/router';
import { DemoRepository } from './store';
import { Assessments } from '../features/candidate/assessments';
export const roleGuard: CanActivateFn = (route) => {
  const s = inject(DemoRepository),
    r = inject(Router),
    u = s.user();
  if (!u) return r.parseUrl('/sign-in');
  if (u.role !== route.pathFromRoot.map((r) => r.data['role']).find(Boolean))
    return r.parseUrl('/' + u.role + (u.role === 'admin' ? '/companies' : '/dashboard'));
  if (u.role === 'company' && s.company(u.entityId)?.status !== 'Approved')
    return r.parseUrl('/account-status');
  return true;
};
export const assessmentExit: CanDeactivateFn<Assessments> = (component) =>
  component?.canLeave() ?? true;
