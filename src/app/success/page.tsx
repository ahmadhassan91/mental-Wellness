import { Container, Title, Text, Stack, Paper, Anchor } from '@mantine/core';
import { IconCircleCheck } from '@tabler/icons-react';

export default function SuccessPage() {
  const clinicPhone = process.env.NEXT_PUBLIC_CLINIC_PHONE || '(555) 555-0100';

  return (
    <Container size="sm" py={80}>
      <Paper p="xl" radius="lg" withBorder style={{ textAlign: 'center' }}>
        <Stack gap="xl" align="center">
          <IconCircleCheck size={64} color="#3aa880" stroke={1.5} />

          <Stack gap="md">
            <Title order={1} size={32} fw={700} c="slate.9">
              Thank You for Your Request
            </Title>
            <Text size="lg" c="slate.6" style={{ lineHeight: 1.6 }}>
              You&apos;ll complete your request in our secure portal. Your clinician will review
              and confirm your appointment by email or SMS.
            </Text>
          </Stack>

          <Paper bg="rose.0" p="md" radius="md" style={{ width: '100%' }}>
            <Text size="md" c="rose.7" fw={500}>
              For urgent matters or emergencies, please call us at{' '}
              <Anchor href={`tel:${clinicPhone}`} c="rose.8" fw={700}>
                {clinicPhone}
              </Anchor>{' '}
              or dial 911.
            </Text>
          </Paper>
        </Stack>
      </Paper>
    </Container>
  );
}
