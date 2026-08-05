"use server";

import { db, storage } from "@/firebase/admin";
import { getCurrentUser } from "@/lib/actions/auth.action";

type SaveReplayInput = Omit<InterviewReplay, "id" | "userId" | "storagePath">;
const replayId = (userId: string, interviewId: string) => `${userId}_${interviewId}`;

async function storeRecording(url: string, userId: string, interviewId: string) {
  const response = await fetch(url);
  if (!response.ok) throw new Error("Recording download failed");
  const path = `interviews/${userId}/${interviewId}.webm`;
  await storage.bucket().file(path).save(Buffer.from(await response.arrayBuffer()), { resumable: false, metadata: { contentType: response.headers.get("content-type") || "audio/webm" } });
  return path;
}

export async function saveInterviewReplay(input: SaveReplayInput) {
  const user = await getCurrentUser();
  if (!user || !input.interviewId) return { success: false };
  try {
    const ref = db.collection("interviewReplays").doc(replayId(user.id, input.interviewId));
    let storagePath: string | undefined;
    if (input.recordingUrl) {
      try { storagePath = await storeRecording(input.recordingUrl, user.id, input.interviewId); } catch (error) { console.error("Replay audio copy failed", error); }
    }
    const payload = Object.fromEntries(Object.entries({ ...input, recordingUrl: undefined, storagePath }).filter(([, value]) => value !== undefined));
    await ref.set({ ...payload, userId: user.id, updatedAt: new Date().toISOString() }, { merge: true });
    return { success: true, replayId: ref.id };
  } catch (error) { console.error("Replay save failed", error); return { success: false }; }
}

export async function getInterviewReplay(interviewId: string): Promise<InterviewReplay | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  const snapshot = await db.collection("interviewReplays").doc(replayId(user.id, interviewId)).get();
  if (!snapshot.exists || snapshot.data()?.userId !== user.id) return null;
  const replay = { id: snapshot.id, ...snapshot.data() } as InterviewReplay;
  if (!replay.storagePath && replay.vapiCallId && process.env.VAPI_API_KEY) {
    try {
      const response = await fetch(`https://api.vapi.ai/call/${encodeURIComponent(replay.vapiCallId)}`, { headers: { Authorization: `Bearer ${process.env.VAPI_API_KEY}` }, cache: "no-store" });
      if (response.ok) {
        const call = await response.json() as { artifact?: { stereoRecordingUrl?: string; recordingUrl?: string }; recordingUrl?: string };
        const sourceUrl = call.artifact?.stereoRecordingUrl || call.artifact?.recordingUrl || call.recordingUrl;
        if (sourceUrl) {
          replay.storagePath = await storeRecording(sourceUrl, user.id, interviewId);
          await snapshot.ref.set({ storagePath: replay.storagePath, updatedAt: new Date().toISOString() }, { merge: true });
        }
      }
    } catch (error) { console.error("Delayed replay audio recovery failed", error); }
  }
  replay.recordingUrl = replay.storagePath ? `/api/replays/${interviewId}/audio` : undefined;
  return replay;
}

export async function attachFeedbackToReplay(interviewId: string, feedback: Record<string, unknown>) {
  const user = await getCurrentUser();
  if (!user) return;
  await db.collection("interviewReplays").doc(replayId(user.id, interviewId)).set({ feedback, score: feedback.totalScore, updatedAt: new Date().toISOString() }, { merge: true });
}
