import { COMPARISONS } from "@/lib/constants/comparisons"
import { MBG } from "@/lib/constants/mbg"
import { formatCompact } from "@/lib/utils/shareFormat"
import { getBackgroundData } from "@/lib/utils/shareBackground"
import { getGradientFallback } from "@/lib/unsplash-photos"
import { ImageResponse } from "next/og"
import { createElement } from "react"

export const runtime = "edge"

function getNumberFontSize(value: string): number {
  if (value.length <= 6) return 200
  if (value.length <= 9) return 160
  if (value.length <= 12) return 120
  return 90
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  const { id } = await params
  const item = COMPARISONS.find((comparison) => comparison.id === id)

  if (!item) {
    return new Response("Not found", { status: 404 })
  }

  const requestOrigin = new URL(request.url).origin
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? requestOrigin

  const [syneBuffer, spaceMediumBuffer, spaceBoldBuffer] = await Promise.all([
    fetch(`${requestOrigin}/fonts/Syne-ExtraBold.ttf`).then((response) => response.arrayBuffer()),
    fetch(`${requestOrigin}/fonts/SpaceGrotesk-Medium.ttf`).then((response) => response.arrayBuffer()),
    fetch(`${requestOrigin}/fonts/SpaceGrotesk-Bold.ttf`).then((response) => response.arrayBuffer()),
  ])

  const units = Math.floor(MBG.DAILY_BUDGET / item.unitPrice)
  const compactStr = formatCompact(units)
  const numberFontSize = getNumberFontSize(compactStr)

  const background = getBackgroundData(item.id, item.category)
  const gradient = getGradientFallback(item.category)

  const imageJsx = createElement(
    "div",
    {
      style: {
        position: "relative",
        width: "100%",
        height: "100%",
      },
    },
    // Layer 1: Background (image or gradient)
    background.type === "image"
      ? createElement("img", {
          src: background.value,
          style: {
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          },
        })
      : createElement("div", {
          style: {
            position: "absolute",
            inset: 0,
            background: background.value,
          },
        }),
    // Layer 2: Gradient overlay
    createElement("div", {
      style: {
        position: "absolute",
        inset: 0,
        background: `linear-gradient(to top, ${gradient.to} 0%, transparent 60%)`,
      },
    }),
    // Layer 3: Content
    createElement(
      "div",
      {
        style: {
          position: "relative",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
          height: "100%",
          padding: "60px 40px",
        },
      },
      createElement(
        "div",
        {
          style: {
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
            fontSize: 32,
            color: "#71717A",
            fontFamily: "Space Grotesk",
            fontWeight: 500,
          },
        },
        createElement("span", null, "mataMBG"),
        createElement("span", null, "🇮🇩")
      ),
      createElement("div", {
        style: { width: "100%", height: 2, backgroundColor: "#1F1F1F", margin: "40px 0" },
      }),
      createElement("div", { style: { fontSize: 180, margin: "40px 0" } }, item.emoji),
      createElement(
        "div",
        {
          style: {
            fontSize: 28,
            color: "#71717A",
            fontFamily: "Space Grotesk",
            fontWeight: 500,
            textTransform: "uppercase",
            textAlign: "center",
          },
        },
        "1 HARI MBG SETARA"
      ),
      createElement(
        "div",
        {
          style: {
            fontSize: numberFontSize,
            color: "#F59E0B",
            fontFamily: "Syne",
            fontWeight: 800,
            margin: "20px 0",
            textAlign: "center",
          },
        },
        compactStr
      ),
      createElement(
        "div",
        {
          style: {
            fontSize: 48,
            color: "#FAFAFA",
            fontFamily: "Space Grotesk",
            fontWeight: 700,
            textAlign: "center",
          },
        },
        `${item.unit} ${item.name}`
      ),
      createElement(
        "div",
        {
          style: {
            marginTop: "auto",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
          },
        },
        createElement("div", {
          style: { width: "100%", height: 2, backgroundColor: "#1F1F1F", margin: "40px 0" },
        }),
        createElement(
          "div",
          {
            style: {
              fontSize: 30,
              color: "#71717A",
              fontFamily: "Space Grotesk",
              fontWeight: 500,
            },
          },
          "Rp 1,2 Triliun/hari · APBN 2026"
        ),
        createElement(
          "div",
          {
            style: {
              fontSize: 32,
              color: "#DC2626",
              fontFamily: "Space Grotesk",
              fontWeight: 700,
              marginTop: 10,
            },
          },
          appUrl ?? "matambg.web.id"
        )
      )
    )
  )

  return new ImageResponse(
    imageJsx,
    {
      width: 1080,
      height: 1920,
      headers: {
        "Cache-Control": "public, max-age=86400",
      },
      fonts: [
        {
          name: "Syne",
          data: syneBuffer,
          weight: 800,
        },
        {
          name: "Space Grotesk",
          data: spaceMediumBuffer,
          weight: 500,
        },
        {
          name: "Space Grotesk",
          data: spaceBoldBuffer,
          weight: 700,
        },
      ],
    }
  )
}
