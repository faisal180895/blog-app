"use client"

import { EditorContent, useEditor } from "@tiptap/react"
import Image from "@tiptap/extension-image"
import Link from "@tiptap/extension-link"
import Placeholder from "@tiptap/extension-placeholder"
import StarterKit from "@tiptap/starter-kit"
import { Bold, Heading2, Heading3, List, ListOrdered, Quote, Code, Undo2, Redo2 } from "lucide-react"

interface PostEditorProps {
  content?: Record<string, unknown>
  onChange: (content: Record<string, unknown>) => void
}

export function PostEditor({ content, onChange }: PostEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: {
          HTMLAttributes: {
            class: "rounded-lg bg-slate-900 text-slate-100 p-4 overflow-x-auto",
          },
        },
      }),
      Image.configure({
        allowBase64: true,
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
      }),
      Placeholder.configure({
        placeholder: "Start writing your story...",
      }),
    ],
    editorProps: {
      attributes: {
        class: "min-h-[400px] max-h-[600px] overflow-y-auto rounded-lg bg-white px-6 py-5 leading-7 outline-none focus:ring-2 focus:ring-accent/30 prose prose-sm max-w-none",
      },
    },
    content: content ?? {
      type: "doc",
      content: [{ type: "paragraph" }],
    },
    onUpdate({ editor }) {
      onChange(editor.getJSON() as Record<string, unknown>)
    },
    immediatelyRender: false,
  })

  if (!editor) {
    return null
  }

  const controls = [
    { label: "Bold", icon: Bold, action: () => editor.chain().focus().toggleBold().run(), isActive: () => editor.isActive("bold") },
    { label: "Heading 2", icon: Heading2, action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), isActive: () => editor.isActive("heading", { level: 2 }) },
    { label: "Heading 3", icon: Heading3, action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(), isActive: () => editor.isActive("heading", { level: 3 }) },
    { label: "Bullet List", icon: List, action: () => editor.chain().focus().toggleBulletList().run(), isActive: () => editor.isActive("bulletList") },
    { label: "Ordered List", icon: ListOrdered, action: () => editor.chain().focus().toggleOrderedList().run(), isActive: () => editor.isActive("orderedList") },
    { label: "Quote", icon: Quote, action: () => editor.chain().focus().toggleBlockquote().run(), isActive: () => editor.isActive("blockquote") },
    { label: "Code", icon: Code, action: () => editor.chain().focus().toggleCodeBlock().run(), isActive: () => editor.isActive("codeBlock") },
  ]

  return (
    <div className="card p-0 overflow-hidden">
      <div className="border-b border-[color:var(--border)] bg-gradient-to-r from-white/60 to-accent/5 p-4">
        <div className="flex flex-wrap gap-1">
          {controls.map((control) => {
            const Icon = control.icon
            const active = control.isActive()

            return (
              <button
                key={control.label}
                type="button"
                onClick={control.action}
                title={control.label}
                className={`inline-flex h-10 items-center gap-2 rounded-lg border px-3 text-sm font-medium transition-all duration-200 ${
                  active
                    ? "bg-accent text-white border-accent shadow-md"
                    : "border-[color:var(--border)] bg-white hover:bg-accent/5"
                }`}
              >
                <Icon size={17} />
                <span className="hidden sm:inline">{control.label}</span>
              </button>
            )
          })}
          
          <div className="w-px bg-[color:var(--border)] mx-2" />
          
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-[color:var(--border)] px-3 text-sm font-medium transition-all hover:bg-accent/5 disabled:opacity-50"
            title="Undo"
          >
            <Undo2 size={17} />
          </button>
          
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-[color:var(--border)] px-3 text-sm font-medium transition-all hover:bg-accent/5 disabled:opacity-50"
            title="Redo"
          >
            <Redo2 size={17} />
          </button>
        </div>
      </div>

      <EditorContent editor={editor} />
    </div>
  )
}
