# Aerologue Icons

Icons sourced from **Icons8** (subscription).

## Folder Structure

```
/icons
├── /web          # Fluency style - for web app
├── /ios          # iOS style - for iOS app (Flutter)
├── /android      # Material style - for Android app (Flutter)
└── /game         # 3D Fluency / Animated - for Unity games
```

## Icon Styles by Platform

| Folder | Icons8 Style | Platform | Notes |
|--------|--------------|----------|-------|
| `/web` | Fluency | Next.js web app | Modern, colorful |
| `/ios` | iOS 17 | Flutter iOS build | Apple design language |
| `/android` | Material Rounded | Flutter Android build | Google design language |
| `/game` | 3D Fluency / Lottie | Unity WebGL & mobile | Engaging for games |

## Required Icons

### Core Navigation
- [ ] home
- [ ] map
- [ ] plane / airplane
- [ ] compass
- [ ] search
- [ ] menu

### Flight Related
- [ ] takeoff
- [ ] landing
- [ ] altitude
- [ ] speed
- [ ] heading / direction

### Crossings & Social
- [ ] crossing / exchange
- [ ] message / chat
- [ ] wave / greeting
- [ ] notification / bell
- [ ] user / profile

### Wallet & Gamification
- [ ] wallet
- [ ] badge / achievement
- [ ] trophy
- [ ] star
- [ ] gem / collectible
- [ ] gift

### Actions
- [ ] add / plus
- [ ] close / x
- [ ] settings / gear
- [ ] share
- [ ] filter
- [ ] sort

### Status
- [ ] check / success
- [ ] error / warning
- [ ] info
- [ ] loading

## Download Instructions

1. Go to https://icons8.com
2. Search for icon name
3. Select appropriate style for platform
4. Download as SVG (or PNG for game assets)
5. Place in correct folder
6. Use consistent naming (lowercase, hyphens)

## Usage in Code

### Next.js (Web)
```tsx
import Image from 'next/image';

<Image src="/icons/web/airplane.svg" alt="airplane" width={24} height={24} />
```

### Flutter (Platform-specific)
```dart
String getIconPath(String name) {
  if (Platform.isIOS) {
    return 'assets/icons/ios/$name.svg';
  } else {
    return 'assets/icons/android/$name.svg';
  }
}
```

### Unity (Game)
```csharp
// Load from Resources/Icons/
Sprite icon = Resources.Load<Sprite>("Icons/badge");
```

## License

Icons8 subscription covers usage in this project.
Attribution not required with paid subscription.
