# Platform Design Guidelines

**Document ID:** DES-001.0
**Last Updated:** 2025-11-27
**Status:** Draft

---

## DES-001.0 - Design Philosophy

### Unified Design Approach

Aerologue targets 5 platforms from shared codebases. Rather than designing separately for each, we design for the **superset of requirements** - implementing the strictest/most feature-rich requirement across all platforms.

```
┌─────────────────────────────────────────────────────────────────┐
│                    DESIGN ONCE, RUN EVERYWHERE                   │
│                                                                  │
│   If Android needs it → Everyone gets it                        │
│   If iOS requires it → Everyone follows it                      │
│   If accessibility demands it → Everyone implements it          │
│                                                                  │
│   Result: Consistent UX, no platform-specific surprises         │
└─────────────────────────────────────────────────────────────────┘
```

### Core Principles

1. **Mobile-First, Desktop-Enhanced** - Design for touch, enhance for mouse/keyboard
2. **Superset Implementation** - Meet the strictest requirement from any platform
3. **Progressive Enhancement** - Core features work everywhere, extras where supported
4. **Consistent Navigation** - Same mental model across all platforms
5. **Accessibility by Default** - WCAG 2.1 AA compliance benefits everyone

---

## DES-002.0 - Platform Matrix

### Target Platforms

| Platform | Technology | Input | Screen Sizes | Primary Context |
|----------|------------|-------|--------------|-----------------|
| Web | React/Vue | Mouse, keyboard, touch | 320px - 4K | Desktop, tablet browser |
| iOS | Flutter | Touch, gestures | 320pt - 428pt | Mobile, on-the-go |
| Android | Flutter | Touch, gestures, back button | 360dp - 840dp | Mobile, on-the-go |
| Windows | Flutter | Mouse, keyboard, touch | 800px - 4K | Desktop, in-flight |
| Unity (Console) | Unity | Touch, controller | Fixed (airline specific) | In-flight entertainment |

### Shared Codebase Strategy

```
┌─────────────────────────────────────────────────────────────────┐
│                         WEB APP                                  │
│                    (React/Vue - BaaS Testing)                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                    Shared Design System
                              │
┌─────────────────────────────────────────────────────────────────┐
│                      FLUTTER APPS                                │
│              (iOS, Android, Windows - Single Codebase)           │
└─────────────────────────────────────────────────────────────────┘
                              │
                    Shared Game Assets
                              │
┌─────────────────────────────────────────────────────────────────┐
│                       UNITY GAMES                                │
│                  (Embedded in all platforms)                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## DES-003.0 - Unified Navigation Pattern

### Navigation Structure (All Platforms)

```
┌─────────────────────────────────────────────────────────────────┐
│  HEADER / APP BAR                                                │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ [←] Back    Title                        [Action] [Menu ≡] ││
│  └─────────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│                       CONTENT AREA                               │
│                                                                  │
│                   (Scrollable, full height)                      │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│  BOTTOM NAVIGATION (Mobile/Tablet)                               │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │   🏠        🔍        🗺️        🎮        👤               ││
│  │  Home    Search     Map      Games    Profile              ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
│  SIDE NAVIGATION (Desktop/Large screens)                         │
│  Transforms to sidebar rail when screen > 1024px                │
└─────────────────────────────────────────────────────────────────┘
```

### Superset Navigation Requirements

| Requirement | Source | Implementation |
|-------------|--------|----------------|
| Back button in header | Android | Always show back button (iOS gesture still works) |
| Bottom navigation | iOS/Android | Use for mobile, transform to side rail on desktop |
| Hardware back support | Android | Handle in all apps (no-op on iOS/Web) |
| Swipe gestures | iOS | Enable everywhere (Android supports too) |
| Keyboard shortcuts | Desktop | Add for power users (ignored on mobile) |
| Tab navigation | Accessibility | Full keyboard nav on all platforms |

### Navigation Behavior

```javascript
// Unified back behavior
function handleBack() {
  if (canGoBack()) {
    navigateBack();
  } else if (isNestedScreen()) {
    navigateToParent();
  } else {
    // At root - platform specific:
    // - Web: do nothing
    // - Mobile: minimize app (don't exit)
    // - Desktop: do nothing
    showExitConfirmation(); // Optional
  }
}
```

---

## DES-004.0 - Responsive Layout Strategy

### Breakpoints (Unified)

| Breakpoint | Width | Layout | Target |
|------------|-------|--------|--------|
| XS | 0 - 599px | Single column, bottom nav | Phone portrait |
| SM | 600 - 904px | Single column, bottom nav | Phone landscape, small tablet |
| MD | 905 - 1239px | Two column, side rail | Tablet, small desktop |
| LG | 1240 - 1439px | Two column, side nav | Desktop |
| XL | 1440px+ | Three column, side nav | Large desktop |

### Layout Adaptation

```
XS/SM (Mobile):
┌─────────────────┐
│     Header      │
├─────────────────┤
│                 │
│     Content     │
│   (Full width)  │
│                 │
├─────────────────┤
│   Bottom Nav    │
└─────────────────┘

