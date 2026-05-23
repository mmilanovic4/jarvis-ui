"use client";
import {
  ArrowUp,
  ChevronDown,
  ChevronUp,
  HomeIcon,
  Mic,
  Search,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import { toast } from "sonner";
import { useAppContext } from "@/app/context/app-context";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./components/theme-toggle";

export default function Home() {
  const {
    status,
    error,
    models,
    selectedConversation,
    setSelectedConversation,
    setConversations,
  } = useAppContext();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [listening, setListening] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [matchIndex, setMatchIndex] = useState(0);
  const bottomRef = useRef(null);
  const scrollRef = useRef(null);
  const textareaRef = useRef(null);
  const recognitionRef = useRef(null);
  const matchRefs = useRef({});

  const modelAvailable = models.includes(selectedConversation?.model);
  const inputDisabled = sending || !selectedConversation || !modelAvailable;

  const matchingIndices = query.trim()
    ? messages
        .map((m, i) => ({ m, i }))
        .filter(({ m }) =>
          m.content.toLowerCase().includes(query.toLowerCase()),
        )
        .map(({ i }) => i)
    : [];

  const onKeyDown = useCallback(
    (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "f") {
        e.preventDefault();
        if (!selectedConversation) return;
        setSearchOpen((x) => !x);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
      }
    },
    [selectedConversation],
  );

  useEffect(() => {
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onKeyDown]);

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

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [selectedConversation]);

  useEffect(() => {
    const resetMatch = () => setMatchIndex(0);
    resetMatch();
    if (!query.trim() || matchingIndices.length === 0) return;
    matchRefs.current[matchingIndices[0]]?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, [query]);

  function goToMatch(index) {
    const clamped = (index + matchingIndices.length) % matchingIndices.length;
    setMatchIndex(clamped);
    matchRefs.current[matchingIndices[clamped]]?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }

  async function sendMessage() {
    if (!input.trim() || sending || !selectedConversation) return;

    const content = input.trim();
    setInput("");

    setMessages((prev) => [...prev, { role: "user", content }]);

    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setSending(true);

    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        conversationId: selectedConversation.id,
        content,
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

  function toggleVoice() {
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.error("Your browser doesn't support voice input.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onresult = (e) => {
      const transcript = e.results[e.results.length - 1][0].transcript;
      setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
    };

    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }

  if (error) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2">
        <p className="text-muted-foreground text-center text-xs tracking-widest uppercase">
          {error}
        </p>
      </div>
    );
  }

  if (!status) return null;

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
      <div className="flex shrink-0 items-center justify-end border-b px-4 py-2">
        <div className="mr-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setSearchOpen(false);
              setQuery("");
              setSelectedConversation(null);
            }}
          >
            <HomeIcon className="h-4 w-4" />
          </Button>
        </div>
        <Button
          variant="ghost"
          size="icon"
          disabled={!selectedConversation}
          onClick={() => setSearchOpen((x) => !x)}
        >
          <Search className="h-4 w-4" />
        </Button>
        <ThemeToggle />
        <SidebarTrigger />
      </div>

      {searchOpen && (
        <div className="bg-background flex items-center gap-2 border-b px-4 py-2">
          <Search className="text-muted-foreground h-4 w-4 shrink-0" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search this conversation... (esc to close)"
            className="placeholder:text-muted-foreground flex-1 bg-transparent text-sm outline-none"
          />
          {query && (
            <>
              <span className="text-muted-foreground text-xs">
                {matchingIndices.length > 0
                  ? `${matchIndex + 1} / ${matchingIndices.length}`
                  : "0 results"}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                disabled={matchingIndices.length === 0}
                onClick={() => goToMatch(matchIndex - 1)}
              >
                <ChevronUp className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                disabled={matchingIndices.length === 0}
                onClick={() => goToMatch(matchIndex + 1)}
              >
                <ChevronDown className="h-3 w-3" />
              </Button>
            </>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => {
              setSearchOpen(false);
              setQuery("");
            }}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-2xl px-4 py-12">
          {!selectedConversation ? (
            <div className="flex flex-col items-center justify-center gap-3 pt-[25vh] text-center">
              <span className="text-4xl">✦</span>
              <h2 className="text-foreground text-2xl font-semibold tracking-tight">
                How can I help you?
              </h2>
              <p className="text-muted-foreground text-xs tracking-widest uppercase">
                Local · Private · Offline
              </p>
            </div>
          ) : messages.length === 0 && !sending ? (
            <div className="flex flex-col items-center justify-center pt-[25vh]">
              <p className="text-muted-foreground text-xs">
                Start the conversation...
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {messages.map((m, i) => (
                <div
                  key={i}
                  ref={(el) => (matchRefs.current[i] = el)}
                  className={cn(
                    "flex items-start gap-3 rounded-xl transition-colors duration-300",
                    m.role === "user" && "flex-row-reverse",
                    matchingIndices.includes(i) &&
                      (i === matchingIndices[matchIndex]
                        ? "bg-primary/10 outline-primary/50 outline outline-2"
                        : "bg-primary/5 outline-primary/20 outline outline-1"),
                  )}
                >
                  <div
                    className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold",
                      m.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground border",
                    )}
                  >
                    {m.role === "user" ? "Y" : "J"}
                  </div>
                  <div
                    className={cn(
                      "max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                      m.role === "user"
                        ? "bg-primary text-primary-foreground rounded-tr-sm"
                        : "bg-muted text-foreground rounded-tl-sm",
                    )}
                  >
                    <ReactMarkdown
                      rehypePlugins={[rehypeHighlight]}
                      components={{
                        code({ inline, className, children, ...props }) {
                          return inline ? (
                            <code
                              className="bg-background rounded px-1 py-0.5 font-mono text-xs"
                              {...props}
                            >
                              {children}
                            </code>
                          ) : (
                            <code className={className} {...props}>
                              {children}
                            </code>
                          );
                        },
                        p({ children }) {
                          return <p className="mb-2 last:mb-0">{children}</p>;
                        },
                      }}
                    >
                      {m.content}
                    </ReactMarkdown>
                  </div>
                </div>
              ))}

              {sending && (
                <div className="flex items-start gap-3">
                  <div className="bg-muted flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold">
                    J
                  </div>
                  <div className="bg-muted flex items-center gap-1.5 rounded-2xl rounded-tl-sm px-4 py-3.5">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="bg-muted-foreground h-1.5 w-1.5 animate-bounce rounded-full"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>
          )}
        </div>
      </div>

      {selectedConversation && !modelAvailable && (
        <p className="text-destructive mb-2 text-center text-xs">
          Model &quot;{selectedConversation.model}&quot; is no longer available.
          Please create a new conversation.
        </p>
      )}

      <div className="bg-background shrink-0 border-t px-4 py-4">
        <div className="mx-auto w-full max-w-2xl">
          <div className="bg-muted/40 focus-within:border-primary flex items-end gap-2 rounded-2xl border px-4 py-3 transition-colors">
            <Textarea
              id="user-input"
              ref={textareaRef}
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
                  ? "Message Jarvis... (Shift + Enter for new line)"
                  : "Select or create a conversation first"
              }
              disabled={inputDisabled}
              rows={1}
              className="max-h-50 flex-1 resize-none rounded-none border-none bg-transparent p-0 shadow-none outline-none focus-visible:ring-0 disabled:bg-transparent disabled:opacity-50 dark:bg-transparent dark:disabled:bg-transparent"
            />
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={toggleVoice}
              disabled={inputDisabled}
              className={cn(
                "h-8 w-8 shrink-0 rounded-lg transition-colors",
                listening
                  ? "bg-destructive text-destructive-foreground animate-pulse"
                  : "text-muted-foreground",
              )}
            >
              <Mic className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              onClick={sendMessage}
              disabled={sending || !input.trim() || !selectedConversation}
              className="h-8 w-8 shrink-0 rounded-lg"
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-muted-foreground mt-2 text-center text-[10px] tracking-widest uppercase">
            {selectedConversation?.model ?? "No model selected"} · Local
          </p>
        </div>
      </div>
    </div>
  );
}
