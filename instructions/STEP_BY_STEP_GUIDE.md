# Step-by-Step Implementation Guide: Email Collection in Chat

## Overview
This guide will walk you through implementing email collection within the chat interface, integrating with N8N webhook, and redirecting to the thank-you page.

## Prerequisites
- Access to `/bless-chat` repository
- Access to `/bless-shopify` repository
- N8N webhook URL: `https://n8n.theexperiencen8n.top/webhook-test/951bd832-961c-4f19-a263-96632039cd07`

## Part 1: Modify Chat Widget (`/bless-chat/widget/src/index.ts`)

### Step 1: Add New Class Properties

**Location:** After line 579 (after `private lastExplanation = '';`)

**Add these properties:**
```typescript
  // Email collection state
  private pendingBlessing: string | null = null;
  private pendingBlessingMeta: StreamMeta | null = null;
  private collectedEmail: string | null = null;
  private awaitingEmail = false;
  private readonly N8N_WEBHOOK_URL = 'https://n8n.theexperiencen8n.top/webhook-test/951bd832-961c-4f19-a263-96632039cd07';
  private readonly THANK_YOU_PAGE = '/pages/thank-you';
```

### Step 2: Replace `onAssistantComplete` Function

**Location:** Lines 1086-1117

**Find this:**
```typescript
  private onAssistantComplete(
    text: string, 
    done: boolean, 
    finalMeta?: StreamMeta
  ) {
    if (!text) return;

    if (done) {
      this.incrementBlessingCount();
      
      const prepared = this.prepareBlessing(text);
      const blessing = prepared.blessing || prepared.raw || text.trim();
      this.blessingDelivered = true;
      setSessionFlag(SESSION_KEY, 'true');

      const last = this.messageList.lastElementChild;
      if (last && last.classList.contains('bless-chat-bubble')) {
        this.messageList.removeChild(last);
      }

      this.displayBlessing(blessing, finalMeta);
      
      // FIXED: Changed blessing message
      this.pushAssistantMessage('Your blessing has been created. Scroll down to read it.');
      
      return;
    }

    if (/image|upload|photo|picture/i.test(text)) {
      this.pushAssistantMessage('No image is needed. Let us continue in words.');
    }
  }
```

**Replace with:**
```typescript
  private onAssistantComplete(
    text: string, 
    done: boolean, 
    finalMeta?: StreamMeta
  ) {
    if (!text) return;

    if (done) {
      this.incrementBlessingCount();
      
      const prepared = this.prepareBlessing(text);
      const blessing = prepared.blessing || prepared.raw || text.trim();
      
      // Store blessing for later use
      this.pendingBlessing = blessing;
      this.pendingBlessingMeta = finalMeta;

      // Remove the full blessing from display
      const last = this.messageList.lastElementChild;
      if (last && last.classList.contains('bless-chat-bubble')) {
        this.messageList.removeChild(last);
      }

      // Show preview and ask for email
      this.showBlessingPreviewAndAskEmail(blessing, finalMeta);
      
      return;
    }

    if (/image|upload|photo|picture/i.test(text)) {
      this.pushAssistantMessage('No image is needed. Let us continue in words.');
    }
  }
```

### Step 3: Add New Functions

**Location:** Right after the `onAssistantComplete` function (after line 1117)

**Add these 7 new functions:**

