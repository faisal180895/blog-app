export interface RichTextNode {
  type?: string
  text?: string
  attrs?: Record<string, unknown>
  marks?: Array<{ type?: string; attrs?: Record<string, unknown> }>
  content?: RichTextNode[]
}

export interface HeadingItem {
  id: string
  level: number
  text: string
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

export function extractText(nodes: RichTextNode[] = []): string {
  return nodes
    .map((node) => {
      if (node.type === "text") {
        return node.text ?? ""
      }

      return extractText(node.content)
    })
    .join(" ")
    .replace(/\s+/g, " ")
    .trim()
}

export function createExcerpt(
  content: RichTextNode[] | null | undefined,
  fallbackTitle: string
) {
  const text = extractText(content ?? [])

  if (!text) {
    return `A fresh story from ${fallbackTitle}.`
  }

  return text.slice(0, 180).trim()
}

export function getHeadings(nodes: RichTextNode[] = []): HeadingItem[] {
  const headings: HeadingItem[] = []

  for (const node of nodes) {
    if (node.type === "heading") {
      const text = extractText(node.content)
      const level = Number(node.attrs?.level ?? 2)
      headings.push({
        id: slugify(text || `section-${headings.length + 1}`),
        level,
        text: text || `Section ${headings.length + 1}`,
      })
    }

    if (node.content?.length) {
      headings.push(...getHeadings(node.content))
    }
  }

  return headings
}
