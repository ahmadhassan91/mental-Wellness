'use client';

import { Card, Image, Text, Button, Badge, Group, Stack } from '@mantine/core';
import { IconVideo, IconMapPin } from '@tabler/icons-react';

export interface Provider {
  id: string;
  name: string;
  photoUrl: string | null;
  specialties: string[];
  modalities: string[];
  acceptingNew: boolean;
  show?: boolean;
  portalLink?: string;
}

interface ProviderCardProps {
  provider: Provider;
  onRequestClick: (providerId: string) => void;
}

export function ProviderCard({ provider, onRequestClick }: ProviderCardProps) {
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Card.Section>
        <Image
          src={provider.photoUrl || '/placeholder-provider.jpg'}
          height={200}
          alt={provider.name}
          fallbackSrc="https://placehold.co/400x300/e7f7f9/2aaab4?text=Provider"
        />
      </Card.Section>

      <Stack gap="md" mt="md">
        <Text fw={600} size="lg" c="slate.9">
          {provider.name}
        </Text>

        <Group gap="xs">
          {provider.specialties.slice(0, 4).map((specialty) => (
            <Badge key={specialty} variant="light" color="medicalCyan" size="sm">
              {specialty}
            </Badge>
          ))}
        </Group>

        <Group gap="md">
          {provider.modalities.includes('telehealth') && (
            <Group gap={4}>
              <IconVideo size={16} color="#64748b" />
              <Text size="sm" c="slate.6">
                Telehealth
              </Text>
            </Group>
          )}
          {provider.modalities.includes('in_person') && (
            <Group gap={4}>
              <IconMapPin size={16} color="#64748b" />
              <Text size="sm" c="slate.6">
                In-person
              </Text>
            </Group>
          )}
        </Group>

        <Text
          size="sm"
          c={provider.acceptingNew ? 'mint.7' : 'slate.6'}
          fw={500}
        >
          {provider.acceptingNew ? 'Accepting new patients' : 'Not accepting new patients'}
        </Text>

        <Button
          fullWidth
          disabled={!provider.acceptingNew}
          onClick={() => onRequestClick(provider.id)}
          style={{ minHeight: 44 }}
        >
          Request on Portal
        </Button>
      </Stack>
    </Card>
  );
}
