import { NextResponse } from "next/server";
import { getRenderProgress, type AwsRegion } from "@remotion/lambda/client";
import { getAwsConfig, hasAwsCredentials } from "../../../src/lib/awsConfig";
import { requireApiAuth } from "../../../src/lib/serverAuth";

export async function GET(request: Request) {
  try {
    const authError = requireApiAuth(request);
    if (authError) return authError;

    if (!hasAwsCredentials()) {
      return NextResponse.json(
        { error: "AWS credentials not configured." },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const renderId = searchParams.get("renderId");
    const bucketName = searchParams.get("bucketName");

    if (!renderId || typeof renderId !== "string" || !/^[a-zA-Z0-9_-]+$/.test(renderId)) {
      return NextResponse.json(
        { error: "Valid renderId query parameter is required." },
        { status: 400 }
      );
    }

    const config = getAwsConfig();

    // Verify bucket against server configuration
    const resolvedBucket = config.bucketName || bucketName;
    if (!resolvedBucket) {
      return NextResponse.json(
        { error: "bucketName is required." },
        { status: 400 }
      );
    }

    if (config.bucketName && bucketName && bucketName !== config.bucketName) {
      return NextResponse.json(
        { error: "Unauthorized bucketName parameter. Bucket must match server configuration." },
        { status: 403 }
      );
    }

    // Remotion Lambda bucket format check
    if (!/^remotionlambda-[a-z0-9-]+$/.test(resolvedBucket) && !/^[a-z0-9.-]+$/.test(resolvedBucket)) {
      return NextResponse.json(
        { error: "Invalid bucketName format." },
        { status: 400 }
      );
    }

    if (!config.functionName) {
      return NextResponse.json(
        { error: "REMOTION_FUNCTION_NAME is not configured." },
        { status: 400 }
      );
    }

    const progress = await getRenderProgress({
      renderId,
      bucketName: resolvedBucket,
      functionName: config.functionName,
      region: config.region as AwsRegion,
      skipLambdaInvocation: true,
    });

    const formattedErrors = progress.errors?.map((e) =>
      typeof e === "string" ? e : (e as { message?: string })?.message || JSON.stringify(e)
    );

    return NextResponse.json({
      done: progress.done,
      overallProgress: progress.overallProgress,
      outputFile: progress.outputFile,
      fatalErrorEncountered: progress.fatalErrorEncountered,
      errors: formattedErrors,
      chunks: progress.chunks,
      timeToFinish: progress.timeToFinish,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to fetch render progress: ${message}` },
      { status: 500 }
    );
  }
}
