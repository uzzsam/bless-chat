# Chat Widget Email Collection - Implementation Summary

## Changes to `/bless-chat/widget/src/index.ts`

### 1. Add New Class Properties (after line 579)
```typescript
// Email collection state
private pendingBlessing: string | null = null;
private pendingBlessingMeta: StreamMeta | null = null;
private collectedEmail: string | null = null;
private awaitingEmail = false;
private readonly N8N_WEBHOOK_URL = 'https://n8n.theexperiencen8n.top/webhook-test/951bd832-961c-4f19-a263-96632039cd07';
private readonly THANK_YOU_PAGE = '/pages/thank-you';
```

### 2. Modify `onAssistantComplete()` Function (line 1086-1117)
**Replace the blessing delivery logic to:**
- Store blessing in `pendingBlessing`
- Extract and show 1-2 sentence preview
- Ask for email in chat
- Wait for email submission

### 3. Add New Functions (after `onAssistantComplete()`)

#### `extractBlessingPreview(blessing: string): string`
Extract first 1-2 sentences (up to ~150 characters)

#### `showBlessingPreviewAndAskEmail(blessing: string, meta?: StreamMeta)`
- Show preview bubble with truncation indicator
- Display email request message
- Create email input in chat

#### `createEmailInputBubble()`
- Create email input field styled as chat bubble
- Add submit button
- Add validation
- Handle submission

#### `validateEmail(email: string): boolean`
Simple email validation regex

#### `handleEmailSubmission(email: string)`
- Validate email
- Show loading state
- Call `sendToN8N()`
- On success: display full blessing + redirect
- On error: show error, allow retry

#### `sendToN8N(email: string, blessing: string, meta?: StreamMeta)`
- Build JSON payload with all data
- POST to N8N webhook
- Handle timeout (30s)
- Return success/error

#### `redirectToThankYou(userName?: string, sidthieKey?: string)`
- Build URL with parameters
- Store blessing in sessionStorage
- Redirect after 2 second delay

### 4. Update CSS Styles (in STYLE_BLOCK)
Add styles for:
- `.bless-chat-email-input` - email input field
- `.bless-chat-email-submit` - submit button
- `.bless-chat-preview` - preview bubble with blur effect
- `.bless-chat-preview--truncated` - truncation indicator

## Changes to `/bless-shopify/sections/bless-blessing.liquid`

### 1. Hide Email Form by Default
Add `hidden` attribute to signup form div

### 2. Update JavaScript Event Listener
- Listen for both `blessing:update` and `blessing:ready` events
- Show/hide signup form based on chat state
- Sync data from chat widget

## Data Flow Sequence

1. **Blessing Generated**
   - Chat receives done=true
   - Increment blessing count
   - Remove full blessing from display
   - Extract preview (first 1-2 sentences)

2. **Show Preview + Ask Email**
   - Display preview bubble with "..." indicator
   - Push message: "What's your email so I can send you the complete blessing?"
   - Show email input field in chat

3. **User Submits Email**
   - Validate format
   - Show loading: "Saving your blessing..."
   - POST to N8N webhook

4. **N8N Webhook Payload**
```json
{
  "email": "user@example.com",
  "userName": "Sarah",
  "blessedPersonName": "Sarah",
  "chosenSidthie": "NIRALUMA",
  "sidthieLabel": "Bliss",
  "blessingText": "Full blessing...",
  "explanation": "Sidthie explanation...",
  "timestamp": "2025-11-19T10:30:00Z"
}
```

5. **On Webhook Success**
   - Display full blessing in chat
   - Trigger `blessing:ready` event
   - Update reveal section below
   - Show success message
   - Redirect to thank-you page after 2s

6. **Thank You Page URL**
```
/pages/thank-you?name=Sarah&sidthie=NIRALUMA
```

## Error Handling

### Email Validation Error
- Message: "Please enter a valid email address"
- Keep input focused
- Allow re-submission

### N8N Webhook Error
- Message: "We couldn't save your blessing right now. Let's try again."
- Show retry button
- Log error to console

### Timeout (30s)
- Message: "This is taking longer than expected. Let's try once more."
- Automatic retry (max 2 attempts)

## Testing Checklist

- [ ] Preview shows correctly (1-2 sentences)
- [ ] Email input appears in chat
- [ ] Email validation works
- [ ] N8N webhook receives data
- [ ] Full blessing displays after email
- [ ] Reveal section updates
- [ ] Thank-you page redirect works
- [ ] Mobile responsive
- [ ] Error messages display
- [ ] Retry logic works
- [ ] Session storage persists data
- [ ] Daily blessing limit still enforced

## Rollback Strategy

If issues occur:
1. Revert `index.ts` changes
2. Re-enable separate email form in `bless-blessing.liquid`
3. Remove N8N webhook call (optional - can keep for future)

## Success Metrics

Target conversion rates:
- Email submission: 15-25%
- Chat completion: 40-50%
- Page views to blessing: 60%+
