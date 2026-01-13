# ExamMaster Design System

## Overview

A modern, professional design system crafted specifically for the ExamMaster AI-powered exam question generator. This system combines academic professionalism with contemporary design principles to create an intuitive, accessible, and visually appealing user experience.

---

## Design Philosophy

### Core Principles

1. **Professional & Trustworthy** - Academic blue tones establish credibility
2. **Modern & Innovative** - Purple accents highlight AI-powered features
3. **Clear & Accessible** - High contrast and readable typography
4. **Responsive & Adaptive** - Seamless experience across all devices
5. **Dark Mode First** - Full support for light and dark themes

---

## Color Palette

### Light Mode

#### Brand Colors
- **Primary (Academic Blue)**: `oklch(0.45 0.15 250)` - Main brand color, CTAs, navigation
- **Secondary (AI Purple)**: `oklch(0.55 0.18 290)` - AI features, highlights, creative elements
- **Accent (Cyan)**: `oklch(0.92 0.03 250)` - Interactive elements, hover states

#### Semantic Colors
- **Success (Educational Green)**: `oklch(0.55 0.15 145)` - Success messages, completed tasks
- **Warning (Amber)**: `oklch(0.72 0.16 75)` - Warnings, attention needed
- **Destructive (Red)**: `oklch(0.58 0.22 25)` - Errors, delete actions
- **Info (Blue)**: `oklch(0.62 0.14 235)` - Information, tips

#### Surface Colors
- **Background**: `oklch(0.99 0 0)` - Main app background
- **Card**: `oklch(1 0 0)` - Card backgrounds
- **Muted**: `oklch(0.96 0.005 285)` - Less important content
- **Border**: `oklch(0.88 0.008 285)` - Borders and dividers

### Dark Mode

#### Brand Colors
- **Primary**: `oklch(0.65 0.18 250)` - Brighter for dark backgrounds
- **Secondary**: `oklch(0.68 0.20 290)` - Enhanced vibrancy
- **Accent**: `oklch(0.28 0.025 250)` - Subtle elevated surface

#### Semantic Colors
- **Success**: `oklch(0.62 0.17 145)` - Bright green
- **Warning**: `oklch(0.78 0.18 75)` - Warmer amber
- **Destructive**: `oklch(0.55 0.20 25)` - Softer red
- **Info**: `oklch(0.68 0.16 235)` - Bright info blue

#### Surface Colors
- **Background**: `oklch(0.14 0.012 285)` - Deep, rich dark
- **Card**: `oklch(0.18 0.015 285)` - Elevated surface
- **Muted**: `oklch(0.25 0.015 285)` - Subdued tones
- **Border**: `oklch(0.30 0.015 285)` - Subtle borders

---

## Typography

### Font Families

```css
--font-sans: "Inter", "Figtree", ui-sans-serif, system-ui, sans-serif;
--font-mono: "JetBrains Mono", "Fira Code", ui-monospace, monospace;
```

### Font Sizes & Hierarchy

- **H1**: `text-4xl lg:text-5xl` - Page titles
- **H2**: `text-3xl lg:text-4xl` - Section headers
- **H3**: `text-2xl lg:text-3xl` - Subsections
- **H4**: `text-xl lg:text-2xl` - Card titles
- **Body**: `text-base` - Default text
- **Small**: `text-sm` - Secondary information
- **Tiny**: `text-xs` - Labels, captions

### Font Features
- Ligatures enabled (`rlig`, `calt`, `ss01`)
- Anti-aliased rendering
- Tight tracking for headings

---

## Spacing & Layout

### Border Radius

```css
--radius: 0.5rem          /* Base radius */
--radius-sm: 0.25rem      /* Small elements */
--radius-md: 0.375rem     /* Medium elements */
--radius-lg: 0.5rem       /* Large elements */
--radius-xl: 0.625rem     /* Extra large */
--radius-2xl: 0.75rem     /* Maximum */
```

### Recommended Usage
- **Buttons**: `rounded-md` or `rounded-lg`
- **Cards**: `rounded-lg` or `rounded-xl`
- **Inputs**: `rounded-md`
- **Modals**: `rounded-2xl`
- **Avatars**: `rounded-full`

---

## Component Patterns

### Cards

```tsx
// Standard Card
<Card className="glass-card">
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>

// Gradient Border Card
<Card className="border-gradient">
  <CardContent>Special content</CardContent>
</Card>
```

### Buttons

```tsx
// Primary Action
<Button variant="default">Generate Questions</Button>

// Secondary Action
<Button variant="secondary">View TOS</Button>

// Destructive Action
<Button variant="destructive">Delete Exam</Button>

// With Icon
<Button>
  <Brain className="mr-2 h-4 w-4" />
  AI Generate
</Button>
```

### Text Gradients

```tsx
// Primary Gradient
<h1 className="text-gradient">AI-Powered Exam Generator</h1>

// Accent Gradient
<span className="text-gradient-accent">Premium Feature</span>
```

### Glass Morphism

