import { Candidate, Job, JobSkill } from './models';
export const key = (s: string) => s.trim().toLocaleLowerCase('en');
export function evidence(c: Candidate, name: string) {
  return c.skills.find((s) => key(s.name) === key(name));
}
export function requiredCoverage(c: Candidate, j: Job) {
  const must = j.skills.filter((r) => r.must);
  return {
    assessed: must.filter((r) => evidence(c, r.name)?.score !== undefined).length,
    total: must.length,
  };
}
export function match(c: Candidate, j: Job): number | null {
  const must = j.skills.filter((r) => r.must);
  if (!must.length || !requiredCoverage(c, j).assessed) return null;
  return must.reduce((n, r) => n + (evidence(c, r.name)?.score ?? 0), 0) / must.length;
}
export function overall(
  c: Candidate,
  weights: Record<string, Record<string, number>>,
): number | null {
  const raw = weights[c.track] ?? {};
  const w = Object.fromEntries(Object.entries(raw).map(([name, value]) => [key(name), value]));
  const included = c.skills.filter((s) => s.score !== undefined && (w[key(s.name)] ?? 0) > 0);
  const total = included.reduce((n, s) => n + w[key(s.name)], 0);
  return total ? included.reduce((n, s) => n + s.score! * w[key(s.name)], 0) / total : null;
}
export function eligible(c: Candidate, j: Job) {
  const must = j.skills.filter((s) => s.must);
  return (
    must.length > 0 &&
    must.every((r) => {
      const s = evidence(c, r.name);
      return s?.score !== undefined && s.score >= (r.minimum ?? 0);
    })
  );
}
export function recommended(cs: Candidate[], j: Job, w: Record<string, Record<string, number>>) {
  const nice = (c: Candidate) =>
    j.skills
      .filter((r) => !r.must)
      .map((r) => evidence(c, r.name)?.score)
      .filter((n): n is number => n !== undefined);
  const avg = (c: Candidate) => {
    const a = nice(c);
    return a.length ? a.reduce((n, v) => n + v, 0) / a.length : 0;
  };
  return cs
    .filter((c) => eligible(c, j))
    .sort(
      (a, b) =>
        (match(b, j) ?? -1) - (match(a, j) ?? -1) ||
        nice(b).length - nice(a).length ||
        avg(b) - avg(a) ||
        (overall(b, w) ?? -1) - (overall(a, w) ?? -1) ||
        a.id.localeCompare(b.id, 'en'),
    );
}
export function jobErrors(skills: JobSkill[]): string[] {
  const errors: string[] = [];
  if (!skills.length || !skills.some((r) => r.must))
    errors.push('At least one Must-Have skill is required.');
  if (skills.some((r) => !r.name.trim())) errors.push('Every skill needs a name.');
  if (new Set(skills.map((r) => key(r.name))).size !== skills.length)
    errors.push('Duplicate skills are not allowed.');
  if (
    skills.some(
      (r) =>
        r.must &&
        (typeof r.minimum !== 'number' ||
          !Number.isFinite(r.minimum) ||
          r.minimum < 0 ||
          r.minimum > 100),
    )
  )
    errors.push('Must-Have minimum scores must be between 0 and 100.');
  return errors;
}
