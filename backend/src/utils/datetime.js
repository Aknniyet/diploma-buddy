export const ASTANA_TIME_ZONE = "Asia/Almaty";

function formatWithAstanaTimeZone(value, options) {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-GB", {
    timeZone: ASTANA_TIME_ZONE,
    ...options,
  }).format(date);
}

export function formatAstanaDate(value, options = {}) {
  return formatWithAstanaTimeZone(value, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    ...options,
  });
}

export function formatAstanaTime(value, options = {}) {
  return formatWithAstanaTimeZone(value, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    ...options,
  });
}
