import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "mindlet_admin";
const SESSION_VALUE = "mindlet-admin-v1";

function signingSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error("관리자 세션 환경 변수가 설정되지 않았습니다.");
  return secret;
}

function signature(value: string) {
  return createHmac("sha256", signingSecret())
    .update(value)
    .digest("hex");
}

export function createAdminSessionToken() {
  const value = `${SESSION_VALUE}.${Math.floor(Date.now() / 1000) + 60 * 60 * 8}`;
  return `${value}.${signature(value)}`;
}

export async function isAdminRequest() {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!token || !process.env.ADMIN_SESSION_SECRET) return false;

  const [version, expiry, mac, extra] = token.split(".");
  const expiresAt = Number(expiry);
  const now = Math.floor(Date.now() / 1000);
  if (version !== SESSION_VALUE || !expiry || !mac || extra !== undefined ||
      !Number.isSafeInteger(expiresAt) || expiresAt <= now || expiresAt > now + 60 * 60 * 8) return false;

  const value = `${version}.${expiry}`;
  const expected = `${value}.${signature(value)}`;
  const left = Buffer.from(token);
  const right = Buffer.from(expected);

  return left.length === right.length && timingSafeEqual(left, right);
}
