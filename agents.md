# Agent Guidelines & Coding Conventions

This document outlines the coding standards and conventions for this project. Please follow these guidelines when making changes.

## 📁 File Structure & Organization

### Interface Management

- **Global Interfaces**: All reusable interfaces must be declared in `src/utils/interfaces.ts`
- **Local Props Interfaces**: Component-specific props interfaces should be declared in the same file as the component to maintain code readability
- Always use `type` imports for TypeScript interfaces when `verbatimModuleSyntax` is enabled

Example:

```typescript
// ✅ Good - Global interface in interfaces.ts
export interface ProjectData {
  name: string;
  message: string;
  tags: string[];
  previews: string[];
}

// ✅ Good - Local props interface in component file
interface ProjectPageProps {
  projectData: ProjectData;
}
```

## 🎨 Component Patterns

### Props & Types

- Use TypeScript for all components
- Import global interfaces using type-only imports: `import type { ProjectData } from '../../utils/interfaces';`
- Define component-specific props interfaces locally in the same file

### Data Management

- Project data should be stored in separate data files (e.g., `src/pages/project/core/one.ts`)
- Each project data file exports a default object conforming to the `ProjectData` interface
- Keep asset imports in the data files, not in the component files

Example:

```typescript
// ✅ Good - Data file structure
import img1 from '../../../assets/project/one/one (1).jpg';
import type { ProjectData } from '../../../utils/interfaces';

const projectOne: ProjectData = {
  name: 'Project One',
  message: 'Description',
  tags: ['React', 'TypeScript'],
  previews: [img1, img2, ...],
};

export default projectOne;
```

## 🚀 Component Architecture

### Dynamic Components

- Prefer dynamic, reusable components over hardcoded implementations
- Pass data as props rather than importing directly in components
- Components should accept data objects that conform to global interfaces

Example:

```typescript
// ✅ Good - Dynamic component
const ProjectPage = ({ projectData }: ProjectPageProps) => {
  const { previews } = projectData;
  // Use previews dynamically
};

// ❌ Bad - Hardcoded imports in component
const ProjectPage = () => {
  import img1 from '../../assets/...';
  // Don't hardcode data in components
};
```

## 📦 Import Organization

### Import Order

1. External libraries (React, third-party packages)
2. Internal components
3. Utilities and helpers
4. Type imports (always last, using `type` keyword)
5. Assets (images, styles)

Example:

```typescript
import useEmblaCarousel from 'embla-carousel-react';
import ImageCard from './ImageCard';
import Aurora from '../../components/Aurora';
import type { ProjectData } from '../../utils/interfaces';
import styles from './index.css.tsx';
```

## ✨ Best Practices

### Code Quality

- Remove unused variables and imports
- Use destructuring for cleaner code
- Keep components focused and single-purpose
- Avoid magic numbers and strings; use constants

### CSS Management

- **Always migrate static CSS to `index.css.tsx` files** in the same folder as components
- Avoid inline styles for static/reusable styles
- Each feature/page folder should have its own `index.css.tsx` file
- Use the `CSSInterface` type for style objects
- Only use inline styles for truly dynamic values (computed at runtime)

Example:

```typescript
// ✅ Good - Styles in index.css.tsx
const styles: CSSInterface = {
  videoWrapper: {
    position: 'relative',
    width: '100%',
    height: '100%',
  },
};

// ✅ Good - Component uses imported styles
<div style={styles.videoWrapper}>...</div>

// ❌ Bad - Inline static styles
<div style={{ position: 'relative', width: '100%' }}>...</div>
```

### TypeScript

- Always use strict typing
- Leverage type inference where appropriate
- Use `type` keyword for type-only imports when `verbatimModuleSyntax` is enabled
- Export interfaces that will be reused across multiple files

### Asset Management

- Keep assets organized in appropriate folders under `src/assets/`
- Import assets in data files, not component files
- Use descriptive names for asset folders (e.g., `project/one`, `project/two`)

### Media Handling (Images & Videos)

- Project previews support both images and videos
- Components must dynamically detect media type by file extension
- Supported video formats: `.mp4`, `.webm`, `.ogg`, `.mov`, `.avi`
- Supported image formats: `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`, `.svg`
- Use helper functions to check file types before rendering
- Videos should have: `autoPlay`, `loop`, `muted`, `playsInline`, and `controls` attributes

Example:

```typescript
// ✅ Good - Dynamic media detection
const isVideo = (url: string): boolean => {
  const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi'];
  return videoExtensions.some((ext) => url.toLowerCase().endsWith(ext));
};

// Render video or image based on type
{isVideo(src) ? (
  <video src={src} controls autoPlay loop muted playsInline />
) : (
  <Image src={src} />
)}
```

## 🔄 Making Changes

When adding new features or modifying existing code:

1. **Check for existing patterns** - Follow established conventions in the codebase
2. **Update interfaces** - If creating reusable types, add them to `src/utils/interfaces.ts`
3. **Keep components clean** - Move data to separate data files
4. **Test changes** - Run `npm run dev` and check for TypeScript errors
5. **Update this document** - If introducing new patterns or conventions

## 📝 Current Project Structure

```
src/
├── utils/
│   ├── interfaces.ts      # Global reusable interfaces
│   ├── constants.ts       # Global constants
│   └── ...
├── pages/
│   ├── landing/
│   │   ├── LandingPage.tsx         # Hero text with GSAP animations
│   │   └── index.css.tsx           # Landing page styles
│   └── project/
│       ├── ProjectPage.tsx          # Dynamic component
│       └── core/
│           ├── one.ts              # Project 1 data
│           └── two.ts              # Project 2 data
└── components/
    └── custom-hooks/               # Reusable hooks
        └── useTheme.tsx            # Theme context + hook
```

## 🎯 Current Interfaces

### ProjectData

Located in `src/utils/interfaces.ts`

```typescript
interface ProjectData {
  name: string; // Project name
  message: string; // Project description
  tags: string[]; // Tech stack/tags
  previews: string[]; // Array of image/video URLs
}
```

## 🪝 Custom Hooks & Context

### useTheme

Located in `src/components/custom-hooks/useTheme.tsx`

Provides dark/light mode state via React Context. Wrap app root with `ThemeProvider`, consume anywhere with `useTheme()`.

```typescript
// ✅ Root setup — wrap once at the top
const AppWithProviders = () => (
  <ThemeProvider>
    <App />
  </ThemeProvider>
);

// ✅ Consume anywhere in the tree
const { isDark, toggleTheme } = useTheme();
```

- Do **not** duplicate theme state locally — always use `useTheme()`
- `ThemeProvider` owns `localStorage` read/write
- New global hooks follow same pattern: context + provider + `useX()` hook, all in one file in `custom-hooks/`

---

**Last Updated**: April 15, 2026
**Maintainers**: Development Team

_Remember: These guidelines ensure consistency, maintainability, and scalability across the project._
