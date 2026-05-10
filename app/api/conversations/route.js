import { getConversations } from "@/app/lib/database";

export async function GET() {
  const conversations = getConversations();
  return Response.json({ conversations });
}
