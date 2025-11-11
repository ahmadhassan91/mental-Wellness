'use client';

import { useState, useEffect, useMemo } from 'react';
import { Container, Title, Text, Stack, SimpleGrid, Paper } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { ProviderCard, Provider } from '@/components/ProviderCard';
import { ProviderFilters } from '@/components/ProviderFilters';
import { parseUTMParams } from '@/lib/utils';

export default function ProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [modality, setModality] = useState('all');
  const [utm, setUtm] = useState<Record<string, string>>({});

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const utmParams = parseUTMParams(searchParams);
    setUtm(utmParams);

    fetch('/api/providers')
      .then((res) => res.json())
      .then((data) => {
        setProviders(data);
        setLoading(false);
      })
      .catch(() => {
        notifications.show({
          title: 'Error',
          message: 'Failed to load providers. Please refresh the page.',
          color: 'red',
        });
        setLoading(false);
      });
  }, []);

  const availableSpecialties = useMemo(() => {
    const specialtiesSet = new Set<string>();
    providers.forEach((provider) => {
      provider.specialties.forEach((specialty) => specialtiesSet.add(specialty));
    });
    return Array.from(specialtiesSet).sort();
  }, [providers]);

  const filteredProviders = useMemo(() => {
    return providers.filter((provider) => {
      if (!provider.show) return false;

      const specialtyMatch =
        selectedSpecialties.length === 0 ||
        selectedSpecialties.some((s) => provider.specialties.includes(s));

      const modalityMatch =
        modality === 'all' || provider.modalities.includes(modality);

      return specialtyMatch && modalityMatch;
    });
  }, [providers, selectedSpecialties, modality]);

  const handleRequestClick = async (providerId: string) => {
    const provider = providers.find((p) => p.id === providerId);
    if (!provider) return;

    try {
      await fetch('/api/events/click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ providerId, utm }),
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

  if (loading) {
    return (
      <Container size="lg" py={64}>
        <Text>Loading providers...</Text>
      </Container>
    );
  }

  return (
    <Container size="lg" py={64}>
      <Stack gap="xl">
        <Stack gap="md">
          <Title order={1} size={40} fw={700} c="slate.9">
            Find Your Provider
          </Title>
          <Text size="lg" c="slate.6">
            You&apos;ll finish your request in our secure TherapyNotes portal.
          </Text>
        </Stack>

        <ProviderFilters
          selectedSpecialties={selectedSpecialties}
          onSpecialtiesChange={setSelectedSpecialties}
          modality={modality}
          onModalityChange={setModality}
          availableSpecialties={availableSpecialties}
        />

        {filteredProviders.length === 0 ? (
          <Paper p="xl" radius="md" withBorder style={{ textAlign: 'center' }}>
            <Stack gap="md">
              <Text size="lg" fw={600} c="slate.7">
                No providers match your filters
              </Text>
              <Text size="sm" c="slate.6">
                Try adjusting your filters or call us at{' '}
                <strong>{process.env.NEXT_PUBLIC_CLINIC_PHONE || '(555) 555-0100'}</strong> for
                assistance.
              </Text>
            </Stack>
          </Paper>
        ) : (
          <SimpleGrid
            cols={{ base: 1, sm: 2, lg: 3 }}
            spacing="lg"
          >
            {filteredProviders.map((provider) => (
              <ProviderCard
                key={provider.id}
                provider={provider}
                onRequestClick={handleRequestClick}
              />
            ))}
          </SimpleGrid>
        )}
      </Stack>
    </Container>
  );
}
