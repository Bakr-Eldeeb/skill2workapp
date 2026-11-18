import { Role } from './models';
export function parentRoute(url: string, role: Role): string {
  const [path, query] = url.split('?');
  const segments = path.split('/').filter(Boolean);
  const base = '/' + role;
  if (segments[0] !== role) return role === 'admin' ? '/admin/companies' : base + '/dashboard';
  if (segments[1] === 'jobs' && segments.length > 2) {
    if (segments[3] === 'apply') return base + '/jobs/' + segments[2] + (query ? '?' + query : '');
    return base + '/jobs';
  }
  if (segments[1] === 'fairs' && segments.length > 2) {
    return segments[3] === 'edit' ? base + '/fairs/' + segments[2] : base + '/fairs';
  }
  if (role === 'candidate' && segments[1] === 'companies') return '/candidate/jobs';
  if (role === 'candidate' && segments[1] === 'applications' && segments.length > 2)
    return '/candidate/applications';
  if (segments[1] === 'candidates') return '/company/talent';
  if (['assessments', 'results', 'passport'].includes(segments[1])) return '/candidate/skills';
  return role === 'admin' ? '/admin/companies' : base + '/dashboard';
}
