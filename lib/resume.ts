import { mkdir, writeFile } from "fs/promises";
import path from "path";

import OpenAI from "openai";
import pdf from "pdf-parse";

const fallbackTopics = ["React", "Node.js", "TypeScript", "Firebase", "Next.js", "AWS", "Docker", "SQL", "REST APIs"];

const resumeSectionPatterns: Array<[string, RegExp]> = [
  ["professional summary", /\b(professional\s+summary|career\s+summary|profile|objective)\b/i],
  ["experience", /\b(work\s+experience|professional\s+experience|employment|work\s+history)\b/i],
  ["education", /\b(education|academic\s+background|qualifications?)\b/i],
  ["skills", /\b(technical\s+skills|core\s+competencies|skills|technologies)\b/i],
  ["projects", /\b(projects?|portfolio)\b/i],
  ["internship", /\b(internships?|trainee)\b/i],
  ["certifications", /\b(certifications?|licenses?)\b/i],
  ["achievements", /\b(achievements?|awards?|honors?)\b/i],
];

const identityPatterns: Array<[string, RegExp]> = [
  ["email", /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i],
  ["phone", /(?:\+?\d[\d\s().-]{7,}\d)/],
  ["LinkedIn", /\b(?:linkedin\.com\/in\/|linkedin\b)/i],
  ["GitHub", /\b(?:github\.com\/|github\b)/i],
];

const supportingProfessionalPatterns = [
  /\b(software|senior|junior|lead|manager|engineer|developer|analyst|consultant|designer|architect|specialist|intern)\b/i,
  /\b(bachelor|master|b\.?tech|m\.?tech|b\.?sc|m\.?sc|mba|ph\.?d|degree|university|college)\b/i,
  /\b(19|20)\d{2}\s*(?:[-–—]|to)\s*(?:(?:19|20)\d{2}|present|current)\b/i,
  /\b(responsible for|developed|implemented|managed|designed|built|delivered|collaborated|improved)\b/i,
];

const nonResumePatterns: Array<[string, RegExp]> = [
  ["question paper or assignment", /\b(question\s+paper|answer\s+all|assignment|marks?\s*[:\-]|semester\s+examination)\b/i],
  ["invoice", /\b(invoice|bill\s+to|amount\s+due|subtotal|tax\s+invoice)\b/i],
  ["certificate", /\b(this\s+is\s+to\s+certify|certificate\s+of|hereby\s+certif)\b/i],
  ["research paper or article", /\b(abstract|keywords|methodology|references|journal|doi:)\b/i],
  ["syllabus or class notes", /\b(syllabus|course\s+outcomes?|unit\s+[ivx\d]+|lecture\s+notes|chapter\s+\d+)\b/i],
  ["legal document", /\b(hereinafter|whereas|terms\s+and\s+conditions|jurisdiction)\b/i],
];

function localResumeValidation(resumeText: string): ResumeValidationResult {
  const text = sanitizeResumeText(resumeText);
  if (text.length < 250) {
    return { isResume: false, confidence: 0, reason: "The document does not contain enough readable text.", detectedSections: [] };
  }

  const detectedSections = resumeSectionPatterns.filter(([, pattern]) => pattern.test(text)).map(([name]) => name);
  const identityIndicators = identityPatterns.filter(([, pattern]) => pattern.test(text)).map(([name]) => name);
  const professionalSignals = supportingProfessionalPatterns.filter((pattern) => pattern.test(text)).length;
  const negativeIndicators = nonResumePatterns.filter(([, pattern]) => pattern.test(text)).map(([name]) => name);
  const hasProfessionalSection = detectedSections.some((section) => ["experience", "education", "skills", "projects", "internship", "certifications"].includes(section));

  let confidence = 20;
  confidence += Math.min(detectedSections.length, 5) * 10;
  confidence += Math.min(identityIndicators.length, 2) * 10;
  confidence += Math.min(professionalSignals, 3) * 6;
  confidence -= negativeIndicators.length * 18;
  confidence = Math.max(0, Math.min(95, confidence));

  const meetsStructure = detectedSections.length >= 2 && identityIndicators.length >= 1 && hasProfessionalSection && professionalSignals >= 1;
  const looksPrimarilyNonResume = negativeIndicators.length >= 2 || (negativeIndicators.length >= 1 && detectedSections.length < 3);
  const isResume = meetsStructure && !looksPrimarilyNonResume && confidence >= 70;

  const reason = isResume
    ? `Found ${detectedSections.length} resume sections, contact information, and professional history indicators.`
    : looksPrimarilyNonResume
      ? `The document appears to be a ${negativeIndicators.join(" or ")} rather than a professional resume.`
      : "The document lacks a strong combination of contact details and professional resume sections.";

  return { isResume, confidence, reason, detectedSections };
}

