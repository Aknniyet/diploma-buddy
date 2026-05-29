import { isValidEmail } from './email.js';
import { normalizeArray } from '../services/arrayUtils.js';

export const STUDY_PROGRAMS = [
  'Software Engineering',
  'Computer Science',
  'Mathematical and Computational Science',
  'Big Data Analysis',
  'Cybersecurity',
  'Smart Security Technologies',
  'Industrial Internet of Things',
  'Electronic Engineering',
  'Smart Technologies',
  'Digital Technologies in Nuclear Power Engineering',
  'IT Management',
  'IT Entrepreneurship',
  'AI Business',
  'Media Technologies',
  'Digital Journalism',
  'Digital Public Administration',
];

export const LANGUAGE_OPTIONS = [
  'Abkhaz',
  'Afrikaans',
  'Albanian',
  'Amharic',
  'Arabic',
  'Armenian',
  'Assamese',
  'Azerbaijani',
  'Basque',
  'Belarusian',
  'Bengali',
  'Bosnian',
  'Bulgarian',
  'Burmese',
  'Catalan',
  'Cebuano',
  'English',
  'Chinese',
  'Croatian',
  'Czech',
  'Danish',
  'Dutch',
  'Esperanto',
  'Estonian',
  'Filipino',
  'Finnish',
  'French',
  'Galician',
  'Georgian',
  'German',
  'Greek',
  'Gujarati',
  'Haitian Creole',
  'Hausa',
  'Hebrew',
  'Hindi',
  'Hungarian',
  'Icelandic',
  'Igbo',
  'Indonesian',
  'Irish',
  'Italian',
  'Japanese',
  'Javanese',
  'Kannada',
  'Kazakh',
  'Khmer',
  'Kinyarwanda',
  'Korean',
  'Kurdish',
  'Kyrgyz',
  'Lao',
  'Latvian',
  'Lithuanian',
  'Luxembourgish',
  'Macedonian',
  'Malagasy',
  'Malay',
  'Malayalam',
  'Maltese',
  'Maori',
  'Marathi',
  'Mongolian',
  'Nepali',
  'Norwegian',
  'Pashto',
  'Persian',
  'Polish',
  'Portuguese',
  'Punjabi',
  'Romanian',
  'Russian',
  'Samoan',
  'Scottish Gaelic',
  'Serbian',
  'Sindhi',
  'Sinhala',
  'Slovak',
  'Slovenian',
  'Somali',
  'Spanish',
  'Sundanese',
  'Swahili',
  'Swedish',
  'Tajik',
  'Tamil',
  'Tatar',
  'Telugu',
  'Thai',
  'Turkish',
  'Turkmen',
  'Ukrainian',
  'Urdu',
  'Uyghur',
  'Uzbek',
  'Vietnamese',
  'Welsh',
  'Xhosa',
  'Yoruba',
  'Zulu',
];

const LANGUAGE_ALIASES = {
  kazakh: 'Kazakh',
  kaz: 'Kazakh',
  қазақ: 'Kazakh',
  казахский: 'Kazakh',
  russian: 'Russian',
  rus: 'Russian',
  русский: 'Russian',
  рус: 'Russian',
  english: 'English',
  eng: 'English',
  английский: 'English',
  англ: 'English',
  turkish: 'Turkish',
  turk: 'Turkish',
  'türkçe': 'Turkish',
  турецкий: 'Turkish',
  chinese: 'Chinese',
  mandarin: 'Chinese',
  中文: 'Chinese',
  китайский: 'Chinese',
  korean: 'Korean',
  한국어: 'Korean',
  корейский: 'Korean',
  japanese: 'Japanese',
  日本語: 'Japanese',
  японский: 'Japanese',
  german: 'German',
  deutsch: 'German',
  немецкий: 'German',
  french: 'French',
  'français': 'French',
  французский: 'French',
  spanish: 'Spanish',
  'español': 'Spanish',
  испанский: 'Spanish',
  arabic: 'Arabic',
  العربية: 'Arabic',
  арабский: 'Arabic',
  hindi: 'Hindi',
  хинди: 'Hindi',
  uzbek: 'Uzbek',
  "o'zbek": 'Uzbek',
  узбекский: 'Uzbek',
  kyrgyz: 'Kyrgyz',
  кыргызча: 'Kyrgyz',
  киргизский: 'Kyrgyz',
  tajik: 'Tajik',
  тоҷикӣ: 'Tajik',
  таджикский: 'Tajik',
  ukrainian: 'Ukrainian',
  українська: 'Ukrainian',
  украинский: 'Ukrainian',
  italian: 'Italian',
  italiano: 'Italian',
  итальянский: 'Italian',
  portuguese: 'Portuguese',
  'português': 'Portuguese',
  португальский: 'Portuguese',
};

