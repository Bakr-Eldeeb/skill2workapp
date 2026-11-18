import { AssessmentQuestion } from './models';
export const DEMO_QUESTION_SECONDS = 120;
export const QUESTION_COUNT: Record<string, number> = { Easy: 4, Medium: 6, Hard: 8 };
/** Per skill: round(30% * count) MCQs, remaining questions open-ended. UI fixtures, not AI. */
export function questions(skills: string[], difficulty: string): AssessmentQuestion[] {
  const count = QUESTION_COUNT[difficulty] ?? 4;
  const mcq = Math.round(count * 0.3);
  return skills.flatMap((skill) =>
    Array.from({ length: count }, (_, i) => ({
      id: skill + '-' + i,
      skill,
      type: i < mcq ? ('mcq' as const) : ('open' as const),
      prompt:
        i < mcq
          ? `When working with ${skill}, which approach helps you check that a change behaves as intended?`
          : [
              `Describe a practical use of ${skill} in a recent project. Explain one decision you made.`,
              `Explain how you would investigate an unexpected issue involving ${skill}.`,
              `What trade-off would you consider when using ${skill}? Give a concrete example.`,
              `Describe how you would explain a ${skill} concept to a teammate.`,
              `How would you make a solution using ${skill} easier to maintain?`,
              `Describe a limitation of ${skill} and how you would handle it.`,
              `Explain how you would validate your assumptions when working with ${skill}.`,
            ][(i - mcq) % 7],
      ...(i < mcq
        ? {
            options: [
              'Compare the result with the expected behavior',
              'Skip validation and rely on the first attempt',
              'Remove all checks before continuing',
              'Avoid discussing the result with the team',
            ],
          }
        : {}),
    })),
  );
}
export function fixtureScore(skill: string) {
  return 65 + ([...skill].reduce((n, c) => n + c.charCodeAt(0), 0) % 26);
}
