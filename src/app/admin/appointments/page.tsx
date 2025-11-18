'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Container,
  Title,
  Stack,
  Table,
  Badge,
  Button,
  Group,
  TextInput,
  Select,
  Paper,
  Text,
  Alert,
  Modal,
  Textarea,
} from '@mantine/core';
import { DatePicker } from '@mantine/dates';
import { notifications } from '@mantine/notifications';
import { IconSearch, IconRefresh, IconCheck, IconAlertCircle } from '@tabler/icons-react';

interface Appointment {
  id: string;
  provider_id: string;
  patient_name: string;
  patient_email: string;
  patient_phone: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  appointment_type: string;
  modality: string;
  status: string;
  notes?: string;
  synced_to_emr: boolean;
  created_at: string;
}

export default function AdminAppointmentsPage() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<Date | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  useEffect(() => {
    const credentials = localStorage.getItem('adminCredentials');
    if (!credentials) {
      router.push('/admin');
      return;
    }

    fetchAppointments();
  }, [router, statusFilter, dateFilter]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const credentials = localStorage.getItem('adminCredentials');
      if (!credentials) return;

      let url = '/api/appointments?';
      if (statusFilter) url += `status=${statusFilter}&`;
      if (dateFilter) url += `date=${dateFilter.toISOString().split('T')[0]}&`;

      const response = await fetch(url.slice(0, -1), {
        headers: {
          Authorization: `Basic ${credentials}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch appointments');

      const data = await response.json();
      setAppointments(data);
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to load appointments',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSyncToTherapyNotes = async (appointmentId?: string) => {
    setSyncing(true);
    try {
      const credentials = localStorage.getItem('adminCredentials');
      if (!credentials) return;

      const response = await fetch('/api/appointments/sync-therapynotes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${credentials}`,
        },
        body: JSON.stringify(appointmentId ? { appointmentId } : {}),
      });

      if (!response.ok) throw new Error('Sync failed');

      const result = await response.json();

      notifications.show({
        title: 'Sync Complete',
        message: `Synced: ${result.synced}, Failed: ${result.failed}`,
        color: result.failed > 0 ? 'yellow' : 'green',
        icon: <IconCheck />,
      });

      fetchAppointments();
    } catch (error) {
      notifications.show({
        title: 'Sync Failed',
        message: 'Unable to sync appointments to TherapyNotes',
        color: 'red',
        icon: <IconAlertCircle />,
      });
    } finally {
      setSyncing(false);
    }
  };

  const updateAppointmentStatus = async (appointmentId: string, newStatus: string) => {
    try {
      const credentials = localStorage.getItem('adminCredentials');
      if (!credentials) return;

      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${credentials}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('Update failed');

      notifications.show({
        title: 'Updated',
        message: 'Appointment status updated',
        color: 'green',
      });

      fetchAppointments();
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to update appointment',
        color: 'red',
      });
    }
  };

  const filteredAppointments = appointments.filter((apt) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      apt.patient_name.toLowerCase().includes(search) ||
      apt.patient_email.toLowerCase().includes(search) ||
      apt.patient_phone.includes(search)
    );
  });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'yellow',
      confirmed: 'green',
      cancelled: 'red',
      completed: 'blue',
      no_show: 'gray',
    };
    return colors[status] || 'gray';
  };

  return (
    <Container size="xl" py={40}>
      <Stack gap="xl">
        <Group justify="space-between">
          <Title order={1}>Appointments Management</Title>
          <Button
            leftSection={<IconRefresh size={16} />}
            onClick={() => handleSyncToTherapyNotes()}
            loading={syncing}
          >
            Sync All to TherapyNotes
          </Button>
        </Group>

        <Paper p="md" withBorder>
          <Group>
            <TextInput
              placeholder="Search by name, email, or phone..."
              leftSection={<IconSearch size={16} />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ flex: 1 }}
            />

            <Select
              placeholder="Filter by status"
              clearable
              value={statusFilter}
              onChange={setStatusFilter}
              data={[
                { value: 'pending', label: 'Pending' },
                { value: 'confirmed', label: 'Confirmed' },
                { value: 'cancelled', label: 'Cancelled' },
                { value: 'completed', label: 'Completed' },
                { value: 'no_show', label: 'No Show' },
              ]}
              style={{ width: 200 }}
            />

            <DatePicker
              placeholder="Filter by date"
              value={dateFilter}
              onChange={setDateFilter}
              style={{ width: 200 }}
            />
          </Group>
        </Paper>

        {loading ? (
          <Text>Loading appointments...</Text>
        ) : filteredAppointments.length === 0 ? (
          <Alert color="blue">No appointments found</Alert>
        ) : (
          <Paper withBorder>
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Patient</Table.Th>
                  <Table.Th>Date & Time</Table.Th>
                  <Table.Th>Type</Table.Th>
                  <Table.Th>Modality</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>EMR Sync</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {filteredAppointments.map((apt) => (
                  <Table.Tr key={apt.id}>
                    <Table.Td>
                      <Stack gap={4}>
                        <Text fw={500}>{apt.patient_name}</Text>
                        <Text size="sm" c="dimmed">
                          {apt.patient_email}
                        </Text>
                        <Text size="sm" c="dimmed">
                          {apt.patient_phone}
                        </Text>
                      </Stack>
                    </Table.Td>
                    <Table.Td>
                      <Stack gap={4}>
                        <Text>{new Date(apt.appointment_date).toLocaleDateString()}</Text>
                        <Text size="sm" c="dimmed">
                          {apt.start_time} - {apt.end_time}
                        </Text>
                      </Stack>
                    </Table.Td>
                    <Table.Td>
                      <Badge variant="light">
                        {apt.appointment_type === 'initial' ? 'Initial' : 'Follow-up'}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Badge variant="light" color="cyan">
                        {apt.modality === 'telehealth' ? 'Telehealth' : 'In-Person'}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Select
                        value={apt.status}
                        onChange={(value) => value && updateAppointmentStatus(apt.id, value)}
                        data={[
                          { value: 'pending', label: 'Pending' },
                          { value: 'confirmed', label: 'Confirmed' },
                          { value: 'cancelled', label: 'Cancelled' },
                          { value: 'completed', label: 'Completed' },
                          { value: 'no_show', label: 'No Show' },
                        ]}
                        size="xs"
                      />
                    </Table.Td>
                    <Table.Td>
                      {apt.synced_to_emr ? (
                        <Badge color="green" leftSection={<IconCheck size={12} />}>
                          Synced
                        </Badge>
                      ) : (
                        <Button
                          size="xs"
                          variant="light"
                          onClick={() => handleSyncToTherapyNotes(apt.id)}
                          loading={syncing}
                        >
                          Sync Now
                        </Button>
                      )}
                    </Table.Td>
                    <Table.Td>
                      <Button
                        size="xs"
                        variant="subtle"
                        onClick={() => {
                          setSelectedAppointment(apt);
                          setDetailsModalOpen(true);
                        }}
                      >
                        View Details
                      </Button>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Paper>
        )}
      </Stack>

      <Modal
        opened={detailsModalOpen}
        onClose={() => {
          setDetailsModalOpen(false);
          setSelectedAppointment(null);
        }}
        title="Appointment Details"
        size="lg"
      >
        {selectedAppointment && (
          <Stack gap="md">
            <Group justify="space-between">
              <Text fw={500}>Patient Name:</Text>
              <Text>{selectedAppointment.patient_name}</Text>
            </Group>
            <Group justify="space-between">
              <Text fw={500}>Email:</Text>
              <Text>{selectedAppointment.patient_email}</Text>
            </Group>
            <Group justify="space-between">
              <Text fw={500}>Phone:</Text>
              <Text>{selectedAppointment.patient_phone}</Text>
            </Group>
            <Group justify="space-between">
              <Text fw={500}>Date:</Text>
              <Text>{new Date(selectedAppointment.appointment_date).toLocaleDateString()}</Text>
            </Group>
            <Group justify="space-between">
              <Text fw={500}>Time:</Text>
              <Text>
                {selectedAppointment.start_time} - {selectedAppointment.end_time}
              </Text>
            </Group>
            <Group justify="space-between">
              <Text fw={500}>Type:</Text>
              <Badge>
                {selectedAppointment.appointment_type === 'initial' ? 'Initial' : 'Follow-up'}
              </Badge>
            </Group>
            <Group justify="space-between">
              <Text fw={500}>Modality:</Text>
              <Badge color="cyan">
                {selectedAppointment.modality === 'telehealth' ? 'Telehealth' : 'In-Person'}
              </Badge>
            </Group>
            <Group justify="space-between">
              <Text fw={500}>Status:</Text>
              <Badge color={getStatusColor(selectedAppointment.status)}>
                {selectedAppointment.status}
              </Badge>
            </Group>
            {selectedAppointment.notes && (
              <Stack gap="xs">
                <Text fw={500}>Notes:</Text>
                <Textarea value={selectedAppointment.notes} readOnly minRows={3} />
              </Stack>
            )}
            <Group justify="space-between">
              <Text fw={500}>Synced to EMR:</Text>
              {selectedAppointment.synced_to_emr ? (
                <Badge color="green">Yes</Badge>
              ) : (
                <Badge color="yellow">No</Badge>
              )}
            </Group>
          </Stack>
        )}
      </Modal>
    </Container>
  );
}
