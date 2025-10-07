// Wix Frontend Code for Blessing Chat
// Place this in your Wix page code

import wixStorage from 'wix-storage';

let messages = []; // Conversation history
let isProcessing = false;

$w.onReady(() => {
  // Initialize with empty repeater
  $w('#chatRepeater').data = [];

  // Hide blessing text initially
  $w('#blessingText').hide();
  $w('#blessingContainer').hide();

  // Start conversation
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

  // Scroll to bottom
  setTimeout(() => {
    $w('#chatRepeater').scrollTo();
  }, 100);
}

function showBlessing(blessingText) {
  // Extract blessing lines (after thank you message)
  const lines = blessingText.split('\n').filter(l => l.trim());
  const blessingLines = lines.slice(-4).join('\n'); // Last 4 lines

  // Show blessing in dedicated area
  $w('#blessingText').text = blessingLines;
  $w('#blessingContainer').show();
  $w('#blessingText').show();

  // Hide chat interface
  $w('#chatRepeater').hide();
  $w('#userInput').hide();
  $w('#sendButton').hide();

  // Store blessing for order personalization
  wixStorage.session.setItem('blessing', blessingLines);

  // Also store in local storage for persistence
  wixStorage.local.setItem('lastBlessing', blessingLines);
}

// Repeater item setup
$w('#chatRepeater').onItemReady(($item, itemData) => {
  if (itemData.showBot) {
    $item('#botBubble').show();
    $item('#botText').text = itemData.text;
    $item('#userBubble').hide();
  } else {
    $item('#userBubble').show();
    $item('#userText').text = itemData.text;
    $item('#botBubble').hide();
  }
});
