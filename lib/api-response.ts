import { NextResponse } from "next/server"

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  details?: unknown
}

export function successResponse<T>(data: T, status: number = 200) {
  return NextResponse.json(
    {
      success: true,
      data,
    } as ApiResponse<T>,
    { status }
  )
}

export function errorResponse(
  error: string,
  status: number = 400,
  details?: unknown
) {
  return NextResponse.json(
    {
      success: false,
      error,
      details,
    } as ApiResponse,
    { status }
  )
}

export function unauthorizedResponse() {
  return errorResponse("Unauthorized. Please sign in.", 401)
}

export function notFoundResponse(resource: string = "Resource") {
  return errorResponse(`${resource} not found.`, 404)
}

export function conflictResponse(message: string = "Resource already exists") {
  return errorResponse(message, 409)
}

export function validationErrorResponse(
  message: string,
  details?: unknown
) {
  return NextResponse.json(
    {
      success: false,
      error: message,
      details,
    } as ApiResponse,
    { status: 422 }
  )
}
