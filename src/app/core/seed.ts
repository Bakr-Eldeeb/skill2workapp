import { DemoState, Candidate, Company, User } from './models';
import { migrateState } from './state-migration';
export const DEMO_PASSWORD = 'Demo123!';
export function seed(): DemoState {
  const universities = [
    { id: 'u1', name: 'Egyptian Chinese University', location: 'Cairo' },
    { id: 'u2', name: 'Aswan University', location: 'Aswan' },
    { id: 'u3', name: 'Helwan University', location: 'Cairo' },
  ];
  const names = [
    'Omar Hassan',
    'Mariam Adel',
    'Youssef Nabil',
    'Salma Mostafa',
    'Ahmed Farouk',
    'Nour Tarek',
    'Karim Emad',
    'Hana Mahmoud',
    'Ali Samir',
    'Dina Hossam',
  ];
  const tracks = ['Frontend Development', 'Backend Development', 'Product Design'];
  const candidates: Candidate[] = Array.from({ length: 50 }, (_, i) => ({
    id: `c${i + 1}`,
    name: names[i % 10] + (i >= 10 ? ` ${Math.floor(i / 10) + 1}` : ''),
    location: ['Cairo', 'Aswan', 'Alexandria'][i % 3],
    universityId: universities[i % 3].id,
    track: tracks[i % 3],
    bio: 'Building useful digital experiences, one thoughtful detail at a time.',
    education: 'BSc student · Expected graduation 2027',
    experience: 'Student projects and independent practice',
    projects: 'Community services platform',
    skills: ['Angular', 'TypeScript', 'SQL', 'Communication'].map((name, k) => ({
      name,
      ...(i % 5 === 4
        ? {}
        : {
            score: 50 + ((i * 7 + k * 11) % 46),
            date: '2026-11-01T10:00:00.000Z',
            summary: 'Practice evidence. Develop your explanations with concrete examples.',
            simulated: true,
          }),
    })),
  }));
  const companies: Company[] = [
    'Nile Pixel Studio',
    'Lotus Digital Labs',
    'Aswan Codeworks',
    'Cairo Cloud Studio',
    'Delta Product House',
    'Saffron Systems',
    'Palm Software',
    'Orbit Egypt Labs',
    'Cedar Tech Studio',
    'Wadi Solutions',
  ].map((name, i) => ({
    id: `co${i + 1}`,
    name,
    location: i % 2 ? 'Aswan' : 'Cairo',
    description: 'A thoughtful product team building accessible digital experiences in Egypt.',
    website: '',
    status: i === 9 ? 'Pending' : 'Approved',
  }));
  const users: User[] = [
    ...candidates.map((c, i) => ({
      id: `uc${i + 1}`,
      email: i ? 'candidate' + (i + 1) + '@skill2work.demo' : 'candidate@skill2work.demo',
      password: DEMO_PASSWORD,
      role: 'candidate' as const,
      entityId: c.id,
      name: c.name,
    })),
    ...companies.map((c, i) => ({
      id: `uco${i + 1}`,
      email: i ? 'company' + (i + 1) + '@skill2work.demo' : 'company@skill2work.demo',
      password: DEMO_PASSWORD,
      role: 'company' as const,
      entityId: c.id,
      name: c.name,
    })),
    ...universities.map((u, i) => ({
      id: `uu${i + 1}`,
      email: i ? 'university' + (i + 1) + '@skill2work.demo' : 'university@skill2work.demo',
      password: DEMO_PASSWORD,
      role: 'university' as const,
      entityId: u.id,
      name: u.name,
    })),
    {
      id: 'admin',
      email: 'admin@skill2work.demo',
      password: DEMO_PASSWORD,
      role: 'admin',
      entityId: 'admin',
      name: 'System Admin',
    },
  ];
  const jobs = companies.slice(0, 9).map((c, i) => ({
    id: `j${i + 1}`,
    companyId: c.id,
    title: ['Frontend Developer', 'Junior Software Engineer', 'Angular Developer'][i % 3],
    description:
      'Help our team build accessible, dependable web applications. Collaborate with designers, review changes, and explain your decisions clearly.',
    location: c.location,
    mode: ['Hybrid', 'Remote', 'On-site'][i % 3],
    type: 'Full-time',
    experience: '0–2 years',
    salary: i % 2 ? 'EGP 15,000–22,000' : '',
    published: true,
    skills: [
      { name: 'Angular', must: true, minimum: 65 },
      { name: 'TypeScript', must: true, minimum: 60 },
      { name: 'Communication', must: false },
    ],
  }));
  return migrateState({
    version: 2,
    users,
    candidates,
    companies,
    universities,
    jobs,
    applications: [
      {
        id: 'a1',
        candidateId: 'c1',
        jobId: 'j1',
        status: 'Applied',
        letter: 'I enjoy thoughtful frontend work.',
        date: '2026-11-15T10:00:00Z',
      },
    ],
    fairs: [
      {
        id: 'f1',
        universityId: 'u1',
        name: 'ECU Skills to Careers Fair',
        date: '2026-12-10T10:00',
        location: 'ECU · Cairo campus',
        description: 'Meet participating employers and explore roles aligned with your skills.',
        companies: [{ companyId: 'co1', jobIds: ['j1'] }],
      },
      {
        id: 'f2',
        universityId: 'u2',
        name: 'Aswan Career Connections',
        date: '2026-12-16T10:00',
        location: 'Aswan campus',
        description: 'Connect with participating teams.',
        companies: [],
      },
    ],
    registrations: [],
    notifications: [],
    results: [],
    trackWeights: {
      'Frontend Development': { Angular: 5, TypeScript: 4, Communication: 1 },
      'Backend Development': { SQL: 5, TypeScript: 3, Communication: 2 },
      'Product Design': { Figma: 5, Communication: 3, TypeScript: 1 },
    },
  });
}
