import { Container, Section } from "@/components/layout";
import { Heading, Text } from "@/components/ui";

export default function Loading() {
  return (
    <Container>
      <Section className="stack loading-shell">
        <div className="skeleton skeleton-title" aria-hidden="true" />
        <div className="skeleton skeleton-copy" aria-hidden="true" />
        <div className="skeleton skeleton-copy short" aria-hidden="true" />
        <Heading as="h1">Loading foundation</Heading>
        <Text>Preparing the application shell and standards.</Text>
      </Section>
    </Container>
  );
}
