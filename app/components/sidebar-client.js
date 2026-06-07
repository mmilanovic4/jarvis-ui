"use client";
import { Plus } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

function ConversationDialog({
  open,
  onOpenChange,
  mode,
  title,
  setTitle,
  model,
  setModel,
  models,
  onSubmit,
  loading,
}) {
  const isCreate = mode === "create";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isCreate ? "New conversation" : "Edit conversation"}
          </DialogTitle>
          <DialogDescription>
            {isCreate
              ? "Choose a title and model for your new conversation."
              : "Update the title of this conversation."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Title</label>
            <Input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") onSubmit();
              }}
              placeholder="Conversation title"
              disabled={loading}
            />
          </div>

          {isCreate && (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Model</label>
              <Select value={model} onValueChange={setModel} disabled={loading}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  {models.map((m) => (
                    <SelectItem key={m} value={m} className="px-3 py-2.5">
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            className="sm:order-2"
            onClick={onSubmit}
            disabled={loading || !title.trim() || (isCreate && !model)}
          >
            {loading ? "Saving..." : "Save"}
          </Button>
          <Button
            className="sm:order-1"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DeleteDialog({
  deleteConv,
  setDeleteConv,
  handleDeleteConfirm,
  loading,
}) {
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
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={handleDeleteConfirm}
            disabled={loading}
          >
            {loading ? "Deleting..." : "Delete"}
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
    models,
    setModels,
    selectedConversation,
    setSelectedConversation,
    conversations,
    setConversations,
  } = useAppContext();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState("create");
  const [dialogConv, setDialogConv] = useState(null);
  const [dialogTitle, setDialogTitle] = useState("New conversation");
  const [dialogModel, setDialogModel] = useState("");
  const [dialogLoading, setDialogLoading] = useState(false);
  const [deleteConv, setDeleteConv] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (!status) return;

    async function init() {
      const [modelsRes, convsRes] = await Promise.all([
        fetch("/api/models"),
        fetch("/api/conversations"),
      ]);

      const modelsJson = await modelsRes.json();
      setModels(modelsJson.models);
      if (modelsJson.models.length === 0) {
        setError("No models found. Run `ollama pull llama3` to get started.");
      }

      const convsJson = await convsRes.json();
      setConversations(convsJson.conversations);
    }

    init();
  }, [status]);

  function openCreateDialog() {
    setDialogMode("create");
    setDialogConv(null);
    setDialogTitle("New conversation");
    setDialogModel(models[0] ?? "");
    setDialogOpen(true);
  }

  function openEditDialog(conv) {
    setDialogMode("edit");
    setDialogConv(conv);
    setDialogTitle(conv.title ?? "");
    setDialogModel("");
    setDialogOpen(true);
  }

  async function handleDialogSubmit() {
    if (!dialogTitle.trim()) return;

    setDialogLoading(true);

    if (dialogMode === "create") {
      const id = uuid();
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          model: dialogModel,
          title: dialogTitle.trim(),
        }),
      });
      const data = await res.json();
      const conv = {
        id: data.id,
        model: dialogModel,
        title: dialogTitle.trim(),
      };
      setConversations((prev) => [conv, ...prev]);
      setSelectedConversation(conv);
    } else {
      await fetch("/api/conversations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: dialogConv.id, title: dialogTitle.trim() }),
      });
      setConversations((prev) =>
        prev.map((c) =>
          c.id === dialogConv.id ? { ...c, title: dialogTitle.trim() } : c,
        ),
      );
    }

    setDialogLoading(false);
    setDialogOpen(false);
  }

  async function handleDeleteConfirm() {
    if (!deleteConv) return;

    setDeleteLoading(true);
    await fetch("/api/conversations", {
      method: "DELETE",
      body: JSON.stringify({ id: deleteConv.id }),
    });

    setConversations((prev) => prev.filter((c) => c.id !== deleteConv.id));
    if (selectedConversation?.id === deleteConv.id) {
      setSelectedConversation(null);
    }
    setDeleteLoading(false);
    setDeleteConv(null);
  }

  return (
    <>
      <Sidebar>
        <SidebarHeader className="border-b">
          <div className="flex h-8 items-center gap-2 px-4">
            <div className="bg-primary h-2 w-2 shrink-0 rounded-full" />
            <span className="text-sm font-semibold tracking-widest uppercase select-none">
              Iskra
            </span>
          </div>
        </SidebarHeader>

        <SidebarContent>
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
                              setSelectedConversation(conversation)
                            }
                          >
                            {conversation.title ?? conversation.id}
                          </SidebarMenuButton>
                        ) : (
                          <button
                            onClick={() =>
                              setSelectedConversation(conversation)
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
                        onClick={() => openEditDialog(conversation)}
                      >
                        Edit
                      </ContextMenuItem>
                      <ContextMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => {
                          setDeleteConv(conversation);
                          if (conversation.id === selectedConversation) {
                            setSelectedConversation(null);
                          }
                        }}
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

        <SidebarFooter className="border-t">
          <Button
            disabled={!status || !models.length}
            className="w-full cursor-pointer"
            onClick={openCreateDialog}
          >
            <Plus />
            New Chat
          </Button>
        </SidebarFooter>
      </Sidebar>

      <ConversationDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={dialogMode}
        title={dialogTitle}
        setTitle={setDialogTitle}
        model={dialogModel}
        setModel={setDialogModel}
        models={models}
        onSubmit={handleDialogSubmit}
        loading={dialogLoading}
      />

      <DeleteDialog
        deleteConv={deleteConv}
        setDeleteConv={setDeleteConv}
        handleDeleteConfirm={handleDeleteConfirm}
        loading={deleteLoading}
      />
    </>
  );
}
