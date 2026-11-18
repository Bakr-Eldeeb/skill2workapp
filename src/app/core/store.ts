import { Injectable, computed, signal, inject } from '@angular/core';
import {
  Application,
  AssessmentResult,
  Candidate,
  Company,
  DemoState,
  Fair,
  Job,
  Role,
  Status,
  User,
} from './models';
import { seed } from './seed';
import { jobErrors, key, match, overall, recommended, requiredCoverage } from './matching';
import { DEMO_PERSISTENCE, STORE_KEY } from './demo-persistence';
export { STORE_KEY } from './demo-persistence';
@Injectable({ providedIn: 'root' })
export class DemoRepository {
  private persistence = inject(DEMO_PERSISTENCE);
  readonly state = signal<DemoState>(this.persistence.load());
  readonly session = signal<string | null>(this.persistence.session());
  readonly toast = signal('');
  readonly user = computed(() => this.state().users.find((u) => u.id === this.session()));
  constructor() {
    window.addEventListener('storage', (e) => {
      if (e.key === STORE_KEY) this.state.set(this.persistence.load());
      if (e.key === 's2w.session') this.session.set(e.newValue);
    });
  }
  commit(mut: (d: DemoState) => void) {
    const d = structuredClone(this.state());
    mut(d);
    this.persistence.save(d);
    this.state.set(d);
  }
  addSkill(name: string) {
    const c = this.candidate();
    if (!name.trim()) throw Error('Enter a skill name.');
    if (c.skills.some((s) => key(s.name) === key(name)))
      throw Error('This skill is already in your profile.');
    this.saveCandidate({ ...c, skills: [...c.skills, { name: name.trim() }] });
  }
  removeSkill(name: string) {
    this.commit((d) => {
      const c = d.candidates.find((c) => c.id === this.user()?.entityId)!;
      c.skills = c.skills.filter((s) => s.name !== name);
      d.results = d.results.filter((r) => r.candidateId !== c.id || r.skill !== name);
    });
  }
  markNotificationsRead() {
    this.commit((d) =>
      d.notifications.filter((n) => n.userId === this.user()?.id).forEach((n) => (n.read = true)),
    );
  }
  saveCredentials(email: string, password: string) {
    if (!/^\S+@\S+\.\S+$/.test(email) || (password && password.length < 8))
      throw Error('Enter a valid email and (if changing it) a password of at least 8 characters.');
    if (this.state().users.some((u) => u.id !== this.user()?.id && key(u.email) === key(email)))
      throw Error('This email is already registered.');
    this.commit((d) => {
      const u = d.users.find((u) => u.id === this.user()?.id)!;
      u.email = email.trim();
      if (password) u.password = password;
    });
    this.notify('Account saved.');
  }
  completeAssessment(results: AssessmentResult[]) {
    this.commit((d) => {
      const c = d.candidates.find((c) => c.id === this.user()?.entityId);
      if (!c) throw Error('Candidate account required.');
      for (const result of results) {
        if (result.candidateId !== c.id) throw Error('Assessment account mismatch.');
        const skill = c.skills.find((s) => s.name === result.skill);
        if (!skill) throw Error('This skill is no longer in your profile.');
        Object.assign(skill, {
          score: result.score,
          date: result.date,
          summary:
            'Practice result from local rules. Explain your decisions with concrete examples.',
          simulated: true,
        });
        d.results = d.results.filter((r) => r.candidateId !== c.id || r.skill !== result.skill);
        d.results.push(result);
      }
      this.addNotice(d, c.id, 'Practice assessment completed. View your latest results.');
    });
  }
  notify(message: string) {
    this.toast.set(message);
    setTimeout(() => this.toast.set(''), 5000);
  }
  id(prefix: string) {
    return prefix + crypto.randomUUID();
  }
  login(email: string, password: string) {
    const u = this.state().users.find(
      (u) => key(u.email) === key(email) && u.password === password,
    );
    if (!u) throw Error('Email or password is incorrect.');
    this.session.set(u.id);
    this.persistence.setSession(u.id);
    return u;
  }
  logout() {
    this.session.set(null);
    this.persistence.setSession(null);
  }
  reset() {
    this.persistence.save(seed());
    this.state.set(seed());
    this.logout();
  }
  company(id: string) {
    return this.state().companies.find((c) => c.id === id)!;
  }
  candidate(id = this.user()?.entityId) {
    return this.state().candidates.find((c) => c.id === id)!;
  }
  job(id: string) {
    return this.state().jobs.find((j) => j.id === id);
  }
  coverage = requiredCoverage;
  score(c: Candidate, j: Job) {
    return match(c, j);
  }
  overall(c: Candidate) {
    return overall(c, this.state().trackWeights);
  }
  recommendations(j: Job) {
    return recommended(this.state().candidates, j, this.state().trackWeights);
  }
  addNotice(d: DemoState, entity: string, text: string) {
    const user = d.users.find((u) => u.entityId === entity);
    if (user)
      d.notifications.unshift({
        id: this.id('n'),
        userId: user.id,
        text,
        date: new Date().toISOString(),
        read: false,
      });
  }
  signup(
    role: 'candidate' | 'company',
    data: { name: string; email: string; password: string; universityId: string; track: string },
  ) {
    if (this.state().users.some((u) => key(u.email) === key(data.email)))
      throw Error('This email is already registered.');
    if (role === 'candidate' && !this.state().universities.some((u) => u.id === data.universityId))
      throw Error('Select your university.');
    const entityId = this.id(role);
    const u: User = {
      id: this.id('user'),
      role,
      entityId,
      name: data.name,
      email: data.email.trim(),
      password: data.password,
    };
    this.commit((d) => {
      d.users.push(u);
      if (role === 'candidate')
        d.candidates.push({
          id: entityId,
          name: data.name,
          location: 'Cairo',
          universityId: data.universityId,
          track: data.track,
          bio: '',
          education: '',
          experience: '',
          projects: '',
          skills: [],
          headline: data.track,
          contactEmail: data.email.replace(/@skill2work\.demo$/, '@example.test'),
          phone: '',
          portfolio: [],
          educationEntries: [],
          experienceEntries: [],
        });
      else
        d.companies.push({
          id: entityId,
          name: data.name,
          location: 'Cairo',
          description: '',
          website: '',
          status: 'Pending',
        });
    });
    this.login(data.email, data.password);
    return u;
  }
  saveCandidate(candidate: Candidate) {
    if (this.user()?.role !== 'candidate' || candidate.id !== this.user()?.entityId)
      throw Error('Only the candidate can edit this profile.');
    candidate = {
      ...candidate,
      education:
        candidate.educationEntries?.map((e) => e.title + ' · ' + e.organization).join('; ') ??
        candidate.education,
      experience:
        candidate.experienceEntries?.map((e) => e.title + ' · ' + e.organization).join('; ') ??
        candidate.experience,
      projects: candidate.portfolio?.map((p) => p.title).join('; ') ?? candidate.projects,
    };
    this.commit((d) => {
      const old = d.candidates.find((c) => c.id === candidate.id)!;
      if (old.universityId !== candidate.universityId) {
        d.registrations = d.registrations.filter((r) => r.candidateId !== candidate.id);
        this.addNotice(
          d,
          candidate.id,
          'University changed. Previous fair registrations were cancelled.',
        );
      }
      d.candidates[d.candidates.findIndex((c) => c.id === candidate.id)] = candidate;
      const u = d.users.find((u) => u.entityId === candidate.id);
      if (u) u.name = candidate.name;
    });
    this.notify('Profile saved.');
  }
  saveCompany(c: Company) {
    this.commit((d) => {
      d.companies[d.companies.findIndex((x) => x.id === c.id)] = c;
      const u = d.users.find((u) => u.entityId === c.id);
      if (u) u.name = c.name;
    });
    this.notify('Company profile saved.');
  }
  saveJob(job: Job, publish: boolean) {
    if (job.companyId !== this.user()?.entityId) throw Error('You can only edit your own jobs.');
    if (publish) {
      const errors = jobErrors(job.skills);
      if (!job.title.trim() || !job.description.trim() || !job.location.trim())
        errors.unshift('Title, description and location are required.');
      if (errors.length) throw Error(errors.join(' '));
    }
    this.commit((d) => {
      const i = d.jobs.findIndex((j) => j.id === job.id);
      const old = d.jobs[i];
      if (old?.published && JSON.stringify(old.skills) !== JSON.stringify(job.skills))
        for (const a of d.applications.filter((a) => a.jobId === job.id))
          this.addNotice(d, a.candidateId, 'Job requirements updated: ' + job.title);
      if (i < 0) d.jobs.push({ ...job, published: publish });
      else d.jobs[i] = { ...job, published: publish };
    });
    this.notify(publish ? 'Job published.' : 'Draft saved.');
  }
  apply(jobId: string, letter: string, fairId?: string) {
    const c = this.candidate(),
      j = this.job(jobId);
    if (!c || !j?.published) throw Error('This job is unavailable.');
    if (this.state().applications.some((a) => a.candidateId === c.id && a.jobId === jobId))
      throw Error('You already applied to this job.');
    if (fairId) {
      const f = this.state().fairs.find((f) => f.id === fairId);
      if (
        !f ||
        f.universityId !== c.universityId ||
        !f.companies.some((x) => x.jobIds.includes(jobId)) ||
        !this.state().registrations.some((r) => r.candidateId === c.id && r.fairId === fairId)
      )
        throw Error('Register for this fair before applying.');
    }
    this.commit((d) => {
      d.applications.push({
        id: this.id('a'),
        candidateId: c.id,
        jobId,
        status: 'Applied',
        letter,
        date: new Date().toISOString(),
        ...(fairId ? { fairId } : {}),
      });
      this.addNotice(d, j.companyId, 'New application: ' + c.name + ' · ' + j.title);
    });
    this.notify('Application submitted.');
  }
  updateStatus(id: string, status: Status) {
    this.commit((d) => {
      const a = d.applications.find((x) => x.id === id)!;
      a.status = status;
      this.addNotice(
        d,
        a.candidateId,
        'Application update: ' + status + ' · ' + this.job(a.jobId)?.title,
      );
    });
    this.notify('Application updated.');
  }
  schedule(id: string, date: string) {
    if (!date || new Date(date).getTime() <= Date.now())
      throw Error('Choose a future interview date and time.');
    this.commit((d) => {
      const a = d.applications.find((x) => x.id === id)!;
      a.status = 'Interview';
      a.interview = { date, response: 'Pending', note: '' };
      this.addNotice(d, a.candidateId, 'Interview invitation: ' + date);
    });
    this.notify('Interview invitation sent.');
  }
  respond(id: string, response: 'Accepted' | 'Declined' | 'Reschedule requested', note: string) {
    this.commit((d) => {
      const a = d.applications.find((x) => x.id === id)!;
      if (a.candidateId !== this.user()?.entityId || !a.interview)
        throw Error('Interview not found.');
      a.interview.response = response;
      a.interview.note = note;
      this.addNotice(
        d,
        this.job(a.jobId)!.companyId,
        'Interview response: ' + response + (note ? ' · ' + note : ''),
      );
    });
    this.notify('Response saved.');
  }
  saveFair(f: Fair) {
    if (
      !f.name.trim() ||
      !f.date ||
      new Date(f.date).getTime() <= Date.now() ||
      !f.location.trim() ||
      !f.description.trim()
    )
      throw Error('Enter a name, future date, location and description.');
    this.commit((d) => {
      const i = d.fairs.findIndex((x) => x.id === f.id);
      if (i < 0) d.fairs.push(f);
      else d.fairs[i] = f;
      for (const r of d.registrations.filter((r) => r.fairId === f.id))
        this.addNotice(d, r.candidateId, 'Fair updated: ' + f.name);
    });
    this.notify('Fair saved.');
  }
  joinFair(id: string, jobIds: string[]) {
    const cid = this.user()!.entityId;
    if (
      !jobIds.length ||
      jobIds.some((id) => {
        const j = this.job(id);
        return !j?.published || j.companyId !== cid;
      })
    )
      throw Error('Select at least one of your published jobs.');
    this.commit((d) => {
      const f = d.fairs.find((f) => f.id === id)!;
      f.companies = f.companies.filter((c) => c.companyId !== cid);
      f.companies.push({ companyId: cid, jobIds });
    });
    this.notify('Fair participation saved.');
  }
  registerFair(id: string, studentId: string) {
    const c = this.candidate();
    if (!studentId.trim()) throw Error('Student ID is required.');
    if (this.state().fairs.find((f) => f.id === id)?.universityId !== c.universityId)
      throw Error('This fair is limited to its university.');
    this.commit((d) => {
      if (d.registrations.some((r) => r.candidateId === c.id && r.fairId === id))
        throw Error('Already registered.');
      d.registrations.push({
        id: this.id('r'),
        candidateId: c.id,
        fairId: id,
        studentId: studentId.trim(),
        ticketToken: crypto.randomUUID(),
      });
      this.addNotice(d, c.id, 'Fair registration confirmed (student ID self-reported).');
    });
    this.notify('Registered for the fair.');
  }
  approve(id: string, status: 'Approved' | 'Rejected', reason = '') {
    this.commit((d) => {
      const c = d.companies.find((c) => c.id === id)!;
      c.status = status;
      c.reason = reason;
      this.addNotice(d, id, 'Company account: ' + status);
    });
    this.notify('Company status updated.');
  }
  saveUniversity(id: string, name: string, location: string, email: string, password: string) {
    const existing = this.state().universities.some((u) => u.id === id);
    if (
      !name.trim() ||
      !location.trim() ||
      !/^\S+@\S+\.\S+$/.test(email) ||
      ((!existing || password.length > 0) && password.length < 8)
    )
      throw Error('Name, location, valid email and an 8-character password are required.');
    this.commit((d) => {
      const conflict = d.users.find((u) => key(u.email) === key(email) && u.entityId !== id);
      if (conflict) throw Error('This email is already registered.');
      const i = d.universities.findIndex((u) => u.id === id);
      if (i < 0) {
        d.universities.push({ id, name, location });
        d.users.push({
          id: this.id('uu'),
          name,
          email,
          password,
          role: 'university',
          entityId: id,
        });
      } else {
        d.universities[i] = { id, name, location };
        const user = d.users.find((u) => u.entityId === id)!;
        Object.assign(user, { name, email, ...(password ? { password } : {}) });
      }
    });
    this.notify('University account saved.');
  }
}
