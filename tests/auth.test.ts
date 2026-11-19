import test from "node:test";
import assert from "node:assert";
import {
  hashPassword,
  verifyPassword,
  createSessionToken,
  verifySessionToken,
  checkLoginRateLimit,
  recordLoginFailure,
  resetLoginRateLimit,
} from "../src/lib/auth";
import { validateRequestSession, requireApiAuth } from "../src/lib/serverAuth";

test("Auth: hashPassword produces valid scrypt format with random salt", async () => {
  const pwd = "SuperSecretPassword123!";
  const hash1 = await hashPassword(pwd);
  const hash2 = await hashPassword(pwd);

  assert.ok(hash1.startsWith("scrypt$"), "Hash must begin with scrypt$ prefix");
  assert.notStrictEqual(hash1, hash2, "Different random salts must produce different hash strings");

  const parts = hash1.split("$");
  assert.strictEqual(parts.length, 3, "Hash must contain exactly 3 segments: scrypt$salt$key");
  assert.strictEqual(parts[1].length, 32, "Salt must be 16 bytes (32 hex characters)");
  assert.strictEqual(parts[2].length, 128, "Derived key must be 64 bytes (128 hex characters)");
});

test("Auth: verifyPassword correctly validates matching passwords and rejects mismatches", async () => {
  const pwd = "FinOpsCloudMastery2026!";
  const hash = await hashPassword(pwd);

  const isValid = await verifyPassword(pwd, hash);
  assert.strictEqual(isValid, true, "Matching password must return true");

  const isInvalid = await verifyPassword("WrongPassword123", hash);
  assert.strictEqual(isInvalid, false, "Wrong password must return false");

  const emptyCheck = await verifyPassword("", hash);
  assert.strictEqual(emptyCheck, false, "Empty password must return false");

  const corruptedHashCheck = await verifyPassword(pwd, "scrypt$invalid$broken");
  assert.strictEqual(corruptedHashCheck, false, "Corrupted hash string must return false safely");
});

test("Auth: verifyPassword supports direct plaintext password from env", async () => {
  const plainPwd = "my_plain_password_123";
  assert.strictEqual(await verifyPassword(plainPwd, plainPwd), true, "Direct plaintext match returns true");
  assert.strictEqual(await verifyPassword("wrong", plainPwd), false, "Mismatched plaintext password returns false");
  assert.strictEqual(await verifyPassword(plainPwd, "  my_plain_password_123  "), true, "Trimmed plaintext password returns true");
});

test("Auth: createSessionToken & verifySessionToken create and validate HMAC-SHA256 tokens", () => {
  const secret = "f4c93047a022c36cb2049e4922e92cbb41a0e104e797eb1df31d4e4209587422";
  const email = "mail-favour@gmail.com";

  const token = createSessionToken(email, secret, 3600 * 1000);
  assert.ok(token.includes("."), "Token must contain payload and signature separated by dot");

  const session = verifySessionToken(token, secret);
  assert.ok(session !== null, "Valid session token must decode successfully");
  assert.strictEqual(session?.email, email);
  assert.ok(session?.exp && session.exp > Date.now(), "Session expiration must be in the future");
});

test("Auth: verifySessionToken rejects tampered signatures and mismatched secrets", () => {
  const secret = "f4c93047a022c36cb2049e4922e92cbb41a0e104e797eb1df31d4e4209587422";
  const wrongSecret = "1111111111111111111111111111111111111111111111111111111111111111";
  const email = "mail-favour@gmail.com";

  const token = createSessionToken(email, secret);

  // Mismatched secret
  const rejectedWithWrongSecret = verifySessionToken(token, wrongSecret);
  assert.strictEqual(rejectedWithWrongSecret, null, "Token signed with secret A must be rejected by secret B");

  // Tampered payload
  const [b64, sig] = token.split(".");
  const tamperedPayload = Buffer.from(JSON.stringify({ email: "hacker@evil.com", exp: Date.now() + 10000 })).toString("base64url");
  const tamperedToken = `${tamperedPayload}.${sig}`;

  const rejectedTampered = verifySessionToken(tamperedToken, secret);
  assert.strictEqual(rejectedTampered, null, "Tampered payload with unmatching signature must be rejected");
});

