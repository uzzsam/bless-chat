// ========================================
// COMPLETE WIX FRONTEND CODE
// Copy and paste this entire code into your Wix page
// ========================================

import wixStorage from 'wix-storage';

let messages = []; // Conversation history
let isProcessing = false;

$w.onReady(() => {
  // Initialize with empty repeater
  $w('#chatRepeater').data = [];

  // Hide blessing container initially
  $w('#blessingText').hide();
  $w('#blessingContainer').hide();

  // Start conversation automatically
  sendBotMessage();

  // Handle send button click
  $w('#sendButton').onClick(handleSend);

  // Handle enter key in input
  $w('#userInput').onKeyPress((event) => {
    if (event.key === 'Enter') {
      handleSend();
    }
  });
});

async function handleSend() {
  if (isProcessing) return;

  const userText = ($w('#userInput').value || '').trim();
  if (!userText) return;

  // Clear input
  $w('#userInput').value = '';

  // Add user message to chat
  addMessage('user', userText);
  messages.push({ role: 'user', content: userText });

  // Send to API
  isProcessing = true;
  $w('#sendButton').disable();

  try {
    const res = await fetch('https://bless-test-brown.vercel.app/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || `Error: ${res.status}`);
    }

    // Add bot response
    messages.push({ role: 'assistant', content: data.message });
    addMessage('bot', data.message);

    // If conversation is done, show blessing
    if (data.done) {
      setTimeout(() => {
        showBlessing(data.message);
      }, 1000);
    }

  } catch (err) {
    console.error('Chat error:', err);
    addMessage('bot', `Sorry, something went wrong: ${err.message}`);
  } finally {
    isProcessing = false;
    $w('#sendButton').enable();
  }
}

async function sendBotMessage() {
  isProcessing = true;
  $w('#sendButton').disable();

  try {
    const res = await fetch('https://bless-test-brown.vercel.app/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || `Error: ${res.status}`);
    }

    messages.push({ role: 'assistant', content: data.message });
    addMessage('bot', data.message);

  } catch (err) {
    console.error('Chat error:', err);
    addMessage('bot', `Sorry, I couldn't start the conversation: ${err.message}`);
  } finally {
    isProcessing = false;
    $w('#sendButton').enable();
  }
}

function addMessage(sender, text) {
  const currentData = $w('#chatRepeater').data;

  currentData.push({
    _id: `msg-${Date.now()}-${Math.random()}`,
    sender: sender,
    text: text,
    showBot: sender === 'bot',
    showUser: sender === 'user'
  });

  $w('#chatRepeater').data = currentData;

  // Scroll to bottom of chat
  setTimeout(() => {
    $w('#chatRepeater').scrollTo();
  }, 100);
}

function showBlessing(fullMessage) {
  // Extract blessing (find "Here is your blessing:" and take the 4 lines after it)
  let blessingLines = '';

  if (fullMessage.includes('Here is your blessing:')) {
    const parts = fullMessage.split('Here is your blessing:');
    const blessingPart = parts[1] || '';
    const lines = blessingPart.split('\n').filter(l => l.trim()).slice(0, 4);
    blessingLines = lines.join('\n');
  } else {
    // Fallback: take last 4 non-empty lines
    const lines = fullMessage.split('\n').filter(l => l.trim());
    blessingLines = lines.slice(-4).join('\n');
  }

  // Show blessing in dedicated container
  $w('#blessingText').text = blessingLines;
  $w('#blessingContainer').show();
  $w('#blessingText').show();

  // Hide chat interface
  $w('#chatRepeater').collapse();
  $w('#userInput').collapse();
  $w('#sendButton').collapse();

  // Scroll to blessing container
  setTimeout(() => {
    $w('#blessingContainer').scrollTo();
  }, 300);

  // Store blessing for order personalization
  wixStorage.session.setItem('blessing', blessingLines);
  wixStorage.local.setItem('lastBlessing', blessingLines);

  console.log('Blessing saved:', blessingLines);
}

// Repeater item setup - NO LABELS, just bubbles with text
$w('#chatRepeater').onItemReady(($item, itemData) => {
  if (itemData.showBot) {
    // Show bot bubble
    $item('#botBubble').show();
    $item('#botText').text = itemData.text;
    // Hide user bubble
    if ($item('#userBubble')) {
      $item('#userBubble').collapse();
    }
  } else {
    // Show user bubble
    $item('#userBubble').show();
    $item('#userText').text = itemData.text;
    // Hide bot bubble
    if ($item('#botBubble')) {
      $item('#botBubble').collapse();
    }
  }
});
