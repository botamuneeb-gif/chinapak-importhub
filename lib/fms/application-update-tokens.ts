import "server-only";

import { createHash, randomBytes } from "node:crypto";

export const fmsApplicationUpdateTokenDays = 14;

export function createFmsApplicationUpdateToken() {
  const token = randomBytes(32).toString("base64url");
  const tokenHash = hashFmsApplicationUpdateToken(token);
  const expiresAt = new Date(
    Date.now() + fmsApplicationUpdateTokenDays * 24 * 60 * 60 * 1000,
  ).toISOString();

  return { expiresAt, token, tokenHash };
}

export function hashFmsApplicationUpdateToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

