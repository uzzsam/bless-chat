# Wix Setup Instructions for Blessing Chat

## Required Wix Elements

Create these elements on your Wix page (https://www.sidthah.com/bless-shop-layout-02):

### 1. Chat Interface
- **Repeater** (ID: `chatRepeater`)
  - Inside repeater item, add:
    - **Container** (ID: `botBubble`) - for bot messages
      - **Text** (ID: `botText`)
    - **Container** (ID: `userBubble`) - for user messages
      - **Text** (ID: `userText`)

### 2. User Input Area
- **Text Input** (ID: `userInput`) - placeholder: "Type your message..."
- **Button** (ID: `sendButton`) - text: "Send"

### 3. Blessing Display Area
- **Container** (ID: `blessingContainer`) - initially hidden
  - **Text** (ID: `blessingText`) - for displaying final blessing

## Page Code

Copy the code from `wix-chat-frontend.js` into your Wix page's code panel.

## Conversation Flow

1. **Welcome** - Bot greets and asks who the blessing is for
2. **Questions** - Bot asks 3-4 follow-up questions about the recipient
3. **Blessing** - Bot thanks the user and generates the blessing
4. **Display** - Chat hides, blessing appears in dedicated area
5. **Store** - Blessing is stored as a custom parameter for order personalization

## Styling Tips

### Bot Bubble
- Background: Light blue or gray
- Text align: Left
- Border radius: 12px
- Padding: 12px
- Max width: 80%
- Align: Left

### User Bubble
- Background: Brand color
- Text color: White
- Text align: Right
- Border radius: 12px
- Padding: 12px
- Max width: 80%
- Align: Right

### Blessing Container
- Center aligned
- Larger font
- Elegant typography
- Soft background

## Integration with Wix Stores

The blessing is stored in session storage and can be accessed in your checkout or order pages:

```javascript
import wixStorage from 'wix-storage';

// Retrieve blessing from session
const blessing = wixStorage.session.getItem('blessing');

// Or from local storage
const lastBlessing = wixStorage.local.getItem('lastBlessing');

// Add to order customization field or product options
```

To pass the blessing to the cart, you can add it as a product option when adding to cart:

```javascript
import wixStorage from 'wix-storage';
import { cart } from 'wix-stores';

const blessing = wixStorage.session.getItem('blessing');

// Add product with custom text field
await cart.addProducts([{
  productId: 'YOUR_PRODUCT_ID',
  quantity: 1,
  options: {
    customTextFields: {
      'Blessing': blessing
    }
  }
}]);
```

## Testing

1. Deploy your Wix page
2. Test the conversation flow:
   - Should get welcome message automatically
   - Answer 4-5 questions
   - See final blessing appear
   - Chat interface should hide

## API Endpoint

The chat uses: `https://bless-test-brown.vercel.app/api/chat`

It expects:
```json
{
  "messages": [
    { "role": "user", "content": "..." },
    { "role": "assistant", "content": "..." }
  ]
}
```

Returns:
```json
{
  "message": "Bot response",
  "done": false
}
```

When `done: true`, the blessing is complete.
