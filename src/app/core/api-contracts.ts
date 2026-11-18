import { InjectionToken, Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Application,
  AssessmentQuestion,
  AssessmentResult,
  Candidate,
  Fair,
  Job,
  User,
} from './models';
export interface LoginRequest {
  email: string;
  password: string;
}
export interface LoginResponse {
  user: Omit<User, 'password'>;
  accessToken?: string;
}
export interface AssessmentStartRequest {
  skillNames: string[];
  difficulty: 'Easy' | 'Medium' | 'Hard';
}
export interface AssessmentStartResponse {
  attemptId: string;
  question: AssessmentQuestion;
  serverDeadline: string;
  totalQuestions: number;
}
export interface AssessmentAnswerRequest {
  questionId: string;
  answer: string;
}
export interface MatchResponse {
  jobId: string;
  candidateId: string;
  /** Arithmetic mean of required evidence, null when none assessed. No employer weights. */
  score: number | null;
  requiredAssessed: number;
  requiredTotal: number;
  assessedNiceCount: number;
  assessedNiceAverage: number | null;
  eligible: boolean;
  contributions: {
    skill: string;
    must: boolean;
    minimum?: number;
    actualScore: number | null;
    points: number;
    evaluated: boolean;
  }[];
}
export interface CandidateRepository {
  get(id: string): Observable<Candidate>;
  save(candidate: Candidate): Observable<Candidate>;
}
export interface JobRepository {
  list(): Observable<Job[]>;
  save(job: Job): Observable<Job>;
}
export interface ApplicationRepository {
  list(): Observable<Application[]>;
  apply(jobId: string, letter: string, fairId?: string): Observable<Application>;
}
export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL', {
  providedIn: 'root',
  factory: () => '/api',
});
/** Optional future adapter. Demo UI never calls it. Auth/authorization must be implemented server-side. */
@Injectable({ providedIn: 'root' })
export class AspNetApiClient {
  private http = inject(HttpClient);
  private base = inject(API_BASE_URL);
  login(body: LoginRequest) {
    return this.http.post<LoginResponse>(this.base + '/auth/login', body);
  }
  candidate(id: string) {
    return this.http.get<Candidate>(this.base + '/candidates/' + encodeURIComponent(id));
  }
  jobs() {
    return this.http.get<Job[]>(this.base + '/jobs');
  }
  apply(jobId: string, letter: string, fairId?: string) {
    return this.http.post<Application>(this.base + '/applications', { jobId, letter, fairId });
  }
  startAssessment(body: AssessmentStartRequest) {
    return this.http.post<AssessmentStartResponse>(this.base + '/assessments', body);
  }
  answer(id: string, body: AssessmentAnswerRequest) {
    return this.http.post<AssessmentStartResponse | AssessmentResult>(
      this.base + '/assessments/' + encodeURIComponent(id) + '/answers',
      body,
    );
  }
  fairs() {
    return this.http.get<Fair[]>(this.base + '/fairs');
  }
}

/** Production boundary: only an authenticated authorized recruiter can receive contacts. */
export type RecruiterCandidateProfile = Candidate;
export interface MediaUploadResponse {
  mediaId: string;
  url: string;
  width: number;
  height: number;
}
export interface TicketResponse {
  registrationId: string;
  opaqueToken: string;
  issuedAt: string;
}
export interface SkillDemandAggregate {
  skill: string;
  requestingCompanies: number;
  jobPostings: number;
  claimedStudents: number;
  assessedStudents: number;
}
