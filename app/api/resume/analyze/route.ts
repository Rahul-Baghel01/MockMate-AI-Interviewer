import { getCurrentUser } from "@/lib/actions/auth.action";
import { db } from "@/firebase/admin";
import { RESUME_MAX_SIZE_BYTES } from "@/lib/resume-config";
import { analyzeResumeText, extractResumeText, generateResumeInterviewQuestions, saveUploadedResume, sanitizeResumeText, validateResumeDocument } from "@/lib/resume";

const invalidFileResponse = (message: string) => Response.json({ success: false, code: "INVALID_FILE" satisfies ResumeAnalyzeErrorCode, message }, { status: 400 });

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const snapshot = await db.collection("resumeAnalysis").where("userId", "==", user.id).get();
  const latestDocument = snapshot.docs
    .map((document): Record<string, unknown> & { id: string } => ({ id: document.id, ...document.data() }))
    .filter((document) => {
      const validation = document.validation as ResumeValidationResult | undefined;
      return validation?.isResume === true && validation.confidence >= 70;
    })
    .sort((left, right) => String((right as { uploadedAt?: string }).uploadedAt ?? "").localeCompare(String((left as { uploadedAt?: string }).uploadedAt ?? "")))[0];

  return Response.json({ success: true, resume: latestDocument ?? null });
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("resume");

    if (!file || typeof file !== "object" || typeof (file as File).arrayBuffer !== "function") {
      return invalidFileResponse("Please attach a PDF resume.");
    }

    const resumeFile = file as File;
    const isPdf =
      resumeFile.type === "application/pdf" ||
      resumeFile.name?.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      return invalidFileResponse("Only PDF resumes are supported.");
    }

    if (resumeFile.size > RESUME_MAX_SIZE_BYTES) {
      return invalidFileResponse("Resume must be 10 MB or smaller.");
    }

    const buffer = Buffer.from(await resumeFile.arrayBuffer());
    if (buffer.subarray(0, 5).toString("ascii") !== "%PDF-") {
      return invalidFileResponse("Only valid PDF resumes are supported.");
    }
    const extractedText = sanitizeResumeText(await extractResumeText(buffer));
    if (extractedText.length < 250) {
      return Response.json({
        success: false,
        code: "UNREADABLE_RESUME" satisfies ResumeAnalyzeErrorCode,
        message: "We could not read enough text from this PDF. Please upload a text-based resume PDF.",
      }, { status: 422 });
    }

    const validation = await validateResumeDocument(extractedText);
    if (!validation.isResume || validation.confidence < 70) {
      return Response.json({
        success: false,
        code: "NOT_A_RESUME" satisfies ResumeAnalyzeErrorCode,
        message: "The uploaded document does not appear to be a resume. Please upload a valid resume or CV.",
        validation: {
          confidence: validation.confidence,
          reason: validation.reason,
          detectedSections: validation.detectedSections,
        },
      }, { status: 422 });
    }

    const analysis = await analyzeResumeText(extractedText);
    const questions = await generateResumeInterviewQuestions(analysis, {
      amount: 6,
      type: "Technical",
      difficulty: "Medium",
    });
    const resumeUrl = await saveUploadedResume(buffer, user.id);

    const document = await db.collection("resumeAnalysis").add({
      userId: user.id,
      resumeUrl,
      extractedText,
      analysis,
      validation,
      uploadedAt: new Date().toISOString(),
    });

    return Response.json({ success: true, analysis, questions, resumeUrl, documentId: document.id });
  } catch (error) {
    console.error("Resume analysis failed", error);
    return Response.json({ success: false, code: "ANALYSIS_FAILED" satisfies ResumeAnalyzeErrorCode, message: "Unable to analyze the resume right now." }, { status: 500 });
  }
}