test("Auth: verifySessionToken rejects expired sessions", () => {
  const secret = "f4c93047a022c36cb2049e4922e92cbb41a0e104e797eb1df31d4e4209587422";
  const email = "mail-favour@gmail.com";

  // Create token expired 10 seconds ago
  const expiredToken = createSessionToken(email, secret, -10000);
  const result = verifySessionToken(expiredToken, secret);
  assert.strictEqual(result, null, "Expired session must return null");
});

test("Auth: Login Rate Limiter throttles after 5 consecutive failures", () => {
  const testIp = "192.0.2.42";
  resetLoginRateLimit(testIp);

  // Initial check: 5 attempts remaining
  let check = checkLoginRateLimit(testIp);
  assert.strictEqual(check.allowed, true);
  assert.strictEqual(check.remainingAttempts, 5);

  // 4 failed attempts
  for (let i = 0; i < 4; i++) {
    recordLoginFailure(testIp);
  }
  check = checkLoginRateLimit(testIp);
  assert.strictEqual(check.allowed, true);
  assert.strictEqual(check.remainingAttempts, 1);

  // 5th failure -> locked out
  recordLoginFailure(testIp);
  check = checkLoginRateLimit(testIp);
  assert.strictEqual(check.allowed, false, "After 5 failures, allowed must be false");
  assert.strictEqual(check.remainingAttempts, 0);
  assert.ok(typeof check.retryAfterSec === "number" && check.retryAfterSec > 0);

  // Reset clears lockout
  resetLoginRateLimit(testIp);
  check = checkLoginRateLimit(testIp);
  assert.strictEqual(check.allowed, true);
  assert.strictEqual(check.remainingAttempts, 5);
});

test("Auth: serverAuth helpers validateRequestSession & requireApiAuth reject unauthenticated requests", () => {
  // Test request without cookie
  const unauthRequest = new Request("http://localhost:3000/api/render", {
    method: "POST",
  });

  const sessionResult = validateRequestSession(unauthRequest);
  assert.strictEqual(sessionResult.authenticated, false);

  const apiError = requireApiAuth(unauthRequest);
  assert.ok(apiError !== null, "requireApiAuth must return a 401 response when unauthenticated");
  assert.strictEqual(apiError.status, 401);
});

test("Auth: serverAuth helpers accept requests with valid session cookie", () => {
  const secret = process.env.STUDIO_SESSION_SECRET || "2e7a0d3e7528301824d57314b9be8bcc83401a2c4909ef79303abcfbc2a0e4cb";
  const email = process.env.STUDIO_LOGIN_EMAIL || "mail-favour@gmail.com";

  const validToken = createSessionToken(email, secret);
  const authRequest = new Request("http://localhost:3000/api/render", {
    method: "POST",
    headers: {
      cookie: `syntax_ops_session=${validToken}`,
    },
  });

  const sessionResult = validateRequestSession(authRequest);
  assert.strictEqual(sessionResult.authenticated, true);
  assert.strictEqual(sessionResult.user?.email, email);

  const apiError = requireApiAuth(authRequest);
  assert.strictEqual(apiError, null, "requireApiAuth must return null (allowing execution) for valid session");
});

test("Auth: verifySessionTokenWeb provides 100% Edge-runtime cryptographic parity", async () => {
  const { verifySessionTokenWeb } = await import("../src/lib/webAuth");
  const secret = "f4c93047a022c36cb2049e4922e92cbb41a0e104e797eb1df31d4e4209587422";
  const email = "mail-favour@gmail.com";

  const token = createSessionToken(email, secret);
  const webSession = await verifySessionTokenWeb(token, secret);

  assert.ok(webSession !== null, "verifySessionTokenWeb must successfully verify node-generated HMAC token");
  assert.strictEqual(webSession?.email, email);

  // Rejection with wrong secret
  const rejectedWeb = await verifySessionTokenWeb(token, "wrong_secret_key");
  assert.strictEqual(rejectedWeb, null);
});
