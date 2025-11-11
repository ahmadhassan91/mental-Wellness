'use client';

import { Container, Group, Text, Anchor, Stack } from '@mantine/core';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer style={{ backgroundColor: '#f8fafc', padding: '32px 0', marginTop: '64px' }}>
      <Container size="lg">
        <Stack gap="md">
          <Group justify="space-between">
            <Text size="sm" c="slate.6">
              © {currentYear} Serenity Wellness. All rights reserved.
            </Text>
            <Group gap="lg">
              <Anchor href="/privacy" size="sm" c="slate.6">
                Privacy Policy
              </Anchor>
              <Anchor href="/terms" size="sm" c="slate.6">
                Terms of Service
              </Anchor>
              <Anchor href="/contact" size="sm" c="slate.6">
                Contact
              </Anchor>
            </Group>
          </Group>
          <Text size="xs" c="slate.5">
            This portal is for appointment requests only. For emergencies, call 911 or go to your
            nearest emergency room.
          </Text>
        </Stack>
      </Container>
    </footer>
  );
}
