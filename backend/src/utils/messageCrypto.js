import crypto from "crypto";
import { env } from "../config/env.js";

const MESSAGE_ENCRYPTION_VERSION = "aes-256-gcm:v1";
const MESSAGE_PLACEHOLDER_TEXT = "[encrypted-message]";

let cachedKey = null;

function getMessageEncryptionKey() {
  if (cachedKey) {
    return cachedKey;
  }

  if (!env.messageEncryptionKey) {
    throw new Error("MESSAGE_ENCRYPTION_KEY is not configured.");
  }

  const key = Buffer.from(env.messageEncryptionKey, "base64");

  if (key.length !== 32) {
    throw new Error("MESSAGE_ENCRYPTION_KEY must be a base64-encoded 32-byte key.");
  }

  cachedKey = key;
  return cachedKey;
}

export function isMessageEncryptionConfigured() {
  try {
    getMessageEncryptionKey();
    return true;
  } catch {
    return false;
  }
}

export function encryptMessageText(text) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", getMessageEncryptionKey(), iv);
  const encryptedBuffer = Buffer.concat([cipher.update(String(text), "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return {
    placeholderText: MESSAGE_PLACEHOLDER_TEXT,
    encryptedText: encryptedBuffer.toString("base64"),
    encryptionIv: iv.toString("base64"),
    encryptionAuthTag: authTag.toString("base64"),
    encryptionVersion: MESSAGE_ENCRYPTION_VERSION,
  };
}

export function decryptMessagePayload(message) {
  if (
    message?.encrypted_text &&
    message?.encryption_iv &&
    message?.encryption_auth_tag
  ) {
    const decipher = crypto.createDecipheriv(
      "aes-256-gcm",
      getMessageEncryptionKey(),
      Buffer.from(message.encryption_iv, "base64")
    );

    decipher.setAuthTag(Buffer.from(message.encryption_auth_tag, "base64"));

    const decryptedBuffer = Buffer.concat([
      decipher.update(Buffer.from(message.encrypted_text, "base64")),
      decipher.final(),
    ]);

    return decryptedBuffer.toString("utf8");
  }

  return String(message?.text || "");
}

export function getMessageEncryptionVersion() {
  return MESSAGE_ENCRYPTION_VERSION;
}

export function getMessagePlaceholderText() {
  return MESSAGE_PLACEHOLDER_TEXT;
}
