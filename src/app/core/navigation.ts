import { Role } from './models';

export interface NavigationItem {
  path: string;
  label: string;
  icon: string;
}
const item = (path: string, label: string, icon: string): NavigationItem => ({ path, label, icon });
/** Only distinct destinations appear in primary navigation. Old deep links remain supported. */
export const NAV: Record<Role, NavigationItem[]> = {
  candidate: [
    item('dashboard', 'Career Home', '◫'),
    item('jobs', 'Find jobs', '⌕'),
    item('skills', 'Skills & Passport', '◇'),
    item('applications', 'Applications', '▧'),
    item('fairs', 'Career fairs', '⌂'),
  ],
  company: [
    item('dashboard', 'Dashboard', '◫'),
    item('jobs', 'Jobs', '▤'),
    item('talent', 'Find candidates', '⌕'),
    item('applicants', 'Applicants & hiring', '▧'),
    item('fairs', 'Career fairs', '⌂'),
  ],
  university: [
    item('dashboard', 'Dashboard', '◫'),
    item('fairs', 'Manage fairs', '⌂'),
    item('analytics', 'Analytics', '▥'),
    item('profile', 'University profile', '○'),
  ],
  admin: [item('companies', 'Company approvals', '▤'), item('universities', 'Universities', '⌂')],
};
export const SECONDARY_NAV: Record<Role, NavigationItem[]> = {
  candidate: [
    item('profile', 'Profile', '○'),
    item('notifications', 'Notifications', '♧'),
    item('settings', 'Settings', '⚙'),
  ],
  company: [
    item('profile', 'Company profile', '○'),
    item('notifications', 'Notifications', '♧'),
    item('settings', 'Settings', '⚙'),
  ],
  university: [item('settings', 'Settings', '⚙')],
  admin: [item('settings', 'Settings', '⚙')],
};
/** Explicit, task-oriented mobile destinations (never derived from desktop order by slice). */
export const MOBILE_NAV: Record<Role, NavigationItem[]> = {
  candidate: [
    item('dashboard', 'Home', '◫'),
    item('jobs', 'Jobs', '⌕'),
    item('skills', 'Skills', '◇'),
    item('applications', 'Applications', '▧'),
  ],
  company: NAV.company.slice(0, 4),
  university: NAV.university,
  admin: NAV.admin,
};