```typescript
  private extractBlessingPreview(blessing: string): string {
    // Extract first 1-2 sentences, max ~150 chars
    const sentences = blessing.split(/[.!?]+/).filter(s => s.trim().length > 0);
    if (!sentences.length) return blessing.slice(0, 150);
    
    let preview = sentences[0].trim();
    if (preview.length < 80 && sentences.length > 1) {
      preview += '. ' + sentences[1].trim();
    }
    
    // Limit to ~150 characters
    if (preview.length > 150) {
      preview = preview.slice(0, 147) + '...';
    }
    
    return preview;
  }

  private showBlessingPreviewAndAskEmail(blessing: string, meta?: StreamMeta) {
    // Extract and show preview
    const preview = this.extractBlessingPreview(blessing);
    const previewBubble = document.createElement('div');
    previewBubble.className = 'bless-chat-bubble bless-chat-preview bless-chat-preview--truncated';
    previewBubble.textContent = preview + '...';
    this.messageList.appendChild(previewBubble);
    this.scrollToBottom();
    
    // Ask for email
    this.awaitingEmail = true;
    this.inputEl.disabled = true;
    this.sendBtn.disabled = true;
    
    setTimeout(() => {
      this.pushAssistantMessage("What's your email so I can send you the complete blessing?");
      this.createEmailInputBubble();
    }, 800);
  }

  private createEmailInputBubble() {
    const bubble = document.createElement('div');
    bubble.className = 'bless-chat-bubble bless-chat-email-bubble';
    
    const form = document.createElement('form');
    form.className = 'bless-chat-email-form';
    
    const inputWrapper = document.createElement('div');
    inputWrapper.className = 'bless-chat-email-wrapper';
    
    const emailInput = document.createElement('input');
    emailInput.type = 'email';
    emailInput.className = 'bless-chat-email-input';
    emailInput.placeholder = 'Enter your email';
    emailInput.required = true;
    emailInput.autocomplete = 'email';
    
    const submitBtn = document.createElement('button');
    submitBtn.type = 'submit';
    submitBtn.className = 'bless-chat-email-submit';
    submitBtn.textContent = 'Receive blessing';
    
    const errorMsg = document.createElement('div');
    errorMsg.className = 'bless-chat-email-error';
    errorMsg.hidden = true;
    
    inputWrapper.appendChild(emailInput);
    inputWrapper.appendChild(submitBtn);
    form.appendChild(inputWrapper);
    form.appendChild(errorMsg);
    bubble.appendChild(form);
    
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = emailInput.value.trim();
      
      if (!this.validateEmail(email)) {
        errorMsg.textContent = 'Please enter a valid email address';
        errorMsg.hidden = false;
        emailInput.focus();
        return;
      }
      
      errorMsg.hidden = true;
      emailInput.disabled = true;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Saving...';
      
      await this.handleEmailSubmission(email);
    });
    
    this.messageList.appendChild(bubble);
    this.scrollToBottom();
    emailInput.focus();
  }

  private validateEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  private async handleEmailSubmission(email: string) {
    if (!this.pendingBlessing) {
      this.pushAssistantMessage('Something went wrong. Please refresh and try again.');
      return;
    }
    
    try {
      // Send to N8N
      const success = await this.sendToN8N(email, this.pendingBlessing, this.pendingBlessingMeta || undefined);
      
      if (!success) {
        throw new Error('Webhook failed');
      }
      
      // Store email
      this.collectedEmail = email;
      this.blessingDelivered = true;
      setSessionFlag(SESSION_KEY, 'true');
      
      // Display full blessing
      this.displayBlessing(this.pendingBlessing, this.pendingBlessingMeta || undefined);
      
      // Show success message
      this.pushAssistantMessage('Perfect! Your blessing has been sent to ' + email);
      
      // Redirect to thank you page
      const userName = this.pendingBlessingMeta?.userName || null;
      const sidthieKey = this.pendingBlessingMeta?.sidthieKey || null;
      this.redirectToThankYou(userName || undefined, sidthieKey || undefined);
      
    } catch (error) {
      console.error('Email submission error:', error);
      
      // Show error and retry option
      const errorBubble = document.createElement('div');
      errorBubble.className = 'bless-chat-bubble bless-chat-error-bubble';
      errorBubble.textContent = "We couldn't save your blessing right now. ";
      
      const retryBtn = document.createElement('button');
      retryBtn.type = 'button';
      retryBtn.className = 'bless-chat-retry';
      retryBtn.textContent = 'Try again';
      retryBtn.addEventListener('click', () => {
        errorBubble.remove();
        this.createEmailInputBubble();
      });
      
      errorBubble.appendChild(retryBtn);
      this.messageList.appendChild(errorBubble);
      this.scrollToBottom();
    }
  }

  private async sendToN8N(email: string, blessing: string, meta?: StreamMeta): Promise<boolean> {
    const payload = {
      email,
      userName: meta?.userName || null,
      blessedPersonName: meta?.blessingFor || meta?.userName || null,
      chosenSidthie: meta?.sidthieKey || null,
      sidthieLabel: meta?.sidthieLabel || null,
      blessingText: blessing,
      explanation: this.lastExplanation || null,
      timestamp: new Date().toISOString()
    };
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout
      
      const response = await fetch(this.N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        console.error('N8N webhook failed:', response.status, response.statusText);
        return false;
      }
      
      return true;
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.error('N8N webhook timeout');
      } else {
        console.error('N8N webhook error:', error);
      }
      return false;
    }
  }

  private redirectToThankYou(userName?: string, sidthieKey?: string) {
    // Store blessing in sessionStorage
    if (this.pendingBlessing) {
      try {
        sessionStorage.setItem('bless-blessing-text', this.pendingBlessing);
        if (sidthieKey) {
          sessionStorage.setItem('bless-sidthie-key', sidthieKey);
        }
      } catch {
        // Ignore storage errors
      }
    }
    
    // Build URL
    const params = new URLSearchParams();
    if (userName) params.append('name', userName);
    if (sidthieKey) params.append('sidthie', sidthieKey);
    
    const url = `${this.THANK_YOU_PAGE}${params.toString() ? '?' + params.toString() : ''}`;
    
    // Redirect after short delay
    setTimeout(() => {
      window.location.href = url;
    }, 2000);
  }
```

