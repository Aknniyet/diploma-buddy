export const ASTANA_TIME_ZONE = "Asia/Almaty";

function toDate(value) {
  if (!value) return null;

  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function buildFormatter(options) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: ASTANA_TIME_ZONE,
    ...options,
  });
}

function getAstanaParts(value) {
  const date = toDate(value);
  if (!date) return null;

  const formatter = buildFormatter({
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  return formatter.formatToParts(date).reduce((result, part) => {
    if (part.type !== "literal") {
      result[part.type] = part.value;
    }

    return result;
  }, {});
}

export function formatAstanaDateTime(value, options = {}) {
  const date = toDate(value);
  if (!date) return "";

  const resolvedOptions =
    Object.keys(options).length > 0
      ? options
      : {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        };

  return buildFormatter(resolvedOptions).format(date);
}

export function formatAstanaDate(value, options = {}) {
  return formatAstanaDateTime(value, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    ...options,
  });
}

export function formatAstanaTime(value, options = {}) {
  return formatAstanaDateTime(value, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    ...options,
  });
}

export function formatAstanaShortDateTime(value) {
  return formatAstanaDateTime(value, {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function getAstanaDateKey(value) {
  const parts = getAstanaParts(value);
  if (!parts) return "";

  return `${parts.year}-${parts.month}-${parts.day}`;
}

export function formatAstanaRelativeDateLabel(value) {
  const dateKey = getAstanaDateKey(value);
  if (!dateKey) return "";

  const todayKey = getAstanaDateKey(new Date());
  const yesterdayKey = getAstanaDateKey(Date.now() - 24 * 60 * 60 * 1000);

  if (dateKey === todayKey) return "Today";
  if (dateKey === yesterdayKey) return "Yesterday";

  return formatAstanaDateTime(value, {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function toAstanaDateTimeInputValue(value) {
  const parts = getAstanaParts(value);
  if (!parts) return "";

  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}
