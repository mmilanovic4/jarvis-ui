import {
  deleteConversation,
  getConversations,
  updateConversationTitle,
} from "@/app/lib/database";

export async function GET() {
  const conversations = getConversations();
  return Response.json({ conversations });
}

export async function PATCH(req, { params }) {
  const { title } = await req.json();
  updateConversationTitle(params.id, title);
  return Response.json({ ok: true });
}

export async function DELETE(req, { params }) {
  deleteConversation(params.id);
  return Response.json({ ok: true });
}
