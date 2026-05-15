import { query } from "../config/db.js";
import {
  encryptMessageText,
  getMessageEncryptionVersion,
  getMessagePlaceholderText,
  isMessageEncryptionConfigured,
} from "../utils/messageCrypto.js";

export async function migrateLegacyMessageEncryption() {
  if (!isMessageEncryptionConfigured()) {
    console.warn(
      "MESSAGE_ENCRYPTION_KEY is missing. Message encryption migration was skipped."
    );
    return;
  }

  const legacyMessagesResult = await query(
    `SELECT id, text
     FROM messages
     WHERE (
       encrypted_text IS NULL
       OR encryption_iv IS NULL
       OR encryption_auth_tag IS NULL
     )
       AND text IS NOT NULL
       AND text <> $1
     ORDER BY id ASC`,
    [getMessagePlaceholderText()]
  );

  if (legacyMessagesResult.rows.length === 0) {
    return;
  }

  for (const message of legacyMessagesResult.rows) {
    const encrypted = encryptMessageText(message.text);

    await query(
      `UPDATE messages
       SET text = $2,
           encrypted_text = $3,
           encryption_iv = $4,
           encryption_auth_tag = $5,
           encryption_version = $6
       WHERE id = $1`,
      [
        message.id,
        encrypted.placeholderText,
        encrypted.encryptedText,
        encrypted.encryptionIv,
        encrypted.encryptionAuthTag,
        encrypted.encryptionVersion || getMessageEncryptionVersion(),
      ]
    );
  }

  console.log(
    `Encrypted ${legacyMessagesResult.rows.length} legacy message(s) for secure storage.`
  );
}
