"use client"

import type { HeadingItem } from "@/lib/posts"

interface TableOfContentsProps {
    headings: HeadingItem[]
}

export function TableOfContents({ headings }: TableOfContentsProps) {
    if (!headings.length) return null

    return (
        <aside className="fixed right-10 top-28 hidden w-60 xl:block">
            <div className="card p-4">
                <h4 className="mb-3 font-medium">
                    On this page
                </h4>

                <div className="space-y-3">
                    {headings.map((heading) => (
                        <a
                            key={heading.id}
                            href={`#${heading.id}`}
                            className="block text-sm text-[color:var(--muted)] transition-colors hover:text-[color:var(--foreground)]"
                            style={{ paddingLeft: `${(heading.level - 1) * 12}px` }}
                        >
                            {heading.text}
                        </a>
                    ))}
                </div>
            </div>
        </aside>
    )
}