MD (Tablet):
┌─────────────────────────┐
│ Rail │     Header       │
├──────┼──────────────────┤
│  🏠  │                  │
│  🔍  │     Content      │
│  🗺️  │   (Full width)   │
│  🎮  │                  │
│  👤  │                  │
└──────┴──────────────────┘

LG/XL (Desktop):
┌─────────────────────────────────────┐
│  Side Nav  │         Header         │
├────────────┼────────────────────────┤
│            │                        │
│  Home      │        Content         │
│  Search    │       (Primary)        │
│  Map       │                        │
│  Games     ├────────────────────────┤
│  Profile   │     Secondary Panel    │
│            │    (Details/Actions)   │
│            │                        │
└────────────┴────────────────────────┘
```

### Touch Targets (Superset)

| Element | Minimum Size | Reason |
|---------|--------------|--------|
| Buttons | 48x48dp | Android requirement, benefits all |
| List items | 48dp height | Touch accessibility |
| Icon buttons | 44x44pt | iOS requirement |
| Spacing between targets | 8dp | Prevent mis-taps |

**Rule**: Use 48x48dp minimum for all interactive elements across all platforms.

---

## DES-005.0 - Input Handling

### Input Method Support (All Platforms)

| Input | Web | iOS | Android | Windows | Unity |
|-------|-----|-----|---------|---------|-------|
| Touch/Tap | ✓ | ✓ | ✓ | ✓ | ✓ |
| Mouse click | ✓ | - | - | ✓ | ✓ |
| Keyboard | ✓ | ✓* | ✓* | ✓ | Limited |
| Gestures (swipe) | ✓ | ✓ | ✓ | ✓ | ✓ |
| Hardware back | - | - | ✓ | - | - |
| Game controller | - | - | - | - | ✓ |

*External keyboard support

### Unified Input Guidelines

1. **Never rely on hover states** - Touch has no hover
   ```css
   /* Bad: Hover-only interaction */
   .button:hover { show-tooltip }

   /* Good: Tap/click alternative */
   .button:hover, .button:focus { show-tooltip }
   .button:active { show-tooltip } /* For touch */
   ```

2. **Always provide tap alternatives to gestures**
   ```
   Swipe to delete → Also show delete button
   Long-press for menu → Also show ⋮ menu icon
   Pinch to zoom → Also show +/- buttons
   ```

3. **Support keyboard navigation**
   ```
   All interactive elements focusable
   Logical tab order
   Enter/Space to activate
   Escape to close modals
   Arrow keys for lists
   ```

4. **Handle hardware back (Android)**
   ```dart
   // Flutter: WillPopScope
   WillPopScope(
     onWillPop: () async {
       if (canGoBack) {
         goBack();
         return false; // Don't exit app
       }
       return true; // Allow default behavior
     },
     child: ...
   )
   ```

---

## DES-006.0 - Visual Design System

### Colors

```
Primary Palette (Consistent across platforms):
├── Primary: #1976D2 (Aviation Blue)
├── Primary Light: #63A4FF
├── Primary Dark: #004BA0
├── Secondary: #FF6F00 (Alert Orange)
├── Background: #FFFFFF (Light) / #121212 (Dark)
├── Surface: #F5F5F5 (Light) / #1E1E1E (Dark)
├── Error: #D32F2F
├── Success: #388E3C
└── Text: #212121 (Light) / #FFFFFF (Dark)

