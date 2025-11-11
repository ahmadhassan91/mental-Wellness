import { Container, Title, Text, Button, Stack, Group, Paper } from '@mantine/core';
import { IconShieldCheck, IconUserCheck, IconClick } from '@tabler/icons-react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <Container size="lg" py={64}>
      <Stack gap={64} align="center">
        <Stack gap="xl" align="center" style={{ maxWidth: 720, textAlign: 'center' }}>
          <Title
            order={1}
            size={48}
            fw={800}
            style={{ lineHeight: 1.2 }}
            c="slate.9"
          >
            Begin Your Journey to Mental Wellness
          </Title>
          <Text size="xl" c="slate.6" style={{ lineHeight: 1.6 }}>
            Connect with experienced, licensed therapists who are here to support you. Our
            compassionate team specializes in a wide range of mental health services.
          </Text>
          <Button
            component={Link}
            href="/providers"
            size="xl"
            radius="md"
            style={{ minWidth: 200, minHeight: 56 }}
          >
            Find Your Provider
          </Button>
        </Stack>

        <Group gap="xl" justify="center" style={{ flexWrap: 'wrap' }}>
          <Paper
            shadow="sm"
            p="xl"
            radius="lg"
            style={{
              width: 280,
              textAlign: 'center',
              border: '1px solid #e2e8f0',
            }}
          >
            <Stack gap="md" align="center">
              <IconShieldCheck size={48} color="#2aaab4" stroke={1.5} />
              <Text fw={600} size="lg" c="slate.8">
                Confidential
              </Text>
              <Text size="sm" c="slate.6" style={{ lineHeight: 1.5 }}>
                Your privacy is our priority. All communications and records are fully protected.
              </Text>
            </Stack>
          </Paper>

          <Paper
            shadow="sm"
            p="xl"
            radius="lg"
            style={{
              width: 280,
              textAlign: 'center',
              border: '1px solid #e2e8f0',
            }}
          >
            <Stack gap="md" align="center">
              <IconUserCheck size={48} color="#2aaab4" stroke={1.5} />
              <Text fw={600} size="lg" c="slate.8">
                Licensed Clinicians
              </Text>
              <Text size="sm" c="slate.6" style={{ lineHeight: 1.5 }}>
                Work with board-certified professionals with years of experience.
              </Text>
            </Stack>
          </Paper>

          <Paper
            shadow="sm"
            p="xl"
            radius="lg"
            style={{
              width: 280,
              textAlign: 'center',
              border: '1px solid #e2e8f0',
            }}
          >
            <Stack gap="md" align="center">
              <IconClick size={48} color="#2aaab4" stroke={1.5} />
              <Text fw={600} size="lg" c="slate.8">
                Simple Booking
              </Text>
              <Text size="sm" c="slate.6" style={{ lineHeight: 1.5 }}>
                Find your provider and request an appointment in just a few clicks.
              </Text>
            </Stack>
          </Paper>
        </Group>
      </Stack>
    </Container>
  );
}
