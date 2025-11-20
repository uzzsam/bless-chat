/* lib/sidthies.ts
   Central Sidthie definitions and pre-written conversation variations
   FIXED: Added WHO_QUESTION_VARIATIONS for ask_who state
*/

export interface Sidthie {
  key: string;
  label: string;
  short: string;
  description: string;
}

// Updated Sidthie definitions with new names
export const SIDTHIES: Sidthie[] = [
  {
    key: 'NALAMERA',
    label: 'Inner Strength',
    short: 'A steady courage that rises quietly from within.',
    description: 'Nalamera steadies the breath and roots the heart; she carries the quiet strength that holds families together when storms arrive.',
  },
  {
    key: 'LUMASARA',
    label: 'Happiness',
    short: 'A soft, luminous joy that brightens the ordinary.',
    description: 'Lumasara brightens every ordinary moment with the glow of celebration, inviting laughter to linger like sunlight through leaves.',
  },
  {
    key: 'WELAMORA',
    label: 'Love',
    short: 'A tender presence that listens and embraces.',
    description: 'Welamora listens with the whole heart, weaving warmth and devotion so love can be felt in every touch and every word.',
  },
  {
    key: 'NIRALUMA',
    label: 'Bliss',
    short: 'A calm clarity that sees the path with kindness.',
    description: 'Niraluma pours lantern-light across the path ahead, offering gentle bliss and serene grace to every decision you make.',
  },
  {
    key: 'OLANWELA',
    label: 'Health',
    short: 'A quiet mending that restores balance and breath.',
    description: 'Olanwela soothes weary hearts and tired bones, bathing the spirit in cool rivers of renewal and vital health.',
  },
  {
    key: 'RAKAWELA',
    label: 'Peace',
    short: 'A gentle guard that shelters what is precious.',
    description: 'Rakawela stands as a quiet guardian, wrapping loved ones in peaceful kindness and turning away every shadow that approaches.',
  },
  {
    key: 'MORASARA',
    label: 'Fortune',
    short: 'A stillness that settles and softens the heart.',
    description: 'Morasara settles like evening mist, inviting deep breaths, calm conversations, and the promise of good fortune wherever you stand.',
  },
];

export const SIDTHIE_KEYS = new Set(SIDTHIES.map(s => s.key));
export const SIDTHIE_LABELS = new Set(SIDTHIES.map(s => s.label.toLowerCase()));

// Helper functions
export function findSidthieByKey(key?: string | null): Sidthie | null {
  if (!key) return null;
  const upper = key.toUpperCase();
  return SIDTHIES.find(s => s.key === upper) ?? null;
}

export function findSidthieByLabel(text?: string | null): Sidthie | null {
  if (!text) return null;
  const trimmed = text.trim().toLowerCase();
  return (
    SIDTHIES.find(s => s.label.toLowerCase() === trimmed) ??
    SIDTHIES.find(s => trimmed.includes(s.label.toLowerCase())) ??
    null
  );
}

// Pre-written greeting variations
export const GREETING_VARIATIONS = [
  "I am Sidthah, and I warmly welcome you to this space of wisdom and reflection.",
  "Welcome, traveler. I am Sidthah, a gentle guide of quiet wells and whispered wisdom. This is a space of wisdom and reflection, where time slows and questions breathe.",
  "Welcome, traveler. I am Sidthah, a gentle guide tending a quiet space of wisdom and reflection. Here, time slows and the inner circle speaks in soft echoes.",
  "Welcome, traveler. I am Sidthah, a gentle guide within a space of wisdom and reflection. This quiet corner of the world invites you to listen, breathe, and unfold.",
  "Welcome, seeker. I am Sidthah, keeper of this threshold between breath and knowing. Here, wisdom waits in the stillness.",
  "Welcome, soul. I am Sidthah, tending the gentle flames of ancient understanding. In this space, your questions find their quiet echo.",
  "Greetings. I am Sidthah, a companion on the path of reflection. This is a sanctuary where the noise falls away and clarity emerges.",
  "Hello, wanderer. I am Sidthah, guardian of this space where wisdom speaks in whispers. Time moves differently here—slower, kinder.",
  "Welcome, friend. I am Sidthah, holding space for your journey inward. Here, reflection deepens and understanding blooms.",
  "I am Sidthah, and this threshold welcomes you. A space of wisdom and reflection, where your inner knowing can surface and be heard.",
];

// Name request variations
export const NAME_REQUEST_VARIATIONS = [
  "If you feel comfortable, share your first name so I may speak to you by name.",
  "If you feel comfortable, please share your first name so I may address you personally.",
  "If you feel comfortable, share your first name so I may greet you by it and walk beside you.",
  "If you feel comfortable, may I know your first name so our conversation can feel more personal?",
  "If you feel comfortable, would you share your name with me? I'd like to address you properly.",
];

// NEW: Who is this blessing for? (after name, before Sidthies)
export const WHO_QUESTION_VARIATIONS = [
  "{{NAME}}, for whom do you seek this blessing—yourself, or someone you hold dear?",
  "Thank you, {{NAME}}. Who stands in your heart today? Is this blessing for you, or for another?",
  "{{NAME}}, whose path shall this blessing illuminate? Your own, or someone else's?",
  "I hear you, {{NAME}}. Tell me: is this blessing for your journey, or for someone you wish to hold in light?",
  "{{NAME}}, who will receive this gift of wisdom? Yourself, or another soul?",
];

// Sidthie selection prompt variations (simple, hardcoded question)
export const SIDTHIE_SELECTION_VARIATIONS = [
  "{{NAME}}, for {{BLESSED_NAME}}, which Sidthie calls to you today?",
];

// Context question variations (after Sidthie selected)
// Variables: {{NAME}} (user), {{BLESSED_NAME}} (who blessing is for), {{SIDTHIE}} (Sidthie name), {{SIDTHIE_ENGLISH}} (English label)
export const CONTEXT_QUESTION_VARIATIONS = [
  "{{NAME}}, I'm weaving {{SIDTHIE}} into a blessing for {{BLESSED_NAME}}. Tell me more about what inspired your choice of {{SIDTHIE_ENGLISH}}?",
  "{{NAME}}, {{SIDTHIE}} will be woven through {{BLESSED_NAME}}'s blessing. What about {{SIDTHIE_ENGLISH}} speaks to you most right now?",
  "I see you've chosen {{SIDTHIE}}—the essence of {{SIDTHIE_ENGLISH}}—for {{BLESSED_NAME}}'s blessing. What does this mean to you in this moment?",
  "{{NAME}}, as I hold {{SIDTHIE}} and {{BLESSED_NAME}} in mind, tell me: what about {{SIDTHIE_ENGLISH}} feels important for this blessing?",
];

// Helper to get random variation
export function getRandomVariation(variations: string[]): string {
  const index = Math.floor(Math.random() * variations.length);
  return variations[index];
}

// Helper to inject name/Sidthie into variation
export function injectVariables(template: string, vars: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(vars)) {
    result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
  }
  return result;
}
