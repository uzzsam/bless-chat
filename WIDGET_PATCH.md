# Widget Fix - Copy this entire function

Find the `onAssistantComplete` function in your widget file and replace it with this:

```typescript
private onAssistantComplete(
  text: string, 
  done: boolean, 
  finalMeta?: StreamMeta
) {
  if (!text) return;

  if (done) {
    // FIXED: Extract blessing and completion message separately
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    let blessingText = '';
    let completionMessage = '';
    
    // Check if last line is the completion message
    const lastLine = lines[lines.length - 1];
    if (lastLine.toLowerCase().includes('scroll down')) {
      completionMessage = lastLine;
      blessingText = lines.slice(0, -1).join('\n');
    } else {
      blessingText = text;
      completionMessage = 'Your blessing has been created. Scroll down to read it.';
    }
    
    this.blessingDelivered = true;
    setSessionFlag(SESSION_KEY, 'true');

    // Remove the last streaming bubble (which contains the blessing)
    const last = this.messageList.lastElementChild;
    if (last && last.classList.contains('bless-chat-bubble')) {
      this.messageList.removeChild(last);
    }

    // Display blessing in panel (not chat)
    this.displayBlessing(blessingText, finalMeta);
    
    // Show ONLY completion message in chat
    this.pushAssistantMessage(completionMessage);
    
    // FIXED: Auto-scroll to blessing panel
    setTimeout(() => {
      const blessingPanel = document.querySelector('[data-bless-panel], .bless-blessing__panel, #bless-blessing__panel');
      if (blessingPanel) {
        blessingPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 500);
    
    return;
  }

  if (/image|upload|photo|picture/i.test(text)) {
    this.pushAssistantMessage('No image is needed. Let us continue in words.');
  }
}
```

## How to Apply:

1. Open `/Users/julia/Documents/GitHub/bless-chat/widget/src/index.ts`
2. Find the function `private onAssistantComplete(`
3. Select the entire function (from `private onAssistantComplete` to the closing `}`)
4. Replace it with the code above
5. Save file
6. Run `cd widget && npm run build && cd ..`
7. Commit and push via GitHub Desktop

That's it! This fixes:
- ✅ Blessing not appearing in chat bubble
- ✅ Only one completion message
- ✅ Auto-scroll to blessing panel
- ✅ No duplicate messages
