'use client';

import { use, useState, useEffect } from 'react';
import { Container, Title, Text, Button, Stack, Image, Badge, Group, Paper } from '@mantine/core';
import { IconVideo, IconMapPin } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { parseUTMParams } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface Provider {
  id: string;
  name: string;
  photoUrl: string | null;
  specialties: string[];
  modalities: string[];
  acceptingNew: boolean;
  portalLink: string;
}

export default function ProviderDetailPage({
  params,
}: {
  params: Promise<{ providerId: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);
  const [utm, setUtm] = useState<Record<string, string>>({});

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const utmParams = parseUTMParams(searchParams);
    setUtm(utmParams);

    fetch(`/api/providers/${resolvedParams.providerId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Provider not found');
        return res.json();
      })
      .then((data) => {
        setProvider(data);
        setLoading(false);
      })
      .catch(() => {
        notifications.show({
          title: 'Error',
          message: 'Provider not found',
          color: 'red',
        });
        router.push('/providers');
      });
  }, [resolvedParams.providerId, router]);

  const handleRequestClick = async () => {
    if (!provider) return;

    try {
      await fetch('/api/events/click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ providerId: provider.id, utm }),
      });

      window.location.href = provider.portalLink;
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to process request. Please try again.',
        color: 'red',
      });
    }
  };

  if (loading || !provider) {
    return (
      <Container size="md" py={64}>
        <Text>Loading...</Text>
      </Container>
    );
  }

  return (
    <Container size="md" py={64}>
      <Paper p="xl" radius="lg" withBorder>
        <Stack gap="xl">
          <Group align="flex-start" gap="xl">
            <Image
              src={provider.photoUrl || '/placeholder-provider.jpg'}
              width={200}
              height={200}
              radius="md"
              alt={provider.name}
              fallbackSrc="https://placehold.co/400x400/e7f7f9/2aaab4?text=Provider"
            />
            <Stack gap="md" style={{ flex: 1 }}>
              <Title order={1} size={32} fw={700} c="slate.9">
                {provider.name}
              </Title>

              <Group gap="xs">
                {provider.specialties.map((specialty) => (
                  <Badge key={specialty} variant="light" color="medicalCyan" size="md">
                    {specialty}
                  </Badge>
                ))}
              </Group>

              <Group gap="md">
                {provider.modalities.includes('telehealth') && (
                  <Group gap={6}>
                    <IconVideo size={20} color="#64748b" />
                    <Text size="md" c="slate.6">
                      Telehealth
                    </Text>
                  </Group>
                )}
                {provider.modalities.includes('in_person') && (
                  <Group gap={6}>
                    <IconMapPin size={20} color="#64748b" />
                    <Text size="md" c="slate.6">
                      In-person
                    </Text>
                  </Group>
                )}
              </Group>

              <Text
                size="md"
                c={provider.acceptingNew ? 'mint.7' : 'slate.6'}
                fw={600}
              >
                {provider.acceptingNew ? 'Accepting new patients' : 'Not accepting new patients'}
              </Text>
            </Stack>
          </Group>

          <Stack gap="md">
            <Text size="lg" fw={600} c="slate.8">
              About
            </Text>
            <Text size="md" c="slate.6" style={{ lineHeight: 1.6 }}>
              {provider.name} is a licensed mental health professional specializing in{' '}
              {provider.specialties.slice(0, 3).join(', ')}. With years of experience helping
              clients navigate their mental health journeys, they provide compassionate,
              evidence-based care tailored to your unique needs.
            </Text>
          </Stack>

          <Button
            size="lg"
            disabled={!provider.acceptingNew}
            onClick={handleRequestClick}
            style={{ minHeight: 56 }}
          >
            Request on Portal
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
}
