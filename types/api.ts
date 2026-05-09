/**
 * Type definitions for API responses and data models
 * Ensures type safety across the application
 */

export interface ApiResponse<T = unknown> {
    success?: boolean
    data?: T
    error?: string
    details?: Record<string, unknown>
    message?: string
}

export interface User {
    id: string
    name: string | null
    email: string
    image: string | null
    role: "AUTHOR" | "READER"
    createdAt: Date
}

export interface Post {
    id: string
    title: string
    slug: string
    excerpt: string | null
    content: Record<string, unknown>
    coverImage: string | null
    published: boolean
    authorId: string
    author?: User
    createdAt: Date
    updatedAt: Date
    publishedAt: Date | null
    _count?: {
        comments: number
        likes: number
    }
}

export interface Comment {
    id: string
    text: string
    postId: string
    userId: string
    user: {
        name: string | null
        image: string | null
    }
    createdAt: Date
    parentId: string | null
    replies?: Comment[]
}

export interface Like {
    id: string
    userId: string
    postId: string
    createdAt: Date
}

export interface AuthSession {
    user: {
        id: string
        name?: string | null
        email?: string | null
        image?: string | null
        role?: "AUTHOR" | "READER"
    }
    expires: string
}

// Form schemas
export interface PostFormData {
    title: string
    slug: string
    excerpt: string | null
    coverImage: string | null
    content: Record<string, unknown>
    published: boolean
}

export interface CommentFormData {
    text: string
    postId: string
    parentId?: string | null
}

export interface RegisterFormData {
    name?: string | null
    email: string
    password: string
    role: "AUTHOR" | "READER"
}

export interface SignInFormData {
    email: string
    password: string
}

// Upload response
export interface UploadResponse {
    success: boolean
    url: string
    assetId: string
    fileName: string
}

// AI generation response
export interface AiGenerationResponse {
    text: string
    error?: string
}
