"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, Save, Trash2, AlertCircle, CheckCircle, Loader } from "lucide-react"
import { PostEditor } from "@/components/dashboard/post-editor"
import { FormField } from "@/components/form/form-field"

interface PostFormProps {
  initialPost?: {
    title: string
    slug: string
    excerpt: string | null
    coverImage: string | null
    published: boolean
    content: Record<string, unknown>
  }
  mode: "create" | "edit"
}

const emptyContent = {
  type: "doc",
  content: [{ type: "paragraph" }],
}

interface ValidationError {
  field: string
  message: string
}

function formatApiError(payload: unknown, fallback: string): string {
  if (typeof payload === "string" && payload.trim()) {
    return payload
  }

  if (typeof payload !== "object" || payload === null) {
    return fallback
  }

  const response = payload as {
    error?: unknown
    details?: unknown
  }

  if (typeof response.error === "string" && response.error.trim()) {
    const detailMessages = extractDetailMessages(response.details)
    return detailMessages.length
      ? `${response.error} ${detailMessages.join(" ")}`
      : response.error
  }

  const detailMessages = extractDetailMessages(response.details)
  return detailMessages.length ? detailMessages.join(" ") : fallback
}

function extractDetailMessages(details: unknown): string[] {
  if (typeof details === "string" && details.trim()) {
    return [details]
  }

  if (Array.isArray(details)) {
    return details.flatMap(extractDetailMessages)
  }

  if (typeof details === "object" && details !== null) {
    return Object.entries(details).flatMap(([field, value]) => {
      const messages = extractDetailMessages(value)
      return messages.map((message) => `${field}: ${message}`)
    })
  }

  return []
}

