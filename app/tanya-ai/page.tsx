import type { Metadata } from "next"
import { ChatInterface } from "@/components/chat/ChatInterface"

export const metadata: Metadata = {
  title: "Tanya AI — MBG",
  description:
    "Tanyakan apapun tentang program Makan Bergizi Gratis (MBG) kepada AI assistant kami. Dari anggaran, kontroversi, hingga perbandingan global.",
}

export default function TanyaAIPage() {
  return (
    <main className="w-full overflow-hidden" style={{ height: "calc(100vh - 56px)" }}>
      <ChatInterface />
    </main>
  )
}
