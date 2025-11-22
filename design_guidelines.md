# Design Guidelines: Pukis Monitoring App

## Design Approach Documentation

**Selected Approach**: Design System (Material Design inspired with Tailwind implementation)

**Justification**: This is a utility-focused, information-dense business application where efficiency, data clarity, and mobile usability are paramount. A systematic approach ensures consistency across data entry forms, dashboards, and reports.

**Key Design Principles**:
- Mobile-first: Prioritize touch-friendly inputs and readable data on small screens
- Data clarity: Clear visual hierarchy for numbers, metrics, and comparisons
- Efficiency: Minimize taps/clicks for daily data entry workflows
- Trust: Professional appearance that instills confidence in data accuracy

---

## Core Design Elements

### A. Typography

**Font Families**:
- Primary: Inter (Google Fonts) - for all UI text, data, and forms
- Monospace: JetBrains Mono - for currency values and numeric displays

**Hierarchy**:
- Page Headers: text-2xl md:text-3xl font-bold
- Section Titles: text-lg md:text-xl font-semibold
- Card Headers: text-base font-semibold
- Body Text: text-sm md:text-base font-normal
- Data Values (Revenue, GM): text-xl md:text-2xl font-bold font-mono
- Labels: text-sm font-medium text-gray-600
- Helper Text: text-xs text-gray-500

### B. Layout System

**Spacing Primitives**: Use Tailwind units of **2, 4, 6, 8, 12, 16** for consistency
- Component padding: p-4 md:p-6
- Section spacing: space-y-6 md:space-y-8
- Form field gaps: gap-4
- Card padding: p-6
- Page margins: px-4 md:px-6 lg:px-8

**Grid System**:
- Desktop dashboards: grid-cols-1 md:grid-cols-2 lg:grid-cols-4 for metric cards
- Forms: Single column on mobile, max-w-2xl centered
- Outlet comparison: grid-cols-1 md:grid-cols-2 lg:grid-cols-3

**Container Strategy**:
- Main content: max-w-7xl mx-auto
- Forms: max-w-2xl mx-auto
- Dashboard cards: w-full with responsive grid

### C. Component Library

**Navigation**:
- Top navigation bar with logo, outlet selector dropdown, date picker, user menu
- Fixed on mobile, sticky on desktop
- Height: h-16
- Bottom tab bar on mobile for main sections: Input, Dashboard Harian, Dashboard MTD, Outlets

**Forms**:
- Input fields: Outlined style with label above, focus ring on interaction
- Currency inputs: Right-aligned text, prefix "Rp" label outside input
- Number steppers: Large touch targets (min-h-12) for mobile
- Date picker: Calendar popup with quick select for today
- Field groupings: Payment methods grouped with subtle border, p-4, rounded-lg, bg-gray-50

**Metric Cards**:
- Card structure: White background, rounded-lg, shadow-sm, p-6
- Label at top (text-sm text-gray-600)
- Large numeric value (text-2xl font-bold font-mono)
- Optional trend indicator (small arrow + percentage)
- Green for positive GM, red for negative (if applicable)

**Dashboard Components**:
- Outlet comparison table: Sticky header, alternating row backgrounds, right-aligned numbers
- Charts: Use Chart.js with subtle gridlines, brand accent for primary line
- Summary cards: Larger size (p-8) with icon, metric, and comparison text
- WhatsApp export: Card with formatted preview, "Copy to Clipboard" button with icon

**Data Display**:
- Tables: Minimal borders, zebra striping on rows, font-mono for numbers
- Status badges: Rounded-full px-3 py-1, text-xs font-medium
- Time display: Monospace font for consistency
- Empty states: Centered icon + message + action button

**Buttons**:
- Primary CTA: Solid background, px-6 py-3, rounded-lg, font-semibold
- Secondary: Outlined style, same padding
- Icon buttons: Square (w-10 h-10), rounded-lg, icon centered
- Submit/Save: Full width on mobile, sticky bottom on scroll

**Overlays**:
- Modals: Centered, max-w-lg, p-6, rounded-xl
- Drawer (mobile): Slide from bottom for filters/settings, rounded-t-2xl
- Toasts: Top-right on desktop, top-center on mobile, auto-dismiss

### D. Animations

**Minimal Animations Only**:
- Button press: Scale down slightly (scale-95) on active state
- Card hover: Subtle shadow increase (transition-shadow)
- Data updates: Fade in new values (fade-in 200ms)
- No scroll animations, no complex transitions

---

## Images

**No Hero Images**: This is a functional business application, not a marketing site.

**Icon Usage**:
- Use Heroicons (outline for navigation, solid for status indicators)
- Payment method icons: Include recognizable logos (QRIS, Grab, GoFood, Shopee, TikTok) as small inline icons (w-5 h-5) next to input fields
- Dashboard icons: Revenue (currency), Pukis sold (shopping bag), GM (trending up), Sold out (clock)

**Empty State Illustrations**: Simple line illustrations for "No data yet" states, centered in cards

---

## Special Considerations

**Outlet Selector**: Prominent dropdown in top navigation with outlet name + live status indicator (open/closed based on time)

**WhatsApp Summary Card**: Monospace font for the entire preview block, light background (bg-green-50), copy button with clipboard icon

**MTD Period Indicator**: Clear visual badge showing current MTD period (e.g., "10 Jan - 10 Feb") in dashboard header

**Mobile Input Optimization**: Large touch targets (min-h-12), numeric keyboards auto-triggered, auto-save indicators

**Responsive Behavior**: Stack metric cards vertically on mobile, horizontal scroll for comparison tables if needed