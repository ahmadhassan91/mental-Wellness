'use client';

import { MultiSelect, SegmentedControl, Stack, Text } from '@mantine/core';

interface ProviderFiltersProps {
  selectedSpecialties: string[];
  onSpecialtiesChange: (value: string[]) => void;
  modality: string;
  onModalityChange: (value: string) => void;
  availableSpecialties: string[];
}

export function ProviderFilters({
  selectedSpecialties,
  onSpecialtiesChange,
  modality,
  onModalityChange,
  availableSpecialties,
}: ProviderFiltersProps) {
  return (
    <Stack gap="md">
      <div>
        <Text size="sm" fw={500} mb="xs" c="slate.7">
          Specialties
        </Text>
        <MultiSelect
          placeholder="Select specialties"
          data={availableSpecialties}
          value={selectedSpecialties}
          onChange={onSpecialtiesChange}
          searchable
          clearable
          styles={{
            input: {
              minHeight: 44,
            },
          }}
        />
      </div>

      <div>
        <Text size="sm" fw={500} mb="xs" c="slate.7">
          Modality
        </Text>
        <SegmentedControl
          value={modality}
          onChange={onModalityChange}
          data={[
            { label: 'All', value: 'all' },
            { label: 'Telehealth', value: 'telehealth' },
            { label: 'In-person', value: 'in_person' },
          ]}
          fullWidth
          styles={{
            root: {
              minHeight: 44,
            },
            label: {
              padding: '10px 16px',
            },
          }}
        />
      </div>
    </Stack>
  );
}
