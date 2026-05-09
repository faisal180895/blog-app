# Code Fixes - Ready to Apply

## 1. Fix JWT Token Role Query (HIGH PRIORITY)

**File:** `lib/auth.ts` - Replace the jwt callback

### Current Code (Lines 68-77)
```typescript
async jwt({ token, user }) {
  if (user) {
    token.id = user.id
    token.role = user.role
  }

  if (token.email && !token.role) {
    const dbUser = await prisma.user.findUnique({
      where: { email: token.email },
      select: { id: true, role: true },
    })

    if (dbUser) {
      token.id = dbUser.id
      token.role = dbUser.role
    }
  }

  return token
}
```

### Fixed Code
```typescript
async jwt({ token, user }) {
  if (user) {
    token.id = user.id
    token.role = user.role
  }

  // Only query database if BOTH id and role are missing (truly fresh token)
  // This prevents N+1 queries on every session refresh
  if (token.email && !token.role && !token.id) {
    try {
      const dbUser = await prisma.user.findUnique({
        where: { email: token.email },
        select: { id: true, role: true },
      })

      if (dbUser) {
        token.id = dbUser.id
        token.role = dbUser.role
      }
    } catch (error) {
      console.error("[JWT Callback] Failed to fetch user role:", error)
      // Continue with token as-is; role will retry on next session
    }
  }

  return token
}
```

---

## 2. Fix AI Generation Response Parsing (HIGH PRIORITY)

**File:** `app/api/ai/generate/route.ts` - Replace lines 44-68

### Current Code
```typescript
const response = await ai.models.generateContent({
  model: "gemini-2.5-flash",
  contents: modelPrompt,
})

const responseData = response as unknown as {
  text?: string
  outputText?: string
  contents?: unknown
}

const contentItems = responseData.contents
const textFromContents = Array.isArray(contentItems)
  ? String((contentItems[0] as { text?: unknown })?.text ?? "")
  : ""

const text =
  responseData.text ||
  responseData.outputText ||
  textFromContents ||
  ""

if (!text) {
  return Response.json({ error: "AI returned no usable text." }, { status: 502 });
}

return Response.json({ text });
```

### Fixed Code
```typescript
interface GeminiCandidate {
  content?: {
    parts?: Array<{
      text?: string
    }>
  }
}

interface GeminiResponse {
  candidates?: GeminiCandidate[]
}

let text = ""

try {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: modelPrompt,
  })

  if (!response) {
    return Response.json(
      { error: "AI service returned no response." },
      { status: 502 }
    )
  }

  const typedResponse = response as GeminiResponse
  const firstCandidate = typedResponse.candidates?.[0]
  const firstPart = firstCandidate?.content?.parts?.[0]

  if (firstPart?.text) {
    text = firstPart.text.trim()
  }

  if (!text) {
    return Response.json(
      {
        error: "AI generated no text. Please try a different title or prompt.",
        details: "Response structure: " + JSON.stringify(typedResponse).slice(0, 100),
      },
      { status: 502 }
    )
  }

  return Response.json({ text })
} catch (error) {
  const errorMessage = error instanceof Error ? error.message : String(error)
  console.error("Gemini Generation Error:", errorMessage)

  return Response.json(
    {
      error: "Failed to generate text with AI.",
      details: process.env.NODE_ENV === "development" ? errorMessage : undefined,
    },
    { status: 500 }
  )
}
```

---

## 3. Fix Dashboard Stats Error Handling (MEDIUM PRIORITY)

**File:** `app/dashboard/page.tsx` - Replace lines 14-26

### Current Code
```typescript
const [postsCount, publishedCount, commentsCount, recentPosts, totalLikes] = await Promise.all([
  prisma.post.count({ where: { authorId: session.user.id } }),
  prisma.post.count({ where: { authorId: session.user.id, published: true } }),
  prisma.comment.count({ where: { userId: session.user.id } }),
  prisma.post.findMany({
    where: { authorId: session.user.id },
    orderBy: { updatedAt: "desc" },
    take: 5,
    include: { _count: { select: { comments: true, likes: true } } },
  }),
  prisma.post.findMany({
    where: { authorId: session.user.id },
    select: { _count: { select: { likes: true } } },
  }).then((posts) => posts.reduce((sum, post) => sum + post._count.likes, 0)),
])
```

### Fixed Code
```typescript
const [postsCount, publishedCount, commentsCount, recentPosts, totalLikes] = await Promise.all([
  prisma.post
    .count({ where: { authorId: session.user.id } })
    .catch((error) => {
      console.error("[Dashboard] Failed to count total posts:", error)
      return 0
    }),
  prisma.post
    .count({ where: { authorId: session.user.id, published: true } })
    .catch((error) => {
      console.error("[Dashboard] Failed to count published posts:", error)
      return 0
    }),
  prisma.comment
    .count({ where: { userId: session.user.id } })
    .catch((error) => {
      console.error("[Dashboard] Failed to count comments:", error)
      return 0
    }),
  prisma.post
    .findMany({
      where: { authorId: session.user.id },
      orderBy: { updatedAt: "desc" },
      take: 5,
      include: { _count: { select: { comments: true, likes: true } } },
    })
    .catch((error) => {
      console.error("[Dashboard] Failed to fetch recent posts:", error)
      return []
    }),
  prisma.post
    .findMany({
      where: { authorId: session.user.id },
      select: { _count: { select: { likes: true } } },
    })
    .then((posts) => posts.reduce((sum, post) => sum + post._count.likes, 0))
    .catch((error) => {
      console.error("[Dashboard] Failed to count total likes:", error)
      return 0
    }),
])
```

