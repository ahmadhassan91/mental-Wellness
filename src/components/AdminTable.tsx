'use client';

import { Table, Text, Badge, ScrollArea } from '@mantine/core';
import { format } from 'date-fns';

interface BookingEvent {
  id: string;
  providerId: string;
  eventType: string;
  utm: Record<string, string> | null;
  createdAt: string;
  provider: {
    name: string;
  };
}

interface AdminTableProps {
  events: BookingEvent[];
}

export function AdminTable({ events }: AdminTableProps) {
  if (events.length === 0) {
    return (
      <Text size="md" c="slate.6" ta="center" py="xl">
        No events found matching your filters.
      </Text>
    );
  }

  return (
    <ScrollArea>
      <Table striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Timestamp</Table.Th>
            <Table.Th>Provider</Table.Th>
            <Table.Th>Event Type</Table.Th>
            <Table.Th>UTM Source</Table.Th>
            <Table.Th>UTM Medium</Table.Th>
            <Table.Th>UTM Campaign</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {events.map((event) => {
            const utm = event.utm as Record<string, string> | null;
            return (
              <Table.Tr key={event.id}>
                <Table.Td>
                  <Text size="sm">{format(new Date(event.createdAt), 'MMM d, yyyy HH:mm')}</Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm" fw={500}>
                    {event.provider.name}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Badge
                    variant="light"
                    color={event.eventType === 'click' ? 'medicalCyan' : 'mint'}
                    size="sm"
                  >
                    {event.eventType}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Text size="sm" c="slate.6">
                    {utm?.source || '—'}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm" c="slate.6">
                    {utm?.medium || '—'}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm" c="slate.6">
                    {utm?.campaign || '—'}
                  </Text>
                </Table.Td>
              </Table.Tr>
            );
          })}
        </Table.Tbody>
      </Table>
    </ScrollArea>
  );
}
