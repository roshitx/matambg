import { z } from "zod";

const envSchema = z.object({
  ANTHROPIC_API_KEY: z.string().min(1, "Anthropic API key required"),
  OPENROUTER_API_KEY: z.string().min(1, "OpenRouter API key required"),
  EXA_API_KEY: z.string().min(1, "Exa API key required"),
  TAVILY_API_KEY: z.string().min(1, "Tavily API key required"),
  NEXT_PUBLIC_APP_URL: z.url(),
  NEXT_PUBLIC_APP_NAME: z.string().default("MataMBG"),
  CRON_SECRET: z.string().optional(),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
});

export const env = envSchema.parse(process.env);
export type Env = z.infer<typeof envSchema>;
