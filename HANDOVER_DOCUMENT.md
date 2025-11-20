# BLESS CHAT - COMPREHENSIVE HANDOVER DOCUMENT

**Date:** November 20, 2024
**Purpose:** Complete technical handover for debugging and fixing final issues in Bless Chat implementation
**Repositories:** bless-chat (chat widget) + bless-shopify (Shopify theme)

---

## EXECUTIVE SUMMARY

Bless Chat is a conversational AI widget that guides users through a spiritual blessing creation journey. Users answer questions, select a Sidthie (spiritual intention), provide context, and receive a personalized AI-generated blessing. The system collects email addresses and redirects to a product thank-you page.

### Current Status: 85% Complete
- ✅ Chat conversation flow working
- ✅ AI blessing generation working
- ✅ Email collection in chat working
- ✅ N8N webhook integration working (200 OK responses)
- ❌ **6 CRITICAL ISSUES REMAINING** (detailed below)

---

## OUTSTANDING ISSUES

### Issue 1: Flow of Chatbot Asking Questions
**Problem:** Chat question sequence and personalization needs refinement
**Current State:**
- Questions ask for: name → who blessing is for → Sidthie selection → context → blessing generation
- Recently updated context question to include user name, blessed person name, and English Sidthie translation
- Sidthie selection simplified to: "{NAME}, which Sidthie calls to you today?"

**Files Involved:**
- `/Users/julia/Documents/GitHub/bless-chat/lib/sidthies.ts` (lines 103-123)
- `/Users/julia/Documents/GitHub/bless-chat/app/api/chat/route.ts` (lines 166-252, 273-309)
- `/Users/julia/Documents/GitHub/bless-chat/lib/prompts.ts`

**What Needs Verification:**
- Test complete conversation flow end-to-end
- Ensure name extraction works correctly (lines 141-148 in route.ts)
- Verify blessed person name is captured from "who" question response
- Check that all variables inject correctly in context question

---

### Issue 2: Chat Data Capture
**Problem:** Ensure all required data is captured and passed through the system
**Required Data Points:**
1. User name (chat user)
2. Blessed person name (who blessing is for)
3. Sidthie key (e.g., "NIRALUMA")
4. Sidthie label (English translation, e.g., "Bliss")
5. Blessing text (full generated blessing)
6. Sidthie explanation (description)
7. User email address

**Files Involved:**
- `/Users/julia/Documents/GitHub/bless-chat/app/api/chat/route.ts` (SessionState interface, lines 36-44)
- `/Users/julia/Documents/GitHub/bless-chat/widget/src/index.ts` (StreamMeta interface, metadata tracking)

**Current State:**
- SessionState in API tracks: userName, blessingFor, sidthieKey, sidthieLabel
- Widget captures explanation in `lastExplanation` property (line 679)
- N8N payload includes all fields (lines 1387-1396)

**What Needs Verification:**
- Trace data flow from user input → state → N8N webhook
- Check `extractName()` function accuracy (route.ts lines 141-148)
- Verify `blessingFor` captures correctly from "who" question
- Ensure `lastExplanation` populates from Sidthie selection response
- Test N8N webhook receives complete payload

---

### Issue 3: Correct Address Usage Before Button Options
**Problem:** Chat should address user by name when showing Sidthie selection buttons
**Current Implementation:**
- SIDTHIE_SELECTION_VARIATIONS: "{{NAME}}, which Sidthie calls to you today?"
- Injected in route.ts lines 286-288

**Files Involved:**
- `/Users/julia/Documents/GitHub/bless-chat/lib/sidthies.ts` (lines 112-114)
- `/Users/julia/Documents/GitHub/bless-chat/app/api/chat/route.ts` (buildControllerMessage function)
- `/Users/julia/Documents/GitHub/bless-chat/widget/src/index.ts` (button rendering)

**What Needs Verification:**
- Test that {{NAME}} actually populates with user's name
- Check that name is captured BEFORE Sidthie selection state
- Verify state machine transitions: ask_name → ask_who → ask_intent
- Ensure `currentState.userName` is available in ask_intent state

---

### Issue 4: Speed of Chatbot Replies
**Problem:** Perceived slowness in chat responses and button display
**Recent Changes:**
- ✅ Removed 800ms delay before email request (previously line 1260)
- ⚠️ Buttons appear during message streaming (may feel slow)

