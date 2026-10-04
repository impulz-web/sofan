import { Container, Section } from "@/components/layout";
import { Button, Heading, Text } from "@/components/ui";

export default function NotFound() {
  return (
    <Container>
      <Section className="stack state-shell">
        <p className="eyebrow">404</p>
        <Heading as="h1">Page not found</Heading>
        <Text>The requested route does not exist in the current foundation.</Text>
        <Button href="/" variant="primary">Return home</Button>
      </Section>
    </Container>
  );
}
