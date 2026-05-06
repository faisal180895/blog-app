"use client"

import { useEffect, useState } from "react"
import { signIn, useSession } from "next-auth/react"
import { MessageCircle, Send, ThumbsUp } from "lucide-react"

interface CommentItem {
  id: string
  text: string
  createdAt: string
  user: {
    name: string | null
    image: string | null
  }
}

interface PostEngagementProps {
  postId: string
  initialCommentCount: number
  initialLikeCount: number
}

export function PostEngagement({
  postId,
  initialCommentCount,
  initialLikeCount,
}: PostEngagementProps) {
  const { status } = useSession()
  const [comments, setComments] = useState<CommentItem[]>([])
  const [commentText, setCommentText] = useState("")
  const [commentCount, setCommentCount] = useState(initialCommentCount)
  const [likeCount, setLikeCount] = useState(initialLikeCount)
  const [liked, setLiked] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoadingComments, setIsLoadingComments] = useState(true)
  const [isSavingComment, setIsSavingComment] = useState(false)
  const [isTogglingLike, setIsTogglingLike] = useState(false)

  useEffect(() => {
    let isActive = true

    async function loadEngagement() {
      setIsLoadingComments(true)

      const [commentsResponse, likesResponse] = await Promise.all([
        fetch(`/api/comments?postId=${encodeURIComponent(postId)}`),
        fetch(`/api/likes?postId=${encodeURIComponent(postId)}`),
      ])

      if (!isActive) {
        return
      }

      if (commentsResponse.ok) {
        const json = await commentsResponse.json()
        if (json?.success && Array.isArray(json.data)) {
          setComments(json.data)
          setCommentCount(json.data.length)
        }
      }

      if (likesResponse.ok) {
        const json = await likesResponse.json()
        if (json?.success && json.data) {
          setLikeCount(Number(json.data.count) || 0)
          setLiked(Boolean(json.data.liked))
        }
      }

      setIsLoadingComments(false)
    }

    loadEngagement().catch(() => {
      if (isActive) {
        setError("Unable to load comments right now.")
        setIsLoadingComments(false)
      }
    })

    return () => {
      isActive = false
    }
  }, [postId])

  async function toggleLike() {
    if (status !== "authenticated") {
      signIn()
      return
    }

    setError(null)
    setIsTogglingLike(true)

    const response = await fetch("/api/likes", {
      method: liked ? "DELETE" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId }),
    })

    const json = await response.json().catch(() => null)
    if (!response.ok || !json?.success) {
      setError(json?.error || "Unable to update your like.")
      setIsTogglingLike(false)
      return
    }

    const nextLiked = !liked
    setLiked(nextLiked)
    setLikeCount((current) => Math.max(0, current + (nextLiked ? 1 : -1)))
    setIsTogglingLike(false)
  }

  async function submitComment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (status !== "authenticated") {
      signIn()
      return
    }

    const text = commentText.trim()

    if (!text) {
      return
    }

    setError(null)
    setIsSavingComment(true)

    const response = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId, text }),
    })

    const json = await response.json().catch(() => null)
    if (!response.ok || !json?.success) {
      setError(json?.error || "Unable to post your comment.")
      setIsSavingComment(false)
      return
    }

    const comment = json.data as CommentItem
    setComments((current) => [comment, ...current])
    setCommentCount((current) => current + 1)
    setCommentText("")
    setIsSavingComment(false)
  }

  return (
    <section className="mt-6 grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
      <div className="card h-fit p-5">
        <p className="eyebrow">Reader Response</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={toggleLike}
            disabled={isTogglingLike}
            className="action"
          >
            <ThumbsUp size={17} />
            {liked ? "Liked" : "Like"} ({likeCount})
          </button>
          <div className="action action-secondary">
            <MessageCircle size={17} />
            {commentCount} comments
          </div>
        </div>
        {status !== "authenticated" ? (
          <p className="mt-4 text-sm text-[color:var(--muted)]">
            Sign in to like posts and join the discussion.
          </p>
        ) : null}
        {error ? <p className="mt-4 text-sm text-red-700">{error}</p> : null}
      </div>

      <div className="panel p-5">
        <form onSubmit={submitComment} className="space-y-3">
          <label className="block space-y-2 text-sm">
            <span>Comment</span>
            <textarea
              value={commentText}
              onChange={(event) => setCommentText(event.target.value)}
              className="min-h-28 w-full rounded-2xl border border-[color:var(--border)] bg-white/80 px-4 py-3"
              placeholder="Share a thoughtful response"
            />
          </label>
          <button
            type="submit"
            disabled={isSavingComment}
            className="action"
          >
            <Send size={17} />
            {isSavingComment ? "Posting..." : "Post comment"}
          </button>
        </form>

        <div className="mt-6 grid gap-3">
          {isLoadingComments ? (
            <p className="text-sm text-[color:var(--muted)]">Loading comments...</p>
          ) : comments.length ? (
            comments.map((comment) => (
              <article key={comment.id} className="rounded-2xl bg-white/60 p-4">
                <div className="flex flex-wrap items-center gap-2 text-sm text-[color:var(--muted)]">
                  <span className="font-semibold text-[color:var(--foreground)]">
                    {comment.user.name ?? "Anonymous"}
                  </span>
                  <span>
                    {new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(
                      new Date(comment.createdAt)
                    )}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6">{comment.text}</p>
              </article>
            ))
          ) : (
            <p className="text-sm text-[color:var(--muted)]">No comments yet.</p>
          )}
        </div>
      </div>
    </section>
  )
}
