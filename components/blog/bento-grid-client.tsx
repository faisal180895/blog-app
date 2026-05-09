"use client"

import Link from "next/link"
import Image from "next/image"
import { motion, type Variants } from "framer-motion"
import { Heart, MessageCircle, ArrowRight, Layers, Sparkles } from "lucide-react"

interface FeaturedPostCard {
  id: string
  title: string
  slug: string
  excerpt: string | null
  coverImage: string | null
  author: {
    name: string | null
  }
  _count: {
    comments: number
    likes: number
  }
}

interface BentoGridClientProps {
  featuredPosts: FeaturedPostCard[]
}

export function BentoGridClient({ featuredPosts }: BentoGridClientProps) {
  if (!featuredPosts.length) {
    return (
      <section className="px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="panel grid gap-8 p-8 md:grid-cols-[1fr_0.7fr] md:p-12"
        >
          <div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="eyebrow text-accent font-bold"
            >
              Editorial Studio
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-4 max-w-3xl text-5xl md:text-6xl font-bold leading-tight"
            >
              Publish thoughtful stories with a modern blog platform.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-4 max-w-2xl text-base leading-7 text-[color:var(--muted)]"
            >
              Create, draft, publish, and engage with readers—all from one focused writing space. Start your blogging journey today.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-8 flex flex-wrap gap-3"
            >
              <Link href="/dashboard/posts/new" className="action inline-flex items-center gap-2 hover:scale-105 transition-transform">
                <span>Write a story</span>
                <ArrowRight size={18} />
              </Link>
              <Link href="/posts" className="action action-secondary hover:scale-105 transition-transform">
                Browse posts
              </Link>
            </motion.div>
          </div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="grid content-end gap-3 rounded-lg bg-gradient-to-br from-accent to-accent-strong p-6 text-white"
          >
            <p className="text-sm text-white/80 font-semibold">Publishing Stack</p>
            <div className="grid grid-cols-2 gap-3 text-sm font-medium">
              <span className="rounded-lg bg-white/15 backdrop-blur p-3 text-center">Authentication</span>
              <span className="rounded-lg bg-white/15 backdrop-blur p-3 text-center">Post Management</span>
              <span className="rounded-lg bg-white/15 backdrop-blur p-3 text-center">Comments</span>
              <span className="rounded-lg bg-white/15 backdrop-blur p-3 text-center">Engagement</span>
            </div>
          </motion.div>
        </motion.div>
      </section>
    )
  }

  const [lead, ...rest] = featuredPosts

  const featureCards = [
    {
      icon: Sparkles,
      title: "Fast publishing flow",
      description: "Move from draft to live with a single polished workflow built for writers.",
    },
    {
      icon: Layers,
      title: "Organize every story",
      description: "Group, preview, and manage posts with clear cards, status labels, and live controls.",
    },
    {
      icon: MessageCircle,
      title: "Engage your readers",
      description: "Collect likes and comments on every post, and keep the conversation alive.",
    },
  ]

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100 },
    },
  }

  return (
    <section className="space-y-8 px-4 md:px-6">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        <div className="grid gap-4 md:grid-cols-3">
          {featureCards.map((feature) => {
            const Icon = feature.icon
            return (
              <div key={feature.title} className="card p-6 border border-[color:var(--border)]">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                  <Icon size={20} />
                </div>
                <h3 className="mt-4 text-xl font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">{feature.description}</p>
              </div>
            )
          })}
        </div>

        <motion.div variants={itemVariants} className="panel grid gap-6 p-8 md:grid-cols-[1fr_auto] md:items-end md:p-10">
          <div>
            <p className="eyebrow text-accent font-bold">Featured Desk</p>
            <h1 className="mt-3 max-w-3xl text-5xl md:text-6xl font-bold leading-tight">Fresh writing, ready to read.</h1>
            <p className="mt-4 max-w-2xl text-base leading-6 text-[color:var(--muted)]">
              Explore the latest stories from our talented writers. Discover new perspectives and ideas.
            </p>
          </div>
          <Link href="/posts" className="action action-secondary inline-flex items-center gap-2">
            View all posts
            <ArrowRight size={18} />
          </Link>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-[1.35fr_0.9fr]">
          <motion.div variants={itemVariants}>
            <Link
              href={`/posts/${lead.slug}`}
              className="card group relative flex min-h-[440px] flex-col justify-end overflow-hidden p-8 transition-all duration-300 hover:shadow-2xl"
            >
              {lead.coverImage ? (
                <Image
                  src={lead.coverImage}
                  alt={lead.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-accent to-accent-strong" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <p className="eyebrow text-white/80 font-semibold">Lead Story</p>
                <h2 className="mt-4 max-w-2xl text-5xl md:text-6xl font-bold leading-tight">{lead.title}</h2>
                <p className="mt-4 max-w-xl text-base text-white/90 leading-relaxed">{lead.excerpt}</p>
                <div className="mt-6 flex items-center gap-4 text-sm font-semibold text-white/80 border-t border-white/20 pt-4">
                  <span>{lead.author.name ?? "Anonymous"}</span>
                  <span className="flex items-center gap-1">
                    <MessageCircle size={16} />
                    {lead._count.comments}
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart size={16} />
                    {lead._count.likes}
                  </span>
                </div>
              </div>
            </Link>
          </motion.div>

          <div className="grid gap-6">
            {rest.map((post: FeaturedPostCard, index: number) => (
              <motion.div key={post.id} variants={itemVariants}>
                <Link
                  href={`/posts/${post.slug}`}
                  className="card group flex min-h-[202px] flex-col justify-between p-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-lg"
                >
                  <div>
                    <p className="eyebrow text-accent group-hover:text-accent-strong">{index === 0 ? "Fresh Pick" : "Editor's Pick"}</p>
                    <h2 className="mt-3 text-3xl font-bold group-hover:text-accent transition-colors">{post.title}</h2>
                    <p className="mt-3 text-sm leading-6 text-[color:var(--muted)] group-hover:text-foreground transition-colors">{post.excerpt}</p>
                  </div>
                  <div className="flex items-center gap-3 text-sm font-semibold text-[color:var(--muted)] border-t border-[color:var(--border)] pt-3 mt-auto">
                    <span>{post.author.name ?? "Anonymous"}</span>
                    <span className="flex items-center gap-1">
                      <Heart size={14} />
                      {post._count.likes}
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  )
}
