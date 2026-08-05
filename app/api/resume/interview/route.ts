import { getCurrentUser } from "@/lib/actions/auth.action";
import { db } from "@/firebase/admin";
import { buildResumeContext, generateResumeInterviewQuestions } from "@/lib/resume";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const payload = await request.json();
    const querySnapshot = await db.collection("resumeAnalysis").where("userId", "==", user.id).get();

    if (querySnapshot.empty) {
      return Response.json({ success: false, error: "No resume analysis found." }, { status: 400 });
    }

    const latestDocument = querySnapshot.docs
      .map((document): Record<string, unknown> & { id: string } => ({ id: document.id, ...document.data() }))
      .filter((document) => {
        const validation = document.validation as ResumeValidationResult | undefined;
        return validation?.isResume === true && validation.confidence >= 70;
      })
      .sort((left, right) => String((right as { uploadedAt?: string }).uploadedAt ?? "").localeCompare(String((left as { uploadedAt?: string }).uploadedAt ?? "")))[0] as { id: string; analysis?: ResumeAnalysis; uploadedAt?: string } | undefined;
    const resumeAnalysis = latestDocument;
    if (!resumeAnalysis?.analysis) {
      return Response.json({ success: false, error: "No resume analysis found." }, { status: 400 });
    }

    const questions = await generateResumeInterviewQuestions(resumeAnalysis.analysis, {
      amount: payload.amount || 10,
      type: payload.type || "Technical",
      difficulty: payload.difficulty || "Medium",
    });

    const interview = {
      role: resumeAnalysis.analysis.name || "Resume-based interview",
      level: payload.level || "Mid",
      techstack: [
        ...(resumeAnalysis.analysis.skills || []).slice(0, 6),
        ...(resumeAnalysis.analysis.frameworks || []).slice(0, 4),
      ],
      questions,
      userId: user.id,
      finalized: true,
      coverImage: "/covers/spotify.png",
      createdAt: new Date().toISOString(),
      type: payload.type || "Technical",
      resumeContext: buildResumeContext(resumeAnalysis.analysis),
    };

    const document = await db.collection("interviews").add(interview);
    return Response.json({ success: true, interviewId: document.id, questions });
  } catch (error) {
    console.error("Resume interview generation failed", error);
    return Response.json({ success: false, error: "Unable to generate the interview." }, { status: 500 });
  }
}
