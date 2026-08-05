interface Feedback {
  id: string;
  interviewId: string;
  totalScore: number;
  categoryScores: Array<{ name: string; score: number; comment: string }>;
  strengths: string[];
  areasForImprovement: string[];
  finalAssessment: string;
  studyPlan?: Array<{ week: string; focus: string; outcome: string }>;
  speakingCoach?: { paceWpm: number; fillerWords: number; confidence: number; grammar: number; notes: string };
  createdAt: string;
}

interface Interview {
  id: string;
  role: string;
  level: string;
  questions: string[];
  techstack: string[];
  createdAt: string;
  userId: string;
  type: string;
  finalized: boolean;
  coverImage?: string;
  company?: string;
  companyProfile?: { style: string; focus: string; principles: string[] };
  resumeContext?: string;
  resumeAnalysisId?: string;
}

interface CreateFeedbackParams {
  interviewId: string;
  transcript: { role: string; content: string }[];
  feedbackId?: string;
}

interface User {
  name: string;
  email: string;
  id: string;
}

interface InterviewCardProps {
  interviewId?: string;
  userId?: string;
  role: string;
  type: string;
  techstack: string[];
  createdAt?: string;
  coverImage?: string;
  questionCount?: number;
  estimatedDuration?: string;
  difficulty?: string;
}

interface AgentProps {
  userName: string;
  userId?: string;
  interviewId?: string;
  feedbackId?: string;
  questions?: string[];
  company?: string;
  companyProfile?: { style: string; focus: string; principles: string[] };
  resumeContext?: string;
  resumeAnalysisId?: string;
}

interface ReplayTranscriptItem { id: string; role: "assistant" | "user"; content: string; timestamp: number; duration: number; }
interface ReplaySegment { text: string; timestamp: number; duration: number; }
interface InterviewReplay {
  id: string; interviewId: string; userId: string; vapiCallId?: string; recordingUrl?: string; storagePath?: string;
  transcript: ReplayTranscriptItem[]; questions: ReplaySegment[]; answers: ReplaySegment[];
  score?: number; feedback?: Feedback | Record<string, unknown>; resumeAnalysisId?: string; resumeContext?: string;
  company?: string; difficulty?: string; startedAt: string; completedAt: string; totalDuration: number;
}

interface RouteParams {
  params: Promise<Record<string, string>>;
  searchParams: Promise<Record<string, string>>;
}

interface GetFeedbackByInterviewIdParams {
  interviewId: string;
  userId: string;
}

interface GetLatestInterviewsParams {
  userId: string;
  limit?: number;
}

interface SignInParams {
  email: string;
  idToken: string;
}

interface SignUpParams {
  uid: string;
  name: string;
  email: string;
  password: string;
}

type FormType = "sign-in" | "sign-up";

interface TechIconProps {
  techStack: string[];
}

interface ResumeExperienceItem {
  company: string;
  role: string;
  duration: string;
  description: string;
}

interface ResumeProjectItem {
  name: string;
  techStack: string[];
  description: string;
}

interface ResumeEducationItem {
  degree: string;
  college: string;
  year: string;
}

interface ResumeAnalysis {
  name: string;
  summary: string;
  skills: string[];
  languages: string[];
  frameworks: string[];
  databases: string[];
  cloud: string[];
  tools: string[];
  experience: ResumeExperienceItem[];
  projects: ResumeProjectItem[];
  education: ResumeEducationItem[];
  certifications: string[];
  achievements: string[];
  strengths: string[];
}

type ResumeValidationResult = {
  isResume: boolean;
  confidence: number;
  reason: string;
  detectedSections: string[];
};

type ResumeAnalyzeErrorCode =
  | "NOT_A_RESUME"
  | "UNREADABLE_RESUME"
  | "INVALID_FILE"
  | "ANALYSIS_FAILED";
