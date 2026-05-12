import { formatAstanaShortDateTime, toAstanaDateTimeInputValue } from "./datetime";

export function formatDate(value) {
  if (!value) {
    return "Flexible time";
  }

  return formatAstanaShortDateTime(value);
}

export function getAvatarInitials(name, fallback = "U") {
  if (!name) {
    return fallback;
  }

  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function createEditableForm(post) {
  return {
    title: post.title || "",
    description: post.description || "",
    category: post.category || "hangout",
    location: post.location || "",
    meetingTime: toAstanaDateTimeInputValue(post.meeting_time),
    imageUrl: post.image_url || "",
  };
}
