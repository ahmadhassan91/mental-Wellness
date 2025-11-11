import { Container, Title, Text, Button, Stack } from '@mantine/core';
import Link from 'next/link';

export default function NotFound() {
  return (
    <Container size="sm" py={80}>
      <Stack gap="xl" align="center" style={{ textAlign: 'center' }}>
        <Title order={1} size={80} fw={900} c="medicalCyan.7">
          404
        </Title>
        <Stack gap="md">
          <Title order={2} size={32} fw={700} c="slate.9">
            Page Not Found
          </Title>
          <Text size="lg" c="slate.6">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </Text>
        </Stack>
        <Button component={Link} href="/" size="lg">
          Return Home
        </Button>
      </Stack>
    </Container>
  );
}
