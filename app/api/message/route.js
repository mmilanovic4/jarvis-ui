import {
  getConversation,
  createConversation,
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
  const { conversationId, content, model } = await req.json();

  if (!conversationId) {
    return Response.json(
      { error: "conversationId is required" },
      { status: 400 },
    );
  }

  let conv = getConversation(conversationId);

  if (!conv) {
    createConversation(model, content.slice(0, 50), conversationId);
    conv = getConversation(conversationId);
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
