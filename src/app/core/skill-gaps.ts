import { DemoState } from './models';
import { evidence, key } from './matching';
export function universitySkillGaps(d: DemoState, universityId: string, fairId = '') {
  const fairs = d.fairs.filter(
    (f) => f.universityId === universityId && (!fairId || f.id === fairId),
  );
  const ids = new Set(fairs.flatMap((f) => f.companies.flatMap((c) => c.jobIds)));
  const jobs = d.jobs.filter((j) => j.published && ids.has(j.id));
  const students = d.candidates.filter((c) => c.universityId === universityId);
  const names = new Map<string, string>();
  for (const s of [...jobs.flatMap((j) => j.skills), ...students.flatMap((c) => c.skills)])
    names.set(key(s.name), s.name);
  return [...names.values()]
    .map((name) => {
      const demand = jobs.filter((j) => j.skills.some((s) => key(s.name) === key(name)));
      const companies = new Set(demand.map((j) => j.companyId)).size;
      const claimed = students.filter((c) => !!evidence(c, name)).length;
      const assessed = students.filter((c) => evidence(c, name)?.score !== undefined).length;
      const ratio = companies ? assessed / companies : null;
      const level = ratio === null ? 'neutral' : ratio < 1 ? 'red' : ratio < 2 ? 'amber' : 'green';
      return {
        name,
        companies,
        jobs: demand.length,
        claimed,
        assessed,
        total: students.length,
        ratio,
        level,
        label:
          level === 'red'
            ? 'Limited assessed supply'
            : level === 'amber'
              ? 'Some assessed supply'
              : level === 'green'
                ? 'Broader assessed supply'
                : 'No requesting companies',
      };
    })
    .sort(
      (a, b) =>
        (a.ratio ?? Infinity) - (b.ratio ?? Infinity) ||
        b.companies - a.companies ||
        a.name.localeCompare(b.name),
    );
}
