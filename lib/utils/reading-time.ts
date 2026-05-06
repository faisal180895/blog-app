export function estimateReadingTime(content: unknown): number {
  const WORDS_PER_MINUTE = 200

  if (!content) return 1

  let text = ""

  function extractText(node: unknown): string {
    if (!node) return ""
    if (typeof node === "string") return node

    if (typeof node !== "object") {
      return ""
    }

    const richTextNode = node as {
      text?: unknown
      content?: unknown
    }

    if (typeof richTextNode.text === "string") {
      return richTextNode.text
    }

    if (Array.isArray(richTextNode.content)) {
      return richTextNode.content.map(extractText).join(" ")
    }

    return ""
  }

  if (typeof content === "object" && content !== null) {
    text = extractText(content)
  } else if (typeof content === "string") {
    text = content
  }

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0
  const minutes = Math.ceil(wordCount / WORDS_PER_MINUTE)

  return Math.max(1, minutes)
}

export function formatReadingTime(minutes: number): string {
  if (minutes < 1) return "< 1 min"
  if (minutes === 1) return "1 min read"
  return `${minutes} min read`
}
