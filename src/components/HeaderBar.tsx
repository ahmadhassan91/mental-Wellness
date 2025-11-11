'use client';

import { Container, Group, Text, Anchor } from '@mantine/core';
import { IconStethoscope } from '@tabler/icons-react';
import Link from 'next/link';

export function HeaderBar() {
  return (
    <header style={{ borderBottom: '1px solid #e2e8f0', padding: '16px 0' }}>
      <Container size="lg">
        <Group justify="space-between">
          <Link href="/" style={{ textDecoration: 'none' }}>
            <Group gap="xs">
              <IconStethoscope size={28} color="#2aaab4" stroke={2.5} />
              <Text size="xl" fw={700} c="medicalCyan.9">
                Serenity Wellness
              </Text>
            </Group>
          </Link>

          <Group gap="lg">
            <Anchor component={Link} href="/providers" c="slate.7" fw={500}>
              Find a Provider
            </Anchor>
            <Anchor
              href={`tel:${process.env.NEXT_PUBLIC_CLINIC_PHONE || '555-0100'}`}
              c="medicalCyan.7"
              fw={600}
            >
              {process.env.NEXT_PUBLIC_CLINIC_PHONE || '(555) 555-0100'}
            </Anchor>
          </Group>
        </Group>
      </Container>
    </header>
  );
}
