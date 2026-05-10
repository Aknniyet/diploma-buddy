import { env } from "../config/env.js";
import { createNotification as createNotificationRecord } from "../repositories/notificationRepository.js";
import { findUserProfileById } from "../repositories/userRepository.js";
import { isEmailConfigured, sendNotificationEmail } from "../utils/mailer.js";

function getDefaultActionUrl(role) {
  if (role === "local") {
    return `${env.frontendUrl}/buddy/notifications`;
  }

  if (role === "international") {
    return `${env.frontendUrl}/student/notifications`;
  }

  return env.frontendUrl;
}

export async function createNotification(payload) {
  const result = await createNotificationRecord(payload);

  if (payload.sendEmail === false || !isEmailConfigured()) {
    return result;
  }

  try {
    const recipientResult = await findUserProfileById(payload.userId);
    const recipient = recipientResult.rows[0];

    if (!recipient?.email) {
      return result;
    }

    await sendNotificationEmail(recipient.email, {
      recipientName: recipient.full_name,
      title: payload.title,
      description: payload.description,
      actionUrl: payload.actionUrl || getDefaultActionUrl(recipient.role),
    });
  } catch (error) {
    console.error("Notification email error:", error.message);
  }

  return result;
}
