# UI Shell Architecture

## Overview
This is a modern Next.js 14 application built with TypeScript, Tailwind CSS, and shadcn/ui components. The architecture follows best practices for accessibility, performance, and maintainability.

## Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v3
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Theme Management**: next-themes
- **Icons**: Lucide React

## Project Structure

```
/home/engine/project/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout with providers and metadata
│   ├── page.tsx                  # Homepage (Dashboard)
│   ├── globals.css               # Global styles and CSS variables
│   ├── analytics/page.tsx        # Analytics page
│   ├── components-demo/page.tsx  # Component showcase
│   ├── projects/page.tsx         # Projects page
│   ├── reporting/page.tsx        # Reporting page
│   ├── settings/page.tsx         # Settings page
│   ├── teams/page.tsx            # Teams page
│   └── pricing/page.tsx          # Pricing page
│
├── components/
│   ├── layout/                   # Layout components
│   │   ├── app-shell.tsx         # Main layout wrapper
│   │   ├── header.tsx            # Top navigation bar
│   │   ├── sidebar.tsx           # Desktop sidebar navigation
│   │   └── mobile-sidebar.tsx   # Mobile drawer navigation
│   │
│   ├── primitives/               # Custom reusable primitives
│   │   ├── chart-wrapper.tsx    # Chart container component
│   │   ├── loading-card.tsx     # Loading state skeletons
│   │   └── stat-card.tsx        # KPI display cards
│   │
│   ├── ui/                       # shadcn/ui base components
│   │   ├── badge.tsx             # Badge component
│   │   ├── button.tsx            # Button with variants
│   │   ├── card.tsx              # Card components
│   │   ├── skeleton.tsx          # Loading skeleton
│   │   └── table.tsx             # Table components
│   │
│   ├── theme-provider.tsx        # Theme context provider
│   └── theme-toggle.tsx          # Theme switcher component
│
├── lib/
│   └── utils.ts                  # Utility functions (cn, formatDate, etc.)
│
├── public/                       # Static assets
│   ├── icon.svg                  # App icon
│   └── og-image.svg              # Open Graph image
│
├── tailwind.config.ts            # Tailwind configuration
├── tsconfig.json                 # TypeScript configuration
├── next.config.js                # Next.js configuration
├── postcss.config.js             # PostCSS configuration
├── package.json                  # Dependencies and scripts
├── .eslintrc.json                # ESLint configuration
├── .gitignore                    # Git ignore patterns
├── README.md                     # Project documentation
├── COMPONENTS.md                 # Component documentation
└── ARCHITECTURE.md               # This file
```

## Design System

### Design Tokens
All design tokens are defined in `tailwind.config.ts` and use CSS variables for theming.

**Color System**:
- Uses HSL format for easy manipulation
- Semantic color names (primary, secondary, muted, accent, destructive)
- Dark mode variants defined in `globals.css`

**Typography**:
- Font families: Inter (sans), JetBrains Mono (mono)
- Scale: xs (0.75rem) → 6xl (3.75rem)
- Line heights optimized for readability

**Spacing**:
- Standard scale: 0-96 (4px increments)
- Extended: 128, 144 for large layouts
- Consistent container padding

**Border Radius**:
- Configurable via `--radius` CSS variable (default: 0.5rem)
- Variants: lg, md, sm

### Theme Support
- Light and dark themes
- System preference detection
- SSR-compatible (no flash of unstyled content)
- CSS variable-based for instant theme switching

## Layout Architecture

### AppShell Pattern
The `AppShell` component provides the main layout structure:
- Responsive header (sticky)
- Desktop sidebar (sticky, hidden on mobile)
- Mobile sidebar (drawer with backdrop)
- Main content area (scrollable)
- Skip to main content link (accessibility)

### Responsive Breakpoints
```
sm:  640px
md:  768px
lg:  1024px
xl:  1280px
2xl: 1400px
```

## Component Patterns

### shadcn/ui Integration
Components follow shadcn/ui patterns:
- Copy-paste friendly (no package dependencies)
- Built on Radix UI primitives
- Fully typed with TypeScript
- Customizable via `cn()` utility

