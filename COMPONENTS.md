# Component Documentation

## Table of Contents
- [Layout Components](#layout-components)
- [UI Primitives](#ui-primitives)
- [Custom Primitives](#custom-primitives)
- [Accessibility Features](#accessibility-features)

## Layout Components

### AppShell
Main application wrapper that provides the overall layout structure.

**Location**: `components/layout/app-shell.tsx`

**Features**:
- Responsive layout with sidebar and main content area
- Mobile sidebar with backdrop and animations
- Skip to main content link for accessibility
- Manages mobile sidebar state

**Usage**:
```tsx
import { AppShell } from "@/components/layout/app-shell";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
```

**Accessibility**:
- Skip to main content link (visible on keyboard focus)
- Semantic HTML elements (`main`, `aside`, `header`)
- ARIA labels for main content area
- Focus management

---

### Header
Sticky top navigation bar with theme toggle and navigation links.

**Location**: `components/layout/header.tsx`

**Props**:
- `onMobileMenuToggle?: () => void` - Callback for mobile menu button

**Features**:
- Sticky positioning with backdrop blur
- Shadow on scroll
- Responsive navigation (hidden on mobile, visible on desktop)
- Theme toggle integration
- Logo and brand name

**Usage**:
```tsx
<Header onMobileMenuToggle={handleToggle} />
```

**Accessibility**:
- Semantic `header` with `role="banner"`
- `nav` element with `role="navigation"`
- Focus indicators on all interactive elements
- ARIA label for mobile menu toggle

---

### Sidebar
Desktop navigation sidebar with primary navigation links.

**Location**: `components/layout/sidebar.tsx`

**Props**:
- `isMobile?: boolean` - Render in mobile mode
- `onNavigate?: () => void` - Callback after navigation (useful for closing mobile sidebar)

**Features**:
- Active state highlighting
- Icon + text navigation items
- Bottom promotional section
- Sticky positioning on desktop

**Usage**:
```tsx
<Sidebar />
<Sidebar isMobile onNavigate={handleClose} />
```

**Accessibility**:
- Semantic `nav` with `role="navigation"`
- ARIA label "Primary"
- Active state indicated via visual styling
- Keyboard navigable

---

### MobileSidebar
Mobile drawer navigation with backdrop.

**Location**: `components/layout/mobile-sidebar.tsx`

**Props**:
- `isOpen: boolean` - Controls visibility
- `onClose: () => void` - Callback to close sidebar

**Features**:
- Slide-in animation
- Backdrop overlay
- Close button
- Body scroll lock when open
- Escape key to close

**Usage**:
```tsx
<MobileSidebar isOpen={isMobileSidebarOpen} onClose={handleClose} />
```

**Accessibility**:
- `aside` with `role="complementary"`
- ARIA label for sidebar and close button
- Focus trap (Escape to close)
- Backdrop prevents interaction with content behind

---

## UI Primitives

### Button
Versatile button component with multiple variants and sizes.

**Location**: `components/ui/button.tsx`

**Props**:
```tsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  asChild?: boolean;
}
```

**Usage**:
```tsx
<Button variant="default" size="lg">Click me</Button>
<Button variant="outline" size="icon">
  <Settings className="h-4 w-4" />
</Button>
```

**Variants**:
- `default`: Primary action button
- `destructive`: Dangerous actions (delete, remove)
- `outline`: Secondary actions
- `secondary`: Tertiary actions
- `ghost`: Minimal styling, hover effect
- `link`: Text link styling

**Accessibility**:
- Focus indicators
- Disabled state handling
- Icon-only buttons should include `aria-label`

---

### Badge
Status and label indicators.

**Location**: `components/ui/badge.tsx`

**Props**:
```tsx
interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline";
}
```

**Usage**:
```tsx
<Badge variant="default">Active</Badge>
<Badge variant="destructive">Error</Badge>
```

**Accessibility**:
- Focus indicators for interactive badges
- Color not used as sole indicator (text included)

---

### Card
Content container with header, content, and footer sections.

**Location**: `components/ui/card.tsx`

**Components**:
- `Card`: Container
- `CardHeader`: Top section
- `CardTitle`: Heading
- `CardDescription`: Subtitle
- `CardContent`: Main content
- `CardFooter`: Bottom section (actions, metadata)

**Usage**:
```tsx
<Card>
  <CardHeader>
    <CardTitle>Dashboard Stats</CardTitle>
    <CardDescription>Last 30 days</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Content here */}
  </CardContent>
  <CardFooter>
    <Button>View Details</Button>
  </CardFooter>
</Card>
```

**Accessibility**:
- Semantic heading hierarchy
- `role="group"` when used for grouped content

---

### Table
Accessible data table components.

**Location**: `components/ui/table.tsx`

**Components**:
- `Table`: Wrapper with overflow handling
- `TableHeader`: `<thead>`
- `TableBody`: `<tbody>`
- `TableFooter`: `<tfoot>`
- `TableRow`: `<tr>`
- `TableHead`: `<th>`
- `TableCell`: `<td>`
- `TableCaption`: `<caption>`

**Usage**:
```tsx
<Table>
  <TableCaption>List of recent transactions</TableCaption>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Status</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>John Doe</TableCell>
      <TableCell>Active</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

**Accessibility**:
- `<caption>` for table description
- `scope="col"` on header cells
- Hover states for rows
- Responsive overflow container

---

### Skeleton
Loading state placeholder.

**Location**: `components/ui/skeleton.tsx`

**Usage**:
```tsx
<Skeleton className="h-12 w-12 rounded-full" />
<Skeleton className="h-4 w-[250px]" />
```

**Accessibility**:
- `aria-live="polite"` for screen readers
- `aria-busy="true"` to indicate loading state

---

## Custom Primitives

### StatCard
KPI display card with trend indicators.

**Location**: `components/primitives/stat-card.tsx`

**Props**:
```tsx
interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  loading?: boolean;
}
```

**Usage**:
```tsx
<StatCard
  title="Total Revenue"
  value="$48,532.89"
  description="from previous month"
  icon={DollarSign}
  trend={{ value: 12.5, isPositive: true }}
/>
```

**Features**:
- Optional icon
- Trend indicator with color coding
- Loading state
- Responsive text sizing

**Accessibility**:
- `aria-label` with full context
- Color + text for trend indication
- `role="group"` for grouping

---

### ChartWrapper
Container for chart visualizations with consistent styling.

**Location**: `components/primitives/chart-wrapper.tsx`

**Props**:
```tsx
interface ChartWrapperProps {
  title: string;
  description?: string;
  trend?: "up" | "down" | "stable";
  trendLabel?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}
```

**Usage**:
```tsx
<ChartWrapper
  title="Revenue Growth"
  description="Monthly revenue trend"
  trend="up"
  trendLabel="+18%"
  footer={<Button>View Details</Button>}
>
  <YourChartComponent />
</ChartWrapper>
```

**Features**:
- Trend badge with color coding
- Optional footer for actions
- Consistent sizing (h-64)
- Dashed border placeholder

**Accessibility**:
- `role="group"` with `aria-labelledby`
- Descriptive heading

---

### Loading Components
Pre-built loading states for common patterns.

**Location**: `components/primitives/loading-card.tsx`

**Components**:
- `LoadingCard`: Card skeleton
- `LoadingTable`: Table skeleton
- `LoadingStats`: Grid of stat card skeletons

**Usage**:
```tsx
<React.Suspense fallback={<LoadingCard />}>
  <YourAsyncComponent />
</React.Suspense>

<React.Suspense fallback={<LoadingStats />}>
  <StatsGrid />
</React.Suspense>
```

**Accessibility**:
- Uses `Skeleton` component with proper ARIA attributes

---

## Theme Components

### ThemeProvider
Context provider for theme management.

**Location**: `components/theme-provider.tsx`

**Usage**:
```tsx
<ThemeProvider defaultTheme="system" enableSystem attribute="class">
  {children}
</ThemeProvider>
```

**Features**:
- SSR compatible
- System theme detection
- Persistent theme preference

---

### ThemeToggle
Theme switcher with light, dark, and system options.

**Location**: `components/theme-toggle.tsx`

**Usage**:
```tsx
<ThemeToggle />
```

**Features**:
- Three theme options (light, dark, system)
- Dropdown menu
- Active state indication
- Keyboard navigable
- Escape to close
- Click outside to close

**Accessibility**:
- ARIA roles for menu (`listbox`, `option`)
- `aria-expanded` state
- `aria-activedescendant` for active option
- Focus management
- Icon with screen reader text

---

## Accessibility Features

### Keyboard Navigation
- **Tab / Shift+Tab**: Navigate between focusable elements
- **Enter / Space**: Activate buttons and links
- **Escape**: Close modals, menus, mobile sidebar
- **Arrow keys**: Navigate within menus (where applicable)

### Screen Readers
- Semantic HTML5 elements
- ARIA labels on all interactive elements
- `alt` text or `aria-hidden` on decorative images
- Live regions for dynamic content
- Form labels properly associated

### Focus Management
- Visible focus indicators (ring-2)
- Skip to main content link
- Focus trap in modals
- Logical tab order

### Color Contrast
- WCAG AA compliant color combinations
- Theme-aware text colors
- Not relying on color alone for information

### Responsive Design
- Mobile-first approach
- Touch-friendly target sizes (min 44x44px)
- Readable text sizes
- Horizontal scrolling avoided

---

## Best Practices

### Adding New Components
1. Follow existing patterns for props and styling
2. Use `cn()` utility for className merging
3. Add proper TypeScript types
4. Include accessibility attributes
5. Test keyboard navigation
6. Test with screen readers
7. Document in this file

### Styling Guidelines
- Use Tailwind utility classes
- Use design tokens (colors, spacing, etc.)
- Use `cn()` for conditional classes
- Avoid inline styles
- Use CSS variables for theme values

### Accessibility Checklist
- [ ] Semantic HTML elements
- [ ] ARIA roles and labels where needed
- [ ] Keyboard navigation support
- [ ] Focus indicators visible
- [ ] Color contrast meets WCAG AA
- [ ] Screen reader tested
- [ ] Touch targets at least 44x44px
- [ ] Forms have associated labels
- [ ] Error messages are descriptive
