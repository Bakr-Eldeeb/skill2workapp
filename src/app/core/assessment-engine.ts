import { Injectable, InjectionToken, inject } from '@angular/core';
import { AssessmentAttempt, AssessmentResult } from './models';
import { fixtureScore } from './assessment';
export interface AssessmentEngine {
  evaluate(attempt: AssessmentAttempt): Promise<AssessmentResult[]>;
}
/** Intentionally fixed UI simulation, not answer grading. No keys or rubrics are sent to a provider. */
@Injectable({ providedIn: 'root' })
export class DemoAssessmentEngine implements AssessmentEngine {
  async evaluate(attempt: AssessmentAttempt): Promise<AssessmentResult[]> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const date = new Date().toISOString();
    return [...new Set(attempt.questions.map((q) => q.skill))].map((skill) => {
      const questions = attempt.questions.filter((q) => q.skill === skill);
      const responses = questions.map(
        (q) =>
          attempt.responses?.find((r) => r.questionId === q.id) ?? {
            questionId: q.id,
            answer: attempt.answers[attempt.questions.indexOf(q)] ?? '',
            status: 'answered' as const,
          },
      );
      return {
        id: crypto.randomUUID(),
        candidateId: attempt.candidateId,
        skill,
        score: fixtureScore(skill),
        date,
        simulated: true,
        strengths: 'Practice expressing a clear approach and naming assumptions.',
        weaknesses: 'Add specific examples, test cases and limitations.',
        responses,
        explanations: questions.map(
          (q, i) =>
            `Question ${i + 1}: ${q.prompt} ${responses[i].status === 'timed-out' ? (responses[i].answer ? 'Time expired. Your partial response was saved.' : 'Unanswered (time expired).') : 'Your response was recorded.'} Demo feedback: explain your reasoning and acknowledge trade-offs. This fixture does not grade your answer.`,
        ),
      };
    });
  }
}
export const ASSESSMENT_ENGINE = new InjectionToken<AssessmentEngine>('ASSESSMENT_ENGINE', {
  providedIn: 'root',
  factory: () => inject(DemoAssessmentEngine),
});
