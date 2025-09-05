// Application Routes
export const ROUTES = {
  HOME: '/home',
  LOGIN: '/login',
  STORY_BUILDER: '/story-builder',
  ONBOARDING: {
    FAMILY: '/onboarding',
    VOICE: '/onboarding/voice',
    CHILDREN: '/onboarding/children'
  },
  AUTH: {
    CALLBACK: '/auth/callback',
    ERROR: '/auth/auth-code-error'
  }
} as const;

// Family Relations
export const RELATION_OPTIONS = [
  { id: 'far', label: 'Far', gender: 'male' },
  { id: 'mor', label: 'Mor', gender: 'female' },
  { id: 'farfar', label: 'Farfar', gender: 'male' },
  { id: 'farmor', label: 'Farmor', gender: 'female' },
  { id: 'morfar', label: 'Morfar', gender: 'male' },
  { id: 'mormor', label: 'Mormor', gender: 'female' }
] as const;

// Hair Colors for Avatar Generation
export const HAIR_COLORS = [
  { id: 'brown', label: 'Brun', male_emoji: '👨‍🦳', female_emoji: '👩‍🦳', color: '#8B4513' },
  { id: 'blonde', label: 'Blond', male_emoji: '👱‍♂️', female_emoji: '👱‍♀️', color: '#F4D03F' },
  { id: 'black', label: 'Sort', male_emoji: '👨', female_emoji: '👩', color: '#2C3E50' },
  { id: 'red', label: 'Rød', male_emoji: '👨‍🦰', female_emoji: '👩‍🦰', color: '#E74C3C' },
  { id: 'gray', label: 'Grå', male_emoji: '👴', female_emoji: '👵', color: '#95A5A6' },
  { id: 'white', label: 'Hvid', male_emoji: '🧓', female_emoji: '👵🏻', color: '#FFFFFF' }
] as const;

// Avatar Features
export const AVATAR_FEATURES = [
  { id: 'glasses', label: 'Briller', emoji: '👓' },
  { id: 'beard', label: 'Skæg', emoji: '🧔' },
  { id: 'bald', label: 'Skaldet', emoji: '👨‍🦲' }
] as const;

// Hair Length
export const HAIR_LENGTHS = [
  { id: 'short', label: 'Kort', male_emoji: '💇‍♂️', female_emoji: '💇‍♀️' },
  { id: 'medium', label: 'Medium', male_emoji: '👨', female_emoji: '👩' },
  { id: 'long', label: 'Langt', male_emoji: '👨‍🦳', female_emoji: '👩‍🦳' },
  { id: 'bald', label: 'Skaldet', male_emoji: '👨‍🦲', female_emoji: '👩‍🦲' },
  { id: 'sparse', label: 'Karse', male_emoji: '👴', female_emoji: '👵' }
] as const;

// Hair Structure
export const HAIR_STRUCTURES = [
  { id: 'straight', label: 'Glat', male_emoji: '👨', female_emoji: '👩' },
  { id: 'wavy', label: 'Bølget', male_emoji: '👨‍🦱', female_emoji: '👩‍🦱' },
  { id: 'curly', label: 'Krøllet', male_emoji: '👨‍🦱', female_emoji: '👩‍🦱' },
  { id: 'braid', label: 'Flettet', male_emoji: '🤴', female_emoji: '👸' },
  { id: 'ponytail', label: 'Hestehale', male_emoji: '🏃‍♂️', female_emoji: '🏃‍♀️' }
] as const;

// Facial Hair Options
export const FACIAL_HAIR_OPTIONS = [
  { id: 'none', label: 'Ingen' },
  { id: 'mustache', label: 'Overskæg' },
  { id: 'beard', label: 'Fuldskæg' },
  { id: 'goatee', label: 'Fipskæg' },
  { id: 'stubble', label: 'Stubber' }
] as const;