```tsx
// Subtle Glass Effect
<div className="glass p-6">Content</div>

// Enhanced Glass Card
<Card className="glass-card">Content</Card>
```

### Shadows

```tsx
// Primary Shadow (for CTAs)
<Button className="shadow-primary">Call to Action</Button>

// Secondary Shadow (for highlights)
<Card className="shadow-secondary">Featured Content</Card>
```

---

## Chart Colors

Harmonious palette optimized for data visualization:

1. **Chart 1**: Blue `oklch(0.55 0.18 250)` - Primary data
2. **Chart 2**: Green `oklch(0.62 0.16 165)` - Secondary data
3. **Chart 3**: Yellow `oklch(0.68 0.19 50)` - Tertiary data
4. **Chart 4**: Purple `oklch(0.58 0.20 290)` - Quaternary data
5. **Chart 5**: Pink `oklch(0.65 0.17 340)` - Quinary data

---

## Accessibility

### Focus States
All interactive elements have clear focus indicators:
```css
*:focus-visible {
  outline: none;
  ring: 2px ring-ring;
  ring-offset: 2px;
}
```

### Color Contrast
- All text meets WCAG AA standards (4.5:1 minimum)
- Interactive elements meet WCAG AAA standards (7:1)
- Dark mode maintains equivalent contrast ratios

### Keyboard Navigation
- All interactive components are keyboard accessible
- Tab order follows logical flow
- Skip links for main content

---

## Animation & Motion

### Smooth Scrolling
```css
html {
  scroll-behavior: smooth;
}
```

### Gradient Animation
```tsx
<div className="gradient-animated h-64">
  Animated background
</div>
```

### Transition Durations
- **Fast**: `150ms` - Hover states, focus
- **Default**: `200ms` - Most transitions
- **Slow**: `300ms` - Complex animations
- **Slower**: `500ms` - Page transitions

---

## Sidebar Navigation

### Colors
- **Background**: Light gray (`oklch(0.98 0.005 250)`)
- **Foreground**: Dark text (`oklch(0.25 0.015 285)`)
- **Active**: Primary blue with subtle background
- **Hover**: Accent background

### Structure
- Collapsible design
- Icon + text labels
- Clear active states
- Organized groups

---

## Usage Guidelines

### Do's ✅
- Use primary color for main CTAs
- Use secondary for AI-related features
- Maintain consistent spacing (4px, 8px, 16px, 24px, 32px)
- Use semantic colors appropriately
- Test in both light and dark modes
- Ensure text is readable against backgrounds

### Don'ts ❌
- Don't mix too many colors in one view
- Don't use decorative colors for semantic actions
- Don't reduce border radius below recommended values
- Don't create custom colors outside the palette
- Don't ignore dark mode styling
- Don't use color alone to convey information

---

## Responsive Design

### Breakpoints
```css
sm: 640px   /* Small devices */
md: 768px   /* Medium devices */
lg: 1024px  /* Large devices */
xl: 1280px  /* Extra large devices */
2xl: 1536px /* 2X large devices */
```

### Mobile-First Approach
Always design mobile-first, then enhance for larger screens:
```tsx
<div className="text-sm md:text-base lg:text-lg">
  Responsive text
</div>
```

---

## Component Library

### Available Components
- Alert Dialog
- Avatar
- Badge
- Breadcrumb
- Button
- Card
- Chart
- Checkbox
- Dialog
- Dropdown Menu
- Empty State
- Field
- Input
- Label
- Select
- Separator
- Sheet
- Sidebar
- Skeleton
- Spinner
- Switch
- Table
- Textarea
- Tooltip

### Adding New Components
Use shadcn CLI:
```bash
npx shadcn@latest add [component-name]
```

---

## Best Practices

### Performance
- Use CSS variables for dynamic theming
- Minimize custom CSS
- Leverage Tailwind's purge for smaller bundles
- Use semantic HTML elements

### Maintainability
- Follow existing component patterns
- Document custom components
- Use TypeScript for type safety
- Keep styles consistent across similar components

### User Experience
- Provide immediate feedback for actions
- Use loading states for async operations
- Show clear error messages
- Maintain consistent interaction patterns

---

## Design Tokens Reference

All design tokens are CSS variables, making them easily themeable:

```tsx
// In your components, use Tailwind classes:
className="bg-primary text-primary-foreground"

// Or reference CSS variables directly:
style={{ color: 'oklch(var(--primary))' }}
```

---

## Future Enhancements

- [ ] Add more chart color variations
- [ ] Implement motion preferences (prefers-reduced-motion)
- [ ] Add high contrast mode
- [ ] Create more gradient utilities
- [ ] Add skeleton loader patterns
- [ ] Document common page layouts
- [ ] Create component composition examples

---

## Resources

- **Tailwind CSS v4**: https://tailwindcss.com/
- **shadcn/ui**: https://ui.shadcn.com/
- **Lucide Icons**: https://lucide.dev/
- **Inertia.js**: https://inertiajs.com/
- **React**: https://react.dev/

---

**Last Updated**: December 21, 2025  
**Version**: 1.0.0
