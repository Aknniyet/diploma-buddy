import { isValidEmail } from "./email";

export const STUDY_PROGRAMS = [
  "Software Engineering",
  "Computer Science",
  "Mathematical and Computational Science",
  "Big Data Analysis",
  "Cybersecurity",
  "Smart Security Technologies",
  "Industrial Internet of Things",
  "Electronic Engineering",
  "Smart Technologies",
  "Digital Technologies in Nuclear Power Engineering",
  "IT Management",
  "IT Entrepreneurship",
  "AI Business",
  "Media Technologies",
  "Digital Journalism",
  "Digital Public Administration",
];

export const LANGUAGE_OPTIONS = [
  "Abkhaz",
  "Afrikaans",
  "Albanian",
  "Amharic",
  "Arabic",
  "Armenian",
  "Assamese",
  "Azerbaijani",
  "Basque",
  "Belarusian",
  "Bengali",
  "Bosnian",
  "Bulgarian",
  "Burmese",
  "Catalan",
  "Cebuano",
  "English",
  "Chinese",
  "Croatian",
  "Czech",
  "Danish",
  "Dutch",
  "Esperanto",
  "Estonian",
  "Filipino",
  "Finnish",
  "French",
  "Galician",
  "Georgian",
  "German",
  "Greek",
  "Gujarati",
  "Haitian Creole",
  "Hausa",
  "Hebrew",
  "Hindi",
  "Hungarian",
  "Icelandic",
  "Igbo",
  "Indonesian",
  "Irish",
  "Italian",
  "Japanese",
  "Javanese",
  "Kannada",
  "Kazakh",
  "Khmer",
  "Kinyarwanda",
  "Korean",
  "Kurdish",
  "Kyrgyz",
  "Lao",
  "Latvian",
  "Lithuanian",
  "Luxembourgish",
  "Macedonian",
  "Malagasy",
  "Malay",
  "Malayalam",
  "Maltese",
  "Maori",
  "Marathi",
  "Mongolian",
  "Nepali",
  "Norwegian",
  "Pashto",
  "Persian",
  "Polish",
  "Portuguese",
  "Punjabi",
  "Romanian",
  "Russian",
  "Samoan",
  "Scottish Gaelic",
  "Serbian",
  "Sindhi",
  "Sinhala",
  "Slovak",
  "Slovenian",
  "Somali",
  "Spanish",
  "Sundanese",
  "Swahili",
  "Swedish",
  "Tajik",
  "Tamil",
  "Tatar",
  "Telugu",
  "Thai",
  "Turkish",
  "Turkmen",
  "Ukrainian",
  "Urdu",
  "Uyghur",
  "Uzbek",
  "Vietnamese",
  "Welsh",
  "Xhosa",
  "Yoruba",
  "Zulu",
];

export const POPULAR_LANGUAGE_OPTIONS = [
  "English",
  "Russian",
  "Kazakh",
  "Chinese",
  "Turkish",
  "German",
  "French",
  "Spanish",
  "Arabic",
  "Korean",
  "Japanese",
  "Uzbek",
];