**Files Involved:**
- `/Users/julia/Documents/GitHub/bless-chat/widget/src/index.ts` (lines 896-944: createOptionsBubble)
- `/Users/julia/Documents/GitHub/bless-chat/app/api/chat/route.ts` (streaming response)

**Current Timing:**
- Buttons render when message completes streaming
- No artificial setTimeout delays in button display
- API responses stream via SSE (Server-Sent Events)

**What Needs Investigation:**
- Measure actual response times from API
- Check if vector search is slowing down responses (route.ts lines 254-270)
- Consider if buttons should appear DURING streaming vs AFTER
- Test OpenAI API latency (gpt-4o-mini model)

**Performance Optimization Opportunities:**
- Vector search is disabled for ask_name, ask_who, ask_intent states (line 255-262)
- Could further optimize by reducing system prompt length
- Could cache Sidthie definitions to avoid repeated lookups

---

### Issue 5: Blessing Display in Shopify Section
**Problem:** Show blessing, Sidthie explanation, success message, and CTA button in Shopify section below chat
**Required Elements:**
1. Complete blessing text
2. Sidthie explanation
3. Success message: "Perfect! Your blessing has been sent to [email]"
4. "Continue your journey" CTA button
5. Auto-redirect after 30 seconds

**Files Involved:**
- `/Users/julia/Documents/GitHub/bless-shopify/sections/bless-blessing.liquid` (blessing reveal section)
- `/Users/julia/Documents/GitHub/bless-chat/widget/src/index.ts` (lines 1546-1682: displayBlessing, renderBlessingPanel)

**Current Implementation:**
- Widget dispatches `blessing:update` event (line 1583)
- Widget dispatches `blessing:ready` event (line 1580)
- Shopify section has elements: `[data-blessing-output]`, `[data-sidthie-title]`, `[data-sidthie-excerpt]`, `[data-success-message]`, `[data-continue-button]`
- Success message element exists (line 45 in bless-blessing.liquid)
- CTA button exists (lines 48-55 in bless-blessing.liquid)

**Event Flow:**
```javascript
// Widget emits:
blessing:ready → { blessing, sidthieLabel, explanation, email, emailCollected }
blessing:update → { blessing, sidthieLabel, explanation }

// Shopify section listens and updates DOM
```

**What Needs Verification:**
- Check if Shopify section JavaScript is listening to events
- Verify success message displays with correct email
- Confirm CTA button appears and is clickable
- Test auto-redirect functionality (30 second timer)
- Ensure all data (blessing, explanation, email) is in event detail

**Known Issues:**
- Console logs added in previous session for debugging (search for "[BlessingDisplay]" and "[CTA Button]")
- CTA button should redirect to thank-you page with parameters

---

### Issue 6: Product Display on Thank You Page
**Problem:** Display product corresponding to chosen Sidthie on thank-you page
**Required Flow:**
1. User completes blessing → redirects to `/pages/thank-you?name=NAME&sidthie=SIDTHIEKEY`
2. Thank-you page reads URL parameters
3. Shopify section displays correct Sidthie product based on `sidthie` parameter

**Files Involved:**
- `/Users/julia/Documents/GitHub/bless-chat/widget/src/index.ts` (lines 1462-1490: redirectToThankYou)
- `/Users/julia/Documents/GitHub/bless-shopify/sections/bless-product.liquid` (product display section)
- `/Users/julia/Documents/GitHub/bless-shopify/sections/bless-thank-you.liquid` (thank you page section)

**Current Redirect Implementation:**
```typescript
private redirectToThankYou(userName?: string, sidthieKey?: string) {
  // Stores blessing in sessionStorage
  sessionStorage.setItem('sidthah-blessing', JSON.stringify({
    blessing: this.pendingBlessing,
    sidthieLabel: this.pendingBlessingMeta?.sidthieLabel,
    explanation: this.lastExplanation,
    timestamp: Date.now()
  }));

  // Builds URL with parameters
  const params = new URLSearchParams();
  if (userName) params.set('name', userName);
  if (sidthieKey) params.set('sidthie', sidthieKey);
  const url = `${this.THANK_YOU_PAGE}?${params.toString()}`;

  // Redirects after 2 seconds
  setTimeout(() => { window.location.href = url; }, 2000);
}
```