export async function validateResumeDocument(resumeText: string): Promise<ResumeValidationResult> {
  const localResult = localResumeValidation(resumeText);
  if (!localResult.isResume || localResult.confidence < 70 || !process.env.OPENAI_API_KEY) return localResult;

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: "You are a document classifier. Determine whether the provided document is a professional resume or CV. A resume normally contains several of these: candidate identity, contact information, skills, education, work experience, projects, internships, certifications, achievements. Do not classify certificates, assignments, invoices, research papers, notes, articles, reports, or syllabi as resumes. Return only valid JSON with isResume (boolean), confidence (0-100), reason (string), and detectedSections (string array).",
        },
        { role: "user", content: `Classify this document:\n\n${resumeText}` },
      ],
    });
    const parsed = JSON.parse(response.choices[0]?.message?.content ?? "{}") as Partial<ResumeValidationResult>;
    const confidence = Math.max(0, Math.min(100, Number(parsed.confidence) || 0));
    const detectedSections = Array.isArray(parsed.detectedSections) ? parsed.detectedSections.filter((item): item is string => typeof item === "string") : localResult.detectedSections;
    const isResume = parsed.isResume === true && confidence >= 70;
    return {
      isResume,
      confidence,
      reason: typeof parsed.reason === "string" && parsed.reason.trim() ? parsed.reason.trim() : isResume ? "The document matches a professional resume structure." : "The document could not be confirmed as a professional resume.",
      detectedSections,
    };
  } catch (error) {
    console.error("Resume classification failed; using conservative local validation", error);
    return localResult;
  }
}

export async function extractResumeText(buffer: Buffer) {
  try {
    const data = await pdf(buffer);
    return sanitizeResumeText(data.text || "");
  } catch (error) {
    console.error("Resume text extraction failed", error);
    return "";
  }
}

export function sanitizeResumeText(text: string) {
  return text
    .replace(/\r/g, "")
    .replace(/[\u0000-\u001f]/g, "")
    .split(/\n+/)
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .filter((line, index, lines) => line !== lines[index - 1])
    .filter((line) => !/^page\s*\d+([\s/\-]+\d+)?$/i.test(line))
    .filter((line) => !/^(copyright|confidential|resume)$/i.test(line))
    .join("\n");
}

export async function saveUploadedResume(buffer: Buffer, userId: string) {
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });

  const fileName = `resume-${userId}-${Date.now()}.pdf`;
  const filePath = path.join(uploadDir, fileName);
  await writeFile(filePath, buffer);

  return `/uploads/${fileName}`;
}

function normalizeAnalysis(analysis: Partial<ResumeAnalysis>): ResumeAnalysis {
  return {
    name: analysis.name || "",
    summary: analysis.summary || "",
    skills: analysis.skills || [],
    languages: analysis.languages || [],
    frameworks: analysis.frameworks || [],
    databases: analysis.databases || [],
    cloud: analysis.cloud || [],
    tools: analysis.tools || [],
    experience: analysis.experience || [],
    projects: analysis.projects || [],
    education: analysis.education || [],
    certifications: analysis.certifications || [],
    achievements: analysis.achievements || [],
    strengths: analysis.strengths || [],
  };
}

function buildFallbackAnalysis(resumeText: string): ResumeAnalysis {
  const lowerText = resumeText.toLowerCase();
  const detectedSkills = fallbackTopics.filter((topic) => lowerText.includes(topic.toLowerCase()));

  return normalizeAnalysis({
    name: "",
    summary: "Resume review completed using the extracted content and keyword matching.",
    skills: detectedSkills.length > 0 ? detectedSkills : ["Problem solving", "Communication"],
    languages: lowerText.includes("typescript") || lowerText.includes("javascript") ? ["TypeScript", "JavaScript"] : ["TypeScript"],
    frameworks: lowerText.includes("react") ? ["React"] : ["Next.js"],
    databases: lowerText.includes("firebase") ? ["Firestore"] : ["SQL"],
    cloud: lowerText.includes("aws") ? ["AWS"] : [],
    tools: lowerText.includes("docker") ? ["Docker"] : ["Git"],
    experience: [],
    projects: [],
    education: [],
    certifications: [],
    achievements: [],
    strengths: ["Adaptability", "Practical delivery"],
  });
}

