import {
  findUpcomingEventsForReminders,
  hasEventReminderBeenSent,
  markEventReminderSent,
} from "../repositories/contentRepository.js";
import { findStudentAndBuddyRecipients } from "../repositories/userRepository.js";
import { createNotification } from "./notificationService.js";
import { env } from "../config/env.js";

let isProcessingEventReminders = false;

const reminderStages = [
  {
    type: "24_hours",
    maxMinutesBeforeEvent: 24 * 60,
    title: "Event reminder",
    buildDescription: (event) =>
      `"${event.title}" is happening within 24 hours${event.location ? ` at ${event.location}` : ""}.`,
  },
  {
    type: "2_hours",
    maxMinutesBeforeEvent: 2 * 60,
    title: "Event starts soon",
    buildDescription: (event) =>
      `"${event.title}" starts in less than 2 hours${event.location ? ` at ${event.location}` : ""}.`,
  },
];

function getEventsPageUrl(role) {
  return role === "local"
    ? `${env.frontendUrl}/buddy/events`
    : `${env.frontendUrl}/student/events`;
}

export async function processEventReminders() {
  if (isProcessingEventReminders) {
    return;
  }

  isProcessingEventReminders = true;

  try {
    const [eventsResult, recipientsResult] = await Promise.all([
      findUpcomingEventsForReminders(),
      findStudentAndBuddyRecipients(),
    ]);

    const now = Date.now();

    for (const event of eventsResult.rows) {
      const minutesUntilEvent = Math.max(
        0,
        Math.floor((new Date(event.event_date).getTime() - now) / 60000)
      );

      const dueStages = reminderStages.filter(
        (stage) => minutesUntilEvent <= stage.maxMinutesBeforeEvent
      );

      if (dueStages.length === 0) {
        continue;
      }

      for (const recipient of recipientsResult.rows) {
        for (const stage of dueStages) {
          const existingResult = await hasEventReminderBeenSent(
            event.id,
            recipient.id,
            stage.type
          );

          if (existingResult.rows.length > 0) {
            continue;
          }

          await createNotification({
            userId: recipient.id,
            type: "event_reminder",
            title: stage.title,
            description: stage.buildDescription(event),
            referenceType: "event",
            referenceId: event.id,
            actionUrl: getEventsPageUrl(recipient.role),
          }).catch(() => null);

          await markEventReminderSent(event.id, recipient.id, stage.type).catch(() => null);
        }
      }
    }
  } catch (error) {
    console.error("Process event reminders error:", error.message);
  } finally {
    isProcessingEventReminders = false;
  }
}
