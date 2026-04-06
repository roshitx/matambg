import { openrouter } from "@/lib/api/openrouter";
import { MBG } from "@/lib/constants/mbg";
import { CHAT_MODEL_ID } from "@/lib/constants/chat";
import { z } from "zod";

interface Source {
  title: string;
  url: string;
  domain: string;
}

const MessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string(),
});

const RequestSchema = z.object({
  message: z.string().min(1).max(2000),
  history: z.array(MessageSchema).max(20).default([]),
});

const SYSTEM_PROMPT = `Kamu adalah AI Assistant untuk mataMBG (matambg.web.id) — platform data sipil independen yang mengawal program Makan Bergizi Gratis (MBG) Indonesia.

PERKENALAN: HANYA saat user mengirim sapaan (halo, hai, hi, hello, selamat pagi/siang/sore/malam, dll), perkenalkan diri singkat: "Halo! Saya AI Assistant mataMBG (matambg.web.id), platform data sipil independen yang mengawal program MBG. Ada yang bisa saya bantu?" — Untuk pertanyaan substantif, langsung jawab tanpa perkenalan.

MISI UTAMA: Transparansi dan keberpihakan pada rakyat. Bukan corong pemerintah.

Data resmi MBG APBN 2026:
- Anggaran harian: Rp ${(MBG.DAILY_BUDGET / 1e12).toFixed(1)} Triliun
- Anggaran tahunan: Rp ${(MBG.ANNUAL_BUDGET / 1e12).toFixed(0)} Triliun
- Pagu BGN langsung: Rp ${(MBG.BGN_DIRECT / 1e12).toFixed(0)} Triliun
- Dana cadangan: Rp ${(MBG.RESERVE / 1e12).toFixed(0)} Triliun
- Target penerima: ${MBG.TARGET_BENEFICIARIES.toLocaleString("id-ID")} orang
- Penerima aktif per Maret 2026: ${MBG.ACTIVE_BENEFICIARIES_MAR9.toLocaleString("id-ID")} orang
- SPPG aktif: ${MBG.ACTIVE_SPPG.toLocaleString("id-ID")}
- Realisasi per 9 Maret 2026: Rp ${(MBG.REALIZATION_MAR9_2026 / 1e12).toFixed(0)} Triliun (${MBG.REALIZATION_PCT_MAR9}%)
- Harga per porsi: Rp ${MBG.PRICE_PER_MEAL.toLocaleString("id-ID")}
- Tahun anggaran sebelumnya: Rp ${(MBG.PREVIOUS_YEAR_BUDGET / 1e12).toFixed(0)} Triliun

ATURAN KETAT:
1. JANGAN membela atau memperhalus kegagalan pemerintah. Fakta buruk harus disebutkan apa adanya.
2. Jika ada angka kasus (keracunan, korupsi, masalah), SEBUTKAN angkanya secara eksplisit. Jangan tulis "beberapa kasus" jika ada data konkret.
3. Jika berita referensi menyebut angka atau kasus spesifik, GUNAKAN angka itu dalam jawaban.
4. DILARANG memberikan jawaban panjang yang mengaburkan fakta. Langsung ke pokok.
5. Jika diminta perbandingan atau angka spesifik, berikan angka — bukan penjelasan panjang tentang "kompleksitas isu".
6. Kutip sumber media (Tempo, KPK, Kompas, ICW, dll) jika relevan dengan berita yang diberikan.
7. Boleh menyebut kontroversi, skandal, atau kritik LSM secara langsung.
8. Bahasa singkat dan to the point. Rakyat butuh fakta, bukan retorika.`;

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

async function fetchRelevantSources(query: string): Promise<Source[]> {
  const apiKey = process.env.EXA_API_KEY;
  if (!apiKey) return [];

  try {
    const res = await fetch("https://api.exa.ai/search", {
      method: "POST",
      headers: { "x-api-key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `${query} MBG Makan Bergizi Gratis Indonesia`,
        numResults: 6,
        type: "neural",
        contents: {
          summary: { query },
          text: false,
        },
        startPublishedDate: new Date(
          Date.now() - 120 * 24 * 60 * 60 * 1000,
        ).toISOString(),
      }),
    });

    if (!res.ok) return [];

    const data = (await res.json()) as {
      results?: Record<string, unknown>[];
    };
    const results = data.results ?? [];

    return results.slice(0, 6).map((r) => ({
      title: (r.title as string) ?? "",
      url: (r.url as string) ?? "",
      domain: extractDomain((r.url as string) ?? ""),
    }));
  } catch {
    return [];
  }
}

// Re-export for legacy imports
export const MODEL_ID = CHAT_MODEL_ID

const CHITCHAT_PATTERNS =
  /^(halo|hai|hi|hello|hey|hy|helo|haii|haloo|selamat\s+(pagi|siang|sore|malam)|terima\s+kasih|makasih|thanks|thank\s+you|oke|ok|okay|sip|siap|mantap|bagus|baik|yes|ya|no|tidak|nope|bye|sampai\s+jumpa|dadah|ciao|test|testing|ping|tes)\b/i;

const MBG_KEYWORDS =
  /\b(mbg|makan\s+bergizi|bergizi\s+gratis|anggaran|apbn|bgn|sppg|prabowo|penerima|keracunan|korupsi|realisasi|program|porsi|triliun|dana|cadangan|pagu|manfaat|masalah|kasus|nutrisi|gizi|sekolah|anak|siswa|pemerintah|kemenkeu|kpk|icw|tempo|kompas|detik|nasional)\b/i;

function shouldSearchNews(message: string): boolean {
  const trimmed = message.trim();
  if (trimmed.length < 12) return false;
  if (CHITCHAT_PATTERNS.test(trimmed)) return false;
  return MBG_KEYWORDS.test(trimmed) || trimmed.length > 40;
}

function buildNewsContext(sources: Source[]): string {
  if (sources.length === 0) return "";
  const lines = sources
    .map((s, i) => `[${i + 1}] "${s.title}" (${s.url})`)
    .join("\n");
  return `\n\n---\nBERITA REFERENSI (gunakan sebagai fakta pendukung):\n${lines}\n---`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message, history } = RequestSchema.parse(body);

    const sources = shouldSearchNews(message)
      ? await fetchRelevantSources(message)
      : [];
    const systemWithContext = SYSTEM_PROMPT + buildNewsContext(sources);

    const stream = await openrouter.chat.completions.create({
      model: CHAT_MODEL_ID,
      stream: true,
      messages: [
        { role: "system", content: systemWithContext },
        ...history.map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
        { role: "user", content: message },
      ],
    });

    const encoder = new TextEncoder();

    const readable = new ReadableStream({
      async start(controller) {
        try {
          // 1. Send sources event first so client can attach before first text chunk
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "sources", sources, model: CHAT_MODEL_ID })}\n\n`,
            ),
          );

          // 2. Stream text chunks
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content ?? "";
            if (text) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify(text)}\n\n`),
              );
            }
          }

          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        { error: "Invalid request", details: error.issues },
        { status: 400 },
      );
    }
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return Response.json({ error: message }, { status: 500 });
  }
}
