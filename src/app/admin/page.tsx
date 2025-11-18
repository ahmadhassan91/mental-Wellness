'use client';

import { useState, useEffect } from 'react';
import {
  Container,
  Title,
  Stack,
  Select,
  Button,
  Group,
  Paper,
  Text,
  PasswordInput,
  TextInput,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { notifications } from '@mantine/notifications';
import { AdminTable } from '@/components/AdminTable';
import { format } from 'date-fns';

interface Provider {
  id: string;
  name: string;
}

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

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [providers, setProviders] = useState<Provider[]>([]);
  const [events, setEvents] = useState<BookingEvent[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const credentials = btoa(`${username}:${password}`);
      const res = await fetch('/api/admin/events', {
        headers: {
          Authorization: `Basic ${credentials}`,
        },
      });

      if (res.ok) {
        setAuthenticated(true);
        localStorage.setItem('adminCredentials', credentials);
        const data = await res.json();
        setEvents(data.events);
        setProviders(data.providers);
      } else {
        notifications.show({
          title: 'Authentication Failed',
          message: 'Invalid username or password',
          color: 'red',
        });
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to authenticate',
        color: 'red',
      });
    }
    setLoading(false);
  };

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const credentials = btoa(`${username}:${password}`);
      const params = new URLSearchParams();
      if (selectedProvider) params.set('providerId', selectedProvider);
      if (dateRange[0]) params.set('startDate', dateRange[0].toISOString());
      if (dateRange[1]) params.set('endDate', dateRange[1].toISOString());

      const res = await fetch(`/api/admin/events?${params}`, {
        headers: {
          Authorization: `Basic ${credentials}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setEvents(data.events);
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to fetch events',
        color: 'red',
      });
    }
    setLoading(false);
  };

  const handleExport = async () => {
    try {
      const credentials = btoa(`${username}:${password}`);
      const params = new URLSearchParams();
      if (selectedProvider) params.set('providerId', selectedProvider);
      if (dateRange[0]) params.set('startDate', dateRange[0].toISOString());
      if (dateRange[1]) params.set('endDate', dateRange[1].toISOString());

      const res = await fetch(`/api/admin/export?${params}`, {
        headers: {
          Authorization: `Basic ${credentials}`,
        },
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-${format(new Date(), 'yyyy-MM-dd')}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        throw new Error('Export failed');
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to export data',
        color: 'red',
      });
    }
  };

  if (!authenticated) {
    return (
      <Container size="xs" py={80}>
        <Paper p="xl" radius="md" withBorder>
          <Stack gap="md">
            <Title order={2} size={28} ta="center" c="slate.9">
              Admin Login
            </Title>
            <TextInput
              label="Username"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              size="md"
            />
            <PasswordInput
              label="Password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              size="md"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleLogin();
              }}
            />
            <Button onClick={handleLogin} loading={loading} size="md" fullWidth>
              Login
            </Button>
          </Stack>
        </Paper>
      </Container>
    );
  }

  return (
    <Container size="xl" py={64}>
      <Stack gap="xl">
        <Group justify="space-between">
          <Title order={1} size={36} fw={700} c="slate.9">
            Analytics Dashboard
          </Title>
          <Group>
            <Button
              component="a"
              href="/admin/appointments"
              variant="filled"
            >
              Manage Appointments
            </Button>
            <Button onClick={handleExport} variant="outline">
              Export CSV
            </Button>
          </Group>
        </Group>

        <Paper p="lg" radius="md" withBorder>
          <Text size="sm" c="slate.6" mb="md">
            Note: All data displayed is non-PHI (no personally identifiable information).
          </Text>
          <Group gap="md" grow>
            <Select
              label="Provider"
              placeholder="All providers"
              data={[
                { value: '', label: 'All providers' },
                ...providers.map((p) => ({ value: p.id, label: p.name })),
              ]}
              value={selectedProvider || ''}
              onChange={(value) => setSelectedProvider(value || null)}
              clearable
            />
            <DatePickerInput
              type="range"
              label="Date Range"
              placeholder="Select date range"
              value={dateRange}
              onChange={setDateRange}
              clearable
            />
            <Button onClick={fetchEvents} loading={loading} mt="auto" style={{ minHeight: 44 }}>
              Apply Filters
            </Button>
          </Group>
        </Paper>

        <Paper p="lg" radius="md" withBorder>
          <Text size="lg" fw={600} mb="md" c="slate.8">
            Events ({events.length})
          </Text>
          <AdminTable events={events} />
        </Paper>
      </Stack>
    </Container>
  );
}
