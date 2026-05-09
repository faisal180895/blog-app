import { NextResponse } from "next/server"
import { v2 as cloudinary } from "cloudinary"
import type { UploadApiResponse } from "cloudinary"
import { Readable } from "stream"
import path from "path"
import { auth } from "@/lib/auth"

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

function bufferToStream(buffer: Buffer) {
  return Readable.from(buffer)
}

function uploadBuffer(fileBuffer: Buffer, fileName: string) {
  return new Promise<UploadApiResponse>((resolve, reject) => {
    const parsed = path.parse(fileName)
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "blog_platform/uploads",
        public_id: parsed.name,
        resource_type: "auto",
      },
      (error, result) => {
        if (error) {
          reject(error)
          return
        }
        if (!result) {
          reject(new Error("Cloudinary did not return an upload result."))
          return
        }
        resolve(result)
      }
    )
    bufferToStream(fileBuffer).pipe(stream)
  })
}

export async function POST(req: Request) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 })
  }

  let formData: FormData

  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json({ error: "Invalid upload payload." }, { status: 400 })
  }

  const file = formData.get("file") as File | null

  if (!file) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 })
  }

  if (!ALLOWED_FILE_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: "Unsupported file type. Upload a JPG, PNG, WEBP, or GIF image." },
      { status: 415 }
    )
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return NextResponse.json(
      { error: "File is too large. Upload an image under 5 MB." },
      { status: 413 }
    )
  }

  if (!hasCloudinaryConfig) {
    return NextResponse.json(
      {
        error:
          "File uploads are not configured. Add Cloudinary credentials to use this endpoint.",
      },
      { status: 501 }
    )
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer())
    const result = await uploadBuffer(buffer, file.name)

    return NextResponse.json(
      {
        success: true,
        url: result.secure_url || result.url,
        assetId: result.asset_id,
        fileName: result.original_filename,
      },
      { status: 201 }
    )
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[Upload POST]", error instanceof Error ? error.message : error)
    }
    return NextResponse.json(
      { error: "Unable to upload file. Check Cloudinary configuration." },
      { status: 500 }
    )
  }
}
