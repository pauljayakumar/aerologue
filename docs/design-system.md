# Aerologue Design System

**Brand Mood:** Warm & Friendly
**Feel:** Approachable, community-focused, inviting, makes air travel feel connected

---

## Color Palette

### Multi-Accent Feature Colors
Each major feature has its own accent color for easy recognition:

| Feature | Color | Hex | Usage |
|---------|-------|-----|-------|
| **Map/Tracking** | Sky Blue | `#0EA5E9` | Flight tracking, map elements |
| **Crossings** | Coral/Orange | `#F97316` | Crossing events, connections |
| **Wallet/Badges** | Purple | `#A855F7` | Collectibles, achievements |
| **Games** | Green | `#22C55E` | Gaming, quizzes, points |
| **Messages** | Pink | `#EC4899` | Chat, greetings, social |

### Neutral Colors

#### Light Mode
| Name | Hex | Usage |
|------|-----|-------|
| Background | `#FAFAFA` | Page background |
| Surface | `#FFFFFF` | Cards, panels |
| Surface Alt | `#F4F4F5` | Secondary surfaces |
| Border | `#E4E4E7` | Dividers, borders |
| Text Primary | `#18181B` | Headings, body text |
| Text Secondary | `#71717A` | Captions, hints |
| Text Muted | `#A1A1AA` | Disabled, placeholders |

#### Dark Mode
| Name | Hex | Usage |
|------|-----|-------|
| Background | `#0A0A0B` | Page background |
| Surface | `#18181B` | Cards, panels |
| Surface Alt | `#27272A` | Secondary surfaces |
| Border | `#3F3F46` | Dividers, borders |
| Text Primary | `#FAFAFA` | Headings, body text |
| Text Secondary | `#A1A1AA` | Captions, hints |
| Text Muted | `#71717A` | Disabled, placeholders |

### Semantic Colors
| Name | Light | Dark | Usage |
|------|-------|------|-------|
| Success | `#22C55E` | `#4ADE80` | Confirmations, online |
| Warning | `#F59E0B` | `#FBBF24` | Alerts, attention |
| Error | `#EF4444` | `#F87171` | Errors, destructive |
| Info | `#3B82F6` | `#60A5FA` | Informational |

---

## Typography

### Font Stack
- **Primary:** Inter (or system fonts)
- **Mono:** JetBrains Mono (for flight codes, data)

### Scale
| Name | Size | Weight | Line Height | Usage |
|------|------|--------|-------------|-------|
| Display | 48px | 700 | 1.1 | Hero headlines |
| H1 | 36px | 700 | 1.2 | Page titles |
| H2 | 28px | 600 | 1.3 | Section headers |
| H3 | 22px | 600 | 1.4 | Card titles |
| Body | 16px | 400 | 1.5 | Body text |
| Small | 14px | 400 | 1.5 | Captions |
| Tiny | 12px | 500 | 1.4 | Labels, badges |

---

## Spacing

Using 4px base unit:

| Token | Size | Usage |
|-------|------|-------|
| xs | 4px | Tight gaps |
| sm | 8px | Icon spacing |
| md | 16px | Default padding |
| lg | 24px | Section gaps |
| xl | 32px | Large sections |
| 2xl | 48px | Page margins |
| 3xl | 64px | Hero spacing |

---

## Border Radius

| Token | Size | Usage |
|-------|------|-------|
| sm | 4px | Small buttons, badges |
| md | 8px | Inputs, small cards |
| lg | 12px | Cards, panels |
| xl | 16px | Large cards |
| 2xl | 24px | Modals, feature cards |
| full | 9999px | Pills, avatars |

---

## Shadows

### Light Mode
```css
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.07);
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.1);
```

### Dark Mode
```css
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.4);
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.5);
--shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.5);
```

---

## Component Styles

### Cards
- Rounded corners (lg or xl)
- Subtle shadow in light mode
- Subtle border in dark mode
- Hover: slight lift effect

### Buttons

#### Primary
- Background: Feature accent color
- Text: White
- Hover: Slightly lighter
- Rounded: lg

#### Secondary
- Background: Surface alt
- Text: Primary text
- Border: Border color
- Hover: Slightly darker

#### Ghost
- Background: Transparent
- Text: Accent color
- Hover: Light background tint

### Inputs
- Background: Surface
- Border: Border color (focus: accent)
- Rounded: md
- Padding: md

---

## Iconography

**Source:** Icons8 (subscription)

| Platform | Style |
|----------|-------|
| Web | Fluency |
| iOS | iOS 17 |
| Android | Material Rounded |
| Games | 3D Fluency / Animated |

---

## Motion

### Timing
- **Quick:** 150ms - Hovers, toggles
- **Normal:** 250ms - Transitions
- **Slow:** 400ms - Page transitions, modals

### Easing
- **Default:** `ease-out` - Most interactions
- **Bounce:** `cubic-bezier(0.34, 1.56, 0.64, 1)` - Playful elements

---

## Feature Color Application

### Map Page
- Primary: Sky Blue (`#0EA5E9`)
- Flight markers: Sky Blue
- Selected flight: Brighter blue glow

### Crossings Page
- Primary: Coral/Orange (`#F97316`)
- Crossing cards: Orange accent
- Unread indicator: Orange dot

### Wallet Page
- Primary: Purple (`#A855F7`)
- Badges: Purple gradient headers
- Rarity colors:
  - Common: Gray
  - Uncommon: Green
  - Rare: Blue
  - Epic: Purple
  - Legendary: Gold/Orange gradient

### Games
- Primary: Green (`#22C55E`)
- Points/Score: Green
- Correct answers: Green flash

### Messages
- Primary: Pink (`#EC4899`)
- Chat bubbles: Pink tint
- New message: Pink dot

---

## Dark/Light Mode Toggle

Place in header navigation:
- Sun icon for light mode
- Moon icon for dark mode
- Smooth transition (250ms)
- Persist preference in localStorage

---

## Warm & Friendly Elements

To achieve the warm, approachable feel:

1. **Rounded everything** - Generous border radius
2. **Soft shadows** - Not harsh drop shadows
3. **Friendly copy** - "Hello!" not "Welcome, User"
4. **Micro-animations** - Subtle hover effects, loading spinners
5. **Illustrations** - Consider warm illustrations on empty states
6. **Gradient accents** - Soft gradients for feature highlights
7. **Comfortable spacing** - Don't crowd elements
8. **Human touches** - Wave emoji for greetings, celebratory confetti for achievements
