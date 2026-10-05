import crypto from "crypto";

export function seal(payload, secret) {
  const iv = crypto.randomBytes(12);
  const key = crypto.createHash("sha256").update(secret).digest();
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const body = Buffer.concat([cipher.update(JSON.stringify(payload), "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, body]).toString("base64url");
}

export function openNote(token, secret) {
  if (typeof token !== "string" || !/^[A-Za-z0-9_-]+$/.test(token) || token.length > 4096) throw new Error("Invalid note");
  const raw = Buffer.from(token, "base64url");
  if (raw.length < 29) throw new Error("Invalid note");
  const iv = raw.subarray(0, 12);
  const tag = raw.subarray(12, 28);
  const body = raw.subarray(28);
  const key = crypto.createHash("sha256").update(secret).digest();
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  const json = Buffer.concat([decipher.update(body), decipher.final()]).toString("utf8");
  const note = JSON.parse(json);
  if (typeof note?.text !== "string" || !note.text || !Number.isSafeInteger(note.openAt) ||
      note.openAt <= 0 || typeof note.sid !== "string" || !note.sid) throw new Error("Invalid note");
  return note;
}