const LANGUAGE_ALIASES = {
  kazakh: "Kazakh",
  kaz: "Kazakh",
  қазақ: "Kazakh",
  казахский: "Kazakh",
  russian: "Russian",
  rus: "Russian",
  русский: "Russian",
  рус: "Russian",
  english: "English",
  eng: "English",
  английский: "English",
  англ: "English",
  turkish: "Turkish",
  turk: "Turkish",
  türkçe: "Turkish",
  турецкий: "Turkish",
  chinese: "Chinese",
  mandarin: "Chinese",
  中文: "Chinese",
  китайский: "Chinese",
  korean: "Korean",
  한국어: "Korean",
  корейский: "Korean",
  japanese: "Japanese",
  日本語: "Japanese",
  японский: "Japanese",
  german: "German",
  deutsch: "German",
  немецкий: "German",
  french: "French",
  français: "French",
  французский: "French",
  spanish: "Spanish",
  español: "Spanish",
  испанский: "Spanish",
  arabic: "Arabic",
  العربية: "Arabic",
  арабский: "Arabic",
  hindi: "Hindi",
  хинди: "Hindi",
  uzbek: "Uzbek",
  "o'zbek": "Uzbek",
  узбекский: "Uzbek",
  kyrgyz: "Kyrgyz",
  кыргызча: "Kyrgyz",
  киргизский: "Kyrgyz",
  tajik: "Tajik",
  тоҷикӣ: "Tajik",
  таджикский: "Tajik",
  ukrainian: "Ukrainian",
  українська: "Ukrainian",
  украинский: "Ukrainian",
  italian: "Italian",
  italiano: "Italian",
  итальянский: "Italian",
  portuguese: "Portuguese",
  português: "Portuguese",
  португальский: "Portuguese",
};

