---
name: Warm Radiant Social
colors:
  surface: '#fcf8ff'
  surface-dim: '#dad8ef'
  surface-bright: '#fcf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f2ff'
  surface-container: '#efecff'
  surface-container-high: '#e8e6fe'
  surface-container-highest: '#e3e0f8'
  on-surface: '#1a1a2b'
  on-surface-variant: '#58423c'
  inverse-surface: '#2f2f41'
  inverse-on-surface: '#f2efff'
  outline: '#8b716b'
  outline-variant: '#dfc0b8'
  surface-tint: '#a7391e'
  primary: '#a7391e'
  on-primary: '#ffffff'
  primary-container: '#ff7a59'
  on-primary-container: '#701500'
  inverse-primary: '#ffb4a2'
  secondary: '#5f3add'
  on-secondary: '#ffffff'
  secondary-container: '#7857f8'
  on-secondary-container: '#fffbff'
  tertiary: '#006c49'
  on-tertiary: '#ffffff'
  tertiary-container: '#0cb880'
  on-tertiary-container: '#00412b'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdad2'
  primary-fixed-dim: '#ffb4a2'
  on-primary-fixed: '#3c0700'
  on-primary-fixed-variant: '#862208'
  secondary-fixed: '#e6deff'
  secondary-fixed-dim: '#cabeff'
  on-secondary-fixed: '#1c0062'
  on-secondary-fixed-variant: '#4918c8'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#fcf8ff'
  on-background: '#1a1a2b'
  surface-variant: '#e3e0f8'
typography:
  display:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '800'
    lineHeight: 44px
    letterSpacing: -0.03em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 28px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: -0.005em
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 22px
    letterSpacing: 0em
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0em
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.03em
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-mobile: 0.75rem
  margin: 1.25rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.875rem
  space-lg: 1.25rem
  space-xl: 2rem
---

## Brand & Style
The design system establishes a warm, intimate, and fluid social environment. Geared toward contemporary digital natives seeking genuine connection without friction, the interface prioritizes approachability, tactile delight, and clarity. The visual language blends soft tactile components with modern frosted glass overlays—avoiding cold corporate minimalism while preserving clean layout discipline. Interactions feel buoyant and responsive, utilizing subtle organic bounce, luminous status indicators, and pill-shaped touch surfaces that invite continuous interaction.

## Colors
The palette balances active warmth with tranquil depth:
- **Primary (`#FF7A59`)**: Vibrant coral, applied to primary call-to-actions, outgoing active message bubbles, unread notification badges, and direct response moments.
- **Secondary (`#7C5CFC`)**: Electric lavender, dedicated to social presence indicators, interactive audio waves, shared media accents, and alternate user reactions.
- **Tertiary (`#10B981`)**: Vivid emerald green, utilized exclusively for real-time presence indicators, online status pings, and positive message delivery feedback.
- **Neutral (`#1E1E2F`)**: Deep ink violet used for primary typography and high-contrast iconography, anchoring the warmth of the background surfaces.

### Surface Tones
- **Canvas Base**: `#FBFBFC`, an ultra-soft alabaster maintaining natural warmth.
- **Surface Elevation (Cards/Containers)**: Pure `#FFFFFF`.
- **Muted Fill**: Tinted slate-lavender (`#F1F1F6`) for incoming message bubbles, disabled states, and inactive tab surfaces.

## Typography
Plus Jakarta Sans powers all copy across display, structural headers, body communication, and utility indicators. Rounded geometric stems harmonize with pill shapes while wide apertures preserve readability at compact mobile sizes. 

- Use **display** and **headline-lg** sparingly for celebratory onboarding headers and top-level channel banners.
- Use **headline-md** and **headline-sm** for chat participant headers, direct messages drawer titles, and profile cards.
- **body-md** serves as the standard conversation bubble reading size; line height is tuned to `22px` to prevent visual fatigue over long chat streams.
- **label-sm** in bold styling is reserved for timestamps, unread counter badges, and audio status tags.

## Layout & Spacing
The layout follows a fluid single-column hierarchy for mobile devices, expanding into a dual-pane structure (sidebar roster + active conversation stream) on tablet and desktop interfaces.

- **Mobile (<768px)**: Native edge margin is fixed at `1rem`, leaving maximum horizontal room for threaded conversation cards and responsive message clouds.
- **Tablet / Split View (768px - 1024px)**: 340px fixed navigation and contact roster paired with a fluid central chat canvas. Gutter remains `1rem`.
- **Desktop (>1024px)**: Max-width capped at `1280px` centered canvas, containing conversation roster, message feed, and contextual profile/media drawer.