### Step 4: Add CSS Styles

**Location:** In the `STYLE_BLOCK` constant (around line 470), before the closing backtick

**Add these styles:**

```css
/* Email input bubble */
.bless-chat-email-bubble {
  padding: 1.2rem !important;
}

.bless-chat-email-form {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.bless-chat-email-wrapper {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.bless-chat-email-input {
  flex: 1;
  padding: 0.75rem 1rem;
  border-radius: 18px;
  border: 1px solid rgba(255,255,255,0.22);
  background: rgba(255,255,255,0.15);
  color: rgba(var(--bless-cream-100), 0.92);
  font-size: 1rem;
  font-family: inherit;
}

.bless-chat-email-input::placeholder {
  color: rgba(var(--bless-cream-100), 0.45);
}

.bless-chat-email-input:focus {
  outline: none;
  border-color: rgba(var(--bless-gold-400), 0.6);
  background: rgba(255,255,255,0.2);
}

.bless-chat-email-submit {
  padding: 0.75rem 1.5rem;
  border-radius: 999px;
  border: none;
  background: rgba(var(--bless-gold-400), 0.92);
  color: rgb(var(--bless-green-900));
  font-family: inherit;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: transform 180ms ease, background-color 180ms ease;
  white-space: nowrap;
}

.bless-chat-email-submit:hover:not(:disabled) {
  transform: translateY(-1px);
  background: rgba(var(--bless-gold-400), 1);
}

.bless-chat-email-submit:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.bless-chat-email-error {
  font-size: 0.9rem;
  color: rgba(255, 129, 100, 0.95);
  padding: 0.25rem 0;
}

/* Preview bubble */
.bless-chat-preview {
  position: relative;
}

.bless-chat-preview--truncated::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 40px;
  background: linear-gradient(to bottom, transparent, rgba(var(--bless-cream-100), 0.1));
  pointer-events: none;
}

.bless-chat-error-bubble {
  background: rgba(255, 129, 100, 0.15);
  border-color: rgba(255, 129, 100, 0.3);
}

@media (max-width: 640px) {
  .bless-chat-email-wrapper {
    flex-direction: column;
    align-items: stretch;
  }
  
  .bless-chat-email-submit {
    width: 100%;
  }
}
```

