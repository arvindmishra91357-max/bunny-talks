# Bunny Talks

A polished responsive Bunny messaging/social app prototype built from the supplied Stitch screens and design references.

## Included flows
- Chats home with search, unread/groups/channel filters, active sparks and quick actions
- One-to-one conversation with live local message sending
- Friends/network and friend requests
- Discover / communities / channels
- Groups and channels
- Active Sparks feed + create Instant Spark sheet
- Profile and settings with dark-mode toggle
- Chat feed filters
- Responsive mobile-first glass/tactile visual system

## Run
Open `index.html` directly in a browser, or serve the folder with any static server.

Example:
`python -m http.server 5500`

Then open `http://localhost:5500`.

## Next production step
Replace the local UI actions with a real backend (auth, database, realtime messaging, media upload, push notifications, calls, moderation, and persistent profiles). The UI is deliberately organized so each screen can become a React component/API route later.
