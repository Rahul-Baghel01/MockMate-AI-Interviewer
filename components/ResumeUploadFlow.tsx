"use client";

import { ChangeEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileText, LoaderCircle, UploadCloud, XCircle, Sparkles, Trash2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { RESUME_MAX_SIZE_BYTES } from "@/lib/resume-config";

interface ResumeUploadFlowProps {
  userId: string;
}

type ResumeStatus = "idle" | "uploading" | "ready" | "error";

interface ResumeAnalyzeErrorResponse {
  success: false;
  code?: ResumeAnalyzeErrorCode;
  message?: string;
  error?: string;
  validation?: Pick<ResumeValidationResult, "confidence" | "reason" | "detectedSections">;
}

export default function ResumeUploadFlow({ userId }: ResumeUploadFlowProps) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<ResumeStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [questions, setQuestions] = useState<string[]>([]);
  const [startingInterview, setStartingInterview] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [validationReason, setValidationReason] = useState("");

  const resumeScore = Math.min(100, 60 + (analysis?.skills.length ?? 0) * 3 + (analysis?.projects.length ?? 0) * 4 + (analysis?.experience.length ?? 0) * 2);

  useEffect(() => {
    const loadExistingResume = async () => {
      try {
        const response = await fetch("/api/resume/analyze", { cache: "no-store" });
        const data = await response.json();
        if (response.ok && data.resume) {
          setAnalysis(data.resume.analysis);
          setStatus("ready");
        }
      } catch {
        // ignore and fall back to empty state
      }
    };

    void loadExistingResume();
  }, [userId]);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.type !== "application/pdf") {
      toast.error("Only PDF resumes are accepted.");
      return;
    }

    if (selectedFile.size > RESUME_MAX_SIZE_BYTES) {
      toast.error("The resume must be 10 MB or smaller.");
      return;
    }

    setFile(selectedFile);
    setStatus("uploading");
    setProgress(20);
    setAnalysis(null);
    setQuestions([]);
    setUploadError("");
    setValidationReason("");

    try {
      const formData = new FormData();
      formData.append("resume", selectedFile);

      const response = await fetch("/api/resume/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await response.json() as ({ success: true; analysis: ResumeAnalysis; questions?: string[] } | ResumeAnalyzeErrorResponse);
      setProgress(100);

      if (!response.ok || data.success === false) {
        const errorData = data as ResumeAnalyzeErrorResponse;
        const message = errorData.code === "NOT_A_RESUME"
          ? "This document does not appear to be a resume. Please upload a valid resume or CV."
          : errorData.code === "UNREADABLE_RESUME"
            ? "We could not extract readable text from this PDF. Try exporting your resume again as a text-based PDF."
            : errorData.message || errorData.error || "Unable to analyze resume.";
        setValidationReason(errorData.validation?.reason || "");
        throw new Error(message);
      }

      setAnalysis(data.analysis);
      setQuestions(data.questions || []);
      setStatus("ready");
      toast.success("Resume analyzed successfully.");
    } catch (error) {
      setStatus("error");
      setProgress(0);
      const message = error instanceof Error ? error.message : "Unable to analyze resume.";
      setUploadError(message);
      toast.error(message);
    }
  };

  const resetUpload = () => {
    setFile(null);
    setStatus("idle");
    setProgress(0);
    setAnalysis(null);
    setQuestions([]);
    setUploadError("");
    setValidationReason("");
  };

  const startResumeInterview = async () => {
    if (!analysis) return;

    setStartingInterview(true);
    try {
      const response = await fetch("/api/resume/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: 10, type: "Resume Deep Dive", difficulty: "Medium" }),
      });
      const data = await response.json();

      if (!response.ok || !data.success || !data.interviewId) {
        throw new Error(data.error || "Unable to start the interview.");
      }

      router.push(`/interview/${data.interviewId}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to start the interview.");
    } finally {
      setStartingInterview(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="rounded-[28px] border border-white/10 bg-dark-300/50 p-5 shadow-2xl shadow-dark-100/30 backdrop-blur-xl sm:p-8">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold text-white">Resume upload</h2>
            <p className="mt-1 text-sm text-light-400">Drop a PDF and let PrepWise extract your experience.</p>
          </div>
          <div className="rounded-full border border-primary-200/20 bg-primary-200/10 px-3 py-1 text-sm font-medium text-primary-100">PDF only</div>
        </div>

        <label className="mt-6 flex cursor-pointer flex-col items-center justify-center rounded-[24px] border border-dashed border-primary-200/25 bg-dark-100/70 px-6 py-12 text-center transition hover:border-primary-200/40">
          <UploadCloud className="h-10 w-10 text-primary-200" />
          <span className="mt-3 text-lg font-semibold text-white">Drag & drop or click to upload</span>
          <span className="mt-2 text-sm text-light-400">Maximum 10 MB • PDF format only</span>
          <input className="hidden" type="file" accept="application/pdf" onChange={handleFileChange} />
        </label>

        <div className="mt-5 flex items-center justify-between text-sm text-light-400">
          <span>Upload progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="mt-2 h-2 rounded-full bg-dark-200">
          <div className="h-2 rounded-full bg-primary-200 transition-all" style={{ width: `${progress}%` }} />
        </div>

        {file && (
          <div className="mt-5 flex items-center justify-between rounded-2xl border border-white/10 bg-dark-100/70 px-4 py-3">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-primary-200" />
              <div>
                <p className="text-sm font-medium text-white">{file.name}</p>
                <p className="text-xs text-light-400">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
              </div>
            </div>
            <button type="button" onClick={resetUpload} className="text-light-400 transition hover:text-white">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}

        {status === "error" && (
          <div className="mt-5 flex items-start gap-2 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200" role="alert">
            <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="text-red-200">{uploadError || "We could not analyze the resume. Please try again."}</p>
              {validationReason && <p className="mt-1 text-xs text-red-200/75">{validationReason}</p>}
            </div>
          </div>
        )}

        {status === "ready" && analysis && (
          <div className="mt-5 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Resume successfully analyzed. Your interview is now personalized.
            </div>
          </div>
        )}
      </div>

      <div className="rounded-[28px] border border-white/10 bg-dark-300/50 p-5 shadow-2xl shadow-dark-100/30 backdrop-blur-xl sm:p-8">
        {status === "ready" && analysis ? (
          <div className="space-y-6">
            <div>
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-primary-100">
                <Sparkles className="h-4 w-4" />
                Resume score
              </div>
              <div className="rounded-3xl border border-primary-200/20 bg-gradient-to-br from-primary-200/10 to-dark-100/40 p-4">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <p className="text-4xl font-semibold text-white">{resumeScore}/100</p>
                    <p className="mt-1 text-sm text-light-400">Strong match for technical interviews.</p>
                  </div>
                  <div className="rounded-full border border-primary-200/20 bg-dark-200/70 px-3 py-1 text-sm text-primary-100">Resume match</div>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-dark-100/70 p-4">
                <p className="text-sm font-semibold text-primary-100">Top Skills</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(analysis.skills || []).slice(0, 8).map((skill) => (
                    <span key={skill} className="rounded-full border border-white/10 bg-dark-200 px-2.5 py-1 text-xs text-light-100">{skill}</span>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-dark-100/70 p-4">
                <p className="text-sm font-semibold text-primary-100">Strengths</p>
                <ul className="mt-3 space-y-2 text-sm text-light-400">
                  {(analysis.strengths || []).slice(0, 4).map((strength) => <li key={strength}>• {strength}</li>)}
                </ul>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-dark-100/70 p-4">
                <p className="text-sm font-semibold text-primary-100">Projects</p>
                <ul className="mt-3 space-y-2 text-sm text-light-400">
                  {(analysis.projects || []).slice(0, 3).map((project) => <li key={project.name}>• {project.name}</li>)}
                </ul>
              </div>
              <div className="rounded-2xl border border-white/10 bg-dark-100/70 p-4">
                <p className="text-sm font-semibold text-primary-100">Experience</p>
                <ul className="mt-3 space-y-2 text-sm text-light-400">
                  {(analysis.experience || []).slice(0, 3).map((item) => <li key={`${item.company}-${item.role}`}>• {item.role} at {item.company}</li>)}
                </ul>
              </div>
              <div className="rounded-2xl border border-white/10 bg-dark-100/70 p-4">
                <p className="text-sm font-semibold text-primary-100">Education</p>
                <ul className="mt-3 space-y-2 text-sm text-light-400">
                  {(analysis.education || []).slice(0, 3).map((item) => <li key={`${item.college}-${item.degree}`}>• {item.degree} • {item.college}</li>)}
                </ul>
              </div>
              <div className="rounded-2xl border border-white/10 bg-dark-100/70 p-4">
                <p className="text-sm font-semibold text-primary-100">Certifications</p>
                <ul className="mt-3 space-y-2 text-sm text-light-400">
                  {(analysis.certifications || []).length > 0 ? analysis.certifications.slice(0, 3).map((certification) => <li key={certification}>• {certification}</li>) : <li>No certifications detected.</li>}
                </ul>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-100">Question preview</p>
              <div className="rounded-2xl border border-white/10 bg-dark-100/70 p-4">
                <ul className="space-y-2 text-sm text-light-300">
                  {questions.slice(0, 4).map((question) => <li key={question}>• {question}</li>)}
                </ul>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button onClick={startResumeInterview} disabled={startingInterview} className="bg-primary-200 text-dark-100 hover:bg-primary-100">
                {startingInterview ? <><LoaderCircle className="h-4 w-4 animate-spin" /> Preparing interview</> : "Start interview"}
              </Button>
              <Button variant="outline" className="border-white/10 bg-dark-100/70 text-light-100 hover:bg-dark-200">
                <Link href="/interview">Create standard interview</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex h-full min-h-[320px] flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-dark-100/40 p-6 text-center">
            {status === "uploading" ? <LoaderCircle className="h-8 w-8 animate-spin text-primary-200" /> : <FileText className="h-8 w-8 text-primary-200" />}
            <p className="mt-4 text-lg font-semibold text-white">Your resume analysis will appear here.</p>
            <p className="mt-2 max-w-md text-sm text-light-400">Upload a resume to unlock skill insights, strength highlights, and interviewer-ready questions.</p>
          </div>
        )}
      </div>
    </div>
  );
}
