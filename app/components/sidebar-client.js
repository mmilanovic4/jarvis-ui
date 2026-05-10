"use client";
import { useEffect, useState } from "react";
import { useAppContext } from "@/app/context/app-context";
import { uuid } from "@/app/lib/uuid";

export default function SidebarClient() {
  const {
    status,
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
        fetch("/api/model"),
        fetch("/api/conversation"),
      ]);

      const modelsJson = await modelsRes.json();
      setModels(modelsJson.models);
      setSelectedModel(modelsJson.models[0]);

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
    return <div className="p-4 text-xs text-[#4a4a60]">Ollama offline</div>;
  }

  if (modelsLoading) {
    return <div className="p-4 text-xs text-[#4a4a60]">...</div>;
  }

  return (
    <div className="flex flex-1 flex-col gap-1 overflow-hidden p-2">
      <select
        className="mb-2 w-full cursor-pointer appearance-none rounded-lg border border-[#2a2a35] bg-[#1a1a22] px-3 py-2 font-sans text-xs text-[#a09fbe]"
        value={selectedModel ?? ""}
        onChange={(e) => setSelectedModel(e.target.value)}
      >
        {models.map((model) => (
          <option key={model} value={model}>
            {model}
          </option>
        ))}
      </select>

      <span className="px-1.5 py-1 text-[10px] tracking-widest text-[#4a4a60] uppercase">
        Conversations
      </span>

      <div className="flex flex-1 flex-col gap-0.5 overflow-y-auto">
        {conversations.map((conv) => (
          <div
            key={conv.id}
            onClick={() => setSelectedConversation(conv)}
            className={`cursor-pointer truncate rounded-lg px-2.5 py-2 text-xs transition-colors duration-150 ${
              selectedConversation?.id === conv.id
                ? "border border-[#3a3850] bg-[#1e1d2e] text-[#afa9ec]"
                : "text-[#6b6a88] hover:bg-[#161620] hover:text-[#8a89a8]"
            }`}
          >
            {conv.title ?? conv.id}
          </div>
        ))}
      </div>

      <button
        onClick={handleNewConversation}
        className="mt-2 w-full cursor-pointer rounded-lg border border-[#534ab7] bg-transparent px-3 py-2 text-left font-sans text-xs text-[#afa9ec] transition-colors duration-150 hover:bg-[#1e1d2e]"
      >
        + New conversation
      </button>
    </div>
  );
}
