# Email Collection in Chat - Implementation Plan

## Goal
Move email collection from the separate reveal section into the chat conversation itself, collecting email at the peak of curiosity (after blessing generation but before full reveal).

## Technical Requirements
- Show preview of blessing (first 1-2 sentences) in chat
- Ask for email within chat interface
- Validate email format
- Send data to N8N webhook: `https://n8n.theexperiencen8n.top/webhook-test/951bd832-961c-4f19-a263-96632039cd07`
- Display full blessing after successful email submission
- Redirect to thank-you page with parameters: `/pages/thank-you?name={userName}&sidthie={sidthieKey}`

## Data Flow
1. User completes chat (name, who for, Sidthie selection, context)
2. Blessing generates → show preview in chat
3. Chat asks for email → user provides email
4. POST to N8N webhook with payload:
   ```json
   {
     "email": "user@example.com",
     "userName": "Sarah",
     "blessedPersonName": "Sarah",
     "chosenSidthie": "NIRALUMA",
     "sidthieLabel": "Bliss",
     "blessingText": "Full blessing text...",
     "timestamp": "2025-11-19T10:30:00Z"
   }
   ```
5. On success → display full blessing in chat
6. Reveal blessing in section below
7. Redirect to thank-you page

## Files to Modify

### 1. `/bless-chat/widget/src/index.ts`
**Changes:**
- Add state variables: `pendingBlessing`, `pendingBlessingMeta`, `collectedEmail`, `awaitingEmail`
- Modify `onAssistantComplete()` to show preview and ask for email instead of immediate reveal
- Add `showBlessingPreviewAndAskEmail()` function
- Add `createEmailInput()` function for in-chat email collection
- Add `validateEmail()` function
- Add `sendToN8N()` function for webhook call
- Add `handleEmailSubmission()` function
- Modify `displayBlessing()` to only show after email collected
- Update error handling

### 2. `/bless-shopify/sections/bless-blessing.liquid` 
**Changes:**
- Keep signup form but make it hidden by default
- Only show after chat completes the email flow
- Update to receive blessing data from chat widget

## Implementation Steps

### Phase 1: Chat Widget Core Changes
1. Add new class properties for pending state
2. Extract first 1-2 sentences from blessing
3. Show preview with visual truncation indicator
4. Display email request message

### Phase 2: Email Input UI
1. Create email input field in chat
2. Style to match chat interface
3. Add submit button
4. Add validation feedback

### Phase 3: N8N Integration
1. Create webhook payload builder
2. Implement POST request
3. Add error handling
4. Add retry logic
5. Handle timeout (30s)

### Phase 4: Post-Email Flow
1. Display full blessing in chat
2. Update reveal section
3. Store data in session storage
4. Redirect to thank-you page with parameters

### Phase 5: Testing
1. Test email validation
2. Test N8N webhook call
3. Test error scenarios
4. Test redirect flow
5. Test mobile responsiveness

## Expected Conversion Rates
- Email capture: 15-25% (target 20%+)
- Completion from start to email: 40-50%

## Success Criteria
- ✅ Email collected within chat conversation
- ✅ Preview shown before email request
- ✅ N8N webhook receives all data
- ✅ Full blessing displays after email
- ✅ Redirect works with correct parameters
- ✅ Mobile-friendly interface
- ✅ Graceful error handling

## Rollback Plan
If issues arise, we can:
1. Revert widget changes
2. Re-enable separate email form in reveal section
3. Keep N8N webhook for future use
