import { LoadingState } from '../../shared/loading';
import { ASSESSMENT_ENGINE } from '../../core/assessment-engine';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Component, inject, signal, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DemoRepository } from '../../core/store';
import { TranslatePipe } from '../../core/preferences';
import { PageHeader } from '../../shared/ui';
import { AssessmentAttempt } from '../../core/models';
import { questions, QUESTION_COUNT, DEMO_QUESTION_SECONDS } from '../../core/assessment';
@Component({
  selector: 's2w-assessments',
  imports: [FormsModule, RouterLink, TranslatePipe, PageHeader, LoadingState],
  templateUrl: './assessments.html',
  styleUrl: './assessments.css',
})
export class Assessments implements OnDestroy {
  s = inject(DemoRepository);
  engine = inject(ASSESSMENT_ENGINE);
  route = inject(ActivatedRoute);
  router = inject(Router);
  target = this.route.snapshot.queryParamMap.get('skill') ?? '';
  difficulty = 'Easy';
  fullMode: 'new' | 'all' = 'new';
  error = '';
  answer = '';
  attempt = signal<AssessmentAttempt | null>(null);
  readonly demoQuestionSeconds = DEMO_QUESTION_SECONDS;
  seconds = signal(DEMO_QUESTION_SECONDS);
  evaluating = signal(false);
  failed = false;
  timer: ReturnType<typeof setInterval>;
  get c() {
    return this.s.candidate();
  }
  get question() {
    const a = this.attempt();
    return a?.questions[a.index];
  }
  get selectedSkills() {
    if (this.target) return this.c.skills.filter((skill) => skill.name === this.target);
    return this.fullMode === 'all'
      ? this.c.skills.filter(
          (skill) =>
            skill.score !== undefined &&
            (!skill.date || Date.now() - new Date(skill.date).getTime() >= 86400000),
        )
      : this.c.skills.filter((skill) => skill.score === undefined);
  }
  constructor() {
    this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      if (!this.attempt()) {
        this.target = params.get('skill') ?? '';
        this.error = '';
      }
    });
    try {
      const a = JSON.parse(sessionStorage.getItem('s2w.attempt') || 'null');
      if (a?.candidateId === this.c.id) {
        this.attempt.set(a);
        this.answer = a.answers[a.index] ?? '';
      }
    } catch {}
    this.timer = setInterval(() => {
      const a = this.attempt();
      if (a) {
        const sec = Math.max(0, Math.ceil((a.deadline - Date.now()) / 1000));
        this.seconds.set(sec);
        if (!sec && !this.failed && !this.evaluating()) {
          this.next(true);
        }
      }
    }, 500);
  }
  start() {
    this.error = '';
    const skills = this.selectedSkills;
    if (!skills.length) {
      this.error =
        this.fullMode === 'all'
          ? 'No skills are eligible for reassessment yet.'
          : this.c.skills.length
            ? 'Every skill has already been assessed. Select a skill or choose full reassessment.'
            : 'Add a claimed skill before starting an assessment.';
      return;
    }
    const cooling = skills.find(
      (s) => s.date && Date.now() - new Date(s.date).getTime() < 86400000,
    );
    if (cooling) {
      this.error = 'Reassessment is available 24 hours after the latest result: ' + cooling.name;
      return;
    }
    const a: AssessmentAttempt = {
      candidateId: this.c.id,
      difficulty: this.difficulty,
      questions: questions(
        skills.map((s) => s.name),
        this.difficulty,
      ),
      answers: [],
      index: 0,
      deadline: Date.now() + DEMO_QUESTION_SECONDS * 1000,
    };
    this.attempt.set(a);
    this.seconds.set(DEMO_QUESTION_SECONDS);
    this.save();
  }
  save() {
    try {
      sessionStorage.setItem('s2w.attempt', JSON.stringify(this.attempt()));
    } catch {
      this.error = 'Attempt recovery is unavailable. Keep this tab open.';
    }
  }
  next(timedOut = false) {
    if (!timedOut && !this.answer.trim()) {
      this.error = 'Enter an answer before continuing.';
      return;
    }
    const current = this.attempt();
    if (!current) return;
    this.error = '';
    const a = { ...current, answers: [...current.answers] };
    a.answers[a.index] = this.answer;
    a.responses = [
      ...(a.responses ?? []).filter((r) => r.questionId !== a.questions[a.index].id),
      {
        questionId: a.questions[a.index].id,
        answer: this.answer,
        status: timedOut ? 'timed-out' : 'answered',
      },
    ];
    if (a.index < a.questions.length - 1) {
      a.index++;
      a.deadline = Date.now() + DEMO_QUESTION_SECONDS * 1000;
      this.attempt.set(a);
      this.answer = '';
      this.seconds.set(DEMO_QUESTION_SECONDS);
      this.save();
    } else {
      this.attempt.set(a);
      this.save();
      this.finish();
    }
  }
  updateAnswer(value: string) {
    this.answer = value;
    const a = this.attempt();
    if (a) {
      a.answers[a.index] = value;
      this.save();
    }
  }
  async finish() {
    const attempt = this.attempt();
    if (!attempt || this.evaluating()) return;
    this.failed = false;
    this.evaluating.set(true);
    try {
      const results = await this.engine.evaluate(structuredClone(attempt));
      if (this.attempt() !== attempt || this.s.user()?.entityId !== attempt.candidateId) return;
      this.s.completeAssessment(results);
      this.attempt.set(null);
      try {
        sessionStorage.removeItem('s2w.attempt');
      } catch {}
      this.router.navigateByUrl('/candidate/results');
      this.s.notify('Demo assessment completed.');
    } catch (e) {
      this.failed = true;
      this.error = (e as Error).message;
    } finally {
      this.evaluating.set(false);
    }
  }
  canLeave() {
    if (!this.attempt()) return true;
    if (confirm('Cancel this demo assessment? Your current attempt will be discarded.')) {
      this.attempt.set(null);
      sessionStorage.removeItem('s2w.attempt');
      return true;
    }
    return false;
  }
  cancel() {
    this.canLeave();
  }
  count() {
    return QUESTION_COUNT[this.difficulty] * this.selectedSkills.length;
  }
  ngOnDestroy() {
    clearInterval(this.timer);
  }
}
