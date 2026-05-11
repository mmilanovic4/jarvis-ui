import {
  deleteConversation,
  getConversations,
  updateConversationTitle,
} from "@/app/lib/database";

export async function GET() {
  const conversations = getConversations();
  return Response.json({ conversations });
}

export async function PATCH(req) {
  const { id, title } = await req.json();
  updateConversationTitle(id, title);
  return Response.json({ ok: true });
}

export async function DELETE(req) {
  const { id } = await req.json();
  deleteConversation(id);
  return Response.json({ ok: true });
}
