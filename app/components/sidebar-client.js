"use client";
import { useEffect, useState } from "react";
import { useAppContext } from "@/app/context/app-context";
import { uuid } from "@/app/lib/uuid";

export default function SidebarClient() {
  const {
    status,
    setError,
    selectedModel,
    setSelectedModel,
    selectedConversation,
    setSelectedConversation,
    conversations,
    setConversations,
  } = useAppContext();
  const [models, setModels] = useState([]);
  const [modelsLoading, setModelsLoading] = useState(true);

  useEffect(() => {
    if (!status) return;

    async function init() {
      const [modelsRes, convsRes] = await Promise.all([
        fetch("/api/models"),
        fetch("/api/conversations"),
      ]);

      const modelsJson = await modelsRes.json();
      setModels(modelsJson.models);
      setSelectedModel(modelsJson.models[0]);
      if (modelsJson.models.length === 0) {
        setError("No models found. Run `ollama pull llama3` to get started.");
      }

      const convsJson = await convsRes.json();
      setConversations(convsJson.conversations);

      setModelsLoading(false);
    }

    init();
  }, [status]);

  function handleNewConversation() {
    const id = uuid();
    const conv = { id, title: "New conversation" };
    setConversations((prev) => [conv, ...prev]);
    setSelectedConversation(conv);
  }

  if (!status) {
    return <div className="text-muted p-4 text-xs">Ollama offline</div>;
  }

  if (modelsLoading) {
    return <div className="text-muted p-4 text-xs">...</div>;
  }

  return (
    <div className="flex flex-1 flex-col gap-1 overflow-hidden p-2">
      <select
        className="border-line bg-surface-3 mb-2 w-full cursor-pointer appearance-none rounded-lg border px-3 py-2 font-sans text-xs text-[#a09fbe]"
        value={selectedModel ?? ""}
        onChange={(e) => setSelectedModel(e.target.value)}
      >
        {models.map((model) => (
          <option key={model} value={model}>
            {model}
          </option>
        ))}
      </select>

      <span className="text-muted px-1.5 py-1 text-[10px] tracking-widest uppercase">
        Conversations
      </span>

      <div className="flex flex-1 flex-col gap-0.5 overflow-y-auto">
        {conversations.map((conv) => (
          <div
            key={conv.id}
            onClick={() => setSelectedConversation(conv)}
            className={`cursor-pointer truncate rounded-lg px-2.5 py-2 text-xs transition-colors duration-150 ${
              selectedConversation?.id === conv.id
                ? "text-accent-light bg-surface-4 border-line-2 border"
                : "hover:bg-surface-2 text-subtle hover:text-dim"
            }`}
          >
            {conv.title ?? conv.id}
          </div>
        ))}
      </div>

      <button
        onClick={handleNewConversation}
        className="text-accent-light border-accent hover:bg-surface-4 mt-2 w-full cursor-pointer rounded-lg border bg-transparent px-3 py-2 text-left font-sans text-xs transition-colors duration-150"
      >
        + New conversation
      </button>
    </div>
  );
}