**Sidthie → Product Mapping:**
| Sidthie Key | English Label | Product to Display |
|-------------|---------------|-------------------|
| NALAMERA | Inner Strength | Corresponding Sidthie product |
| LUMASARA | Happiness | Corresponding Sidthie product |
| WELAMORA | Love | Corresponding Sidthie product |
| NIRALUMA | Bliss | Corresponding Sidthie product |
| OLANWELA | Health | Corresponding Sidthie product |
| RAKAWELA | Peace | Corresponding Sidthie product |
| MORASARA | Fortune | Corresponding Sidthie product |

**What Needs Investigation:**
- Review bless-product.liquid to see if it reads URL parameters
- Check if product mapping exists (Sidthie key → Shopify product handle)
- Verify sessionStorage data is accessible on thank-you page
- Test redirect timing (currently 2 seconds, may need adjustment)
- Confirm thank-you page exists at `/pages/thank-you`

---

## REPOSITORY STRUCTURES

### Bless-Chat Repository (`/Users/julia/Documents/GitHub/bless-chat`)

```
bless-chat/
├── app/
│   ├── api/
│   │   ├── chat/route.ts        ← MAIN API: State machine, conversation flow
│   │   ├── bless/route.ts       ← Blessing generation endpoint
│   │   ├── health/route.ts      ← Health check
│   │   └── send-blessing/route.ts
│   ├── layout.tsx
│   └── page.tsx
├── lib/
│   ├── sidthies.ts              ← Sidthie definitions, question variations
│   ├── prompts.ts               ← AI system prompts
│   └── openai.ts                ← OpenAI client configuration
├── widget/
│   └── src/
│       └── index.ts             ← WIDGET CODE: Chat UI, email collection, events
├── public/
│   ├── bless-chat-widget.js     ← Built widget bundle
│   └── bless-chat-widget.js.map
├── scripts/
│   └── build-widget.mjs         ← Widget build script
├── instructions/                 ← Implementation documentation
├── .env.local                    ← OpenAI API key, N8N webhook URL
└── package.json
```

### Bless-Shopify Repository (`/Users/julia/Documents/GitHub/bless-shopify`)

```
bless-shopify/
└── sections/
    ├── bless-blessing.liquid    ← Blessing reveal section (below chat)
    ├── bless-chat.liquid        ← Chat widget embed
    ├── bless-product.liquid     ← Product display on thank-you page
    ├── bless-thank-you.liquid   ← Thank-you page section
    ├── bless-hero.liquid
    └── bless-carousel.liquid
```

---

## KEY FILES DEEP DIVE

### 1. `/app/api/chat/route.ts` - Conversation State Machine

**Purpose:** Handles all chat API requests, manages conversation state, generates responses

**Critical Sections:**

**State Machine (lines 166-252):**
```typescript
// States: ask_name → ask_who → ask_intent → ask_context → compose_blessing
function determineNextState(messages: Msg[], currentState: SessionState | null): SessionState
```

**State Transitions:**
- `ask_name`: Extract user name from first message
- `ask_who`: Capture who blessing is for (blessed person)
- `ask_intent`: Detect Sidthie selection from user's choice
- `ask_context`: User provides context about their Sidthie choice
- `compose_blessing`: Generate final blessing with AI

**Question Injection (lines 273-309):**
```typescript
function buildControllerMessage(currentState: SessionState, messages: Msg[])
```
- Injects pre-written question variations from `lib/sidthies.ts`
- Replaces variables: {{NAME}}, {{SIDTHIE}}, {{BLESSED_NAME}}, {{SIDTHIE_ENGLISH}}

**Recent Changes:**
- Added `findSidthieEnglish()` helper (lines 80-84)
- Updated context question to include all personalization variables (lines 290-297)

**Critical Dependencies:**
- OpenAI API (streaming completions)
- Vector store (for context and blessing generation only)
- Environment variables: `OPENAI_API_KEY`, `VECTOR_STORE_ID`

---

### 2. `/lib/sidthies.ts` - Sidthie Definitions & Questions

**Purpose:** Central source of truth for Sidthie data and conversation variations

**Sidthie Array (lines 14-57):**
```typescript
export const SIDTHIES: Sidthie[] = [
  {
    key: 'NALAMERA',           // Used in code/URLs
    label: 'Inner Strength',   // English translation shown to users
    short: 'A steady courage that rises quietly from within.',
    description: 'Nalamera steadies the breath and roots the heart...'
  },
  // ... 6 more Sidthies
]
```