const PUBLIC_ROLES = new Set(['international', 'local']);
const GENDERS = new Set(['female', 'male', 'other']);
const GENDER_PREFERENCES = new Set(['no_preference', 'female', 'male', 'other']);
const MEETING_MODES = new Set(['online', 'offline', 'both']);
const LANGUAGE_SET = new Set(LANGUAGE_OPTIONS);
const MAX_LANGUAGES = 5;
const NAME_LIKE_REGEX = /^[\p{L}\s'-]+$/u;
const HAS_LETTER_REGEX = /\p{L}/u;
const LIST_ITEM_REGEX = /^[\p{L}\s&'-]+$/u;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,72}$/;
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
  return typeof value === 'string' ? value.trim() : '';
}

function collapseSpaces(value) {
  return trimString(value).replace(/\s+/g, ' ');
}

function findCanonicalLanguage(value) {
  const normalizedValue = collapseSpaces(value).toLowerCase();
  return LANGUAGE_ALIASES[normalizedValue]
    || LANGUAGE_OPTIONS.find((language) => language.toLowerCase() === normalizedValue)
    || null;
}

function normalizeLanguageSelections(value) {
  const rawValues = Array.isArray(value) ? value : normalizeArray(value);
  const normalizedValues = rawValues
    .map((item) => findCanonicalLanguage(item))
    .filter(Boolean);

  return [...new Set(normalizedValues)];
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
  const rawValues = Array.isArray(value)
    ? value.map((item) => collapseSpaces(item)).filter(Boolean)
    : normalizeArray(value).map((item) => collapseSpaces(item)).filter(Boolean);

  if (rawValues.length === 0) {
    return { error: 'Choose at least one real language.' };
  }

  if (rawValues.length > MAX_LANGUAGES) {
    return { error: `Choose up to ${MAX_LANGUAGES} languages.` };
  }

  const normalizedValues = normalizeLanguageSelections(rawValues);
  if (normalizedValues.length !== rawValues.length || normalizedValues.some((language) => !LANGUAGE_SET.has(language))) {
    return { error: 'Choose languages only from the suggested list.' };
  }

  return { value: normalizedValues };
}

function validateListField(value, label) {
  const items = normalizeArray(value).map((item) => collapseSpaces(item)).filter(Boolean);

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
    return 'About you must be 500 characters or fewer.';
  }

  if (normalizedValue.length < 12 || normalizedValue.split(' ').length < 3) {
    return 'Write a short, real introduction with at least a few words.';
  }

  if (looksLikePlaceholderText(normalizedValue)) {
    return 'Write a real short introduction about yourself.';
  }

  if (containsUnsafeContent(normalizedValue)) {
    return 'Use respectful and safe language in your profile.';
  }

  return null;
}

export function validateModeratedText(value, label, { required = false, maxLength = 500 } = {}) {
  const normalizedValue = collapseSpaces(value);

  if (!normalizedValue) {
    return required ? `${label} is required.` : null;
  }

  if (normalizedValue.length > maxLength) {
    return `${label} must be ${maxLength} characters or fewer.`;
  }

  if (normalizedValue.length < 2) {
    return `${label} is too short.`;
  }

  if (looksLikePlaceholderText(normalizedValue)) {
    return `${label} looks incomplete or unrealistic.`;
  }

  if (containsUnsafeContent(normalizedValue)) {
    return `${label} must stay respectful and safe.`;
  }

  return null;
}

function normalizeRole(role) {
  return collapseSpaces(role);
}

function normalizeGender(gender) {
  return collapseSpaces(gender);
}

function normalizeGenderPreference(genderPreference) {
  const value = collapseSpaces(genderPreference);
  return value || 'no_preference';
}

function normalizeMaxBuddies(maxBuddies) {
  return Number.parseInt(String(maxBuddies), 10);
}

function normalizeMaxWeeklyHours(maxWeeklyHours) {
  return Number.parseInt(String(maxWeeklyHours), 10);
}

