# 05 - AI Chat & Voice Interface

> **Phase:** 5
> **Dependencies:** 04-product-catalog (needs products to search), 06-cart-checkout (needs cart to add items)
> **User Stories:** US-011, US-012, US-013

---

## Overview

The AI interface is Plexaris's key differentiator. Horeca users can find and order products through natural language chat and voice input instead of navigating traditional search forms. The AI understands ordering intent, searches the product catalog, shows results as cards, and can add items to cart on request. It also proactively suggests products based on order history.

**Note:** This phase depends on both the product catalog (to search) and the cart (to add items). Implementation can begin in parallel with cart/checkout, with cart integration added once US-014 is complete.

## User Stories

### US-011: AI Chat Interface

> As a Horeca user, I want to chat with AI to find and order products naturally.

**Acceptance Criteria:**

- Chat UI with message input at bottom of screen
- AI understands ordering intent: "I need apple pies from Beukappeltarten"
- AI searches products and shows results inline as cards
- Each card shows: image, description, price, supplier name
- User can say "add to cart" and AI adds the item
- Conversation history preserved within session
- Graceful handling when no products match

---

### US-012: Voice Input for Ordering

> As a Horeca user, I want to speak my order so I can order hands-free.

**Acceptance Criteria:**

- Microphone button in chat interface
- Speech-to-text converts voice to text
- Transcribed text sent to AI chat (same flow as typed input)
- Works on mobile and desktop browsers
- Visual feedback while recording (recording indicator, waveform)
- Handle microphone permission denial gracefully

---

### US-013: Proactive Suggestions

> As a Horeca user, I want the AI to suggest products I usually order.

**Acceptance Criteria:**

- AI suggests based on order history: "You usually order apple pies on Thursdays. Want me to add them?"
- Quick "Yes, add to cart" response
- Suggestions triggered by day-of-week patterns and frequency
- Learn from user preferences over time
- Suggestions appear at start of chat session or contextually

---

## Technical Considerations

- **LLM integration:** Claude or GPT API for natural language understanding and response generation
- **Tool use / function calling:** LLM calls product search and cart functions as tools
- **Voice:** Web Speech API (browser-native) for MVP, Whisper API as fallback for better accuracy
- **Chat persistence:** Store conversation history per session in database or session storage
- **Product cards:** Rendered inline in chat as structured UI components, not just text
- **Rate limiting:** LLM API calls should be rate-limited per user to control costs
- **Streaming:** Stream LLM responses for better UX (tokens appear as generated)
