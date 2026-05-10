"use client";
import { createContext, useContext, useState, useEffect } from "react";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [status, setStatus] = useState(false);
  const [selectedModel, setSelectedModel] = useState(null);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    async function init() {
      const res = await fetch("/api/health");
      const json = await res.json();
      setStatus(Boolean(json.status));
    }

    init();
  }, []);

  return (
    <AppContext.Provider
      value={{
        status,
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
