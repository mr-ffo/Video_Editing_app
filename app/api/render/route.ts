import { NextResponse } from "next/server";
import { renderMediaOnLambda, type AwsRegion } from "@remotion/lambda/client";
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

    const config = getAwsConfig();

    if (!config.functionName || !config.serveUrl) {
      return NextResponse.json(
        {
          error:
            "Remotion Lambda deployment missing. Please set REMOTION_FUNCTION_NAME and REMOTION_SERVE_URL in your .env. Deploy using: 'npx remotion lambda functions deploy' and 'npx remotion lambda sites create src/index.ts'.",
        },
        { status: 400 }
      );
    }

    const {
      compositionId = "VideoOverlay",
      durationMinutes = 1,
      inputProps = {},
    } = await request.json();

    // Select the composition matching the duration tier
    const resolvedComposition =
      compositionId === "VideoOverlay" && durationMinutes > 1
        ? `VideoOverlay-${durationMinutes}min`
        : compositionId;

    const concurrency = process.env.REMOTION_CONCURRENCY
      ? parseInt(process.env.REMOTION_CONCURRENCY, 10)
      : 6;

    const { renderId, bucketName } = await renderMediaOnLambda({
      region: config.region as AwsRegion,
      functionName: config.functionName,
      serveUrl: config.serveUrl,
      composition: resolvedComposition,
      inputProps,
      codec: "h264",
      privacy: "no-acl",
      concurrency,
      downloadBehavior: {
        type: "download",
        fileName: `${resolvedComposition}-${Date.now()}.mp4`,
      },
    });

    return NextResponse.json({
      renderId,
      bucketName,
      composition: resolvedComposition,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Lambda render failed to start: ${message}` },
      { status: 500 }
    );
  }
}
