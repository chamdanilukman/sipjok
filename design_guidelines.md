# Design Guidelines - SIPJOK Responsive Navigation & Layout

## Design Approach
**System**: Material Design with mobile-first responsive principles
**Rationale**: Utility-focused application requiring consistent, predictable navigation across all device sizes with emphasis on accessibility and touch-friendly interactions.

## Breakpoint System
```
Mobile: 320px - 767px
Tablet: 768px - 1024px  
Desktop: 1025px+
```

## Navigation Design

### Mobile (320px - 767px)
- **Hamburger Menu**: Top-right corner, 44px × 44px tap target
- **Slide-in Drawer**: Full-height overlay navigation from right side
- **Menu Items**: Full-width, 56px minimum height for touch targets
- **Logo**: Left-aligned, max-height 40px
- **Overlay**: Semi-transparent backdrop when drawer is open

### Tablet (768px - 1024px)
- **Hybrid Approach**: Condensed horizontal menu OR hamburger depending on item count
- **If 5+ items**: Use hamburger menu
- **If <5 items**: Horizontal navigation with adequate spacing (24px between items)
- **Logo**: Left-aligned, max-height 48px

### Desktop (1025px+)
- **Horizontal Navigation Bar**: Full-width, 64px height
- **Menu Items**: Horizontal layout with 32px spacing
- **Logo**: Left-aligned, max-height 56px
- **Dropdowns**: If needed, appear below parent with smooth transition

## Typography

### Font System
**Primary**: Inter (Google Fonts)
**Weights**: 400 (Regular), 500 (Medium), 600 (Semi-bold)

### Hierarchy
- **Nav Links Mobile**: 16px, weight 500
- **Nav Links Desktop**: 15px, weight 500
- **Headings H1**: 32px mobile / 48px desktop, weight 600
- **Body Text**: 16px, weight 400, line-height 1.6

## Layout & Spacing System

### Spacing Units (Tailwind)
**Primary units**: 2, 4, 6, 8, 12, 16, 24
- Navigation padding: p-4 mobile, p-6 desktop
- Section spacing: py-12 mobile, py-16 tablet, py-24 desktop
- Container max-width: max-w-7xl with px-4 on mobile

### Grid System
- **Mobile**: Single column, full-width
- **Tablet**: 2-column grid where appropriate (grid-cols-2)
- **Desktop**: 3-4 column grid for cards/features (grid-cols-3 lg:grid-cols-4)

## Component Library

### Navigation Components
1. **Mobile Menu Button**: 
   - 44px × 44px touch target
   - Animated hamburger to X transition
   - Fixed position top-right

2. **Navigation Drawer**:
   - Full viewport height
   - 280px width
   - Smooth slide transition (300ms ease-in-out)
   - Stacked vertical menu items

3. **Desktop Nav Bar**:
   - Sticky position on scroll
   - Horizontal flex layout with space-between
   - Subtle shadow on scroll (shadow-sm)

4. **Menu Items**:
   - Clear hover states (subtle background change)
   - Active state indicator (bottom border or background)
   - Minimum 44px height on all devices

### Content Containers
- **Full-width sections**: w-full with inner max-w-7xl
- **Content sections**: max-w-6xl for main content
- **Forms**: max-w-2xl for optimal usability

## Interaction Patterns

### Touch Optimization
- Minimum tap targets: 44px × 44px
- Adequate spacing between interactive elements: 8px minimum
- No hover-dependent functionality on touch devices
- Swipe gestures for drawer close (optional enhancement)

### Transitions
- Navigation drawer: 300ms cubic-bezier(0.4, 0, 0.2, 1)
- Menu item hover: 150ms ease
- Page transitions: Minimal, focus on instant feedback

## Accessibility Requirements
- **Keyboard Navigation**: Full tab order through all menu items
- **Focus Indicators**: Visible 2px outline on focused elements
- **ARIA Labels**: Proper labeling for hamburger menu and navigation regions
- **Screen Reader**: Semantic HTML with nav, button, and ul/li structure
- **Skip Links**: "Skip to main content" for keyboard users

## Images
- **Hero Section**: Not required for this utility-focused application
- **Icons**: Use Heroicons library via CDN for menu icons and UI elements
- **Logo**: SVG format, responsive sizing based on breakpoint

## Critical Implementation Notes
- **z-index management**: Navigation drawer (z-50), overlay backdrop (z-40)
- **Body scroll lock**: Prevent background scrolling when mobile menu is open
- **Smooth scrolling**: For anchor links within the page
- **Performance**: Lazy load non-critical navigation elements on mobile