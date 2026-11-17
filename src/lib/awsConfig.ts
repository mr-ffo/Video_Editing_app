export interface AwsConfig {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  bucketName?: string;
  functionName?: string;
  serveUrl?: string;
}

/**
 * Safely resolves AWS credentials and Remotion Lambda configuration from environment variables.
 * Never called on the client side.
 */
export const getAwsConfig = (): AwsConfig => {
  const accessKeyId =
    process.env.REMOTION_AWS_ACCESS_KEY_ID ||
    process.env.AWS_ACCESS_KEY_ID ||
    "";

  const secretAccessKey =
    process.env.REMOTION_AWS_SECRET_ACCESS_KEY ||
    process.env.AWS_SECRET_ACCESS_KEY ||
    "";

  const region =
    process.env.REMOTION_AWS_REGION ||
    process.env.AWS_REGION ||
    "us-east-1";

  const bucketName = process.env.REMOTION_BUCKET_NAME;
  const functionName = process.env.REMOTION_FUNCTION_NAME;
  const serveUrl = process.env.REMOTION_SERVE_URL;

  return {
    accessKeyId,
    secretAccessKey,
    region,
    bucketName,
    functionName,
    serveUrl,
  };
};

export const hasAwsCredentials = (): boolean => {
  const config = getAwsConfig();
  return Boolean(config.accessKeyId && config.secretAccessKey);
};
