import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import { auth } from "@/lib/auth";

const apiKey = process.env.GOOGLE_API_KEY;
const requestSchema = z.object({
  type: z.enum(["draft", "excerpt"]).optional().default("draft"),
  title: z.string().trim().min(1, "Title is required.").max(180),
  excerpt: z.string().trim().max(500).optional(),
  content: z.string().trim().max(12000).optional(),
  prompt: z.string().trim().max(1000).optional(),
});

if (!apiKey && process.env.NODE_ENV === "development") {
  console.warn("[AI] GOOGLE_API_KEY not configured. AI generation will return 501 errors.");
}

const ai = new GoogleGenAI({ apiKey });

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
  }

  if (!apiKey) {
    return Response.json(
      { error: "AI generation is not configured. Add GOOGLE_API_KEY." },
      { status: 501 }
    );
  }

  try {
    const body = await req.json().catch(() => null);

    if (!body) {
      return Response.json({ error: "Invalid request body." }, { status: 400 });
    }

    const parsed = requestSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        {
          error: "Invalid AI generation payload.",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 422 }
      );
    }

    const { type, title, excerpt, content, prompt } = parsed.data;

    // Safely parse the user's custom prompt if it exists
    const userPrompt = typeof prompt === "string" ? prompt.trim() : "";

    // If the user didn't write a custom prompt, use optimized fallback templates
    const preparedPrompt = userPrompt || (
      type === "excerpt"
        ? `Write a short, engaging, click-worthy excerpt (under 150 characters) for a blog post titled "${title ?? "Untitled"}".`
        : `Write a well-structured, engaging blog post draft for the title "${title ?? "Untitled"}". Use proper headings and Markdown.`
    );

    // Build the final combined prompt payload for Gemini
    const modelPrompt = `${preparedPrompt}

${content ? `Current content:
${content}

` : ""}${excerpt ? `Current excerpt:
${excerpt}

` : ""}`.trim();

    // Call the Gemini API using the fast and smart flash model
    interface GeminiCandidate {
      content?: {
        parts?: Array<{ text?: string }>
      }
    }
    interface GeminiResponse {
      candidates?: GeminiCandidate[]
    }

    let response
    try {
      response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: modelPrompt,
      })
    } catch (apiError) {
      if (process.env.NODE_ENV === "development") {
        console.error("[AI] Generation error:", apiError instanceof Error ? apiError.message : apiError)
      }
      return Response.json(
        { error: "AI service temporarily unavailable. Try again later." },
        { status: 503 }
      )
    }

    if (!response) {
      return Response.json(
        { error: "AI service returned invalid response." },
        { status: 502 }
      )
    }

    const typedResponse = response as GeminiResponse
    const firstCandidate = typedResponse.candidates?.[0]
    const firstPart = firstCandidate?.content?.parts?.[0]
    const text = firstPart?.text?.trim() || ""

    if (!text) {
      return Response.json(
        { error: "AI generated no text. Try a different title or prompt." },
        { status: 502 }
      )
    }

    return Response.json({ text });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[AI] Unexpected error:", error instanceof Error ? error.message : error)
    }
    return Response.json({ error: "Failed to generate text" }, { status: 500 });
  }
}