export function PostForm({ initialPost, mode }: PostFormProps) {
  const router = useRouter()
  const [title, setTitle] = useState(initialPost?.title ?? "")
  const [slug, setSlug] = useState(initialPost?.slug ?? "")
  const [excerpt, setExcerpt] = useState(initialPost?.excerpt ?? "")
  const [coverImage, setCoverImage] = useState(initialPost?.coverImage ?? "")
  const [published, setPublished] = useState(initialPost?.published ?? false)
  const [content, setContent] = useState<Record<string, unknown>>(
    initialPost?.content ?? emptyContent
  )
  const [slugTouched, setSlugTouched] = useState(Boolean(initialPost?.slug))
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [aiPrompt, setAiPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)
  const [aiMessage, setAiMessage] = useState<string | null>(null)

  function textToTipTapDocument(text: string): Record<string, unknown> {
    const paragraphs = text
      .trim()
      .split(/\n\s*\n/)
      .map((paragraph) => paragraph.replace(/\n/g, " ").trim())
      .filter(Boolean)

    return {
      type: "doc",
      content: paragraphs.map((paragraph) => ({
        type: "paragraph",
        content: [{ type: "text", text: paragraph }],
      })),
    }
  }

  function contentToPlainText(contentData: Record<string, unknown>): string {
    const nodes = (contentData as { content?: unknown }).content
    if (!Array.isArray(nodes)) {
      return ""
    }

    const extractText = (node: unknown): string => {
      if (typeof node !== "object" || node === null) {
        return ""
      }

      const typedNode = node as { type?: unknown; content?: unknown; text?: unknown }
      if (typeof typedNode.type !== "string") {
        return ""
      }

      const { type, content } = typedNode

      if (type === "paragraph" || type === "heading") {
        if (Array.isArray(content)) {
          return content
            .map((child) =>
              typeof child === "object" && child !== null
                ? String((child as { text?: unknown }).text ?? "")
                : ""
            )
            .join("")
        }

        return ""
      }

      if (type === "bulletList" || type === "orderedList") {
        if (Array.isArray(content)) {
          return content
            .map((item) => extractText(item))
            .filter(Boolean)
            .join("\n")
        }

        return ""
      }

      if (Array.isArray(content)) {
        return content.map(extractText).filter(Boolean).join(" ")
      }

      return ""
    }

    return nodes.map(extractText).filter(Boolean).join("\n\n")
  }

  async function callAi(type: "draft" | "excerpt") {
    if (!title.trim()) {
      setAiError("Please add a title before using AI.")
      return
    }

    setAiError(null)
    setAiMessage(null)
    setIsGenerating(true)

    try {
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type,
          title,
          excerpt,
          content: contentToPlainText(content),
          prompt: aiPrompt,
        }),
      })

      if (!response.ok) {
        const json = await response.json().catch(() => ({}))
        setAiError(formatApiError(json, "AI request failed. Please try again."))
        return
      }

      const data = await response.json()

      if (!data.text) {
        setAiError("AI returned no content. Try again with a different title or prompt.")
        return
      }

      if (type === "draft") {
        setContent(textToTipTapDocument(data.text))
        setAiMessage("Draft created in the editor. You can edit it freely.")
      } else {
        setExcerpt(data.text.trim())
        setAiMessage("Excerpt generated. Customize it if needed.")
      }
    } catch (error) {
      console.error("AI request error", error)
      setAiError("AI request failed. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  function handleTitleChange(value: string) {
    setTitle(value)
    clearFieldError("title")

    if (mode === "create" && !slugTouched) {
      setSlug(
        value
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-")
      )
    }
  }

  function validateForm(): boolean {
    const errors: ValidationError[] = []

    if (!title.trim()) {
      errors.push({ field: "title", message: "Title is required" })
    } else if (title.length < 3) {
      errors.push({ field: "title", message: "Title must be at least 3 characters" })
    }

    if (!slug.trim()) {
      errors.push({ field: "slug", message: "Slug is required" })
    } else if (!/^[a-z0-9-]+$/.test(slug)) {
      errors.push({ field: "slug", message: "Slug can only contain lowercase letters, numbers, and hyphens" })
    }

    if (coverImage && !isValidUrl(coverImage)) {
      errors.push({ field: "coverImage", message: "Please enter a valid URL" })
    }

    setValidationErrors(errors)
    return errors.length === 0
  }

  function isValidUrl(url: string): boolean {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  function clearFieldError(field: string) {
    setValidationErrors((prev) => prev.filter((e) => e.field !== field))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!validateForm()) {
      return
    }

    setError(null)
    setSuccess(null)
    setIsSaving(true)

    const payload = {
      title,
      slug,
      excerpt,
      coverImage: coverImage || null,
      content,
      published,
    }

    const endpoint =
      mode === "create" ? "/api/posts" : `/api/posts/${initialPost?.slug ?? slug}`
    const method = mode === "create" ? "POST" : "PATCH"

    try {
      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({
          error: "Unable to save the post.",
        }))
        setError(data.error ?? "Unable to save the post.")
        setIsSaving(false)
        return
      }

      const data = await response.json()
      const post = data?.data ?? data
      setSuccess(mode === "create" ? "Post created successfully!" : "Changes saved successfully!")
      setIsSaving(false)

      setTimeout(() => {
        router.push(`/dashboard/posts/${post.slug}`)
        router.refresh()
      }, 1000)
    } catch {
      setError("An unexpected error occurred. Please try again.")
      setIsSaving(false)
    }
  }

  async function handleDelete() {
    if (mode !== "edit" || !initialPost?.slug) {
      return
    }

    const confirmed = window.confirm("Delete this post permanently? This action cannot be undone.")

    if (!confirmed) {
      return
    }

    setError(null)
    setSuccess(null)
    setIsDeleting(true)

    try {
      const response = await fetch(`/api/posts/${initialPost.slug}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({
          error: "Unable to delete the post.",
        }))
        setError(data.error ?? "Unable to delete the post.")
        setIsDeleting(false)
        return
      }

      setSuccess("Post deleted successfully!")
      setTimeout(() => {
        router.push("/dashboard/posts")
        router.refresh()
      }, 1000)
    } catch {
      setError("An unexpected error occurred. Please try again.")
      setIsDeleting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error/Success Alerts */}
      {error && (
        <div className="card border-l-4 border-rose bg-rose/5 p-4 flex items-start gap-3">
          <AlertCircle size={20} className="text-rose mt-0.5 flex-shrink-0" />
          <p className="text-sm text-foreground">{error}</p>
        </div>
      )}

      {success && (
        <div className="card border-l-4 border-green-600 bg-green-50 p-4 flex items-start gap-3">
          <CheckCircle size={20} className="text-green-600 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-foreground">{success}</p>
        </div>
      )}

      <div className="panel space-y-6 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold">AI Writing Assistant</h2>
            <p className="text-sm text-muted mt-1">
              Generate a post draft or excerpt automatically, then edit it in the editor below.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => callAi("draft")}
              disabled={isGenerating}
              className="action inline-flex items-center gap-2"
            >
              {isGenerating ? <Loader size={16} className="animate-spin" /> : null}
              <span>Generate draft</span>
            </button>
            <button
              type="button"
              onClick={() => callAi("excerpt")}
              disabled={isGenerating}
              className="action action-secondary inline-flex items-center gap-2"
            >
              <span>Generate excerpt</span>
            </button>
          </div>
        </div>

        <FormField
          label="Custom AI prompt"
          hint="Optional guidance for the AI (leave empty for general writing)"
        >
          <input
            value={aiPrompt}
            onChange={(event) => setAiPrompt(event.target.value)}
            className="w-full rounded-lg border border-[color:var(--border)] px-4 py-3 bg-white/80 transition-colors focus:ring-2 focus:ring-accent/30 outline-none"
            placeholder="e.g., 'Write in a casual tone for beginners'"
          />
        </FormField>

        {aiError ? (
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 flex items-start gap-3">
            <AlertCircle size={20} className="text-destructive mt-0.5 flex-shrink-0" />
            <p className="text-sm text-foreground">{aiError}</p>
          </div>
        ) : null}

        {aiMessage ? (
          <div className="rounded-lg border border-green-200/50 bg-green-50/50 p-4 flex items-start gap-3">
            <CheckCircle size={20} className="text-green-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-foreground">{aiMessage}</p>
          </div>
        ) : null}
      </div>

      {/* Main Form Panel */}
      <div className="panel space-y-6 p-6">
        <div>
          <h2 className="text-2xl font-bold">Post Details</h2>
          <p className="text-sm text-muted mt-1">Add the essential information about your post</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            label="Title"
            required
            error={validationErrors.find((e) => e.field === "title")?.message}
            hint="The main heading for your story"
          >
            <input
              value={title}
              onChange={(event) => handleTitleChange(event.target.value)}
              className="w-full rounded-lg border border-[color:var(--border)] px-4 py-3 bg-white/80 transition-colors focus:ring-2 focus:ring-accent/30 outline-none"
              placeholder="The story title"
              required
            />
          </FormField>

          <FormField
            label="Slug"
            required
            error={validationErrors.find((e) => e.field === "slug")?.message}
            hint="URL-friendly identifier (auto-generated from title)"
          >
            <input
              value={slug}
              onChange={(event) => {
                setSlugTouched(true)
                setSlug(event.target.value)
                clearFieldError("slug")
              }}
              className="w-full rounded-lg border border-[color:var(--border)] px-4 py-3 bg-white/80 transition-colors focus:ring-2 focus:ring-accent/30 outline-none"
              placeholder="story-slug"
            />
          </FormField>
        </div>

        <div className="grid gap-4 md:grid-cols-[1.6fr_1fr]">
          <FormField
            label="Excerpt"
            hint="Short description (optional; auto-generated if empty)"
          >
            <textarea
              value={excerpt}
              onChange={(event) => {
                setExcerpt(event.target.value)
                clearFieldError("excerpt")
              }}
              className="min-h-28 w-full rounded-lg border border-[color:var(--border)] bg-white/80 px-4 py-3 transition-colors focus:ring-2 focus:ring-accent/30 outline-none resize-none"
              placeholder="Short summary for cards and social previews"
            />
            <p className="text-xs text-[color:var(--muted)]">{excerpt.length}/180 characters</p>
          </FormField>

          <div className="space-y-4">
            <FormField
              label="Cover image URL"
              error={validationErrors.find((e) => e.field === "coverImage")?.message}
              hint="HTTPS image URL or leave empty"
            >
              <input
                value={coverImage}
                onChange={(event) => {
                  setCoverImage(event.target.value)
                  clearFieldError("coverImage")
                }}
                className="w-full rounded-lg border border-[color:var(--border)] px-4 py-3 bg-white/80 transition-colors focus:ring-2 focus:ring-accent/30 outline-none"
                placeholder="https://..."
              />
            </FormField>

            <FormField
              label="Or upload new image"
            >
              <input
                type="file"
                accept="image/*"
                onChange={async (event) => {
                  const file = event.target.files?.[0]

                  if (!file) {
                    return
                  }

                  setUploadError(null)
                  setIsUploading(true)

                  try {
                    const formData = new FormData()
                    formData.append("file", file)

                    const uploadResponse = await fetch("/api/upload", {
                      method: "POST",
                      body: formData,
                    })

                    if (!uploadResponse.ok) {
                      const data = await uploadResponse.json().catch(() => ({}))
                      setUploadError(data.error || "Upload failed. Please try again.")
                      return
                    }

                    const data = await uploadResponse.json()
                    if (data.url) {
                      setCoverImage(data.url)
                    } else {
                      setUploadError("Upload failed. No URL returned.")
                    }
                  } catch {
                    setUploadError("Upload failed. Please try again.")
                  } finally {
                    setIsUploading(false)
                  }
                }}
                className="w-full rounded-lg border border-[color:var(--border)] bg-white/80 px-3 py-2 file:px-0 file:py-0"
              />
              {isUploading && <p className="text-xs text-[color:var(--muted)] mt-2 flex items-center gap-2"><Loader size={14} className="animate-spin" /> Uploading…</p>}
              {uploadError && <p className="text-xs text-destructive mt-2">{uploadError}</p>}
            </FormField>

            {coverImage && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Cover preview</p>
                <div
                  className="h-32 rounded-lg border border-[color:var(--border)] bg-cover bg-center"
                  style={{ backgroundImage: `url(${coverImage})` }}
                  role="img"
                  aria-label="Cover image preview"
                />
              </div>
            )}
          </div>

          <label className="flex items-center gap-3 text-sm cursor-pointer select-none">
            <input
              type="checkbox"
              checked={published}
              onChange={(event) => setPublished(event.target.checked)}
              className="w-4 h-4 rounded accent-accent cursor-pointer"
              aria-label="Publish post immediately"
            />
            <span className="font-semibold">Publish immediately</span>
          </label>
        </div>
      </div>

      {/* Editor Section */}
      <div className="space-y-3">
        <div>
          <p className="eyebrow">Writing</p>
          <h2 className="mt-2 text-2xl font-bold">Content</h2>
        </div>

        <PostEditor content={content} onChange={setContent} />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-3 pt-4">
        <button
          type="submit"
          disabled={isSaving || isDeleting}
          className="action inline-flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSaving ? <Loader size={17} className="animate-spin" /> : <Save size={17} />}
          <span>{isSaving ? "Saving..." : mode === "create" ? "Create post" : "Save changes"}</span>
        </button>

        {mode === "edit" && published ? (
          <button
            type="button"
            onClick={() => router.push(`/posts/${initialPost?.slug ?? slug}`)}
            className="action action-secondary inline-flex items-center gap-2"
          >
            <Eye size={17} />
            View live
          </button>
        ) : null}

        <button
          type="button"
          onClick={() => router.push("/dashboard/posts")}
          className="action action-secondary inline-flex items-center gap-2"
        >
          Back to posts
        </button>

        {mode === "edit" ? (
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting || isSaving}
            className="action inline-flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ background: "#b3251c" }}
          >
            {isDeleting ? <Loader size={17} className="animate-spin" /> : <Trash2 size={17} />}
            <span>{isDeleting ? "Deleting..." : "Delete"}</span>
          </button>
        ) : null}
      </div>
    </form>
  )
}
