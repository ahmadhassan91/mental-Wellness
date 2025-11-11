'use client';

import { useEffect } from 'react';
import { Container, Title, Text, Button, Stack } from '@mantine/core';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Container size="sm" py={80}>
      <Stack gap="xl" align="center" style={{ textAlign: 'center' }}>
        <Title order={1} size={80} fw={900} c="rose.6">
          500
        </Title>
        <Stack gap="md">
          <Title order={2} size={32} fw={700} c="slate.9">
            Something Went Wrong
          </Title>
          <Text size="lg" c="slate.6">
            We encountered an unexpected error. Please try again.
          </Text>
        </Stack>
        <Button onClick={reset} size="lg">
          Try Again
        </Button>
      </Stack>
    </Container>
  );
}