Spacing rhythm relies strictly on a 4px baseline matrix. Inline conversation gaps default to `space-xs` (4px) for consecutive messages from the same sender, jumping to `space-md` (14px) when alternating senders to establish natural conversational cadence.

## Elevation & Depth
Depth is produced through ambient, warm-tinted drops rather than harsh architectural shadows. 

- **Level 0 (Base Canvas)**: Flat `#FBFBFC`.
- **Level 1 (Chat Cards & Content Modules)**: Pure white background `#FFFFFF` overlaid with a diffuse ambient shadow: `0px 4px 20px -2px rgba(30, 30, 47, 0.04)`.
- **Level 2 (Popovers, Bottom Sheets & Modals)**: Lifted surface with soft colored dispersion: `0px 12px 36px -4px rgba(124, 92, 252, 0.12)`.
- **Level 3 (Persistent Bottom Bar & Floating Controls)**: Translucent glass substrate utilizing `backdrop-filter: blur(20px)` paired with `background: rgba(255, 255, 255, 0.82)` and a delicate 1px boundary: `border: 1px solid rgba(255, 255, 255, 0.6)`.
- **Interactive Presence Ping**: Real-time status badges use an energetic glowing ring: `box-shadow: 0 0 0 3px #FFFFFF, 0 0 10px rgba(16, 185, 129, 0.6)`.

## Shapes
The system relies on pill-shaped geometry (`roundedness: 3`) to echo friendly warmth and ergonomic hand travel on mobile touchscreens.

- **Buttons & Pills**: Full capsule shape (`border-radius: 9999px` or `2rem`).
- **Interactive Cards & Surface Sheets**: `border-radius: 1.5rem` (24px) for bottom sheets, active reaction sheets, and feed containers.
- **Chat Bubbles**: Asymmetric rounded execution. Incoming bubbles use `20px` corner radii with a flattened bottom-left corner (`4px`). Outgoing bubbles feature `20px` radii with a flattened bottom-right corner (`4px`), providing instant directional attribution.
- **Avatars**: True circles (`rounded-full`) enclosed by a 2px offset border when combined with status badges.

## Components

### Buttons
- **Primary**: Full pill profile, `#FF7A59` background with white text, zero border, and a subtle warm glow on press: `0 4px 14px rgba(255, 122, 89, 0.35)`.
- **Secondary**: Soft lavender tint background `rgba(124, 92, 252, 0.12)` with solid `#7C5CFC` text, morphing to `rgba(124, 92, 252, 0.2)` on interaction.
- **Icon Action Buttons**: Pure white circular discs (40px x 40px) with ambient Level 1 elevation housing single-tone neutral icons.

### Chat Bubbles
- **Outgoing (Sent)**: Filled with primary coral `#FF7A59` with crisp `#FFFFFF` text. Micro-metadata (timestamp, read status ticks) renders in white with 75% opacity.
- **Incoming (Received)**: Filled with muted tone `#F1F1F6` with `#1E1E2F` text. Timestamps render in `label-sm` slate text.
- **Media Attachments**: Wrapped in matching asymmetric radii with a micro-thin internal border `rgba(0, 0, 0, 0.04)`.

### Presence Badges & Avatars
- **Status Indicator**: An 10px circular pill of `#10B981` anchored to the lower-right quadrant of user avatars, surrounded by a 2px knockout border matching the parent background color. 
- **Active Pulse**: Real-time voice/video channels display a repeating outward CSS keyframe ripple matching the tertiary emerald tone.

### Inputs & Text Areas
- **Message Bar**: Full-width docking floating island (`border-radius: 9999px`) utilizing a `#F1F1F6` base fill, transitioning to a pure white surface with a delicate `#7C5CFC` outline (`1.5px`) upon focus.
- **Attachment & Emoji Triggers**: Embedded within the input bar boundaries to minimize spatial clutter.

### Navigation Bar & Tab Bar
- **Floating Island Navigation**: Suspended 16px above the display bottom edge, enclosed in a frosted glass capsule (`backdrop-filter: blur(24px)`).
- **Active Tab State**: Active items inhabit a smooth `#FF7A59` micro-capsule or pill marker with animated layout spring transitions; inactive icons stay `#1E1E2F` at 45% alpha.

### Chips & Tags
- **Activity Filter**: Pill-shaped horizontal scrolling filters with 8px vertical and 16px horizontal padding. Selected chips feature secondary `#7C5CFC` solid fill with white text; unselected chips sit on transparent white cards with `1px solid rgba(30, 30, 47, 0.08)`.