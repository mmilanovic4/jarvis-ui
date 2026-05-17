import {
  getConversation,
  getMessages,
  createMessage,
} from "@/app/lib/database";
import { chat } from "@/app/lib/ollama";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const conversationId = searchParams.get("conversationId");

  if (!conversationId) {
    return Response.json(
      { error: "conversationId is required" },
      { status: 400 },
    );
  }

  const messages = getMessages(conversationId);
  return Response.json({ messages });
}

export async function POST(req) {
  const { conversationId, content } = await req.json();

  if (!conversationId) {
    return Response.json(
      { error: "conversationId is required" },
      { status: 400 },
    );
  }

  const conv = getConversation(conversationId);

  if (!conv) {
    return Response.json({ error: "Conversation not found" }, { status: 400 });
  }

  const history = getMessages(conversationId);
  createMessage(conversationId, "user", content);

  const messages = [
    ...history.map((m) => ({ role: m.role, content: m.content })),
    { role: "user", content },
  ];

  const response = await chat(conv.model, messages);
  createMessage(conversationId, "assistant", response);

  return Response.json({ message: response, title: conv.title });
}
