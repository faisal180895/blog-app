"use client"

import { useEffect, useState } from "react"

export function ReadingProgress() {
    const [progress, setProgress] = useState(0)

    useEffect(() => {
        const update = () => {
            const scroll = window.scrollY
            const height =
                document.body.scrollHeight - window.innerHeight

            if (height <= 0) {
                setProgress(0)
                return
            }

            setProgress(Math.min(100, (scroll / height) * 100))
        }

        update()
        window.addEventListener("scroll", update)
        return () => window.removeEventListener("scroll", update)
    }, [])

    return (
        <div className="fixed left-0 right-0 top-0 z-50 h-1 bg-black/5">
            <div
                className="h-full bg-[color:var(--accent)] transition-[width]"
                style={{ width: `${progress}%` }}
            />
        </div>
    )
}
