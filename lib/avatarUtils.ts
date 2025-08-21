export interface AvatarGenerationData {
  hairDescription: string;
  hairColor: string;
  facialHair: string;
  skinTone: string;
  eyeColor: string;
  adultGender: string;
  other: string;
}

export function buildAvatarPrompt(data: AvatarGenerationData): string {
  return `SHARP HIGH QUALITY 2D cartoon avatar, ultra crisp clean illustration, razor sharp defined shapes, ultra clean precise lines, highly detailed non-photorealistic. Same minimal child-avatar style but clearly adult. Head-and-shoulders only (top of shoulders visible), centered, eye-level. Family-friendly. Fully clothed: random top garment (crew-neck t-shirt, light button-up shirt, or sweater) in a muted, desaturated color; neckline fully covered; no bare shoulders. Character: ${data.adultGender}, adult; hair: ${data.hairDescription} in ${data.hairColor}; facial hair: ${data.facialHair}; skin tone: ${data.skinTone}; eyes: ${data.eyeColor}. Positive friendly expression (warm small smile). Adult proportions: slightly longer face, soft defined jawline, normal-sized eyes (not oversized), visible neck and slightly broader shoulders. Background: pastel circular backdrop in a randomly chosen soft hue with soft inner shadow. Extras: ${data.other}. Keep features clean and friendly; ULTRA SHARP crisp finish; MAXIMUM detail; no text or logos; PROFESSIONAL QUALITY; CRYSTAL CLEAR.`;
}

export function getFallbackAvatar(relation: string): string {
  // Definer relation options lokalt for at undgå cirkulær import
  const RELATION_OPTIONS = [
    { id: 'far', label: 'Far', gender: 'male' },
    { id: 'mor', label: 'Mor', gender: 'female' },
    { id: 'farfar', label: 'Farfar', gender: 'male' },
    { id: 'farmor', label: 'Farmor', gender: 'female' },
    { id: 'morfar', label: 'Morfar', gender: 'male' },
    { id: 'mormor', label: 'Mormor', gender: 'female' }
  ];
  
  const relationData = RELATION_OPTIONS.find(r => r.id === relation);
  if (relationData?.gender === 'female') {
    return 'https://v3.fal.media/files/elephant/U6s6W3m4Fn3aOqZUoSTxd.png';
  } else {
    return 'https://v3.fal.media/files/rabbit/oMLaHg9ZF7RgpddpWRQ0C.png';
  }
}

export function getHairDescription(hairColor: string, features: string[]): string {
  if (features.includes('bald')) {
    return 'bald head';
  }
  
  const hairLength = features.includes('long') ? 'long' : 'short';
  return `${hairLength} hair`;
}

export function getFacialHairDescription(features: string[]): string {
  if (features.includes('beard')) {
    return 'full beard';
  }
  return 'clean shaven';
}

export function getSkinTone(): string {
  const skinTones = ['light', 'medium', 'dark'];
  return skinTones[Math.floor(Math.random() * skinTones.length)];
}

export function getEyeColor(): string {
  const eyeColors = ['brown', 'blue', 'green', 'hazel'];
  return eyeColors[Math.floor(Math.random() * eyeColors.length)];
}

export function getOtherFeatures(features: string[]): string {
  const otherFeatures = [];
  
  if (features.includes('glasses')) {
    otherFeatures.push('wearing glasses');
  }
  
  if (features.includes('bald')) {
    otherFeatures.push('bald head');
  }
  
  return otherFeatures.length > 0 ? otherFeatures.join(', ') : 'none';
}