Then add a warning banner after the stats section (around line 35):
```typescript
// Add this after stats rendering, before the "Recent Posts" section
{(postsCount === 0 && publishedCount === 0 && recentPosts.length === 0) && (
  <div className="card p-4 bg-amber-50 border border-amber-200 rounded-lg">
    <p className="text-sm text-amber-900 font-medium">
      ⚠️ Some dashboard stats are temporarily unavailable. Please refresh the page.
    </p>
  </div>
)}
```

---

## 4. Add Prisma Connection Cleanup (MEDIUM PRIORITY)

**File:** `lib/prisma.ts` - Replace entire file

### Current Code
```typescript
import { PrismaClient } from "@prisma/client"

const globalForPrisma = global as unknown as {
    prisma: PrismaClient | undefined
}

export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient()

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma
}
```

### Fixed Code
```typescript
import { PrismaClient } from "@prisma/client"

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development"
      ? ["query", "error", "warn"]
      : ["error"],
  })

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}

// Graceful shutdown for development/serverless environments
if (typeof global !== "undefined") {
  const cleanup = async () => {
    console.log("[Prisma] Disconnecting client...")
    await prisma.$disconnect()
  }

  if (process.env.NODE_ENV === "development") {
    process.on("SIGTERM", async () => {
      console.log("[Prisma] SIGTERM received, closing connection")
      await cleanup()
      process.exit(0)
    })

    process.on("SIGINT", async () => {
      console.log("[Prisma] SIGINT received, closing connection")
      await cleanup()
      process.exit(0)
    })
  }
}
```

---

## 5. Fix Comments API Validation (MEDIUM PRIORITY)

**File:** `app/api/comments/route.ts` - Replace lines 48-60 in POST handler

### Current Code
```typescript
const comment = await prisma.comment.create({
  data: {
    text: parsed.data.text,
    postId: parsed.data.postId,
    parentId: parsed.data.parentId || null,
    userId: session.user.id,
  },
  include: {
    user: { select: { name: true, image: true } },
  },
})

return successResponse(comment, 201)
```

### Fixed Code
```typescript
const comment = await prisma.comment.create({
  data: {
    text: parsed.data.text,
    postId: parsed.data.postId,
    parentId: parsed.data.parentId || null,
    userId: session.user.id,
  },
  include: {
    user: { select: { name: true, image: true } },
  },
})

// Validate comment structure to prevent orphaned data
if (!comment.user) {
  console.error(
    `[Comments] Created comment ${comment.id} without user relationship. ` +
    `User ID: ${session.user.id}, Post ID: ${parsed.data.postId}`
  )
  return errorResponse(
    "Failed to create comment - user relationship missing",
    500
  )
}

// Type-safe response
const responseData: CommentItem = {
  id: comment.id,
  text: comment.text,
  createdAt: comment.createdAt.toISOString(),
  user: {
    name: comment.user.name,
    image: comment.user.image,
  },
}

return successResponse(responseData, 201)
```

---

## 6. Add Cloudinary URL Validation (LOW PRIORITY)

**File:** `app/api/upload/route.ts` - Replace lines 7-26

### Current Code
```typescript
const cloudName = process.env.CLOUDINARY_CLOUD_NAME
const apiKey = process.env.CLOUDINARY_API_KEY
const apiSecret = process.env.CLOUDINARY_API_SECRET
const cloudinaryUrl = process.env.CLOUDINARY_URL
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024
const ALLOWED_FILE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
])

const hasCloudinaryConfig = Boolean(
  cloudinaryUrl || (cloudName && apiKey && apiSecret)
)

if (hasCloudinaryConfig) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  })
}
```

### Fixed Code
```typescript
const cloudName = process.env.CLOUDINARY_CLOUD_NAME
const apiKey = process.env.CLOUDINARY_API_KEY
const apiSecret = process.env.CLOUDINARY_API_SECRET
const cloudinaryUrl = process.env.CLOUDINARY_URL
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024
const ALLOWED_FILE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
])

// Validate Cloudinary URL format if provided
let hasCloudinaryConfig = false

if (cloudinaryUrl) {
  if (!cloudinaryUrl.startsWith("cloudinary://")) {
    console.warn(
      "[Upload] Invalid CLOUDINARY_URL format. " +
      "Expected format: cloudinary://key:secret@cloud_name"
    )
  } else {
    hasCloudinaryConfig = true
  }
} else if (cloudName && apiKey && apiSecret) {
  hasCloudinaryConfig = true
}

if (hasCloudinaryConfig) {
  try {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    })
  } catch (error) {
    console.error("[Upload] Failed to configure Cloudinary:", error)
    hasCloudinaryConfig = false
  }
}
```

---

## Testing the Fixes

Run these after applying fixes:

```bash
# Type check
npx tsc --noEmit

# Lint
npx eslint app/ components/ lib/

# Test AI generation
curl -X POST http://localhost:3000/api/ai/generate \
  -H "Content-Type: application/json" \
  -d '{"type":"draft","title":"Test"}'

# Test dashboard loads without errors
# Visit: http://localhost:3000/dashboard

# Test comment creation
curl -X POST http://localhost:3000/api/comments \
  -H "Content-Type: application/json" \
  -d '{"postId":"test-id","text":"Test comment"}'
```
