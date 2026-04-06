"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import type { ReactNode } from "react"
import { Brain, ArrowUpRight, Copy, Check, Sparkles, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Inline markdown renderer (bold, italic, line breaks) ─────────────────────

function renderMarkdown(text: string): ReactNode[] {
  // Split into lines first to preserve paragraph breaks
  return text.split("\n").flatMap((line, lineIdx, lines) => {
    const segments: ReactNode[] = []
    // Match **bold** or *italic* tokens
    const parts = line.split(/(\*\*[^*\n]+?\*\*|\*[^*\n]+?\*)/g)
    parts.forEach((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        segments.push(<strong key={`${lineIdx}-b-${i}`} className="font-semibold">{part.slice(2, -2)}</strong>)
      } else if (part.startsWith("*") && part.endsWith("*")) {
        segments.push(<em key={`${lineIdx}-i-${i}`}>{part.slice(1, -1)}</em>)
      } else {
        segments.push(part)
      }
    })
    // Add line break after each line except the last
    if (lineIdx < lines.length - 1) segments.push(<br key={`${lineIdx}-br`} />)
    return segments
  })
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface Source {
  title: string
  url: string
  domain: string
}

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  sources?: Source[]
}

// ─── Constants ────────────────────────────────────────────────────────────────

const FALLBACK_QUESTIONS = [
  "Kalau anggaran MBG dipakai bangun RS, bisa berapa?",
  "Bandingkan MBG Indonesia vs school lunch USA",
  "Kenapa banyak kasus keracunan di MBG?",
  "Apa kata ICW soal konflik kepentingan MBG?",
  "Berapa persen GDP Indonesia yang terpakai untuk MBG?",
  "Apakah MBG lebih mahal dari negara lain?",
]

const TOPIC_TAGS = ["Anggaran", "Keracunan", "Transparansi", "Perbandingan Global", "Kebijakan"]

const MODEL_DISPLAY: Record<string, string> = {
  "qwen/qwen3-14b:free": "Qwen 3 14B",
  "qwen/qwen3.6-plus:free": "Qwen 3.6 Plus",
  "anthropic/claude-3.5-sonnet": "Claude 3.5 Sonnet",
  "anthropic/claude-3-haiku": "Claude 3 Haiku",
  "openai/gpt-4o-mini": "GPT-4o Mini",
  "meta-llama/llama-3.3-70b-instruct:free": "Llama 3.3 70B",
}

function formatModelName(id: string): string {
  if (MODEL_DISPLAY[id]) return MODEL_DISPLAY[id]
  const base = id.split("/").pop() ?? id
  return base.replace(/:.*$/, "").replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function AIBadge({ size = "sm" }: { size?: "sm" | "md" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full bg-primary font-mono font-bold text-primary-foreground",
        size === "sm" ? "h-6 w-6 text-[9px]" : "h-8 w-8 text-[10px]"
      )}
    >
      AI
    </span>
  )
}

function TypingIndicator() {
  return (
    <div className="flex items-start gap-2.5">
      <AIBadge size="sm" />
      <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm border border-border bg-card px-4 py-3">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/50"
            style={{ animationDelay: `${i * 0.15}s`, animationDuration: "0.8s" }}
          />
        ))}
      </div>
    </div>
  )
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="flex items-center gap-1 rounded border border-border bg-card px-2 py-0.5 text-[10px] text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary"
    >
      {copied ? <Check size={10} /> : <Copy size={10} />}
      {copied ? "Tersalin" : "Salin"}
    </button>
  )
}