### Component Variants
Using `class-variance-authority` for component variants:
```tsx
const buttonVariants = cva(
  "base-classes",
  {
    variants: {
      variant: { default: "...", outline: "..." },
      size: { default: "...", sm: "...", lg: "..." }
    }
  }
)
```

### Composition Pattern
Components are composable:
```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>{/* Content */}</CardContent>
  <CardFooter>{/* Actions */}</CardFooter>
</Card>
```

## Accessibility

### Semantic HTML
- Uses HTML5 semantic elements (`header`, `nav`, `main`, `aside`, `section`)
- Proper heading hierarchy (h1 → h6)
- Landmark roles for major sections

### ARIA Support
- ARIA labels on interactive elements
- ARIA roles for custom widgets
- Live regions for dynamic content (`aria-live`, `aria-busy`)
- State indicators (`aria-expanded`, `aria-selected`)

### Keyboard Navigation
- Tab order follows visual order
- Focus indicators visible (ring-2)
- Escape key closes modals/menus
- Skip to main content link
- All interactive elements keyboard accessible

### Screen Reader Support
- Descriptive labels
- Hidden decorative elements (`aria-hidden`)
- Form labels properly associated
- Error messages descriptive

## SEO

### Metadata
Configured in `app/layout.tsx`:
- Title templates
- Descriptions
- Open Graph tags
- Twitter Card tags
- Structured data ready

### Performance
- Server-side rendering by default
- React Server Components
- Optimized fonts (`next/font`)
- Image optimization (`next/image`)

## Theming

### Light Theme
```css
:root {
  --primary: 221.2 83.2% 53.3%;
  --background: 0 0% 100%;
  /* ... more tokens ... */
}
```

### Dark Theme
```css
.dark {
  --primary: 217.2 91.2% 59.8%;
  --background: 222.2 84% 4.9%;
  /* ... more tokens ... */
}
```

### Customization
To customize the theme:
1. Update CSS variables in `app/globals.css`
2. Modify Tailwind config if adding new tokens
3. Theme automatically applies to all components

## Development Workflow

### Getting Started
```bash
npm install       # Install dependencies
npm run dev       # Start dev server (http://localhost:3000)
npm run build     # Production build
npm run type-check # TypeScript validation
```

### Adding Components
1. Create component file in appropriate directory
2. Follow existing patterns (props, styling, accessibility)
3. Use TypeScript for type safety
4. Document in COMPONENTS.md

### Adding Pages
1. Create file in `app/[route]/page.tsx`
2. Add route to sidebar navigation
3. Update metadata if needed

## Performance Considerations

### Server Components
- All components are Server Components by default
- Client Components marked with `"use client"`
- Minimizes JavaScript sent to client

### Styling
- Tailwind for zero-runtime CSS
- No CSS-in-JS overhead
- Critical CSS inlined automatically

### Code Splitting
- Automatic route-based splitting
- Dynamic imports for heavy components
- React.lazy() for client components

## Browser Support
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Future Enhancements
- [ ] Add more chart libraries integration
- [ ] Implement form components
- [ ] Add more table features (sorting, filtering)
- [ ] Add toast notifications
- [ ] Add modal/dialog components
- [ ] Add dropdown menu components
- [ ] Add tabs component
- [ ] Implement data fetching patterns
- [ ] Add loading UI for async routes
- [ ] Add error boundaries
- [ ] Implement authentication patterns

## Best Practices

### Code Style
- Use TypeScript for all files
- Use `cn()` for className merging
- Prefer composition over inheritance
- Keep components focused and small
- Extract reusable logic to hooks

### Accessibility
- Test with keyboard only
- Test with screen reader
- Verify color contrast
- Ensure touch targets are 44x44px minimum
- Add loading states for async operations

### Performance
- Use Server Components when possible
- Lazy load heavy components
- Optimize images
- Minimize client JavaScript
- Use React Suspense for data fetching

## Testing Strategy
(To be implemented)
- Unit tests: Jest + React Testing Library
- E2E tests: Playwright
- Accessibility tests: axe-core
- Visual regression: Chromatic/Percy
