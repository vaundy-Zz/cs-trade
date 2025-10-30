# UI Shell - Product Intelligence Dashboard

A modern, accessible, and responsive dashboard shell built with Next.js 14, TypeScript, Tailwind CSS, and shadcn/ui.

## Features

### 🎨 Design System
- **Design Tokens**: Comprehensive color palette, typography, and spacing system defined in `tailwind.config.ts`
- **Theme Support**: Light, dark, and system theme with SSR-compatible `next-themes`
- **Custom Branding**: Easily customizable color scheme using CSS variables

### 🧩 Components

#### Layout Components
- **AppShell**: Main application wrapper with responsive navigation
- **Header**: Sticky header with theme toggle and navigation
- **Sidebar**: Desktop sidebar with navigation links
- **MobileSidebar**: Mobile-friendly drawer navigation with backdrop

#### UI Primitives (shadcn/ui based)
- **Button**: Versatile button component with multiple variants
- **Badge**: Status and label indicators
- **Card**: Content containers with header, content, and footer sections
- **Table**: Accessible data tables
- **Skeleton**: Loading state placeholders

#### Custom Primitives
- **StatCard**: KPI and metric display cards with trend indicators
- **ChartWrapper**: Container for chart visualizations with consistent styling
- **LoadingCard/LoadingTable/LoadingStats**: Pre-built loading states

### ♿ Accessibility
- Semantic HTML5 elements (`nav`, `main`, `aside`, `section`, `header`)
- ARIA roles, labels, and live regions
- Keyboard navigation support (Tab, Escape, Arrow keys)
- Focus management and visible focus indicators
- Screen reader friendly content

### 📱 Responsive Design
- Mobile-first approach
- Breakpoints: `sm`, `md`, `lg`, `xl`, `2xl`
- Mobile sidebar with backdrop and animations
- Touch-friendly interactive elements

### 🔍 SEO
- Comprehensive metadata configuration
- Open Graph and Twitter Card tags
- Structured head elements
- Semantic HTML structure
- Viewport configuration

### ⚡ Performance
- Server-side rendering (SSR)
- React Server Components by default
- Client components only when necessary
- CSS-in-JS avoided for better performance
- Optimized fonts with `next/font`

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Build

```bash
npm run build
npm start
```

### Type Checking

```bash
npm run type-check
```

## Project Structure

```
├── app/
│   ├── layout.tsx           # Root layout with providers
│   ├── page.tsx             # Homepage with dashboard
│   ├── analytics/page.tsx   # Analytics page
│   ├── settings/page.tsx    # Settings page
│   └── globals.css          # Global styles and CSS variables
├── components/
│   ├── layout/
│   │   ├── app-shell.tsx    # Main layout wrapper
│   │   ├── header.tsx       # Top navigation bar
│   │   ├── sidebar.tsx      # Desktop sidebar
│   │   └── mobile-sidebar.tsx # Mobile navigation drawer
│   ├── primitives/
│   │   ├── stat-card.tsx    # KPI display cards
│   │   ├── chart-wrapper.tsx # Chart container
│   │   └── loading-card.tsx # Loading skeletons
│   ├── ui/
│   │   ├── button.tsx       # Button component
│   │   ├── badge.tsx        # Badge component
│   │   ├── card.tsx         # Card components
│   │   ├── table.tsx        # Table components
│   │   └── skeleton.tsx     # Skeleton loader
│   ├── theme-provider.tsx   # Theme context provider
│   └── theme-toggle.tsx     # Theme switcher component
├── lib/
│   └── utils.ts             # Utility functions (cn, etc.)
├── tailwind.config.ts       # Tailwind configuration
└── tsconfig.json            # TypeScript configuration
```

## Design Tokens

### Colors
All colors use HSL values for easy theme customization:
- `--primary`: Brand primary color
- `--secondary`: Secondary/accent color
- `--muted`: Subdued backgrounds
- `--accent`: Hover states
- `--destructive`: Error/warning states

### Typography
- Font family: Inter (sans-serif), JetBrains Mono (monospace)
- Scale: xs, sm, base, lg, xl, 2xl, 3xl, 4xl, 5xl, 6xl
- Line heights optimized for readability

### Spacing
- Standard scale: 0-96 in 4px increments
- Extended: 128, 144 for large layouts
- Container padding: responsive (2rem standard, varies by breakpoint)

### Border Radius
- `--radius`: Base radius (0.5rem by default)
- `lg`, `md`, `sm` variants derived from base

## Theming

Modify theme colors in `app/globals.css`:

```css
:root {
  --primary: 221.2 83.2% 53.3%;  /* HSL format */
  /* ... other tokens ... */
}

.dark {
  --primary: 217.2 91.2% 59.8%;
  /* ... dark theme tokens ... */
}
```

## Accessibility Guidelines

### Keyboard Navigation
- `Tab` / `Shift+Tab`: Navigate between interactive elements
- `Enter` / `Space`: Activate buttons and links
- `Escape`: Close modals, menus, and mobile sidebar
- Arrow keys: Navigate within menus (where applicable)

### Screen Readers
- All interactive elements have accessible labels
- Images and icons include `aria-hidden` or alt text
- Loading states use `aria-live="polite"` and `aria-busy`
- Form inputs have associated labels

### Focus Management
- Visible focus indicators on all interactive elements
- Focus trapped in modals and mobile sidebar
- Skip to main content (can be added)

## Component Documentation

### StatCard
Display key metrics with optional trend indicators.

```tsx
<StatCard
  title="Total Revenue"
  value="$48,532.89"
  description="from previous month"
  icon={DollarSign}
  trend={{ value: 12.5, isPositive: true }}
/>
```

### ChartWrapper
Consistent container for chart visualizations.

```tsx
<ChartWrapper
  title="Revenue Growth"
  description="Monthly revenue trend"
  trend="up"
  trendLabel="+18%"
  footer={<Button>View Details</Button>}
>
  {/* Chart component */}
</ChartWrapper>
```

### Button
Versatile button with multiple variants and sizes.

```tsx
<Button variant="default" size="lg">
  Click me
</Button>
```

Variants: `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`
Sizes: `default`, `sm`, `lg`, `icon`

### Badge
Status indicators and labels.

```tsx
<Badge variant="default">Active</Badge>
```

Variants: `default`, `secondary`, `destructive`, `outline`

## Customization

### Adding New Pages
1. Create a new file in `app/[page-name]/page.tsx`
2. Add route to sidebar in `components/layout/sidebar.tsx`
3. Export a default component

### Adding New Components
1. Create component in appropriate directory (`ui`, `primitives`, or `layout`)
2. Follow existing patterns for props and styling
3. Use `cn()` utility for className merging
4. Add proper TypeScript types

### Modifying Branding
1. Update logo in `components/layout/header.tsx`
2. Modify color scheme in `app/globals.css`
3. Update metadata in `app/layout.tsx`
4. Replace favicons in `public/` directory

## Browser Support
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License
MIT
