import { NextResponse } from "next/server";
import { getRenderProgress, type AwsRegion } from "@remotion/lambda/client";
import { getAwsConfig, hasAwsCredentials } from "../../../src/lib/awsConfig";

export async function GET(request: Request) {
  try {
    if (!hasAwsCredentials()) {
      return NextResponse.json(
        { error: "AWS credentials not configured." },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const renderId = searchParams.get("renderId");
    const bucketName = searchParams.get("bucketName");

    if (!renderId || !bucketName) {
      return NextResponse.json(
        { error: "renderId and bucketName are required query parameters." },
        { status: 400 }
      );
    }

    const config = getAwsConfig();

    if (!config.functionName) {
      return NextResponse.json(
        { error: "REMOTION_FUNCTION_NAME is not configured." },
        { status: 400 }
      );
    }

    const progress = await getRenderProgress({
      renderId,
      bucketName,
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