**Question Variations:**
- `GREETING_VARIATIONS` (lines 80-91): Welcome messages
- `NAME_REQUEST_VARIATIONS` (lines 94-100): Ask for name
- `WHO_QUESTION_VARIATIONS` (lines 103-109): Ask who blessing is for
- `SIDTHIE_SELECTION_VARIATIONS` (lines 112-114): **CRITICAL** - Ask which Sidthie
- `CONTEXT_QUESTION_VARIATIONS` (lines 118-123): **CRITICAL** - Ask about Sidthie choice

**Recent Changes:**
- Simplified SIDTHIE_SELECTION_VARIATIONS to single hardcoded question
- Enhanced CONTEXT_QUESTION_VARIATIONS with 4 variables: NAME, BLESSED_NAME, SIDTHIE, SIDTHIE_ENGLISH

**Variable Injection:**
```typescript
export function injectVariables(template: string, vars: Record<string, string>): string
```
- Replaces `{{VARIABLE}}` placeholders with actual values

---

### 3. `/widget/src/index.ts` - Chat Widget Frontend

**Size:** 1,740 lines
**Purpose:** Complete chat UI, email collection, event dispatching, Shopify integration

**Critical Sections:**

**Email Collection Properties (lines 679-684):**
```typescript
private lastExplanation = '';                    // Captured from Sidthie selection response
private pendingBlessing: string | null = null;   // Stores blessing before email
private pendingBlessingMeta: StreamMeta | null = null;  // Metadata (names, Sidthie)
private collectedEmail: string | null = null;    // User's email
private awaitingEmail = false;                   // Flag for email collection state
private readonly N8N_WEBHOOK_URL = 'https://bless-test-brown.vercel.app/api/bless';
```

**Conversation Flow (lines 1080-1226):**
```typescript
private onAssistantComplete(text: string, finalMeta?: StreamMeta)
```
- Detects when blessing is complete
- Shows preview (first 1-2 sentences)
- Asks for email
- Waits for submission

**Email Submission (lines 1326-1384):**
```typescript
private async handleEmailSubmission(email: string)
```
- Validates email format
- POSTs to N8N webhook with all data
- On success: displays full blessing, dispatches events
- On failure: shows retry button

**N8N Webhook Payload (lines 1387-1396):**
```typescript
{
  email: string,
  userName: string | null,
  blessedPersonName: string | null,  // Who blessing is for
  chosenSidthie: string | null,      // Sidthie key (e.g., "NIRALUMA")
  sidthieLabel: string | null,       // English label (e.g., "Bliss")
  blessingText: string,              // Full blessing
  explanation: string | null,        // Sidthie description
  timestamp: string                   // ISO format
}
```

**Event Dispatching (lines 1546-1598):**
```typescript
private displayBlessing(blessing: string, meta?: StreamMeta)
```
- Dispatches `blessing:ready` event with all data
- Dispatches `blessing:update` event for Shopify section
- Auto-scrolls to blessing panel
- Calls `renderBlessingPanel()` to update DOM

**Shopify Section Update (lines 1600-1682):**
```typescript
private renderBlessingPanel(detail: { blessing, explanation, sidthieLabel })
```
- Finds `[data-bless-panel]` in Shopify section
- Updates `[data-blessing-output]` with blessing text
- Updates `[data-sidthie-title]` and `[data-sidthie-excerpt]` with Sidthie info
- Hides email signup form (already collected in chat)

**Recent Changes:**
- Removed 800ms setTimeout delay before email request (line 1260)
- Added comprehensive console logging for debugging
- Updated N8N webhook URL to production endpoint

---

### 4. `/sections/bless-blessing.liquid` - Shopify Blessing Reveal Section

**Purpose:** Displays blessing below chat after email collection

**DOM Elements:**
```liquid
<div class="bless-blessing__panel" data-blessing-panel>
  <!-- Placeholder text (before blessing) -->
  <p class="bless-blessing__placeholder" data-placeholder></p>

  <!-- Blessing text (populated via JavaScript) -->
  <div class="bless-blessing__content" data-blessing-output hidden></div>

  <!-- Sidthie explanation (populated via JavaScript) -->
  <div class="bless-blessing__meta" data-blessing-meta hidden>
    <h3 class="bless-blessing__meta-title" data-sidthie-title></h3>
    <p class="bless-blessing__meta-text" data-sidthie-excerpt></p>
  </div>

  <!-- Success message (NEW - should show after email) -->
  <p class="bless-blessing__success-message" data-success-message hidden></p>

  <!-- CTA button (NEW - should appear after success message) -->
  <button class="bless-blessing__continue-button" data-continue-button hidden>
    Continue your journey
  </button>

  <!-- Email form (backup, already collected in chat) -->
  <form class="bless-blessing__signup-form" data-blessing-signup hidden></form>
</div>
```