Contrast Requirements (WCAG AA):
├── Normal text: 4.5:1 minimum
├── Large text: 3:1 minimum
└── UI components: 3:1 minimum
```

### Typography

```
Font Stack (Platform-adaptive):
├── iOS: SF Pro (system)
├── Android: Roboto (system)
├── Windows: Segoe UI (system)
├── Web: Inter, system-ui fallback
└── Unity: Embedded (Roboto)

Type Scale:
├── Display: 57sp / 57pt
├── Headline Large: 32sp
├── Headline Medium: 28sp
├── Headline Small: 24sp
├── Title Large: 22sp
├── Title Medium: 16sp (semi-bold)
├── Body Large: 16sp
├── Body Medium: 14sp
├── Label Large: 14sp (medium)
├── Label Medium: 12sp
└── Caption: 12sp
```

### Iconography

```
Icon System:
├── Style: Outlined (primary), Filled (selected state)
├── Size: 24dp standard, 20dp compact, 40dp featured
├── Touch target: 48dp (icon centered within)
└── Source: Material Icons (consistent cross-platform)

Platform-specific icons (use system):
├── iOS: SF Symbols for share, settings, etc.
├── Android: Material Icons
└── Windows: Segoe MDL2 Assets (optional)

Rule: For core features, use Material Icons everywhere for consistency.
      For platform actions (share, etc.), use platform-native icons.
```

### Spacing

```
Spacing Scale (8dp base):
├── 4dp: Compact spacing (within components)
├── 8dp: Related elements
├── 16dp: Section spacing
├── 24dp: Group spacing
├── 32dp: Major section breaks
└── 48dp: Screen-level padding

Safe Areas:
├── iOS: Respect safe area insets (notch, home indicator)
├── Android: Account for status bar, nav bar
├── Windows: Standard window chrome
└── Unity: Airline-specific bezels
```

---

## DES-007.0 - Component Library

### Core Components (Build Once)

| Component | Behavior | Notes |
|-----------|----------|-------|
| Button | Touch: ripple, Click: highlight | 48dp min height |
| TextField | Platform keyboard, validation | Clear button always visible |
| Card | Elevation, tap feedback | Consistent shadow |
| List Item | Tap, swipe actions | 48dp min height |
| Bottom Sheet | Drag to dismiss | Handle at top |
| Dialog/Modal | Centered, scrim, trap focus | Escape to close |
| Snackbar/Toast | Auto-dismiss, action | Bottom placement |
| App Bar | Back, title, actions | Fixed or scroll |
| Navigation | Bottom (mobile), Side (desktop) | Adaptive |
| Map | Pan, zoom, markers | Touch + mouse |

### Platform-Specific Adaptations

```
Component: Date Picker
├── iOS: Use native UIDatePicker (expected UX)
├── Android: Use native MaterialDatePicker
├── Windows: Custom or native
└── Web: Custom (html5 date input as fallback)

Component: Share Sheet
├── iOS: UIActivityViewController
├── Android: Intent.ACTION_SEND
├── Windows: Windows.ApplicationModel.DataTransfer
└── Web: navigator.share() or custom

Rule: Use platform-native for system-level interactions,
      custom components for app-specific UI.
```

---

## DES-008.0 - Offline & Loading States

### Loading States (Unified)

```
Loading Patterns:
├── Skeleton screens: Preferred for content areas
├── Spinner: For actions (buttons, submit)
├── Progress bar: For determinate progress
└── Pull-to-refresh: Mobile content refresh

