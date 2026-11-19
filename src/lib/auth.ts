import crypto from "node:crypto";

/**
 * Single-User Studio Authentication Configuration
 */
export interface AuthConfig {
  email: string;
  password: string;
  passwordHash: string; // backwards compatibility alias
  sessionSecret: string;
}

export interface SessionPayload {
  email: string;
  exp: number; // Unix timestamp in ms
  iat: number; // Unix timestamp in ms
}

export const SESSION_COOKIE_NAME = "syntax_ops_session";
export const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60; // 7 days

/**
 * Resolves authentication configuration directly from environment variables.
 * Directly reads STUDIO_LOGIN_EMAIL and STUDIO_LOGIN_PASSWORD (or STUDIO_LOGIN_PASSWORD_HASH).
 */
export const getAuthConfig = (): AuthConfig => {
  const email = (process.env.STUDIO_LOGIN_EMAIL || "mail-favour@gmail.com").trim().toLowerCase();
  const password = (
    process.env.STUDIO_LOGIN_PASSWORD ||
    process.env.STUDIO_LOGIN_PASSWORD_HASH ||
    ""
  ).trim();
  const sessionSecret = (
    process.env.STUDIO_SESSION_SECRET ||
    "syntax-ops-default-session-secret-salt-2026-production"
  ).trim();

  return {
    email,
    password,
    passwordHash: password,
    sessionSecret,
  };
};

/**
 * Hashes a plaintext password using Node.js crypto.scrypt (optional utility).
 * Output format: "scrypt$<saltHex>$<derivedKeyHex>"
 */
export const hashPassword = async (password: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString("hex");
    crypto.scrypt(password, salt, 64, { N: 16384, r: 8, p: 1 }, (err, derivedKey) => {
      if (err) return reject(err);
      resolve(`scrypt$${salt}$${derivedKey.toString("hex")}`);
    });
  });
};

/**
 * Synchronously hashes a password (useful for scripts & deterministic tests).
 */
export const hashPasswordSync = (password: string, saltHex?: string): string => {
  const salt = saltHex || crypto.randomBytes(16).toString("hex");
  const derivedKey = crypto.scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1 });
  return `scrypt$${salt}$${derivedKey.toString("hex")}`;
};

/**
 * Verifies password against configured value in .env.
 * Supports direct plaintext match as well as scrypt hash format.
 */
export const verifyPassword = async (
  password: string,
  storedPasswordOrHash: string
): Promise<boolean> => {
  if (!storedPasswordOrHash || !password) return false;

  // 1. If stored value is an scrypt hash format (scrypt$<salt>$<key>)
  if (storedPasswordOrHash.startsWith("scrypt$")) {
    const parts = storedPasswordOrHash.split("$");
    if (
      parts.length !== 3 ||
      !parts[1] ||
      !parts[2] ||
      !/^[0-9a-fA-F]+$/.test(parts[1]) ||
      !/^[0-9a-fA-F]+$/.test(parts[2]) ||
      parts[2].length % 2 !== 0
    ) {
      return false;
    }

    const salt = parts[1];
    const keyHex = parts[2];
    try {
      const expectedKey = Buffer.from(keyHex, "hex");
      if (expectedKey.length < 16) return false;

      return new Promise((resolve) => {
        crypto.scrypt(
          password,
          salt,
          expectedKey.length,
          { N: 16384, r: 8, p: 1 },
          (err, derivedKey) => {
            if (err) return resolve(false);
            try {
              if (derivedKey.length !== expectedKey.length) {
                return resolve(false);
              }
              resolve(crypto.timingSafeEqual(derivedKey, expectedKey));
            } catch {
              resolve(false);
            }
          }
        );
      });
    } catch {
      return false;
    }
  }

  // 2. Direct straightforward plaintext match (from .env)
  return (
    password === storedPasswordOrHash ||
    password.trim() === storedPasswordOrHash.trim()
  );
};

/**
 * Signs a session payload with HMAC-SHA256 using STUDIO_SESSION_SECRET.
 * Token format: "<base64Payload>.<signatureHex>"
 */
export const createSessionToken = (
  email: string,
  secret: string,
  durationMs: number = SESSION_MAX_AGE_SECONDS * 1000
): string => {
  if (!secret) {
    throw new Error("Cannot create session token: STUDIO_SESSION_SECRET is empty");
  }

  const now = Date.now();
  const payload: SessionPayload = {
    email: email.trim().toLowerCase(),
    iat: now,
    exp: now + durationMs,
  };

  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", secret)
    .update(payloadB64)
    .digest("hex");

  return `${payloadB64}.${signature}`;
};

/**
 * Verifies a signed session token.
 * Returns the decoded SessionPayload if valid and not expired, or null otherwise.
 */
export const verifySessionToken = (
  token: string,
  secret: string
): SessionPayload | null => {
  if (!token || !secret) return null;

  const parts = token.split(".");
  if (parts.length !== 2) return null;

  const [payloadB64, signature] = parts;

  // Recompute HMAC signature
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(payloadB64)
    .digest("hex");

  try {
    const sigBuf = Buffer.from(signature, "hex");
    const expBuf = Buffer.from(expectedSignature, "hex");

    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return null;
    }

    const jsonStr = Buffer.from(payloadB64, "base64url").toString("utf-8");
    const payload: SessionPayload = JSON.parse(jsonStr);

    if (!payload.email || typeof payload.exp !== "number") {
      return null;
    }

    // Expiry check
    if (Date.now() > payload.exp) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
};

/**
 * In-memory Login Rate Limiting (Single-instance / serverless cold-start tolerant).
 * Limits consecutive failed login attempts by IP.
 */
interface RateLimitEntry {
  failures: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();
const MAX_FAILURES = 5;
const LOCKOUT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

export const checkLoginRateLimit = (
  clientIp: string
): { allowed: boolean; remainingAttempts: number; retryAfterSec?: number } => {
  const now = Date.now();
  const entry = rateLimitMap.get(clientIp);

  if (!entry) {
    return { allowed: true, remainingAttempts: MAX_FAILURES };
  }

  // Window has expired; clear failures
  if (now > entry.resetAt) {
    rateLimitMap.delete(clientIp);
    return { allowed: true, remainingAttempts: MAX_FAILURES };
  }

  if (entry.failures >= MAX_FAILURES) {
    const retryAfterSec = Math.ceil((entry.resetAt - now) / 1000);
    return { allowed: false, remainingAttempts: 0, retryAfterSec };
  }

  return {
    allowed: true,
    remainingAttempts: MAX_FAILURES - entry.failures,
  };
};

export const recordLoginFailure = (clientIp: string): void => {
  const now = Date.now();
  const entry = rateLimitMap.get(clientIp);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(clientIp, {
      failures: 1,
      resetAt: now + LOCKOUT_WINDOW_MS,
    });
  } else {
    entry.failures += 1;
  }
};

export const resetLoginRateLimit = (clientIp: string): void => {
  rateLimitMap.delete(clientIp);
};
