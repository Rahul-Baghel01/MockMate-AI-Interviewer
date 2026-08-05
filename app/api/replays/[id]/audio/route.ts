import { getInterviewReplay } from "@/lib/replay";
import { storage } from "@/firebase/admin";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const replay = await getInterviewReplay(id);
  if (!replay) return new Response("Not found", { status: 404 });
  if (!replay.storagePath) return new Response("Audio unavailable", { status: 404 });
  const [bytes] = await storage.bucket().file(replay.storagePath).download();
  return new Response(bytes, { headers: { "Content-Type": "audio/webm", "Content-Length": String(bytes.length), "Cache-Control": "private, max-age=300", "Accept-Ranges": "bytes" } });
}
