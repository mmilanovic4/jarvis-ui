"use client";
import { ChevronDown, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useAppContext } from "@/app/context/app-context";
import { uuid } from "@/app/lib/uuid";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function SidebarClient() {
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

  function handleSelectConversation(conv) {
    setSelectedConversation(conv);
  }

  return (
    <Sidebar>
      <SidebarHeader className="border-sidebar-border border-b">
        <div className="flex items-center gap-2 px-2 py-1">
          <div className="bg-primary h-2 w-2 shrink-0 rounded-full" />
          <span className="text-sm font-semibold tracking-widest uppercase">
            Jarvis
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton disabled={!models.length}>
                    {selectedModel ?? "Select model"}
                    <ChevronDown className="ml-auto" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[--radix-popper-anchor-width]">
                  {models.map((model) => (
                    <DropdownMenuItem
                      key={model}
                      onClick={() => setSelectedModel(model)}
                    >
                      {model}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Conversations</SidebarGroupLabel>
          <SidebarMenu>
            {conversations.map((conversation) => {
              const isActive = selectedConversation?.id === conversation.id;
              return (
                <SidebarMenuItem key={conversation.id}>
                  {isActive ? (
                    <SidebarMenuButton
                      isActive
                      onClick={() => handleSelectConversation(conversation)}
                    >
                      {conversation.title ?? conversation.id}
                    </SidebarMenuButton>
                  ) : (
                    <button
                      onClick={() => handleSelectConversation(conversation)}
                      className="text-muted-foreground hover:text-foreground w-full cursor-pointer truncate px-2 py-1.5 text-left text-sm transition-colors"
                    >
                      {conversation.title ?? conversation.id}
                    </button>
                  )}
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-sidebar-border border-t">
        <Button
          variant="outline"
          className="w-full"
          onClick={handleNewConversation}
        >
          <Plus />
          New Chat
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