Skeleton Example:
┌─────────────────────────────────────┐
│ [████████████]           [██]       │  ← Header skeleton
├─────────────────────────────────────┤
│ [███████████████████████████]       │
│ [██████████████████]                │  ← Content skeleton
│ [████████████████████████]          │
└─────────────────────────────────────┘
```

### Offline Behavior

```
Offline Strategy:
├── Show cached data when available
├── Indicate stale data with timestamp
├── Queue actions for sync when online
├── Show clear offline indicator
└── Graceful degradation of features

Offline Indicator:
┌─────────────────────────────────────┐
│ ⚠️ You're offline. Some features    │
│    may be limited.            [×]   │
└─────────────────────────────────────┘
```

---

## DES-009.0 - Animation & Motion

### Principles

1. **Purposeful** - Animation should inform, not decorate
2. **Fast** - 200-300ms for most transitions
3. **Consistent** - Same easing curves throughout
4. **Respectful** - Honor reduced motion preferences

### Duration Guidelines

| Animation Type | Duration | Easing |
|----------------|----------|--------|
| Micro (button feedback) | 100ms | ease-out |
| Small (fade, scale) | 200ms | ease-out |
| Medium (slide, expand) | 300ms | ease-in-out |
| Large (page transition) | 400ms | ease-in-out |
| Complex (orchestrated) | 500ms+ | custom |

### Reduced Motion

```css
/* Respect user preference */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

```dart
// Flutter: Check for reduced motion
MediaQuery.of(context).disableAnimations
```

---

## DES-010.0 - Platform-Specific Considerations

### iOS Specific
- Use SF Symbols where appropriate
- Support Dynamic Type (text scaling)
- Respect safe areas (notch, home indicator)
- Support dark mode
- Swipe-from-edge for back navigation (don't block)

### Android Specific
- Handle hardware back button
- Support Material You dynamic colors (Android 12+)
- Edge-to-edge design (draw behind system bars)
- Support predictive back gesture (Android 14+)
- Respect font scaling

### Windows Specific
- Support window resizing gracefully
- Handle DPI scaling (100%, 125%, 150%, etc.)
- Keyboard shortcuts for power users
- Right-click context menus
- Respect system light/dark mode

### Web Specific
- Responsive from 320px to 4K
- Support browser zoom (up to 200%)
- Handle browser back/forward
- Progressive Web App (PWA) capable
- Print stylesheet for key pages

### Unity (In-Flight Console) Specific
- Fixed resolution (airline dependent)
- Limited input (touch, maybe controller)
- Embedded in airline IFE system
- May have restricted network
- Must handle interruptions (announcements)

---

## DES-011.0 - Accessibility Superset

All accessibility requirements apply to ALL platforms:

| Requirement | Standard | Implementation |
|-------------|----------|----------------|
| Color contrast | WCAG AA (4.5:1) | All platforms |
| Touch targets | 48x48dp | All platforms |
| Screen reader | Full support | All platforms |
| Keyboard nav | Complete | All platforms |
| Focus indicators | Visible | All platforms |
| Text scaling | Up to 200% | All platforms |
| Reduced motion | Respect preference | All platforms |
| Alt text | All images | All platforms |

---

## DES-012.0 - Implementation Checklist

Before releasing any screen/feature, verify:

```
□ Layout
  □ Works at all breakpoints (XS to XL)
  □ No horizontal scroll on mobile
  □ Touch targets ≥ 48dp
  □ Safe areas respected

□ Input
  □ Works with touch
  □ Works with mouse
  □ Works with keyboard
  □ Hardware back handled (Android)

□ Visual
  □ Light mode correct
  □ Dark mode correct
  □ Color contrast passes
  □ Text scales properly

□ Accessibility
  □ Screen reader tested
  □ Focus order logical
  □ Alt text present
  □ No motion without purpose

□ States
  □ Loading state defined
  □ Empty state defined
  □ Error state defined
  □ Offline state handled
```

---

## References

- [UX-001.0](user-flows.md) - User Flows
- [OPS-005.0](operations.md#ops-0050---accessibility-requirements) - Accessibility Requirements
- Material Design 3: https://m3.material.io/
- Apple HIG: https://developer.apple.com/design/human-interface-guidelines/
- Fluent Design: https://fluent2.microsoft.design/
