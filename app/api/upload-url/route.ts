import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getAwsConfig, hasAwsCredentials } from "../../../src/lib/awsConfig";
import { requireApiAuth } from "../../../src/lib/serverAuth";

export async function POST(request: Request) {
  try {
    const authError = requireApiAuth(request);
    if (authError) return authError;

    if (!hasAwsCredentials()) {
      return NextResponse.json(
        {
          error:
            "AWS credentials not configured. Please define REMOTION_AWS_ACCESS_KEY_ID and REMOTION_AWS_SECRET_ACCESS_KEY in your .env or Vercel environment.",
        },
        { status: 400 }
      );
    }

    const ALLOWED_CONTENT_TYPES = ["video/mp4", "video/quicktime", "video/webm"];
    const ALLOWED_EXTENSIONS = /\.(mp4|mov|webm)$/i;

    let body: { fileName?: unknown; contentType?: unknown };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { fileName, contentType = "video/mp4" } = body;

    if (!fileName || typeof fileName !== "string" || fileName.trim().length === 0) {
      return NextResponse.json(
        { error: "fileName is required and must be a non-empty string" },
        { status: 400 }
      );
    }

    if (fileName.length > 255) {
      return NextResponse.json(
        { error: "fileName exceeds maximum allowed length of 255 characters" },
        { status: 400 }
      );
    }

    if (!ALLOWED_EXTENSIONS.test(fileName)) {
      return NextResponse.json(
        { error: "Invalid file extension. Only .mp4, .mov, and .webm files are allowed." },
        { status: 400 }
      );
    }

    if (typeof contentType !== "string" || !ALLOWED_CONTENT_TYPES.includes(contentType)) {
      return NextResponse.json(
        {
          error: `Invalid contentType '${contentType}'. Allowed types: ${ALLOWED_CONTENT_TYPES.join(", ")}`,
        },
        { status: 400 }
      );
    }

    const config = getAwsConfig();
    const bucketName = config.bucketName || "remotion-assets";

    const s3 = new S3Client({
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });

    // Generate unique sanitized object key
    const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
    const fileKey = `uploads/${Date.now()}-${sanitizedName}`;

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileKey,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 900 }); // 15 min validity
    const publicUrl = `https://${bucketName}.s3.${config.region}.amazonaws.com/${fileKey}`;

    return NextResponse.json({
      uploadUrl,
      fileKey,
      publicUrl,
      bucketName,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to generate presigned upload URL: ${message}` },
      { status: 500 }
    );
  }
}
