/* lib/sidthies.ts
   Central Sidthie definitions and pre-written conversation variations
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

// Pre-written greeting variations (randomly selected)
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

// Sidthie selection prompt variations (with name injected)
export const SIDTHIE_SELECTION_VARIATIONS = [
  "As you breathe, {{NAME}}, notice what feels most present today.",
  "{{NAME}}, welcome to this quiet circle. Let your heart drift toward the Sidthie whose intention your soul is ready to meet.",
  "{{NAME}}, which blessing calls to you? Let intuition guide your choice.",
  "Take a breath, {{NAME}}. Which of these Sidthies speaks to where you stand today?",
  "{{NAME}}, feel into this moment. Which blessing does your heart recognize?",
];

// Context question variations (after Sidthie selected)
export const CONTEXT_QUESTION_VARIATIONS = [
  "When you think of your Sidthie and the blessing—for yourself, for someone else—what's your first thought to include?",
  "Whose path shall the blessing touch? Is there a story?",
  "Tell me who stands in the light of this blessing, and what would you like to include?",
  "For whom do you seek this weaving of words, and what thread shall I strengthen?",
  "Who will receive this {{SIDTHIE}}, and what intention shall I weave into it?",
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