**JavaScript Event Listeners:**
The section should listen for:
1. `blessing:ready` - Initial blessing data with all metadata
2. `blessing:update` - Blessing display trigger

**What Should Happen:**
1. Blessing text appears in `[data-blessing-output]`
2. Sidthie title and explanation appear in meta section
3. Success message appears: "Perfect! Your blessing has been sent to [email]"
4. CTA button appears with text "Continue your journey"
5. After 30 seconds, auto-redirect to thank-you page

**Recent Changes:**
- Added console logging for debugging (search for "[BlessingDisplay]" and "[CTA Button]")
- Success message and CTA button elements added to Liquid template

**⚠️ CRITICAL ISSUE:**
Need to verify if JavaScript in this section is:
- Listening to the correct events
- Populating success message with user's email
- Showing CTA button
- Implementing 30-second auto-redirect

---

### 5. `/sections/bless-product.liquid` - Thank You Page Product Display

**Purpose:** Show product matching user's chosen Sidthie on thank-you page

**Expected Behavior:**
1. Page loads with URL: `/pages/thank-you?name=Sarah&sidthie=NIRALUMA`
2. JavaScript reads `sidthie` parameter
3. Maps Sidthie key to product handle
4. Displays corresponding product

**Product Mapping Required:**
```javascript
// Example mapping
const SIDTHIE_TO_PRODUCT = {
  'NALAMERA': 'sidthie-inner-strength',
  'LUMASARA': 'sidthie-happiness',
  'WELAMORA': 'sidthie-love',
  'NIRALUMA': 'sidthie-bliss',
  'OLANWELA': 'sidthie-health',
  'RAKAWELA': 'sidthie-peace',
  'MORASARA': 'sidthie-fortune'
};
```

**⚠️ CRITICAL ISSUE:**
Need to verify if this section:
- Reads URL parameters correctly
- Has product mapping implemented
- Displays correct product
- Handles missing/invalid sidthie parameter gracefully

---

## DATA FLOW DIAGRAM

```
┌──────────────────────────────────────────────────────────────────┐
│                         USER INTERACTION                          │
└────────────────────────────┬─────────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│ WIDGET (index.ts)                                                 │
│ • Captures user input                                             │
│ • Sends messages to API                                           │
│ • Displays streaming responses                                    │
└────────────────────────────┬─────────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│ API (route.ts)                                                    │
│ • State machine determines current state                          │
│ • Injects appropriate questions                                   │
│ • Calls OpenAI for responses                                      │
│ • Streams response back to widget                                 │
└────────────────────────────┬─────────────────────────────────────┘
                             │
                ┌────────────┴────────────┐
                ▼                         ▼
┌───────────────────────────┐  ┌──────────────────────────┐
│ OpenAI GPT-4o-mini        │  │ Vector Store (RAG)       │
│ • Generates responses     │  │ • Context for blessings  │
│ • Creates blessing text   │  │ • Only used in           │
└───────────────────────────┘  │   ask_context +          │
                               │   compose_blessing       │
                               └──────────────────────────┘

                             ▼
┌──────────────────────────────────────────────────────────────────┐
│ WIDGET receives complete blessing                                 │
│ • Shows preview (first 1-2 sentences)                             │
│ • Asks for email                                                  │
│ • User enters email                                               │
└────────────────────────────┬─────────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│ N8N WEBHOOK                                                       │
│ POST https://bless-test-brown.vercel.app/api/bless               │
│ Payload: {                                                        │
│   email, userName, blessedPersonName,                             │
│   chosenSidthie, sidthieLabel,                                    │
│   blessingText, explanation, timestamp                            │
│ }                                                                 │
│ Response: 200 OK                                                  │
└────────────────────────────┬─────────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│ WIDGET displays full blessing                                     │
│ • Dispatches blessing:ready event                                 │
│ • Dispatches blessing:update event                                │
└────────────────────────────┬─────────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│ SHOPIFY BLESSING SECTION (bless-blessing.liquid)                  │
│ • Listens to blessing:update event                                │
│ • Updates DOM elements:                                           │
│   - Blessing text                                                 │
│   - Sidthie explanation                                           │
│   - Success message: "Perfect! Sent to [email]"                   │
│   - CTA button: "Continue your journey"                           │
│ • Starts 30-second countdown                                      │
└────────────────────────────┬─────────────────────────────────────┘
                             │
                             ▼ (user clicks CTA or 30s timeout)
┌──────────────────────────────────────────────────────────────────┐
│ REDIRECT TO THANK YOU PAGE                                        │
│ URL: /pages/thank-you?name=NAME&sidthie=SIDTHIEKEY               │
│ SessionStorage: { blessing, sidthieLabel, explanation }           │
└────────────────────────────┬─────────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│ THANK YOU PAGE (bless-product.liquid)                             │
│ • Reads URL parameter: sidthie                                    │
│ • Maps Sidthie key to product handle                              │
│ • Displays corresponding Sidthie product                          │
└──────────────────────────────────────────────────────────────────┘
```

