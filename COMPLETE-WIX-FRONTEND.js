// ========================================
// COMPLETE WIX FRONTEND CODE
// Copy and paste this entire code into your Wix page
// ========================================
//
// IMPORTANT: In Wix Editor, set #userBubble to "Hidden on load"
// (or collapsed) in the repeater item settings
// ========================================

import wixStorage from 'wix-storage';

let messages = []; // Conversation history
let isProcessing = false;

$w.onReady(() => {
  console.log('Page loaded, initializing...');

  // Set up repeater item handler FIRST
  $w('#chatRepeater').onItemReady(($item, itemData) => {
    setupRepeaterItem($item, itemData);
  });

  // Force clear repeater data
  $w('#chatRepeater').data = [];
  console.log('Repeater cleared, current data:', $w('#chatRepeater').data);

  // Hide blessing container initially
  $w('#blessingText').hide();
  $w('#blessingContainer').hide();

  // Clear any cached blessing state on page load
  wixStorage.session.removeItem('blessingCreated');

  // Start conversation automatically (this will add first bot message)
  console.log('Starting conversation...');
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

  // Check if blessing has already been created
  const blessingCreated = wixStorage.session.getItem('blessingCreated');
  if (blessingCreated === 'true') {
    // Don't send more messages, just show a message
    $w('#userInput').value = '';
    addMessage('bot', 'Your blessing has been created! Scroll down to see it.');
    return;
  }

  // Clear input
  $w('#userInput').value = '';

  // Add user message to chat
  addMessage('user', userText);
  messages.push({ role: 'user', content: userText });

  // Show loading indicator
  addMessage('bot', '...');
  const loadingId = `msg-loading-${Date.now()}`;

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

    // Remove loading indicator
    removeLastMessage();

    // Add bot response (but clean it of file upload messages)
    const cleanedMessage = cleanBotMessage(data.message);
    messages.push({ role: 'assistant', content: cleanedMessage });

    // If conversation is done, show blessing separately
    if (data.done) {
      // Add thank you message to chat (only if it has content)
      const thankYouPart = extractThankYou(cleanedMessage);
      if (thankYouPart && thankYouPart.length > 0) {
        addMessage('bot', thankYouPart);
      }

      // Show the blessing in the blessing container
      setTimeout(() => {
        showBlessing(cleanedMessage);
        addMessage('bot', 'Your blessing has been created! Scroll down to see it.');
      }, 500);
    } else {
      // Regular message (only add if not empty)
      if (cleanedMessage && cleanedMessage.trim().length > 0) {
        addMessage('bot', cleanedMessage);
      }
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

    const cleanedMessage = cleanBotMessage(data.message);
    messages.push({ role: 'assistant', content: cleanedMessage });
    addMessage('bot', cleanedMessage);

  } catch (err) {
    console.error('Chat error:', err);
    addMessage('bot', `Sorry, I couldn't start the conversation: ${err.message}`);
  } finally {
    isProcessing = false;
    $w('#sendButton').enable();
  }
}

// Clean bot messages from file upload artifacts
function cleanBotMessage(message) {
  // Remove file upload messages from the vector store
  const patterns = [
    /Thank you for (sharing|uploading|providing).*?(files?|documents?|that)!?.*$/gmi,
    /How can I assist you with (them|it|the files?)\?.*$/gmi,
    /Would you like me to search for specific information.*$/gmi,
    /or summarize the content\?.*$/gmi,
    /\【\d+:\d+†source\】/g,  // Remove citation markers
    /To create a personalized blessing.*?providing the files?!?/gmi,
    /and for providing the files?!?/gmi
  ];

  let cleaned = message;
  patterns.forEach(pattern => {
    cleaned = cleaned.replace(pattern, '');
  });

  return cleaned.trim();
}

// Extract thank you message (everything before "Here is your blessing:")
function extractThankYou(message) {
  if (message.includes('Here is your blessing:')) {
    const parts = message.split('Here is your blessing:');
    return parts[0].trim();
  }
  return '';
}

function addMessage(sender, text) {
  // Don't add empty messages
  if (!text || text.trim().length === 0) {
    console.log('Skipping empty message');
    return;
  }

  const currentData = $w('#chatRepeater').data;

  const newItem = {
    _id: `msg-${Date.now()}-${Math.random()}`,
    sender: sender,
    text: text,
    showBot: sender === 'bot',
    showUser: sender === 'user'
  };

  console.log('Adding message:', newItem);
  currentData.push(newItem);

  $w('#chatRepeater').data = currentData;
  console.log('Repeater now has', currentData.length, 'items');

  // Don't auto-scroll - let user scroll themselves
}

function removeLastMessage() {
  const currentData = $w('#chatRepeater').data;
  if (currentData.length > 0) {
    currentData.pop();
    $w('#chatRepeater').data = currentData;
  }
}

function showBlessing(fullMessage) {
  console.log('Full message:', fullMessage);

  // Extract blessing (find "Here is your blessing:" and take EXACTLY 4 lines after it)
  let blessingLines = '';

  if (fullMessage.includes('Here is your blessing:')) {
    const parts = fullMessage.split('Here is your blessing:');
    const blessingPart = parts[1] || '';
    // Get non-empty lines and take exactly 4
    const lines = blessingPart.split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0 && !l.startsWith('---') && !l.startsWith('**'))
      .slice(0, 4);
    blessingLines = lines.join('\n');
  } else {
    // Fallback: take last 4 non-empty lines
    const lines = fullMessage.split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0 && !l.startsWith('---') && !l.startsWith('**'))
      .slice(-4);
    blessingLines = lines.join('\n');
  }

  console.log('Extracted blessing:', blessingLines);

  // Show blessing in dedicated container
  if ($w('#blessingText') && $w('#blessingContainer')) {
    $w('#blessingText').text = blessingLines;
    $w('#blessingText').show();
    $w('#blessingContainer').expand();
    console.log('Blessing container shown');
  } else {
    console.error('Blessing elements not found!');
  }

  // Keep chat visible - don't collapse it
  // Just disable further input
  $w('#userInput').disable();

  // Store blessing for order personalization
  wixStorage.session.setItem('blessing', blessingLines);
  wixStorage.local.setItem('lastBlessing', blessingLines);
  wixStorage.session.setItem('blessingCreated', 'true');

  console.log('Blessing saved:', blessingLines);
}

// Repeater item setup - NO LABELS, just bubbles with text
function setupRepeaterItem($item, itemData) {
  console.log('Setting up item:', itemData);

  // ALWAYS hide both bubbles first
  $item('#botBubble').collapse();
  $item('#userBubble').collapse();

  // Check if this is a valid message with data
  if (!itemData || (!itemData.showBot && !itemData.showUser)) {
    console.log('No valid data, hiding both bubbles');
    return;
  }

  // Set text and show appropriate bubble
  if (itemData.showBot && itemData.text) {
    $item('#botText').text = itemData.text;
    $item('#botBubble').expand();
    console.log('Showing bot bubble with:', itemData.text);
  } else if (itemData.showUser && itemData.text) {
    $item('#userText').text = itemData.text;
    $item('#userBubble').expand();
    console.log('Showing user bubble with:', itemData.text);
  }
}