function CitationChip({ source, index }: { source: Source; index: number }) {
  return (
    <span className="group/chip relative inline-block">
      <a
        href={source.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-border bg-card px-2 py-0.5 text-[10px] text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary"
      >
        <span className="font-mono text-primary/70">[{index + 1}]</span>
        {source.domain}
      </a>
      {/* Hover popup */}
      <span className="pointer-events-none absolute bottom-full left-0 z-50 mb-2 w-64 rounded-lg border border-border bg-card p-2.5 shadow-lg opacity-0 transition-opacity duration-150 group-hover/chip:opacity-100">
        <span className="block text-[11px] font-medium leading-snug text-foreground line-clamp-2">
          {source.title}
        </span>
        <span className="mt-1 block truncate text-[10px] text-muted-foreground">
          {source.url}
        </span>
      </span>
    </span>
  )
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user"

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[75%] rounded-2xl rounded-br-sm bg-primary px-4 py-3 sm:max-w-[60%]">
          <p className="text-sm leading-relaxed text-primary-foreground">{message.content}</p>
        </div>
      </div>
    )
  }

  const hasSources = message.sources && message.sources.length > 0

  return (
    <div className="flex items-start gap-2.5">
      <AIBadge size="sm" />
      <div className="group max-w-[80%]">
        <div className="rounded-2xl rounded-tl-sm border border-border bg-card px-4 py-3">
          <p className="text-sm leading-relaxed text-foreground">{renderMarkdown(message.content)}</p>
        </div>

        {/* Sources row */}
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          {hasSources ? (
            <>
              <span className="text-[10px] italic text-muted-foreground/60">Sumber:</span>
              {message.sources!.map((s, i) => (
                <CitationChip key={s.url} source={s} index={i} />
              ))}
            </>
          ) : (
            <p className="text-[10px] italic text-muted-foreground/60">
              Berdasarkan data APBN 2026 &amp; pengetahuan model
            </p>
          )}
          <div className="opacity-0 transition-opacity group-hover:opacity-100">
            <CopyButton text={message.content} />
          </div>
        </div>

      </div>
    </div>
  )
}

function WelcomeState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-20 text-center">
      <p
        className="mb-4 select-none font-display text-8xl font-extrabold leading-none text-primary/[0.07] md:text-9xl"
        aria-hidden
      >
        ?
      </p>
      <h2 className="font-display text-2xl font-extrabold text-foreground">
        Tanyakan apapun tentang MBG
      </h2>
      <p className="mt-2 max-w-xs text-sm text-muted-foreground">
        Dari anggaran, kontroversi, hingga perbandingan global
      </p>
    </div>
  )
}

// ─── Left Panel ───────────────────────────────────────────────────────────────

interface LeftPanelProps {
  onSelectQuestion: (q: string) => void
  modelName: string
  questions: string[]
  questionsLoading: boolean
}

