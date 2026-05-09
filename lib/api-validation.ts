/**
 * API Validation & Sanitization Utilities
 * Centralized functions to validate and sanitize API inputs
 */

import { z } from "zod"

/**
 * Sanitize HTML content to prevent XSS attacks
 * Removes potentially dangerous attributes and tags
 */
export function sanitizeHtml(html: string): string {
    if (!html || typeof html !== "string") return ""

    // Remove script tags and event handlers
    return html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
        .replace(/on\w+\s*=\s*["'][^"']*["']/gi, "")
        .replace(/on\w+\s*=\s*[^\s>]*/gi, "")
        .trim()
}

/**
 * Sanitize user input to prevent injection attacks
 * Trims whitespace and removes control characters
 */
export function sanitizeInput(input: string): string {
    if (!input || typeof input !== "string") return ""

    return input
        .trim()
        .replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, "") // Remove control characters
        .slice(0, 5000) // Limit length to prevent DOS
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
    try {
        new URL(url)
        return true
    } catch {
        return false
    }
}

/**
 * Validate slug format (lowercase alphanumeric and hyphens only)
 */
export function isValidSlug(slug: string): boolean {
    return /^[a-z0-9-]+$/.test(slug)
}

/**
 * Rate limiting helper - tracks API calls per IP
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

export function checkRateLimit(
    identifier: string,
    limit: number = 100,
    windowMs: number = 60000 // 1 minute
): boolean {
    const now = Date.now()
    const record = rateLimitMap.get(identifier)

    if (!record || now > record.resetTime) {
        rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs })
        return true
    }

    if (record.count >= limit) {
        return false
    }

    record.count++
    return true
}

/**
 * Get client IP address from request
 */
export function getClientIp(request: Request): string {
    const forwarded = request.headers.get("x-forwarded-for")
    const ip = forwarded ? forwarded.split(",")[0].trim() : request.headers.get("x-real-ip") || "unknown"
    return ip
}

/**
 * Validate and parse JSON safely
 */
export async function parseJsonSafely<T>(request: Request): Promise<{ success: boolean; data?: T; error?: string }> {
    try {
        const text = await request.text()
        if (!text) {
            return { success: false, error: "Request body is empty" }
        }
        const data = JSON.parse(text) as T
        return { success: true, data }
    } catch (error) {
        return {
            success: false,
            error: error instanceof SyntaxError ? "Invalid JSON" : "Failed to parse request body",
        }
    }
}
