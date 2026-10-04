# Architecture guide

This project is intentionally a technical foundation, not a feature prototype. All future work must follow these standards.

## Project structure

- app/: route-level entry points, global layout, error/loading/not-found states, and metadata
- components/: reusable UI and layout primitives grouped by purpose
- styles/: design-token source of truth for colors, spacing, radius, motion, and breakpoints
- lib/: shared utilities and business-logic helpers when needed
- public/: static assets only; keep these minimal and optimized

## Component conventions

- Keep components small and focused on one responsibility.
- Prefer reusable primitives over markup duplication.
- Reuse existing patterns before inventing new ones.
- Do not mix unrelated business logic into UI components.
- Favor semantic HTML and accessible defaults.

## Design-token conventions

- Manage all color, typography, spacing, border radius, motion, and layout values in one token source.
- Avoid repeated raw values in component styles.
- Update the design system centrally rather than patching individual components.
- Keep the current neutral foundation ready for future brand work without locking in product-specific choices early.

## Server and client rules

- Default to Server Components.
- Use Client Components only when interactivity or browser APIs are genuinely required.
- Keep the server/client boundary intentional and minimal.
- Avoid large client bundles and unnecessary state management.

## Styling conventions

- Use CSS variables and consistent classes rather than ad hoc numeric values.
- Prefer restraint over decorative visual noise.
- Maintain strong contrast, readable type scale, and sensible whitespace.
- Adapt layouts intentionally to viewport size rather than simply shrinking elements.

## Performance rules

- Use Next.js defaults for server rendering and image optimization.
- Avoid unnecessary JavaScript and third-party animation libraries.
- Prefer HTML and CSS solutions before introducing client-side complexity.
- Keep route states consistent and lightweight.

## Accessibility rules

- Use semantic headings, labels, and landmark regions.
- Keep focus states visible and keyboard navigation predictable.
- Ensure interactive controls have readable labels and sufficient touch targets.
- Support reduced-motion preferences.
- Do not rely on color alone to communicate state.

## Naming conventions

- Prefer clear, descriptive names over clever abstractions.
- Keep file and symbol names readable and predictable.
- Match existing project patterns before adding new utilities or conventions.

## Feature-development rules

1. Understand the requirement.
2. Check for existing reusable components and patterns.
3. Follow the design tokens and typography scale.
4. Preserve the server-first architecture.
5. Keep business logic separate from presentation.
6. Validate accessibility and responsive behavior before shipping.
7. Avoid unnecessary dependencies, new visual systems, or duplicate patterns.

## Foundation status

This app intentionally stops at the architectural foundation stage. No business brand, product pages, or feature flows are introduced here.
