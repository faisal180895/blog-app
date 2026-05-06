import { useCallback, useState } from "react"

export interface ApiError {
  message: string
  status?: number
  details?: unknown
}

export interface UseApiOptions<T> {
  onSuccess?: (data: T) => void
  onError?: (error: ApiError) => void
}

export function useApi<T = unknown>(options?: UseApiOptions<T>) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)
  const [data, setData] = useState<T | null>(null)

  const request = useCallback(
    async (url: string, config?: RequestInit) => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(url, {
          headers: {
            "Content-Type": "application/json",
          },
          ...config,
        })

        const responseData = (await response.json()) as { success: boolean; data?: T; error?: string }

        if (!response.ok) {
          const err: ApiError = {
            message: responseData.error || `Error ${response.status}`,
            status: response.status,
            details: responseData,
          }
          setError(err)
          options?.onError?.(err)
          return null
        }

        const result = responseData.data || (responseData as T)
        setData(result)
        options?.onSuccess?.(result)
        return result
      } catch (err) {
        const error: ApiError = {
          message: err instanceof Error ? err.message : "An error occurred",
        }
        setError(error)
        options?.onError?.(error)
        return null
      } finally {
        setLoading(false)
      }
    },
    [options]
  )

  return { loading, error, data, request }
}