---

## ENVIRONMENT VARIABLES

### Bless-Chat `.env.local`
```bash
OPENAI_API_KEY=sk-proj-...                    # OpenAI API key
VECTOR_STORE_ID=vs_...                        # OpenAI vector store for RAG
ALLOWED_ORIGINS=https://www.sidthah.com       # CORS allowed origins
```

### N8N Webhook
```
Production URL: https://bless-test-brown.vercel.app/api/bless
Method: POST
Content-Type: application/json
Response: 200 OK with body "Workflow was started"
```

---

## TESTING CHECKLIST

### Full User Flow Test
- [ ] Open chat on Shopify site
- [ ] Enter name (e.g., "Sarah")
- [ ] See personalized greeting: "Thank you, Sarah..."
- [ ] Answer who blessing is for (e.g., "Michael")
- [ ] See Sidthie selection: "Sarah, which Sidthie calls to you today?"
- [ ] Click a Sidthie button (e.g., "Bliss")
- [ ] See context question: "Sarah, I'm weaving NIRALUMA into a blessing for Michael. Tell me more about what inspired your choice of Bliss?"
- [ ] Provide context (e.g., "He needs peace")
- [ ] See blessing preview (first 1-2 sentences)
- [ ] See email request immediately (no delay)
- [ ] Enter email and submit
- [ ] See full blessing in chat
- [ ] Scroll down to blessing reveal section
- [ ] Verify blessing appears in styled panel
- [ ] Verify Sidthie explanation appears
- [ ] Verify success message: "Perfect! Your blessing has been sent to [email]"
- [ ] Verify "Continue your journey" button appears
- [ ] Click button (or wait 30 seconds)
- [ ] Redirect to `/pages/thank-you?name=Sarah&sidthie=NIRALUMA`
- [ ] Verify correct Sidthie product displays

### N8N Webhook Test
```bash
curl -X POST https://bless-test-brown.vercel.app/api/bless \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "userName": "Sarah",
    "blessedPersonName": "Michael",
    "chosenSidthie": "NIRALUMA",
    "sidthieLabel": "Bliss",
    "blessingText": "Test blessing text...",
    "explanation": "Niraluma pours lantern-light...",
    "timestamp": "2024-11-20T10:00:00Z"
  }'
```
Expected: `200 OK` with response body

### Browser Console Tests
```javascript
// Test event dispatching
window.addEventListener('blessing:ready', (e) => console.log('READY:', e.detail));
window.addEventListener('blessing:update', (e) => console.log('UPDATE:', e.detail));

// Test sessionStorage
console.log(sessionStorage.getItem('sidthah-blessing'));

// Test URL parameters
const params = new URLSearchParams(window.location.search);
console.log('Name:', params.get('name'));
console.log('Sidthie:', params.get('sidthie'));
```

---

## KNOWN ISSUES & WORKAROUNDS

### Issue: N8N Webhook Returns 200 but Data Not Saved
**Status:** Needs verification
**Test:** Check N8N workflow execution logs
**Workaround:** Implement retry mechanism in widget

### Issue: Chat Feels Slow
**Possible Causes:**
1. OpenAI API latency (average 1-3 seconds for GPT-4o-mini)
2. Vector store search adding latency
3. Streaming delay perception

