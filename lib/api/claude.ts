import Anthropic from "@anthropic-ai/sdk"

// apiKey defaults to "" at build time — actual validation happens at runtime
// when the API key is missing, Anthropic SDK throws on the first API call
export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY ?? "",
})
