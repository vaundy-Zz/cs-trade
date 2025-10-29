# CS Trade

A modern Counter-Strike trading platform built with Next.js 14, TypeScript, and Tailwind CSS.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 3 + PostCSS
- **UI Components**: shadcn/ui (with Radix UI primitives)
- **Theme**: Dark/Light mode switching with next-themes
- **Charts**: Recharts for data visualization
- **Animation**: Framer Motion
- **Testing**: Vitest + React Testing Library
- **Code Quality**: ESLint + Prettier + Husky + lint-staged
- **Commit Linting**: commitlint with conventional commits

## Features

- ✅ Next.js 14 with App Router and React Server Components
- ✅ TypeScript for type safety
- ✅ Tailwind CSS with custom design tokens
- ✅ Dark/Light theme switching
- ✅ shadcn/ui components library
- ✅ Recharts for beautiful charts and data visualization
- ✅ Framer Motion for smooth animations
- ✅ Absolute path imports with `@/` prefix
- ✅ ESLint with TypeScript-aware rules
- ✅ Prettier for consistent code formatting
- ✅ Husky pre-commit hooks with lint-staged
- ✅ Commitlint for conventional commits
- ✅ Vitest for fast unit testing
- ✅ EditorConfig for consistent coding styles

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd cs-trade
```

2. Install dependencies:

```bash
npm install
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

### Development

- `npm run dev` - Start the development server
- `npm run build` - Build the production application
- `npm run start` - Start the production server

### Code Quality

- `npm run lint` - Run ESLint to check for code issues
- `npm run lint:fix` - Fix auto-fixable ESLint issues
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting without modifying files
- `npm run typecheck` - Run TypeScript type checking

### Testing

- `npm run test` - Run all tests
- `npm run test:watch` - Run tests in watch mode

## Project Structure

```
cs-trade/
├── src/
│   ├── app/                 # Next.js app directory
│   │   ├── globals.css      # Global styles and CSS variables
│   │   ├── layout.tsx       # Root layout with theme provider
│   │   └── page.tsx         # Home page
│   ├── components/          # React components
│   │   ├── ui/              # shadcn/ui components
│   │   ├── sample-chart.tsx # Example Recharts component
│   │   ├── theme-provider.tsx
│   │   └── theme-toggle.tsx
│   ├── data/                # Data and mock data
│   └── lib/                 # Utility functions
│       ├── __tests__/       # Unit tests
│       └── utils.ts         # Helper utilities
├── public/                  # Static assets
├── .husky/                  # Git hooks
├── components.json          # shadcn/ui configuration
├── tailwind.config.ts       # Tailwind CSS configuration
├── tsconfig.json            # TypeScript configuration
├── vitest.config.ts         # Vitest test configuration
├── .prettierrc              # Prettier configuration
├── .editorconfig            # EditorConfig settings
├── commitlint.config.js     # Commitlint configuration
└── eslint.config.mjs        # ESLint configuration
```

## Configuration

### Path Aliases

The project uses `@/` as an alias for the `src/` directory:

```typescript
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
```

### Theming

The application supports dark and light themes using next-themes. CSS variables are defined in `src/app/globals.css` and can be customized for both themes.

Toggle the theme using the theme toggle button in the top-right corner of the application.

### Component Library

This project uses [shadcn/ui](https://ui.shadcn.com/) for UI components. To add new components:

```bash
npx shadcn@latest add button
```

## Git Hooks

The project uses Husky to enforce code quality before commits:

- **pre-commit**: Runs lint-staged to lint and format staged files
- **commit-msg**: Validates commit messages using commitlint

### Commit Message Format

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <subject>

Examples:
feat(auth): add login functionality
fix(ui): correct button alignment
docs(readme): update installation steps
```

## Testing

Tests are written using Vitest and React Testing Library. Test files should be placed in `__tests__` directories or use the `.test.ts` or `.spec.ts` suffix.

Example:

```typescript
import { describe, expect, it } from "vitest";
import { cn } from "../utils";

describe("cn utility", () => {
  it("should merge class names correctly", () => {
    expect(cn("px-4", "py-2")).toBe("px-4 py-2");
  });
});
```

## Building for Production

1. Build the application:

```bash
npm run build
```

2. Start the production server:

```bash
npm start
```

## CI/CD Ready

All commands are CI-friendly and will exit with appropriate status codes:

- `npm run lint` - Fails on any linting errors
- `npm run format:check` - Fails if files are not formatted
- `npm run typecheck` - Fails on TypeScript errors
- `npm run test` - Fails if any tests fail
- `npm run build` - Fails if build fails

## License

MIT
