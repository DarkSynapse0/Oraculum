/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import {
  SendHorizontal,
  Bot,
  User as UserIcon,
  Loader2,
  Sparkles,
  X,
  MessageCircle,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils"; // Assumes standard shadcn-style utility

// --- Sub-Components ---

const ChatHeader = ({ onClose }: { onClose: () => void }) => (
  <header className="p-4 border-b border-zinc-100 bg-zinc-900 text-white flex items-center justify-between">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center">
        <BookOpen size={16} className="text-zinc-400" />
      </div>
      <div>
        <h3 className="text-[11px] font-bold uppercase tracking-widest leading-none">
          Galaxy Assistant
        </h3>
        <div className="flex items-center gap-1.5 mt-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-tighter">
            Systems Live
          </span>
        </div>
      </div>
    </div>
    <button
      onClick={onClose}
      className="p-1.5 hover:bg-zinc-800 rounded-md transition-colors text-zinc-400 hover:text-white"
    >
      <X size={18} />
    </button>
  </header>
);

const TypingIndicator = () => (
  <div className="flex gap-3 animate-in fade-in slide-in-from-left-2">
    <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-200 flex items-center justify-center">
      <Loader2 size={12} className="animate-spin" />
    </div>
    <div className="bg-white border border-zinc-200 px-4 py-2 rounded-2xl flex gap-1 items-center h-8">
      <div className="w-1 h-1 bg-zinc-700 rounded-full animate-bounce [animation-duration:0.6s]" />
      <div className="w-1 h-1 bg-zinc-700 rounded-full animate-bounce [animation-duration:0.6s] [animation-delay:0.2s]" />
      <div className="w-1 h-1 bg-zinc-700 rounded-full animate-bounce [animation-duration:0.6s] [animation-delay:0.4s]" />
    </div>
  </div>
);

// --- Main Widget ---

export default function AIChatWidget({ userId }: { userId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState<
    { role: "user" | "assistant"; text: string }[]
  >([]);
  const [isPending, startTransition] = useTransition();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current)
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [chat, isPending]);

  const handleSend = async () => {
    if (!message.trim() || isPending) return;

    const userQuery = message;
    setChat((prev) => [...prev, { role: "user", text: userQuery }]);
    setMessage("");

    startTransition(async () => {
      try {
        const res = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: userQuery, userId: userId }),
        });
        const data = await res.json();
        setChat((prev) => [
          ...prev,
          { role: "assistant", text: data.reply || data.error },
        ]);
      } catch (err) {
        setChat((prev) => [
          ...prev,
          { role: "assistant", text: "Service temporarily unavailable." },
        ]);
      }
    });
  };

  return (
    <div className="fixed lg:bottom-6 bottom-18 right-6 z-[100] flex flex-col items-end">
      {/* Chat Window */}
      <div
        className={cn(
          "mb-4 w-[380px] h-[580px] rounded-2xl border bg-background flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right transform",
          isOpen
            ? "scale-100 opacity-100 translate-y-0"
            : "scale-95 opacity-0 translate-y-8 pointer-events-none",
        )}
      >
        <ChatHeader onClose={() => setIsOpen(false)} />

        {/* Message Area */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-5 space-y-6 scroll-smooth"
        >
          {chat.length === 0 && (
            <div className="py-12 text-center space-y-4">
              <div className="w-12 h-12 bg-foreground rounded-2xl mx-auto flex items-center justify-center text-background shadow-sm">
                <Sparkles size={22} />
              </div>
              <div>
                <h4 className="text-sm font-boldtracking-tight">
                  AI Bookstore Assistant
                </h4>
                <p className="text-xs text-zinc-500 mt-1 px-12">
                  Search the catalog, check inventory, or get reading
                  recommendations.
                </p>
              </div>
            </div>
          )}

          {chat.map((msg, i) => (
            <div
              key={i}
              className={cn(
                "flex gap-3",
                msg.role === "user" ? "flex-row-reverse" : "flex-row",
              )}
            >
              <div
                className={cn(
                  "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border text-[10px] font-bold uppercase",
                  msg.role === "user"
                    ? "bg-background border-zinc-900 "
                    : "bg-background border-zinc-200",
                )}
              >
                {msg.role === "user" ? <UserIcon /> : <Bot size={14} />}
              </div>
              <div
                className={cn(
                  "max-w-[80%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm transition-all",
                  msg.role === "user"
                    ? "bg-zinc-900 text-white"
                    : "bg-zinc-900 ",
                )}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {isPending && <TypingIndicator />}
        </div>

        {/* Input Footer */}
        <footer className="p-4 bg-background border-t">
          <div className="relative group">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask Galaxy AI..."
              className="w-full bg-zinc-900 border-transparent border rounded-xl py-3 pl-4 pr-12 text-sm focus:border-zinc-100 focus:ring-4 focus:ring-zinc-900/5 transition-all outline-none placeholder:text-zinc-400"
            />
            <button
              onClick={handleSend}
              disabled={isPending || !message.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-zinc-900 text-white rounded-lg flex items-center justify-center hover:bg-zinc-800 active:scale-90 transition-all disabled:opacity-30 shadow-lg"
            >
              {isPending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <SendHorizontal size={16} />
              )}
            </button>
          </div>
        </footer>
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 active:scale-[0.85] group relative overflow-hidden",
          isOpen ? "bg-zinc-900 border" : "bg-zinc-900 text-white",
        )}
      >
        <div className="relative z-10">
          {isOpen ? (
            <X size={24} />
          ) : (
            <MessageCircle
              size={24}
              className="group-hover:scale-110 transition-transform"
            />
          )}
        </div>
        {!isOpen && (
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />
        )}
        {!isOpen && (
          <div className="absolute top-3 right-3 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-zinc-900" />
        )}
      </button>
    </div>
  );
}