export async function analyzeResumeText(resumeText: string): Promise<ResumeAnalysis> {
  if (!process.env.OPENAI_API_KEY) {
    return buildFallbackAnalysis(resumeText);
  }

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      response_format: { type: "json_object" },
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content: `You are a senior recruiting analyst. Read the resume and return ONLY valid JSON matching the requested schema. Keep lists concise and factual. Use empty strings or arrays when information is not present.`,
        },
        {
          role: "user",
          content: `Analyze this resume. Return ONLY valid JSON with this structure:\n{\n  "name":"",\n  "summary":"",\n  "skills":[],\n  "languages":[],\n  "frameworks":[],\n  "databases":[],\n  "cloud":[],\n  "tools":[],\n  "experience":[{\"company\":\"\",\"role\":\"\",\"duration\":\"\",\"description\":\"\"}],\n  "projects":[{\"name\":\"\",\"techStack\":[],\"description\":\"\"}],\n  "education":[{\"degree\":\"\",\"college\":\"\",\"year\":\"\"}],\n  "certifications":[],\n  "achievements":[],\n  "strengths":[]\n}\n\nResume text:\n${resumeText}`,
        },
      ],
    });

    const content = response.choices[0]?.message?.content ?? "{}";
    const payload = JSON.parse(content);
    return normalizeAnalysis(payload);
  } catch {
    return buildFallbackAnalysis(resumeText);
  }
}

export async function generateResumeInterviewQuestions(analysis: ResumeAnalysis, options: { amount: number; type: string; difficulty: string }) {
  const prompt = buildResumeInterviewPrompt(analysis, options);

  if (!process.env.OPENAI_API_KEY) {
    return buildFallbackQuestions(analysis, options.amount);
  }

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      temperature: 0.3,
      messages: [
        {
          role: "system",
          content: "You are a senior technical interviewer. Create only resume-specific questions and avoid generic interview questions.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const content = response.choices[0]?.message?.content ?? "";
    return content
      .split(/\n+/)
      .map((item) => item.replace(/^[-*\d.\s]+/, "").trim())
      .filter(Boolean)
      .slice(0, options.amount);
  } catch {
    return buildFallbackQuestions(analysis, options.amount);
  }
}

function buildResumeInterviewPrompt(analysis: ResumeAnalysis, options: { amount: number; type: string; difficulty: string }) {
  const skillSummary = [analysis.skills, analysis.languages, analysis.frameworks, analysis.databases, analysis.tools]
    .flat()
    .slice(0, 10)
    .join(", ");

  const projectSummary = analysis.projects
    .slice(0, 3)
    .map((project) => `${project.name}: ${project.description}`)
    .join(" | ");

  return `You are a Senior Technical Interviewer. Ask only resume-specific questions for this candidate. Do not ask unrelated questions. Refer to their experience naturally, and increase the difficulty gradually from easy to hard. Do not repeat topics. Include brief follow-up prompts where relevant. Interview type: ${options.type}. Difficulty: ${options.difficulty}. Candidate skills: ${skillSummary || "general software delivery"}. Candidate projects: ${projectSummary || "professional experience"}. Return exactly ${options.amount} questions, one per line, without numbering or bullets.`;
}

function buildFallbackQuestions(analysis: ResumeAnalysis, amount: number) {
  const templates = [
    `I noticed your resume highlights ${analysis.skills[0] || "your core skills"}. Walk me through how you applied that in practice.`,
    `Tell me about one project where you used ${analysis.frameworks[0] || analysis.tools[0] || "modern tooling"}. What tradeoffs did you make?`,
    `Explain how you approached architecture or collaboration in your recent work.`,
    `Describe a challenge that came up in your project and how you resolved it.`,
    `What would you improve in your current approach if you had more time?`,
  ];

  return Array.from({ length: amount }, (_, index) => templates[index % templates.length]).slice(0, amount);
}

export function buildResumeContext(analysis: ResumeAnalysis | null | undefined) {
  if (!analysis) return "No resume details provided.";

  return [
    `Candidate: ${analysis.name || "Resume-based candidate"}`,
    `Summary: ${analysis.summary || "Resume analysis available"}`,
    `Skills: ${analysis.skills.join(", ") || "General engineering"}`,
    `Projects: ${analysis.projects.map((project) => project.name).join(", ") || "Recent work"}`,
    `Experience: ${analysis.experience.map((item) => `${item.role} at ${item.company}`).join("; ") || "Professional background available"}`,
    `Achievements: ${analysis.achievements.join("; ") || "Not specified"}`,
  ].join("\n");
}
