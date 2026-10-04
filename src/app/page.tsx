import { Container, Section } from "@/components/layout";
import { Button, Card, Heading, Link, Text } from "@/components/ui";

const principles = [
  {
    title: "Architecture",
    body: "Use the App Router with server-first defaults and intentional client boundaries only when interactivity requires it.",
  },
  {
    title: "Design system",
    body: "Keep tokens centralized so color, spacing, type scale, borders, motion, and layout decisions remain consistent across features.",
  },
  {
    title: "Performance",
    body: "Prioritize server rendering, minimal hydration, optimized assets, and restrained dependencies to keep the app fast by default.",
  },
];

const standards = [
  "Accessible structure and keyboard-visible focus states",
  "Responsive layouts for mobile, tablet, laptop, and desktop",
  "Consistent loading, empty, error, and not-found states",
  "Reusable components built around maintainability, not cleverness",
];

export default function Home() {
  return (
    <main className="page-shell" id="main-content">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>

      <Container className="page-shell__content">
        <header className="site-header">
          <div className="brand-mark" aria-label="Project foundation brand mark">
            S
          </div>

          <nav className="top-nav" aria-label="Main navigation">
            <Link href="#architecture">Architecture</Link>
            <Link href="#system">System</Link>
            <Link href="#rules">Rules</Link>
          </nav>
        </header>

        <Section className="hero stack">
          <p className="eyebrow">Production-ready foundation</p>
          <Heading as="h1">A scalable Next.js system built for future feature work.</Heading>
          <Text className="hero-copy">
            This project establishes the technical and design rules that every future feature
            will follow: better structure, clearer tokens, easier maintenance, stronger
            accessibility, and a more reliable performance baseline.
          </Text>

          <div className="actions" aria-label="Page actions">
            <Button href="#architecture" variant="primary">
              Review standards
            </Button>
            <Button href="#rules" variant="secondary">
              Read the guide
            </Button>
          </div>
        </Section>

        <Section id="architecture" className="stack">
          <Heading as="h2">Architecture principles</Heading>

          <div className="grid grid-3">
            {principles.map((item) => (
              <Card key={item.title} className="stack">
                <p className="card-label">{item.title}</p>
                <Text>{item.body}</Text>
              </Card>
            ))}
          </div>
        </Section>

        <Section id="system" className="stack">
          <Heading as="h2">Design-system foundation</Heading>

          <div className="grid grid-2">
            <Card className="stack">
              <p className="card-label">Tokens</p>
              <Text>
                Centralized variables cover color, spacing, typography, radius, shadows,
                breakpoints, motion, and z-index. This keeps future UI changes controlled and
                consistent.
              </Text>
            </Card>

            <Card className="stack">
              <p className="card-label">Typography</p>
              <Text>
                A single scale supports display, heading, body, caption, label, navigation, and
                action text with a clear information hierarchy built into the system.
              </Text>
            </Card>
          </div>
        </Section>

        <Section id="rules" className="stack">
          <Heading as="h2">Foundation rules</Heading>

          <Card className="stack">
            <ul className="check-list" aria-label="Project standards">
              {standards.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Card>
        </Section>
      </Container>
    </main>
  );
}