const LANGUAGE_SET = new Set(LANGUAGE_OPTIONS);
const MAX_LANGUAGES = 5;
const NAME_LIKE_REGEX = /^[\p{L}\s'-]+$/u;
const HAS_LETTER_REGEX = /\p{L}/u;
const LIST_ITEM_REGEX = /^[\p{L}\s&'-]+$/u;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,72}$/;
const GENDERS = new Set(["female", "male", "other"]);
const GENDER_PREFERENCES = new Set(["no_preference", "female", "male", "other"]);
const MEETING_MODES = new Set(["online", "offline", "both"]);
const PLACEHOLDER_PATTERN = /^(test|tester|testing|qwerty|asdf|admin|user|unknown|none|null|n\/a)$/iu;
const REPEATED_CHAR_PATTERN = /(.)\1{3,}/u;
const UNSAFE_CONTENT_PATTERNS = [
  /\bkill(?:ing|ed|er)?\b/iu,
  /\bmurder(?:ing|ed|er)?\b/iu,
  /\bshoot(?:ing|er|ed)?\b/iu,
  /\bterror(?:ist|ism)?\b/iu,
  /\brape\b/iu,
  /\bsuicide\b/iu,
  /\bself[- ]?harm\b/iu,
  /\bdrug(?:s| dealer| dealing)?\b/iu,
  /\bnazi\b/iu,
  /\bgenocide\b/iu,
  /\bviolent extremism\b/iu,
  /уб(ить|ью|ийство|ивать)/iu,
  /насили[ея]/iu,
  /террор/iu,
  /суицид/iu,
  /наркот/iu,
  /убий/iu,
  /өлтір/iu,
  /зорлық/iu,
  /суицид/iu,
];

function trimString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function collapseSpaces(value) {
  return trimString(value).replace(/\s+/g, " ");
}

function normalizeList(value) {
  return String(value || "")
    .split(",")
    .map((item) => collapseSpaces(item))
    .filter(Boolean);
}

function findCanonicalLanguage(value) {
  const normalizedValue = collapseSpaces(value).toLowerCase();
  return LANGUAGE_ALIASES[normalizedValue]
    || LANGUAGE_OPTIONS.find((language) => language.toLowerCase() === normalizedValue)
    || null;
}

export function normalizeLanguageSelections(value) {
  const rawValues = Array.isArray(value) ? value : normalizeList(value);
  const normalizedValues = rawValues
    .map((item) => findCanonicalLanguage(item))
    .filter(Boolean);

  return [...new Set(normalizedValues)];
}

export function toggleLanguageSelection(currentLanguages, language) {
  if (!currentLanguages.includes(language) && currentLanguages.length >= MAX_LANGUAGES) {
    return currentLanguages;
  }

  return currentLanguages.includes(language)
    ? currentLanguages.filter((item) => item !== language)
    : [...currentLanguages, language];
}

export function filterLanguageOptions(query) {
  const normalizedQuery = collapseSpaces(query).toLowerCase();

  if (!normalizedQuery) {
    return LANGUAGE_OPTIONS;
  }

  return LANGUAGE_OPTIONS.filter((language) => {
    const languageName = language.toLowerCase();
    const aliases = Object.entries(LANGUAGE_ALIASES)
      .filter(([, canonicalLanguage]) => canonicalLanguage === language)
      .map(([alias]) => alias);

    return [languageName, ...aliases].some((term) => term.includes(normalizedQuery));
  });
}

function containsUnsafeContent(value) {
  const normalizedValue = collapseSpaces(value).toLowerCase();
  return UNSAFE_CONTENT_PATTERNS.some((pattern) => pattern.test(normalizedValue));
}

function looksLikePlaceholderText(value) {
  const normalizedValue = collapseSpaces(value);
  return PLACEHOLDER_PATTERN.test(normalizedValue) || REPEATED_CHAR_PATTERN.test(normalizedValue);
}

function validateNameLikeField(value, label, { required = false, maxLength = 100 } = {}) {
  const normalizedValue = collapseSpaces(value);

  if (!normalizedValue) {
    return required ? `${label} is required.` : null;
  }

  if (normalizedValue.length > maxLength) {
    return `${label} must be ${maxLength} characters or fewer.`;
  }

  if (!NAME_LIKE_REGEX.test(normalizedValue)) {
    return `${label} can contain only letters, spaces, hyphens, and apostrophes.`;
  }

  if (!HAS_LETTER_REGEX.test(normalizedValue)) {
    return `${label} must include at least one letter.`;
  }

  if (looksLikePlaceholderText(normalizedValue)) {
    return `${label} looks incomplete or unrealistic.`;
  }

  return null;
}

function validateLanguagesField(value) {
  const normalizedValues = Array.isArray(value) ? value.map(collapseSpaces).filter(Boolean) : normalizeList(value);

  if (normalizedValues.length === 0) {
    return "Choose at least one real language.";
  }

  if (normalizedValues.length > MAX_LANGUAGES) {
    return `Choose up to ${MAX_LANGUAGES} languages.`;
  }

  if (normalizedValues.some((language) => !LANGUAGE_SET.has(language))) {
    return "Choose languages only from the suggested list.";
  }

  return null;
}

function validateListField(value, label) {
  const items = normalizeList(value);

  if (items.length > 10) {
    return `${label} can contain up to 10 items.`;
  }

  for (const item of items) {
    if (item.length < 2 || item.length > 40) {
      return `Each ${label.toLowerCase()} item must be between 2 and 40 characters.`;
    }

    if (!LIST_ITEM_REGEX.test(item)) {
      return `${label} items can contain only letters, spaces, commas, hyphens, apostrophes, and ampersands.`;
    }

    if (looksLikePlaceholderText(item)) {
      return `${label} should contain real interests, not placeholder text.`;
    }

    if (containsUnsafeContent(item)) {
      return `${label} must stay respectful and safe.`;
    }
  }

  return null;
}

function validateAboutYouField(value) {
  const normalizedValue = collapseSpaces(value);

  if (!normalizedValue) {
    return null;
  }

  if (normalizedValue.length > 500) {
    return "About you must be 500 characters or fewer.";
  }

  if (normalizedValue.length < 12 || normalizedValue.split(" ").length < 3) {
    return "Write a short, real introduction with at least a few words.";
  }

  if (looksLikePlaceholderText(normalizedValue)) {
    return "Write a real short introduction about yourself.";
  }

  if (containsUnsafeContent(normalizedValue)) {
    return "Use respectful and safe language in your profile.";
  }

  return null;
}

function validateSharedFields(formData, { requireCity = false } = {}) {
  const fullNameError = validateNameLikeField(formData.fullName, "Full name", { required: true });
  if (fullNameError) {
    return fullNameError;
  }

  const homeCountryError = validateNameLikeField(formData.homeCountry, "Home country");
  if (homeCountryError) {
    return homeCountryError;
  }

  const cityError = validateNameLikeField(formData.city, "City", { required: requireCity });
  if (cityError) {
    return cityError;
  }

  const studyProgram = collapseSpaces(formData.studyProgram);
  if (studyProgram && !STUDY_PROGRAMS.includes(studyProgram)) {
    return "Please choose a valid study program.";
  }

  const languagesError = validateLanguagesField(formData.languages);
  if (languagesError) {
    return languagesError;
  }

  const hobbiesError = validateListField(formData.hobbies, "Hobbies");
  if (hobbiesError) {
    return hobbiesError;
  }

  const aboutYouError = validateAboutYouField(formData.aboutYou);
  if (aboutYouError) {
    return aboutYouError;
  }

  const gender = collapseSpaces(formData.gender);
  if (gender && !GENDERS.has(gender)) {
    return "Please choose a valid gender.";
  }

  const genderPreference = collapseSpaces(formData.genderPreference || "no_preference");
  if (genderPreference && !GENDER_PREFERENCES.has(genderPreference)) {
    return "Please choose a valid buddy gender preference.";
  }

  return "";
}

function translateSharedValidationError(sharedError, t) {
  const errorKeyMap = {
    "Full name is required.": "signup.errors.fillRequired",
    "Full name can contain only letters, spaces, hyphens, and apostrophes.": "signup.errors.fullNameInvalid",
    "Full name looks incomplete or unrealistic.": "signup.errors.fullNameUnrealistic",
    "Home country is required.": "signup.errors.homeCountryRequired",
    "Home country can contain only letters, spaces, hyphens, and apostrophes.": "signup.errors.homeCountryInvalid",
    "Home country looks incomplete or unrealistic.": "signup.errors.homeCountryUnrealistic",
    "City is required.": "signup.errors.cityRequired",
    "City can contain only letters, spaces, hyphens, and apostrophes.": "signup.errors.cityInvalid",
    "City looks incomplete or unrealistic.": "signup.errors.cityUnrealistic",
    "Please choose a valid study program.": "signup.errors.invalidStudyProgram",
    "Please choose a valid gender.": "signup.errors.invalidGender",
    "Please choose a valid buddy gender preference.": "signup.errors.invalidGenderPreference",
    "Choose at least one real language.": "signup.errors.languagesRequired",
    "Choose up to 5 languages.": "signup.errors.languagesTooMany",
    "Choose languages only from the suggested list.": "signup.errors.languagesInvalid",
    "About you must be 500 characters or fewer.": "signup.errors.aboutYouTooLong",
    "Write a short, real introduction with at least a few words.": "signup.errors.aboutYouTooShort",
    "Write a real short introduction about yourself.": "signup.errors.aboutYouUnrealistic",
    "Use respectful and safe language in your profile.": "signup.errors.respectfulTextRequired",
    "Hobbies should contain real interests, not placeholder text.": "signup.errors.hobbiesPlaceholder",
    "Hobbies must stay respectful and safe.": "signup.errors.respectfulTextRequired",
  };

  const translationKey = errorKeyMap[sharedError];
  if (translationKey) {
    return t(translationKey);
  }

  if (sharedError.startsWith("Hobbies")) {
    return t("signup.errors.hobbiesInvalid");
  }

  if (sharedError.startsWith("Each hobbies")) {
    return t("signup.errors.hobbiesInvalid");
  }

  return sharedError;
}

export function sanitizeRestrictedFieldValue(name, value) {
  if (typeof value !== "string") {
    return value;
  }

  if (["fullName", "homeCountry", "city"].includes(name)) {
    return value.replace(/[^\p{L}\s'-]/gu, "");
  }

  if (name === "hobbies" || name === "supportAreas") {
    return value.replace(/[^\p{L}\s,&'-]/gu, "");
  }

  return value;
}

export function normalizeRegistrationPayload(formData, selectedRole) {
  return {
    ...formData,
    fullName: collapseSpaces(formData.fullName),
    email: trimString(formData.email).toLowerCase(),
    homeCountry: selectedRole === "local" ? "Kazakhstan" : collapseSpaces(formData.homeCountry),
    city: collapseSpaces(formData.city),
    studyProgram: collapseSpaces(formData.studyProgram),
    languages: normalizeLanguageSelections(formData.languages),
    hobbies: normalizeList(formData.hobbies).join(", "),
    aboutYou: collapseSpaces(formData.aboutYou),
    gender: trimString(formData.gender),
    genderPreference: trimString(formData.genderPreference || "no_preference"),
    maxBuddies: String(formData.maxBuddies || "3"),
  };
}

export function validateSignupStepTwo(formData, t) {
  if (!collapseSpaces(formData.fullName) || !trimString(formData.email) || !formData.password || !formData.confirmPassword) {
    return t("signup.errors.fillRequired");
  }

  const fullNameError = validateNameLikeField(formData.fullName, "Full name", { required: true });
  if (fullNameError) {
    return fullNameError.includes("unrealistic")
      ? t("signup.errors.fullNameUnrealistic")
      : t("signup.errors.fullNameInvalid");
  }

  if (!isValidEmail(formData.email)) {
    return t("signup.errors.invalidEmail");
  }

  if (!PASSWORD_REGEX.test(String(formData.password || ""))) {
    return t("signup.errors.passwordWeak");
  }

  if (formData.password !== formData.confirmPassword) {
    return t("signup.errors.passwordsMismatch");
  }

  if (collapseSpaces(formData.gender) && !GENDERS.has(collapseSpaces(formData.gender))) {
    return t("signup.errors.invalidGender");
  }

  if (collapseSpaces(formData.genderPreference || "no_preference") && !GENDER_PREFERENCES.has(collapseSpaces(formData.genderPreference || "no_preference"))) {
    return t("signup.errors.invalidGenderPreference");
  }

  return "";
}

export function validateSignupForm(formData, selectedRole, t) {
  const stepTwoError = validateSignupStepTwo(formData, t);
  if (stepTwoError) {
    return stepTwoError;
  }

  if (selectedRole === "international" && !collapseSpaces(formData.homeCountry)) {
    return t("signup.errors.homeCountryRequired");
  }

  const sharedError = validateSharedFields(formData, { requireCity: true });
  if (sharedError) {
    return translateSharedValidationError(sharedError, t);
  }

  const maxBuddies = Number.parseInt(String(formData.maxBuddies), 10);
  if (selectedRole === "local" && (!Number.isInteger(maxBuddies) || maxBuddies < 1 || maxBuddies > 3)) {
    return t("signup.errors.maxBuddiesInvalid");
  }

  return "";
}

export function validateProfileForm(formData, isBuddy, t = null) {
  const sharedError = validateSharedFields(formData);
  if (sharedError) {
    return t ? translateSharedValidationError(sharedError, t) : sharedError;
  }

  if (isBuddy) {
    const maxBuddies = Number.parseInt(String(formData.maxBuddies), 10);
    const maxWeeklyHours = Number.parseInt(String(formData.maxWeeklyHours), 10);
    const meetingMode = collapseSpaces(formData.preferredMeetingMode || "both");

    if (!Number.isInteger(maxBuddies) || maxBuddies < 1 || maxBuddies > 3) {
      return t ? t("signup.errors.maxBuddiesInvalid") : "Maximum students must be between 1 and 3.";
    }

    if (!MEETING_MODES.has(meetingMode)) {
      return "Please choose a valid meeting mode.";
    }

    if (!Number.isInteger(maxWeeklyHours) || maxWeeklyHours < 1 || maxWeeklyHours > 20) {
      return "Maximum weekly hours must be between 1 and 20.";
    }

    const supportAreasError = validateListField(formData.supportAreas, "Support areas");
    if (supportAreasError) {
      return supportAreasError;
    }
  }

  return "";
}
