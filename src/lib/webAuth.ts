/**
 * Edge-compatible Session Verification using standard Web Crypto API (SubtleCrypto).
 * Works seamlessly in Next.js Edge Middleware and Node.js without node:crypto imports.
 */

export const SESSION_COOKIE_NAME = "syntax_ops_session";

export interface SessionPayload {
  email: string;
  exp: number;
  iat: number;
}

const hexToBytes = (hex: string): Uint8Array => {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
};

const base64UrlDecode = (str: string): string => {
  // Convert base64url to base64
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  return atob(base64);
};

export const verifySessionTokenWeb = async (
  token: string,
  secret: string
): Promise<SessionPayload | null> => {
  if (!token || !secret) return null;

  const parts = token.split(".");
  if (parts.length !== 2) return null;

  const [payloadB64, signatureHex] = parts;

  try {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const key = await crypto.subtle.importKey(
      "raw",
      keyData.buffer as ArrayBuffer,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const signatureBytes = hexToBytes(signatureHex);
    const dataBytes = encoder.encode(payloadB64);

    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      signatureBytes.buffer as ArrayBuffer,
      dataBytes.buffer as ArrayBuffer
    );

    if (!isValid) return null;

    const jsonStr = base64UrlDecode(payloadB64);
    const payload: SessionPayload = JSON.parse(jsonStr);

    if (!payload.email || typeof payload.exp !== "number") {
      return null;
    }

    if (Date.now() > payload.exp) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
};
