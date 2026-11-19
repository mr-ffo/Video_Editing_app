import { NextResponse } from "next/server";
import { renderMediaOnLambda, type AwsRegion } from "@remotion/lambda/client";
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

    let body: {
      compositionId?: unknown;
      durationMinutes?: unknown;
      inputProps?: unknown;
    };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const {
      compositionId = "VideoOverlay",
      durationMinutes = 1,
      inputProps = {},
    } = body;

    const ALLOWED_COMPOSITIONS = [
      "DynamicProject",
      "VideoOverlay",
      "VideoOverlay-2min",
      "VideoOverlay-3min",
      "VideoOverlay-4min",
      "VideoOverlay-5min",
      "TechnicalExplainer",
    ];

    if (typeof compositionId !== "string" || !ALLOWED_COMPOSITIONS.includes(compositionId)) {
      return NextResponse.json(
        {
          error: `Invalid compositionId '${String(compositionId)}'. Allowed: ${ALLOWED_COMPOSITIONS.join(", ")}`,
        },
        { status: 400 }
      );
    }

    const parsedDuration = Number(durationMinutes);
    if (!Number.isInteger(parsedDuration) || parsedDuration < 1 || parsedDuration > 5) {
      return NextResponse.json(
        { error: "durationMinutes must be an integer between 1 and 5" },
        { status: 400 }
      );
    }

    if (typeof inputProps !== "object" || inputProps === null || Array.isArray(inputProps)) {
      return NextResponse.json(
        { error: "inputProps must be an object" },
        { status: 400 }
      );
    }

    // Select the composition matching the duration tier
    const resolvedComposition =
      compositionId === "VideoOverlay" && parsedDuration > 1
        ? `VideoOverlay-${parsedDuration}min`
        : compositionId;

    const rawConcurrency = process.env.REMOTION_CONCURRENCY
      ? parseInt(process.env.REMOTION_CONCURRENCY, 10)
      : 6;
    const concurrency = Math.min(Math.max(1, isNaN(rawConcurrency) ? 6 : rawConcurrency), 8);

    const { renderId, bucketName } = await renderMediaOnLambda({
      region: config.region as AwsRegion,
      functionName: config.functionName,
      serveUrl: config.serveUrl,
      composition: resolvedComposition,
      inputProps: inputProps as Record<string, unknown>,
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