## Part 2: Update Shopify Section (Optional)

The blessing reveal section in `/bless-shopify/sections/bless-blessing.liquid` will automatically work with the new flow. The email form there will now serve as a backup/alternative option.

If you want to hide it completely, add `hidden` attribute to the signup form div (around line 40):

```liquid
<form
  class="bless-blessing__signup bless-blessing__signup-form"
  data-blessing-signup
  hidden
  <!-- rest of attributes -->
>
```

## Part 3: Deploy and Test

### Deploy Chat Widget
```bash
cd /Users/julia/Documents/GitHub/bless-chat
npm run build
# Deploy to Vercel (or your hosting platform)
vercel --prod
```

### Testing Checklist

1. **Chat Flow**
   - [ ] Complete chat conversation (name, who for, Sidthie, context)
   - [ ] Blessing generates correctly
   - [ ] Preview shows (first 1-2 sentences)
   - [ ] Email prompt appears
   - [ ] Email input displays in chat

2. **Email Validation**
   - [ ] Invalid email shows error
   - [ ] Valid email accepts
   - [ ] "Saving..." state shows

3. **N8N Webhook**
   - [ ] Check N8N receives data
   - [ ] All fields populated correctly
   - [ ] Timestamp included

4. **Post-Submission**
   - [ ] Full blessing displays in chat
   - [ ] Success message shows
   - [ ] Reveal section updates below
   - [ ] Redirect happens after 2s

5. **Thank You Page**
   - [ ] URL has correct parameters
   - [ ] Name parameter present
   - [ ] Sidthie parameter present

6. **Mobile Testing**
   - [ ] Email input is responsive
   - [ ] Submit button works
   - [ ] Layout looks good

7. **Error Scenarios**
   - [ ] Network error shows retry
   - [ ] Timeout handled gracefully
   - [ ] Retry button works

## Troubleshooting

### Preview Not Showing
- Check `extractBlessingPreview()` function
- Verify blessing text is not empty
- Check console for errors

### Email Not Submitting
- Check N8N webhook URL is correct
- Verify CORS settings on N8N
- Check network tab for request/response

### Redirect Not Working
- Verify thank-you page exists at `/pages/thank-you`
- Check URL parameters are correctly formatted
- Confirm sessionStorage is working

### N8N Not Receiving Data
- Test webhook URL directly with curl/Postman
- Check N8N workflow is active
- Verify payload structure matches expected format

## N8N Webhook Test

Test the webhook manually:

```bash
curl -X POST https://n8n.theexperiencen8n.top/webhook-test/951bd832-961c-4f19-a263-96632039cd07 \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "userName": "Test User",
    "blessedPersonName": "Test User",
    "chosenSidthie": "NIRALUMA",
    "sidthieLabel": "Bliss",
    "blessingText": "Test blessing text...",
    "explanation": "Test explanation",
    "timestamp": "2025-11-19T10:30:00Z"
  }'
```

Expected response: 200 OK

## Rollback Plan

If you need to revert:

1. Git checkout the original `index.ts`:
   ```bash
   cd /Users/julia/Documents/GitHub/bless-chat
   git checkout HEAD -- widget/src/index.ts
   ```

2. Rebuild and redeploy:
   ```bash
   npm run build
   vercel --prod
   ```

## Success Metrics

After deployment, monitor:
- Email collection rate (target: 15-25%)
- N8N webhook success rate (target: >95%)
- Redirect completion rate (target: >90%)
- Mobile vs desktop performance
- Error rate (target: <5%)

## Need Help?

- Check browser console for JavaScript errors
- Check N8N execution logs
- Verify Vercel deployment logs
- Test in incognito mode to rule out caching

---

**Implementation Status:**
- [ ] Part 1: Chat Widget Modified
- [ ] Part 2: Shopify Section Updated
- [ ] Part 3: Deployed to Production
- [ ] Part 4: Tested All Scenarios
- [ ] Part 5: Monitoring Metrics
