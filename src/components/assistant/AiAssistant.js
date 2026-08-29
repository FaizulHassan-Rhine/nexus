"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Sparkles, Send, X } from "lucide-react";
import { helpArticles } from "@/data/helpArticles";
import { cn } from "@/lib/cn";

const SUGGESTIONS = [
  "How do I get started?",
  "What is a match score?",
  "How does UGC co-funding work?",
  "How do I use a demo account?",
];

const WELCOME =
  "Hi — I am the Nexus assistant. Ask about registration, matching, funding, or support. Answers come from the help centre.";

function findAnswer(text) {
  const query = text.toLowerCase();
  const words = query.split(/\W+/).filter((w) => w.length > 2);
  const ranked = helpArticles
    .map((article) => {
      const hay = `${article.title} ${article.summary} ${article.topics?.join(" ")} ${article.content}`.toLowerCase();
      const score = words.reduce((sum, word) => sum + (hay.includes(word) ? 1 : 0), 0);
      return { article, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  if (ranked[0]) {
    const { article } = ranked[0];
    return {
      body: article.summary,
      href: `/help/articles/${article.slug}`,
      title: article.title,
    };
  }

  return {
    body: "I could not find a matching help article. Try the help centre, or sign in with a demo account from the login page.",
    href: "/help",
    title: "Browse help articles",
  };
}

export function AiAssistant() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([{ id: "welcome", role: "assistant", body: WELCOME }]);
  const listRef = useRef(null);

  const canSend = useMemo(() => input.trim().length > 0, [input]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  const ask = (text) => {
    const question = text.trim();
    if (!question) return;
    const reply = findAnswer(question);
    setMessages((prev) => [
      ...prev,
      { id: `u-${Date.now()}`, role: "user", body: question },
      { id: `a-${Date.now()}`, role: "assistant", body: reply.body, href: reply.href, title: reply.title },
    ]);
    setInput("");
  };

  return (
    <div className="pointer-events-none fixed right-4 bottom-4 z-[60] flex flex-col items-end gap-3 sm:right-6 sm:bottom-6">
      {open ? (
        <div className="pointer-events-auto flex h-[min(32rem,calc(100vh-7.5rem))] w-[min(22rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-[#d5e3df] bg-cream shadow-[0_16px_40px_rgba(51,104,160,0.18)] dark:border-nexus-700 dark:bg-nexus-900 dark:shadow-[0_16px_40px_rgba(0,0,0,0.4)]">
          <div className="flex items-center justify-between bg-nexus-800 px-4 py-3 text-cream">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
                <Sparkles className="h-4 w-4 text-sage" />
              </span>
              <div>
                <p className="text-sm font-semibold">Nexus assistant</p>
                <p className="text-[11px] text-cream/70">Help for matching, funding, and accounts</p>
              </div>
            </div>
            <button
              type="button"
              className="rounded-lg p-1.5 text-cream/80 hover:bg-white/10 hover:text-white"
              onClick={() => setOpen(false)}
              aria-label="Close assistant"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
            {messages.map((msg) => (
              <div key={msg.id} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[90%] rounded-2xl px-3 py-2 text-sm leading-relaxed",
                    msg.role === "user"
                      ? "rounded-br-md bg-nexus-600 text-white"
                      : "rounded-bl-md bg-chrome text-nexus-900 dark:bg-nexus-800 dark:text-cream"
                  )}
                >
                  <p>{msg.body}</p>
                  {msg.href ? (
                    <Link href={msg.href} className="mt-2 inline-block text-xs font-medium text-nexus-700 hover:underline dark:text-sage">
                      {msg.title || "Learn more"} →
                    </Link>
                  ) : null}
                </div>
              </div>
            ))}

            {messages.length === 1 ? (
              <div className="flex flex-wrap gap-2 pt-1">
                {SUGGESTIONS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => ask(item)}
                    className="rounded-full border border-[#d5e3df] bg-cream px-3 py-1 text-xs text-nexus-800 hover:border-nexus-400 hover:bg-sage/40 dark:border-nexus-700 dark:bg-nexus-900 dark:text-cream dark:hover:border-nexus-500"
                  >
                    {item}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <form
            className="flex items-center gap-2 border-t border-[#d5e3df] p-3 dark:border-nexus-800"
            onSubmit={(e) => {
              e.preventDefault();
              ask(input);
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question…"
              className="h-10 flex-1 rounded-lg border border-[#d5e3df] bg-cream px-3 text-sm text-nexus-900 placeholder:text-nexus-400/70 focus:border-nexus-600 focus:outline-none focus:ring-2 focus:ring-nexus-600/20 dark:border-nexus-700 dark:bg-nexus-950 dark:text-cream"
            />
            <button
              type="submit"
              disabled={!canSend}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-nexus-600 text-white hover:bg-nexus-800 disabled:opacity-40"
              aria-label="Send message"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      ) : null}

      <button
        type="button"
        aria-expanded={open}
        aria-label={open ? "Close Nexus assistant" : "Open Nexus assistant"}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "pointer-events-auto inline-flex h-14 w-14 items-center justify-center rounded-full text-white shadow-[0_8px_24px_rgba(51,104,160,0.35)] transition-transform hover:scale-105",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nexus-600/50 focus-visible:ring-offset-2",
          open ? "bg-nexus-800" : "bg-nexus-600 hover:bg-nexus-700"
        )}
      >
        {open ? <X className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
      </button>
    </div>
  );
}
