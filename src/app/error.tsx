"use client";

import { Container, Section } from "@/components/layout";
import { Button, Heading, Text } from "@/components/ui";

export default function Error({ reset }: { reset: () => void }) {
  return (
    <Container>
      <Section className="stack state-shell">
        <p className="eyebrow">Error</p>
        <Heading as="h1">Something went wrong</Heading>
        <Text>The application shell encountered an unexpected issue while rendering.</Text>
        <Button variant="primary" onClick={reset}>Try again</Button>
      </Section>
    </Container>
  );
}