function LeftPanel({ onSelectQuestion, modelName, questions, questionsLoading }: LeftPanelProps) {
  return (
    <div className="flex h-full flex-col overflow-y-auto px-6 py-8">
      {/* Header */}
      <div className="mb-6 flex flex-col items-start gap-3">
        <AIBadge size="md" />
        <div>
          <h2 className="font-display text-2xl font-extrabold leading-none text-foreground">
            Tanya <span className="text-primary">AI</span>
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Powered by{" "}
            {modelName ? (
              <span className="font-medium text-foreground/70">{modelName}</span>
            ) : (
              <span className="inline-block h-3 w-20 animate-pulse rounded bg-muted-foreground/20 align-middle" />
            )}
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mb-6 rounded-lg border border-border bg-secondary/50 p-3">
        <p className="text-[12px] leading-relaxed text-muted-foreground">
          Jawaban AI berdasarkan data publik APBN 2026. Bukan pernyataan resmi pemerintah.
        </p>
      </div>

      <div className="mb-6 h-px w-full bg-border" />

      {/* Suggested Questions */}
      <div className="flex-1">
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Pertanyaan Populer
        </p>
        {questionsLoading ? (
          <ul className="flex flex-col gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <li key={i}>
                <div
                  className="h-[46px] animate-pulse rounded-lg border border-border bg-card"
                  style={{ animationDelay: `${i * 0.07}s` }}
                />
              </li>
            ))}
          </ul>
        ) : (
          <ul className="flex flex-col gap-2">
            {questions.map((q) => (
              <li key={q}>
                <button
                  type="button"
                  onClick={() => onSelectQuestion(q)}
                  className="group flex w-full items-center justify-between rounded-lg border border-border bg-card px-3.5 py-3 text-left text-[13px] leading-snug text-foreground transition-all duration-150 hover:border-primary/25 hover:bg-primary/[0.03] hover:text-primary"
                >
                  <span className="flex-1 pr-2">{q}</span>
                  <ArrowUpRight
                    size={13}
                    className="flex-shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                  />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Topic tags */}
      <div className="mt-6 flex flex-wrap gap-1.5">
        {TOPIC_TAGS.map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-border px-2.5 py-1 text-[10px] text-muted-foreground"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  )
}

// ─── Main ChatInterface ────────────────────────────────────────────────────────

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isStreaming, setIsStreaming] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [modelName, setModelName] = useState("")
  const [questions, setQuestions] = useState<string[]>(FALLBACK_QUESTIONS)
  const [questionsLoading, setQuestionsLoading] = useState(true)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  // Fetch AI-generated questions on mount
  useEffect(() => {
    let cancelled = false
    fetch("/api/chat/questions")
      .then((r) => r.json())
      .then((data: { questions?: string[]; model?: string }) => {
        if (cancelled) return
        if (Array.isArray(data.questions) && data.questions.length >= 3) {
          setQuestions(data.questions)
        }
        if (data.model) setModelName(formatModelName(data.model))
      })
      .catch(() => {/* silently use fallback */})
      .finally(() => { if (!cancelled) setQuestionsLoading(false) })
    return () => { cancelled = true }
  }, [])

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isStreaming])

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = "auto"
    ta.style.height = `${Math.min(ta.scrollHeight, 120)}px`
  }, [input])

  // Close sidebar on mobile when message sent
  useEffect(() => {
    if (isStreaming) setSidebarOpen(false)
  }, [isStreaming])

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim()
      if (!trimmed || isStreaming) return

      const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: trimmed }

      // Only add user message — assistant bubble is added on first chunk
      setMessages((prev) => [...prev, userMsg])
      setInput("")
      setIsStreaming(true)

      abortRef.current = new AbortController()

      // Track assistant message id and pending sources locally
      let assistantId: string | null = null
      let pendingSources: Source[] = []

      try {
        const history = messages.map((m) => ({ role: m.role, content: m.content }))

        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: trimmed, history }),
          signal: abortRef.current.signal,
        })

        if (!res.ok || !res.body) throw new Error("Stream failed")

        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ""

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split("\n")
          buffer = lines.pop() ?? ""

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue
            const data = line.slice(6)
            if (data === "[DONE]") break
            try {
              const parsed = JSON.parse(data) as unknown

              // Sources event (arrives before text)
              if (
                typeof parsed === "object" &&
                parsed !== null &&
                "type" in parsed &&
                (parsed as { type: string }).type === "sources"
              ) {
                const evt = parsed as unknown as { sources: Source[]; model?: string }
                pendingSources = evt.sources ?? []
                if (evt.model) setModelName(formatModelName(evt.model))
                // If assistant bubble already exists (unlikely but safe), attach sources
                if (assistantId) {
                  const id = assistantId
                  setMessages((prev) =>
                    prev.map((m) => m.id === id ? { ...m, sources: pendingSources } : m)
                  )
                }
                continue
              }

              // Text chunk
              if (typeof parsed === "string") {
                const chunk = parsed
                if (!assistantId) {
                  assistantId = crypto.randomUUID()
                  const id = assistantId
                  setMessages((prev) => [
                    ...prev,
                    { id, role: "assistant", content: chunk, sources: pendingSources },
                  ])
                } else {
                  const id = assistantId
                  setMessages((prev) =>
                    prev.map((m) => m.id === id ? { ...m, content: m.content + chunk } : m)
                  )
                }
              }
            } catch {
              // ignore parse errors
            }
          }
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          if (assistantId) {
            const id = assistantId
            setMessages((prev) =>
              prev.map((m) =>
                m.id === id ? { ...m, content: "Maaf, terjadi kesalahan. Coba lagi." } : m
              )
            )
          } else {
            setMessages((prev) => [
              ...prev,
              { id: crypto.randomUUID(), role: "assistant", content: "Maaf, terjadi kesalahan. Coba lagi." },
            ])
          }
        }
      } finally {
        setIsStreaming(false)
        abortRef.current = null
      }
    },
    [messages, isStreaming]
  )

  const handleSelectQuestion = useCallback(
    (q: string) => {
      sendMessage(q)
    },
    [sendMessage]
  )

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  const charCount = input.length

  return (
    <div
      className="flex"
      style={{ height: "calc(100vh - 56px)" }} // subtract navbar height
    >
      {/* ── Left panel — desktop always visible, mobile overlay ─────────────── */}
      <>
        {/* Mobile overlay backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-foreground/20 backdrop-blur-sm md:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden
          />
        )}

        {/* Sidebar */}
        <aside
          className={cn(
            "z-40 w-[320px] flex-shrink-0 border-r border-border bg-card transition-transform duration-300 md:relative md:block md:translate-x-0 lg:w-[360px]",
            sidebarOpen
              ? "fixed inset-y-0 left-0 top-14 translate-x-0"
              : "fixed inset-y-0 left-0 top-14 -translate-x-full md:relative md:top-0 md:translate-x-0"
          )}
        >
          <LeftPanel
            onSelectQuestion={handleSelectQuestion}
            modelName={modelName}
            questions={questions}
            questionsLoading={questionsLoading}
          />
        </aside>
      </>

      {/* ── Right panel — chat ───────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Chat header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            {/* Mobile sidebar toggle */}
            <button
              type="button"
              onClick={() => setSidebarOpen((v) => !v)}
              className="flex items-center gap-1.5 rounded border border-border px-2.5 py-1 text-[11px] font-semibold text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary md:hidden"
            >
              <Brain size={11} />
              Pertanyaan
              <ChevronDown
                size={10}
                className={cn("transition-transform", sidebarOpen && "rotate-180")}
              />
            </button>

            <div className="hidden items-center gap-2 md:flex">
              <AIBadge size="sm" />
              <span className="text-sm font-semibold text-foreground">MBGmata AI Assistant</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500 pulse" />
            <span className="text-[11px] text-muted-foreground">Data terbaru: Maret 2026</span>
          </div>
        </div>

        {/* Messages */}
        <div className="flex flex-1 flex-col overflow-y-auto px-5 py-6">
          {messages.length === 0 ? (
            <WelcomeState />
          ) : (
            <div className="flex flex-col gap-5">
              {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
              {isStreaming && messages[messages.length - 1]?.role === "user" && (
                <TypingIndicator />
              )}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input bar */}
        <div className="border-t border-border bg-background/80 px-5 py-4 backdrop-blur-sm">
          <div className="flex items-end gap-2 rounded-xl border border-border bg-card px-4 py-2.5 focus-within:border-primary/40 transition-colors">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Tanyakan tentang MBG..."
              rows={1}
              disabled={isStreaming}
              className="flex-1 resize-none bg-transparent text-sm leading-relaxed text-foreground outline-none placeholder:text-muted-foreground/60 selection:bg-primary/20 selection:text-foreground disabled:opacity-50"
              style={{ maxHeight: "120px" }}
            />
            <button
              type="button"
              onClick={() => sendMessage(input)}
              disabled={!input.trim() && !isStreaming}
              className={cn(
                "flex-shrink-0 rounded-lg px-4 py-2 text-xs font-semibold text-primary-foreground",
                isStreaming
                  ? "shimmer-red cursor-default"
                  : "bg-primary transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
              )}
            >
              {isStreaming ? (
                <span className="flex items-center gap-1.5">
                  <Sparkles size={11} />
                  Membalas...
                </span>
              ) : (
                "Kirim"
              )}
            </button>
          </div>

          {/* Disclaimer — satu kali saja di seluruh halaman */}
          <p className="mb-2 text-center text-[10px] text-muted-foreground/35">
            AI dapat membuat kesalahan · selalu verifikasi dari sumber terpercaya
          </p>

          {/* Character counter + hint */}
          <div className="mt-1.5 flex items-center justify-between px-1">
            <p className="text-[10px] text-muted-foreground/50">
              Enter untuk kirim · Shift+Enter untuk baris baru
            </p>
            {charCount > 200 && (
              <p
                className={cn(
                  "text-[10px] tabular-nums",
                  charCount > 1800 ? "text-primary" : "text-muted-foreground"
                )}
              >
                {charCount}/2000
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