// Skin Tones
export const SKIN_TONES = [
  { id: 'light', label: 'Lys', male_emoji: '👨🏻', female_emoji: '👩🏻', color: '#fdbcb4' },
  { id: 'medium-light', label: 'Medium lys', male_emoji: '👨🏼', female_emoji: '👩🏼', color: '#ee9b77' },
  { id: 'medium', label: 'Medium', male_emoji: '👨🏽', female_emoji: '👩🏽', color: '#ce967c' },
  { id: 'medium-dark', label: 'Medium mørk', male_emoji: '👨🏾', female_emoji: '👩🏾', color: '#bb7748' },
  { id: 'dark', label: 'Mørk', male_emoji: '👨🏿', female_emoji: '👩🏿', color: '#8b5a2b' }
] as const;

// Eye Colors
export const EYE_COLORS = [
  { id: 'blue', label: 'Blå', color: '#3b82f6' },
  { id: 'brown', label: 'Brun', color: '#92400e' },
  { id: 'green', label: 'Grøn', color: '#059669' },
  { id: 'hazel', label: 'Hasselnød', color: '#a16207' },
  { id: 'gray', label: 'Grå', color: '#6b7280' }
] as const;

// Other Features
export const OTHER_FEATURES = [
  { id: 'freckles', label: 'Fregner' },
  { id: 'dimples', label: 'Smilehul' },
  { id: 'scar', label: 'Ar' },
  { id: 'mole', label: 'Modermærke' },
  { id: 'tattoo', label: 'Tatovering' },
  { id: 'piercing', label: 'Piercing' },
  { id: 'wrinkles', label: 'Rynker' },
  { id: 'smile_lines', label: 'Smilerynker' }
] as const;

// Story Statuses
export const STORY_STATUS = {
  DRAFT: 'draft',
  GENERATING: 'generating', 
  COMPLETED: 'completed',
  FAILED: 'failed'
} as const;

// Age Limits
export const AGE_LIMITS = {
  MIN_CHILD_AGE: 1,
  MAX_CHILD_AGE: 18,
  MAX_FAMILY_MEMBERS: 6
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  AVATAR_GENERATE: '/api/avatar/generate',
  ELEVENLABS: {
    CLONE_VOICE: '/api/elevenlabs/clone-voice',
    TEST_VOICE: '/api/elevenlabs/test-voice',
    TEST_VOICE_MULTI: '/api/elevenlabs/test-voice-multi',
    TEST_VOICE_CHARACTER: '/api/elevenlabs/test-voice-character'
  }
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  AUTH: {
    INVALID_CREDENTIALS: 'Forkert email eller adgangskode',
    PASSWORDS_DONT_MATCH: 'Adgangskoderne matcher ikke',
    PASSWORD_TOO_SHORT: 'Adgangskoden skal være mindst 6 tegn',
    EMAIL_REQUIRED: 'Email er påkrævet',
    GOOGLE_LOGIN_FAILED: 'Der opstod en fejl ved login med Google'
  },
  AVATAR: {
    GENERATION_FAILED: 'Kunne ikke generere avatar. Prøv igen eller gå videre uden avatar.',
    CAMERA_NOT_SUPPORTED: 'Kamera understøttes ikke i denne browser.',
    CAMERA_PERMISSION_DENIED: 'Kamera tilladelse blev afvist. Tjek din browser indstillinger.',
    CAMERA_IN_USE: 'Kamera er i brug af en anden app. Luk andre apps der bruger kameraet.',
    PHOTO_REQUIRED: 'Du skal tage eller uploade et billede først.',
    HAIR_COLOR_REQUIRED: 'Du skal vælge hårfarve først.'
  },
  GENERIC: {
    UNEXPECTED_ERROR: 'Der opstod en uventet fejl. Prøv igen.',
    NETWORK_ERROR: 'Netværksfejl. Tjek din internetforbindelse.',
    REQUIRED_FIELD: 'Dette felt er påkrævet'
  }
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  AUTH: {
    EMAIL_CONFIRMATION_SENT: 'Tjek din email for at bekræfte din konto',
    PASSWORD_RESET_SENT: 'Vi har sendt en email med instruktioner til at nulstille din adgangskode'
  },
  AVATAR: {
    GENERATED: 'Avatar genereret succesfuldt',
    UPLOADED: 'Billede uploadet succesfuldt'
  }
} as const;