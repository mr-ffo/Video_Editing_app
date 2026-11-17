import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getAwsConfig, hasAwsCredentials } from "../../../src/lib/awsConfig";

export async function POST(request: Request) {
  try {
    if (!hasAwsCredentials()) {
      return NextResponse.json(
        {
          error:
            "AWS credentials not configured. Please define REMOTION_AWS_ACCESS_KEY_ID and REMOTION_AWS_SECRET_ACCESS_KEY in your .env or Vercel environment.",
        },
        { status: 400 }
      );
    }

    const { fileName, contentType = "video/mp4" } = await request.json();

    if (!fileName) {
      return NextResponse.json(
        { error: "fileName is required" },
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
