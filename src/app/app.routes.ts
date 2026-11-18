import { Technology } from './features/public/technology';
import { Routes } from '@angular/router';
import { roleGuard, assessmentExit } from './core/guards';
import { AppShell } from './shared/shell';
import { Landing } from './features/public/landing';
import { Auth } from './features/public/auth';
import { AccountStatus, NotFound } from './features/public/status';
import { CandidateDashboard } from './features/candidate/dashboard';
import { CandidateProfile } from './features/candidate/profile';
import { Skills } from './features/candidate/skills';
import { Assessments } from './features/candidate/assessments';
import { CandidateJobs } from './features/candidate/jobs';
import { CandidateApplications } from './features/candidate/applications';
import { CompanyDashboard } from './features/company/dashboard';
import { CompanyProfile } from './features/company/profile';
import { CompanyJobs } from './features/company/jobs';
import { Talent } from './features/company/talent';
import { Applicants } from './features/company/applicants';
import { Fairs } from './features/university/fairs';
import { University } from './features/university/university';
import { Admin } from './features/admin/admin';
import { Settings } from './features/settings/settings';
const preferences: Routes = [
  { path: 'settings', component: Settings },
  { path: 'notifications', component: Settings, data: { notifications: true } },
];
const fairs: Routes = [
  { path: 'fairs', component: Fairs },
  { path: 'fairs/:id', component: Fairs },
];
export const routes: Routes = [
  { path: '', component: Landing, pathMatch: 'full' },
  { path: 'technology', component: Technology },
  { path: 'sign-in', component: Auth, data: { kind: 'login' } },
  { path: 'sign-up', component: Auth, data: { kind: 'candidate' } },
  { path: 'company-sign-up', component: Auth, data: { kind: 'company' } },
  { path: 'account-status', component: AccountStatus },
  {
    path: 'candidate',
    component: AppShell,
    data: { role: 'candidate' },
    canActivate: [roleGuard],
    canActivateChild: [roleGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: CandidateDashboard },
      { path: 'profile', component: CandidateProfile },
      { path: 'skills', component: Skills },
      { path: 'passport', component: Skills, data: { tab: 'passport' } },
      { path: 'assessments', component: Assessments, canDeactivate: [assessmentExit] },
      { path: 'results', component: Skills, data: { tab: 'results' } },
      { path: 'jobs', component: CandidateJobs },
      { path: 'jobs/:id', component: CandidateJobs },
      { path: 'jobs/:id/apply', component: CandidateJobs, data: { apply: true } },
      { path: 'applications', component: CandidateApplications },
      { path: 'applications/:id', component: CandidateApplications },
      { path: 'companies/:id', component: CompanyProfile },
      ...fairs,
      ...preferences,
    ],
  },
  {
    path: 'company',
    component: AppShell,
    data: { role: 'company' },
    canActivate: [roleGuard],
    canActivateChild: [roleGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: CompanyDashboard },
      { path: 'profile', component: CompanyProfile },
      { path: 'jobs', component: CompanyJobs },
      { path: 'jobs/new', component: CompanyJobs, data: { editor: true } },
      { path: 'jobs/:id/edit', component: CompanyJobs, data: { editor: true } },
      { path: 'recommendations', component: Talent, data: { recommended: true } },
      { path: 'talent', component: Talent },
      { path: 'candidates/:id', component: CandidateProfile },
      { path: 'applicants', component: Applicants },
      { path: 'pipeline', component: Applicants, data: { pipeline: true } },
      ...fairs,
      ...preferences,
    ],
  },
  {
    path: 'university',
    component: AppShell,
    data: { role: 'university' },
    canActivate: [roleGuard],
    canActivateChild: [roleGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'profile', component: CompanyProfile },
      { path: 'dashboard', component: University, data: { view: 'dashboard' } },
      { path: 'fairs/new', component: Fairs, data: { editor: true } },
      { path: 'fairs/:id/edit', component: Fairs, data: { editor: true } },
      ...fairs,
      { path: 'registrations', component: University, data: { view: 'registrations' } },
      { path: 'analytics', component: University, data: { view: 'analytics' } },
      { path: 'settings', component: Settings },
    ],
  },
  {
    path: 'admin',
    component: AppShell,
    data: { role: 'admin' },
    canActivate: [roleGuard],
    canActivateChild: [roleGuard],
    children: [
      { path: '', redirectTo: 'companies', pathMatch: 'full' },
      { path: 'companies', component: Admin },
      { path: 'universities', component: Admin, data: { universities: true } },
      { path: 'settings', component: Settings },
    ],
  },
  { path: '**', component: NotFound },
];
