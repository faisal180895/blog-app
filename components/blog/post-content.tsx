import Image from "next/image"
import { slugify, type RichTextNode } from "@/lib/posts"

interface PostContentProps {
  post: {
    title: string
    excerpt: string | null
    content: RichTextNode
    coverImage: string | null
    author: {
      name: string | null
      image: string | null
    }
    createdAt: Date
  }
}

function renderInline(nodes: RichTextNode[] = []): React.ReactNode {
  return nodes.map((node, index) => {
    if (node.type !== "text") {
      return <span key={index}>{renderNode(node, index)}</span>
    }

    let content: React.ReactNode = node.text ?? ""

    for (const mark of node.marks ?? []) {
      if (mark.type === "bold") {
        content = <strong key={`${index}-bold`}>{content}</strong>
      }

      if (mark.type === "italic") {
        content = <em key={`${index}-italic`}>{content}</em>
      }

      if (mark.type === "link") {
        content = (
          <a
            key={`${index}-link`}
            href={String(mark.attrs?.href ?? "#")}
            target="_blank"
            rel="noreferrer"
            className="font-semibold underline decoration-[color:var(--accent)] underline-offset-4"
          >
            {content}
          </a>
        )
      }
    }

    return <span key={index}>{content}</span>
  })
}

function renderNode(node: RichTextNode, index: number): React.ReactNode {
  const children = node.content ?? []
  const text = children.map((child) => child.text ?? "").join(" ").trim()

  switch (node.type) {
    case "paragraph":
      return <p key={index}>{renderInline(children)}</p>
    case "heading": {
      const level = Number(node.attrs?.level ?? 2)
      const id = slugify(text || `section-${index + 1}`)

      if (level === 1) {
        return (
          <h1 key={index} id={id} className="text-4xl">
            {renderInline(children)}
          </h1>
        )
      }

      if (level === 3) {
        return (
          <h3 key={index} id={id} className="text-2xl">
            {renderInline(children)}
          </h3>
        )
      }

      return (
        <h2 key={index} id={id} className="text-3xl">
          {renderInline(children)}
        </h2>
      )
    }
    case "bulletList":
      return <ul key={index}>{children.map((child, childIndex) => renderNode(child, childIndex))}</ul>
    case "orderedList":
      return <ol key={index}>{children.map((child, childIndex) => renderNode(child, childIndex))}</ol>
    case "listItem":
      return <li key={index}>{children.map((child, childIndex) => renderNode(child, childIndex))}</li>
    case "blockquote":
      return <blockquote key={index}>{renderInline(children)}</blockquote>
    case "codeBlock":
      return (
        <pre key={index}>
          <code>{text}</code>
        </pre>
      )
    case "image": {
      const src = String(node.attrs?.src ?? "").trim()
      const alt = String(node.attrs?.alt ?? "Post image")

      if (!src) {
        return <p key={index}>Image source is missing.</p>
      }

      return (
        <div key={index} className="relative my-8 h-[320px] w-full overflow-hidden rounded-[1.5rem] bg-black/5">
          <Image
            src={src}
            alt={alt}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 100vw"
          />
        </div>
      )
    }
    default:
      return <p key={index}>{renderInline(children)}</p>
  }
}

export function PostContent({ post }: PostContentProps) {
  const contentNodes = Array.isArray(post.content?.content) ? post.content.content : []

  return (
    <article className="card overflow-hidden">
      {post.coverImage ? (
        <div
          className="h-[340px] w-full bg-cover bg-center md:h-[430px]"
          style={{
            backgroundImage: `linear-gradient(180deg, rgba(23, 33, 27, 0.06), rgba(23, 33, 27, 0.46)), url(${post.coverImage})`,
          }}
        />
      ) : null}

      <div className="space-y-6 p-8 md:p-10">
        <div className="space-y-4">
          <p className="eyebrow">Published Story</p>
          <h1 className="text-5xl md:text-6xl">{post.title}</h1>
          {post.excerpt ? (
            <p className="max-w-3xl text-lg leading-8 text-[color:var(--muted)]">{post.excerpt}</p>
          ) : null}
          <p className="text-sm text-[color:var(--muted)]">
            {post.author.name ?? "Anonymous"} <span aria-hidden="true">&middot;</span>{" "}
            {new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(post.createdAt)}
          </p>
        </div>

        <div className="rich-text">{contentNodes.map((node, index) => renderNode(node, index))}</div>
      </div>
    </article>
  )
}
