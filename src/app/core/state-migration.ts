import { DemoState } from './models';
/** Version 2: additive profile fields and ticket tokens; employer weights are discarded. */
export function migrateState(input: unknown): DemoState {
  if (!input || typeof input !== 'object') throw Error('Invalid saved state');
  const d = structuredClone(input) as DemoState;
  if (!Array.isArray(d.users)) throw Error('Invalid saved account collection');
  d.companies ??= [];
  d.universities ??= [];
  d.applications ??= [];
  d.registrations ??= [];
  d.fairs ??= [];
  d.notifications ??= [];
  d.results ??= [];
  d.trackWeights ??= {};
  for (const collection of [
    'candidates',
    'companies',
    'universities',
    'jobs',
    'applications',
    'registrations',
    'fairs',
    'notifications',
    'results',
  ] as const)
    if (!Array.isArray(d[collection])) (d as unknown as Record<string, unknown>)[collection] = [];
  for (const j of d.jobs) {
    j.skills = (Array.isArray(j.skills) ? j.skills : [])
      .filter((r) => r && typeof r.name === 'string')
      .map((r) => ({
        name: r.name.trim(),
        must: r.must === true,
        ...(r.must
          ? {
              minimum:
                typeof r.minimum === 'number' && Number.isFinite(r.minimum)
                  ? Math.min(100, Math.max(0, r.minimum))
                  : 60,
            }
          : {}),
      }));
    if (!j.skills.some((r) => r.must)) j.published = false; // invalid legacy draft is repairable, applications survive
  }
  for (const c of d.candidates) {
    c.skills = Array.isArray(c.skills)
      ? c.skills.filter((s) => s && typeof s.name === 'string')
      : [];
    for (const field of [
      'name',
      'location',
      'track',
      'bio',
      'education',
      'experience',
      'projects',
    ] as const)
      if (typeof c[field] !== 'string') c[field] = '';
    if (!Array.isArray(c.portfolio)) delete c.portfolio;
    if (!Array.isArray(c.educationEntries)) delete c.educationEntries;
    if (!Array.isArray(c.experienceEntries)) delete c.experienceEntries;
    c.skills.forEach((s) => {
      if (typeof s.score !== 'number' || !Number.isFinite(s.score) || s.score < 0 || s.score > 100)
        delete s.score;
      if (s.summary?.includes('demo'))
        s.summary = 'Practice evidence: explain your decisions with concrete examples.';
    });
    c.headline ??= c.track;
    c.contactEmail ??=
      d.users
        .find((u) => u.entityId === c.id)
        ?.email.replace(/@skill2work\.demo$/, '@example.test') ?? '';
    c.phone ??= '';
    c.website ??= '';
    c.github ??= '';
    c.portfolio ??= c.projects?.trim()
      ? [
          {
            id: 'legacy-' + c.id,
            title: c.projects,
            description: 'A practical project exploring thoughtful digital experiences.',
            skills: c.skills.map((s) => s.name).join(', '),
            team: 'Solo',
          },
        ]
      : [];
    c.experienceEntries ??= c.experience?.trim()
      ? [
          {
            id: 'exp-' + c.id,
            title: 'Project experience',
            organization: 'Independent practice',
            start: '',
            end: '',
            description: c.experience,
          },
        ]
      : [];
    c.educationEntries ??= c.education?.trim()
      ? [
          {
            id: 'edu-' + c.id,
            title: c.education,
            organization: d.universities.find((u) => u.id === c.universityId)?.name ?? '',
            start: '',
            end: '',
            description: '',
          },
        ]
      : [];
  }
  for (const c of d.companies) {
    c.industry ??= 'Digital products';
    c.contactEmail ??= c.id + '@example.test';
    c.socialLinks ??= [];
  }
  for (const u of d.universities) {
    u.campuses ??= u.location;
    u.description ??=
      'Connecting our students with their next opportunity through skills, projects and career fairs.';
    u.contactEmail ??= u.id + '@example.test';
  }
  const tokens = new Set<string>();
  for (const r of d.registrations) {
    if (!r.ticketToken || tokens.has(r.ticketToken)) r.ticketToken = crypto.randomUUID();
    tokens.add(r.ticketToken);
  }
  d.version = 2;
  return d;
}
