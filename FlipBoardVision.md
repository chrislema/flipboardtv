# FlipBoard TV

**A split-flap display for Apple TV — send messages to your TV from anywhere in the world.**

---

## Concept

Turn an Apple TV into a permanent, beautiful split-flap (Vestaboard-style) message display. Messages are sent remotely — from your phone, laptop, or anywhere with internet — and appear on the TV with a retro mechanical flip animation.

No Vestaboard hardware ($3,500). No subscriptions. Just your Apple TV doing something it wasn't designed for.

## Visual Inspiration

- [Vestaboard](https://www.vestaboard.com/) — the premium physical split-flap display
- [FlipOff](https://github.com/magnum6actual/flipoff) — open-source split-flap emulator (pure HTML/CSS/JS, MIT license)

The display should feel like a real split-flap board: individual character tiles that scramble through random characters with colored backgrounds before settling on the final letter. Mechanical clacking sound optional.

---

## Architecture

Three components:

### 1. Display Page (Cloudflare Pages)

A full-screen HTML/CSS/JS split-flap renderer.

- Hosted on Cloudflare Pages
- Connects to the Message API to fetch the current message
- Renders the split-flap animation when the message changes
- Uses polling or Server-Sent Events (SSE) to detect new messages
- Designed for a 1920×1080 (or 4K) TV display — large tiles, high contrast, dark background

### 2. Message API (Cloudflare Worker + KV)

A simple API for storing and retrieving the current message.

- `GET /message` — returns the current message text
- `POST /message` — sets a new message (authenticated)
- Backed by Cloudflare KV for persistence
- Authentication via a simple API key or bearer token (sufficient for personal use)
- Optionally stores message history

### 3. tvOS App (Apple TV)

A minimal native tvOS app that displays the Cloudflare Pages site full-screen.

- Built in Xcode using SwiftUI + WKWebView
- Loads the display page URL on launch
- Suppresses the screen saver: `UIApplication.shared.isIdleTimerDisabled = true`
- No UI chrome — just the full-screen web view
- Sideloaded to Apple TV via Xcode or distributed via TestFlight

---

## Message Sending

Multiple options for sending messages, all hitting the same Worker API:

- **iOS Shortcut** — "Hey Siri, set the board to [message]" via an HTTP POST shortcut
- **Simple web form** — a companion page (e.g., `/send`) with a text input and submit button
- **Slack command** — wire a Slack slash command to the Worker (future)
- **SMS/iMessage** — via a Twilio webhook or similar (future)

---

## Requirements

### To Build & Deploy

- Mac with Xcode (for the tvOS app)
- Apple Developer account (enrolled — $99/year) ✅
- Cloudflare account (for Pages, Workers, KV)
- Apple TV (4th gen or later, running tvOS)

### Technical Stack

- **Display**: HTML, CSS, JavaScript (vanilla — no frameworks)
- **API**: Cloudflare Worker (JavaScript), Cloudflare KV
- **Hosting**: Cloudflare Pages
- **tvOS App**: Swift/SwiftUI, WKWebView (minimal wrapper)

---

## Screen Saver Prevention

Two layers:

1. **tvOS app level**: `UIApplication.shared.isIdleTimerDisabled = true` — prevents the OS from triggering the screen saver while the app is in the foreground
2. **Apple TV settings level**: Settings → General → Screen Saver → Start After → Never (belt and suspenders)

---

## Open Questions

- **Grid size**: How many columns × rows? Vestaboard is 6 rows × 22 columns. FlipOff defaults to a similar layout. Needs to be readable from across a room on a 55"+ TV.
- **Multi-line vs. single message**: Should messages auto-wrap across rows, or is each message a single line?
- **Message queue**: Should it support a queue of messages that rotate, or always show the latest single message?
- **Sound**: Include the mechanical flip sound? (Fun but might get old if the TV is always on.)
- **Companion app**: Is the web form sufficient for sending, or do we want a dedicated iOS companion app later?
- **Colors**: Stick with classic black/yellow Vestaboard aesthetic, or allow customization?

---

## Build Order

1. **Cloudflare Worker + KV** — the message API (POST and GET)
2. **Display page** — split-flap renderer on Cloudflare Pages, wired to the API
3. **tvOS wrapper app** — minimal Xcode project, WKWebView loading the display URL
4. **Sender interface** — web form and/or iOS Shortcut for posting messages
5. **Polish** — animation tuning, sound, grid sizing, dark mode optimization for TV