function validateSharedProfileFields(data, { requireCity = false } = {}) {
  const fullName = collapseSpaces(data.fullName);
  const homeCountry = collapseSpaces(data.homeCountry);
  const city = collapseSpaces(data.city);
  const studyProgram = collapseSpaces(data.studyProgram);
  const aboutYou = collapseSpaces(data.aboutYou);
  const gender = normalizeGender(data.gender);
  const genderPreference = normalizeGenderPreference(data.genderPreference);
  const hobbies = normalizeArray(data.hobbies).map((item) => collapseSpaces(item)).filter(Boolean);

  const fullNameError = validateNameLikeField(fullName, 'Full name', { required: true });
  if (fullNameError) {
    return { error: fullNameError };
  }

  const homeCountryError = validateNameLikeField(homeCountry, 'Home country');
  if (homeCountryError) {
    return { error: homeCountryError };
  }

  const cityError = validateNameLikeField(city, 'City', { required: requireCity });
  if (cityError) {
    return { error: cityError };
  }

  if (studyProgram && !STUDY_PROGRAMS.includes(studyProgram)) {
    return { error: 'Study program is invalid.' };
  }

  const languagesValidation = validateLanguagesField(data.languages);
  if (languagesValidation.error) {
    return languagesValidation;
  }

  const hobbiesError = validateListField(hobbies, 'Hobbies');
  if (hobbiesError) {
    return { error: hobbiesError };
  }

  const aboutYouError = validateAboutYouField(aboutYou);
  if (aboutYouError) {
    return { error: aboutYouError };
  }

  if (gender && !GENDERS.has(gender)) {
    return { error: 'Gender is invalid.' };
  }

  if (genderPreference && !GENDER_PREFERENCES.has(genderPreference)) {
    return { error: 'Buddy gender preference is invalid.' };
  }

  return {
    value: {
      fullName,
      homeCountry,
      city,
      studyProgram,
      languages: languagesValidation.value,
      hobbies,
      aboutYou,
      gender,
      genderPreference,
    },
  };
}

export function validateRegistrationData(data) {
  const role = normalizeRole(data.role);
  const email = trimString(data.email).toLowerCase();
  const password = String(data.password || '');
  const confirmPassword = String(data.confirmPassword || '');
  const code = trimString(data.code);
  const maxBuddies = normalizeMaxBuddies(data.maxBuddies || 3);

  if (code === '' && Object.prototype.hasOwnProperty.call(data, 'code')) {
    return { error: 'Verification code is required.' };
  }

  if (!PUBLIC_ROLES.has(role)) {
    return { error: 'Role is invalid.' };
  }

  if (!email || !isValidEmail(email) || email.length > 150) {
    return { error: 'Enter a valid email.' };
  }

  if (!PASSWORD_REGEX.test(password)) {
    return {
      error:
        'Password must be 8-72 characters long and include at least one uppercase letter, one lowercase letter, and one number.',
    };
  }

  if (password !== confirmPassword) {
    return { error: 'Passwords do not match.' };
  }

  const sharedValidation = validateSharedProfileFields(data, { requireCity: true });
  if (sharedValidation.error) {
    return sharedValidation;
  }

  if (role === 'international' && !sharedValidation.value.homeCountry) {
    return { error: 'Home country is required.' };
  }

  if (role === 'local' && !Number.isInteger(maxBuddies)) {
    return { error: 'Maximum buddies must be a whole number.' };
  }

  if (role === 'local' && (maxBuddies < 1 || maxBuddies > 3)) {
    return { error: 'Maximum buddies must be between 1 and 3.' };
  }

  return {
    value: {
      ...sharedValidation.value,
      email,
      password,
      confirmPassword,
      role,
      code,
      maxBuddies: role === 'local' ? maxBuddies : 3,
    },
  };
}

export function validateProfileData(data, { role }) {
  const sharedValidation = validateSharedProfileFields(data);
  if (sharedValidation.error) {
    return sharedValidation;
  }

  const normalizedRole = normalizeRole(role);
  const maxBuddies = normalizeMaxBuddies(data.maxBuddies);
  const preferredMeetingMode = collapseSpaces(data.preferredMeetingMode || 'both') || 'both';
  const maxWeeklyHours = normalizeMaxWeeklyHours(data.maxWeeklyHours || 2);
  const supportAreas = normalizeArray(data.supportAreas).map((item) => collapseSpaces(item)).filter(Boolean);

  if (normalizedRole === 'local') {
    if (!Number.isInteger(maxBuddies)) {
      return { error: 'Maximum buddies must be a whole number.' };
    }

    if (maxBuddies < 1 || maxBuddies > 3) {
      return { error: 'Maximum buddies must be between 1 and 3.' };
    }

    if (!MEETING_MODES.has(preferredMeetingMode)) {
      return { error: 'Preferred meeting mode is invalid.' };
    }

    if (!Number.isInteger(maxWeeklyHours) || maxWeeklyHours < 1 || maxWeeklyHours > 20) {
      return { error: 'Maximum weekly hours must be between 1 and 20.' };
    }

    const supportAreasError = validateListField(supportAreas, 'Support areas');
    if (supportAreasError) {
      return { error: supportAreasError };
    }
  }

  return {
    value: {
      ...sharedValidation.value,
      maxBuddies: normalizedRole === 'local' ? maxBuddies : null,
      preferredMeetingMode: normalizedRole === 'local' ? preferredMeetingMode : null,
      maxWeeklyHours: normalizedRole === 'local' ? maxWeeklyHours : null,
      supportAreas: normalizedRole === 'local' ? supportAreas : null,
      profilePhotoUrl: typeof data.profilePhotoUrl === 'string' ? data.profilePhotoUrl : '',
    },
  };
}
