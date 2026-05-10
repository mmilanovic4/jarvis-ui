"use client";
import { createContext, useContext, useState, useEffect } from "react";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [status, setStatus] = useState(false);
  const [error, setError] = useState(null);
  const [selectedModel, setSelectedModel] = useState(null);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    async function init() {
      const res = await fetch("/api/health");
      const json = await res.json();
      const online = Boolean(json.status);
      setStatus(online);

      if (!online) {
        setError("Ollama is offline. Please start Ollama and refresh.");
      }
    }

    init();
  }, []);

  return (
    <AppContext.Provider
      value={{
        status,
        error,
        setError,
        selectedModel,
        setSelectedModel,
        selectedConversation,
        setSelectedConversation,
        conversations,
        setConversations,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}
