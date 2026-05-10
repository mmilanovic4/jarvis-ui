"use client";
import { useEffect, useRef, useState } from "react";
import { useAppContext } from "@/app/context/app-context";

export default function Home() {
  const { error, selectedConversation, selectedModel, setConversations } =
    useAppContext();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    async function loadMessages() {
      if (!selectedConversation) {
        setMessages([]);
        return;
      }

      const res = await fetch(
        `/api/messages?conversationId=${selectedConversation.id}`,
      );
      const json = await res.json();
      setMessages(json.messages ?? []);
    }

    loadMessages();
  }, [selectedConversation]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  async function sendMessage() {
    if (!input.trim() || sending || !selectedConversation) return;

    const content = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content }]);
    setSending(true);

    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        conversationId: selectedConversation.id,
        content,
        model: selectedModel,
      }),
    });

    const data = await res.json();
    setMessages((prev) => [
      ...prev,
      { role: "assistant", content: data.message },
    ]);
    setConversations((prev) =>
      prev.map((c) =>
        c.id === selectedConversation.id ? { ...c, title: data.title } : c,
      ),
    );
    setSending(false);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  if (error) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3">
        <p className="text-muted text-xs tracking-widest uppercase">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Messages */}
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-[10%] py-8">
        {!selectedConversation ? (
          <div className="mt-[20vh] flex h-full flex-1 flex-col items-center justify-center gap-4">
            <span className="text-4xl">✦</span>
            <h2 className="text-bright text-2xl font-semibold tracking-tight">
              How can I help you?
            </h2>
            <p className="text-muted text-xs tracking-widest uppercase">
              Local · Private · Offline
            </p>
          </div>
        ) : messages.length === 0 && !sending ? (
          <div className="mt-[20vh] flex h-full flex-1 flex-col items-center justify-center gap-2">
            <p className="text-muted text-xs">Start the conversation...</p>
          </div>
        ) : (
          messages.map((m, i) => (
            <div
              key={i}
              className={`flex items-start gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${
                  m.role === "user"
                    ? "bg-accent-dim text-accent-text"
                    : "text-accent-light border-accent bg-surface-4 border"
                }`}
              >
                {m.role === "user" ? "Y" : "J"}
              </div>
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "text-accent-text bg-surface-4 border-line-2 rounded-tr-sm border"
                    : "text-soft rounded-tl-sm"
                }`}
              >
                {m.content.split("\n").map((line, j, arr) => (
                  <span key={j}>
                    {line}
                    {j < arr.length - 1 && <br />}
                  </span>
                ))}
              </div>
            </div>
          ))
        )}

        {sending && (
          <div className="flex items-start gap-3">
            <div className="text-accent-light border-accent bg-surface-4 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold">
              J
            </div>
            <div className="flex items-center gap-1.5 px-4 py-3">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="bg-accent h-1.5 w-1.5 animate-bounce rounded-full"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-line border-t px-[10%] py-4">
        <div className="border-line bg-surface-2 flex items-end gap-2 rounded-2xl border px-4 py-3">
          <textarea
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height =
                Math.min(e.target.scrollHeight, 200) + "px";
            }}
            onKeyDown={handleKeyDown}
            placeholder={
              selectedConversation
                ? "Message Jarvis... (Shift+Enter for new line)"
                : "Select or create a conversation first"
            }
            disabled={sending || !selectedConversation}
            rows={1}
            className="text-soft placeholder-muted max-h-50 flex-1 resize-none overflow-y-auto border-none bg-transparent font-sans text-sm leading-relaxed outline-none disabled:opacity-50"
          />
          <button
            onClick={sendMessage}
            disabled={sending || !input.trim() || !selectedConversation}
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-base font-bold transition-colors duration-150 ${
              sending || !input.trim() || !selectedConversation
                ? "text-muted bg-line cursor-not-allowed"
                : "text-bright bg-accent hover:bg-accent-hover cursor-pointer"
            }`}
          >
            ↑
          </button>
        </div>
        <p className="text-line mt-2 text-center text-[10px] tracking-widest uppercase">
          {selectedModel ?? "No model selected"} · Local
        </p>
      </div>
    </div>
  );
}
