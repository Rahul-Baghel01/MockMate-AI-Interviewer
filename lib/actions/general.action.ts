"use server";

import { generateObject } from "ai";
import { groq } from "@ai-sdk/groq";

import { db } from "@/firebase/admin";
import { feedbackSchema } from "@/constants";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { attachFeedbackToReplay } from "@/lib/replay";

export async function createFeedback({ interviewId, transcript, feedbackId }: CreateFeedbackParams) {
  try {
    const user = await getCurrentUser();
    if (!user || transcript.length === 0) return { success: false };

    const formattedTranscript = transcript
      .map(({ role, content }) => `- ${role}: ${content}`)
      .join("\n");

    const { object } = await generateObject({
      model: groq("llama-3.3-70b-versatile"),
      schema: feedbackSchema,
      system: "You are a professional interviewer who provides candid, constructive interview feedback.",
      prompt: `Evaluate this mock interview transcript. Score every category from 0 to 100, provide specific comments, strengths, areas for improvement, and a final assessment. Also create a realistic four-week personalized study plan. Estimate speaking pace, filler words (um, uh, like, actually, basically), confidence, and grammar strictly from the transcript; state uncertainty in notes rather than inventing audio observations.\n\nTranscript:\n${formattedTranscript}`,
    });

    const feedback = {
      interviewId,
      userId: user.id,
      totalScore: object.totalScore,
      categoryScores: object.categoryScores,
      strengths: object.strengths,
      areasForImprovement: object.areasForImprovement,
      finalAssessment: object.finalAssessment,
      studyPlan: object.studyPlan,
      speakingCoach: object.speakingCoach,
      createdAt: new Date().toISOString(),
    };
    const feedbackRef = feedbackId ? db.collection("feedback").doc(feedbackId) : db.collection("feedback").doc();

    await feedbackRef.set(feedback);
    await attachFeedbackToReplay(interviewId, feedback);
    return { success: true, feedbackId: feedbackRef.id };
  } catch {
    return { success: false };
  }
}

export async function getInterviewById(id: string): Promise<Interview | null> {
  const interview = await db.collection("interviews").doc(id).get();
  return interview.exists ? ({ id: interview.id, ...interview.data() } as Interview) : null;
}

export async function getFeedbackByInterviewId({ interviewId, userId }: GetFeedbackByInterviewIdParams): Promise<Feedback | null> {
  const querySnapshot = await db.collection("feedback").where("interviewId", "==", interviewId).where("userId", "==", userId).limit(1).get();
  if (querySnapshot.empty) return null;
  const feedbackDoc = querySnapshot.docs[0];
  return { id: feedbackDoc.id, ...feedbackDoc.data() } as Feedback;
}

export async function getLatestInterviews({ userId, limit = 20 }: GetLatestInterviewsParams): Promise<Interview[]> {
  const interviews = await db.collection("interviews").where("finalized", "==", true).get();

  return interviews.docs
    .filter((document) => document.data().userId !== userId)
    .map((document) => ({ id: document.id, ...document.data() }) as Interview)
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
    .slice(0, limit);
}

export async function getInterviewsByUserId(userId: string): Promise<Interview[]> {
  const interviews = await db.collection("interviews").where("userId", "==", userId).get();

  return interviews.docs
    .map((document) => ({ id: document.id, ...document.data() }) as Interview)
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}