**Investigation Steps:**
1. Add timing logs: `console.time('API Response')` in widget
2. Check OpenAI dashboard for request latency
3. Consider disabling vector search for more states
4. Test with different OpenAI models (gpt-3.5-turbo is faster)

### Issue: Success Message Not Showing in Shopify Section
**Possible Causes:**
1. JavaScript not listening to events
2. Event detail missing email data
3. Element hidden by CSS
4. JavaScript error preventing execution

**Debug Steps:**
1. Open browser console
2. Look for `[BlessingDisplay]` logs
3. Check for JavaScript errors
4. Verify `blessing:update` event fires with correct detail
5. Inspect `[data-success-message]` element - should not have `hidden` attribute

### Issue: CTA Button Not Redirecting
**Possible Causes:**
1. Button event listener not attached
2. Redirect URL incorrect
3. Thank-you page doesn't exist

**Debug Steps:**
1. Check console for `[CTA Button]` logs
2. Verify button has click listener
3. Test thank-you page URL manually
4. Check for navigation errors in console

---

## DEBUGGING COMMANDS

### Check Build Status
```bash
cd /Users/julia/Documents/GitHub/bless-chat
npm run build
```

### Test API Locally
```bash
# Start dev server
npm run dev

# Test chat endpoint
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Hello"}]}'
```

### View Recent Commits
```bash
git log --oneline -10
```

### Check Current Status
```bash
git status
```

### View Console Logs (in browser)
Filter console by:
- `[BlessChatWidget]` - Widget operations
- `[N8N Webhook]` - Webhook calls
- `[BlessingDisplay]` - Shopify section updates
- `[CTA Button]` - Button interactions

---

## RECENT CHANGES (Last 5 Commits)

1. **560ef1c** - Improve chat flow: personalize context question and remove delays
   - Simplified Sidthie selection to single question
   - Enhanced context question with 4 variables
   - Removed 800ms email delay

2. **c753474** - Add comprehensive console logging for debugging
   - N8N webhook logging
   - CTA button flow logging

3. **b6ebe26** - Refactor: Move CTA button to blessing reveal section

4. **ea34ebc** - Implement full user flow: scroll, success message, CTA, auto-redirect

5. **02da48d** - Update N8N webhook URL to production endpoint

---

## NEXT STEPS FOR DEBUGGING SESSION

### Priority 1: Verify Data Capture
1. Add console logs to track data flow:
   - After name capture
   - After "who" question
   - After Sidthie selection
   - Before N8N webhook call
2. Check SessionState in API has all fields populated
3. Verify N8N receives complete payload

### Priority 2: Fix Blessing Reveal Section
1. Review Shopify section JavaScript
2. Verify event listeners are set up
3. Test success message population
4. Test CTA button functionality
5. Implement 30-second auto-redirect

### Priority 3: Test Thank You Page
1. Verify page exists at `/pages/thank-you`
2. Review bless-product.liquid code
3. Implement URL parameter reading
4. Implement Sidthie → product mapping
5. Test product display

### Priority 4: Performance Optimization
1. Measure API response times
2. Identify bottlenecks (vector search, OpenAI API, etc.)
3. Optimize where possible
4. Test perceived speed improvements

---

## CONTACT & RESOURCES

**OpenAI Dashboard:** https://platform.openai.com/
**N8N Instance:** https://n8n.theexperiencen8n.top/
**Shopify Store:** https://www.sidthah.com/

**Documentation Files:**
- `/instructions/IMPLEMENTATION_COMPLETE.md` - Original implementation plan
- `/instructions/chatbot_flow_information_text_markdown.md` - UX strategy
- `/instructions/VISUAL_FLOW.md` - Visual flow diagrams
- `/instructions/QUICK_REFERENCE.md` - Quick reference guide

---

## GLOSSARY

**Sidthie:** A spiritual intention/blessing type with Sanskrit-inspired name and English translation
**Blessed Person:** The person who will receive the blessing (can be user themselves or someone else)
**N8N:** Workflow automation platform used for email collection webhook
**StreamMeta:** Metadata object containing userName, blessingFor, sidthieKey, sidthieLabel
**SessionState:** API state tracking object for conversation flow
**RAG:** Retrieval-Augmented Generation (vector store context)
**SSE:** Server-Sent Events (streaming protocol)

---

**End of Handover Document**
Last Updated: November 20, 2024
