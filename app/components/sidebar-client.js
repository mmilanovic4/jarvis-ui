"use client";
import { ChevronDown, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useAppContext } from "@/app/context/app-context";
import { uuid } from "@/app/lib/uuid";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
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

function RenameDialog({
  renameConv,
  setRenameConv,
  renameTitle,
  setRenameTitle,
  handleRenameSubmit,
}) {
  return (
    <Dialog
      open={!!renameConv}
      onOpenChange={(open) => !open && setRenameConv(null)}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename conversation</DialogTitle>
          <DialogDescription>
            Enter a new name for this conversation.
          </DialogDescription>
        </DialogHeader>
        <Input
          autoFocus
          value={renameTitle}
          onChange={(e) => setRenameTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleRenameSubmit();
            if (e.key === "Escape") setRenameConv(null);
          }}
          placeholder="Conversation name"
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => setRenameConv(null)}>
            Cancel
          </Button>
          <Button onClick={handleRenameSubmit}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DeleteDialog({ deleteConv, setDeleteConv, handleDeleteConfirm }) {
  return (
    <AlertDialog
      open={!!deleteConv}
      onOpenChange={(open) => !open && setDeleteConv(null)}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete conversation?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete &quot;{deleteConv?.title}&quot; and all
            its messages. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={handleDeleteConfirm}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

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
  const [renameConv, setRenameConv] = useState(null);
  const [renameTitle, setRenameTitle] = useState("");
  const [deleteConv, setDeleteConv] = useState(null);

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

  function handleRenameOpen(conv) {
    setRenameConv(conv);
    setRenameTitle(conv.title ?? "");
  }

  async function handleRenameSubmit() {
    if (!renameTitle.trim() || !renameConv) return;

    setConversations((prev) =>
      prev.map((c) =>
        c.id === renameConv.id ? { ...c, title: renameTitle.trim() } : c,
      ),
    );
    setRenameConv(null);

    await fetch("/api/conversations", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: renameConv.id, title: renameTitle.trim() }),
    });
  }

  async function handleDeleteConfirm() {
    if (!deleteConv) return;

    setConversations((prev) => prev.filter((c) => c.id !== deleteConv.id));
    if (selectedConversation?.id === deleteConv.id) {
      setSelectedConversation(null);
    }
    setDeleteConv(null);

    await fetch("/api/conversations", {
      method: "DELETE",
      body: JSON.stringify({ id: deleteConv.id }),
    });
  }

  return (
    <>
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
                  <ContextMenu key={conversation.id}>
                    <ContextMenuTrigger>
                      <SidebarMenuItem>
                        {isActive ? (
                          <SidebarMenuButton
                            isActive
                            onClick={() =>
                              handleSelectConversation(conversation)
                            }
                          >
                            {conversation.title ?? conversation.id}
                          </SidebarMenuButton>
                        ) : (
                          <button
                            onClick={() =>
                              handleSelectConversation(conversation)
                            }
                            className="text-muted-foreground hover:text-foreground w-full cursor-pointer truncate px-2 py-1.5 text-left text-sm transition-colors"
                          >
                            {conversation.title ?? conversation.id}
                          </button>
                        )}
                      </SidebarMenuItem>
                    </ContextMenuTrigger>
                    <ContextMenuContent>
                      <ContextMenuItem
                        onClick={() => handleRenameOpen(conversation)}
                      >
                        Rename
                      </ContextMenuItem>
                      <ContextMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => setDeleteConv(conversation)}
                      >
                        Delete
                      </ContextMenuItem>
                    </ContextMenuContent>
                  </ContextMenu>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="border-sidebar-border border-t">
          <Button
            variant="outline"
            className="w-full cursor-pointer"
            onClick={handleNewConversation}
          >
            <Plus />
            New Chat
          </Button>
        </SidebarFooter>
      </Sidebar>

      <RenameDialog
        renameConv={renameConv}
        setRenameConv={setRenameConv}
        renameTitle={renameTitle}
        setRenameTitle={setRenameTitle}
        handleRenameSubmit={handleRenameSubmit}
      />

      <DeleteDialog
        deleteConv={deleteConv}
        setDeleteConv={setDeleteConv}
        handleDeleteConfirm={handleDeleteConfirm}
      />
    </>
  );
}
