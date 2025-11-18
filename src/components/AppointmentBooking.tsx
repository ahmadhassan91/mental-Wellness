'use client';

import { useState, useEffect } from 'react';
import {
  Modal,
  Stepper,
  Button,
  Group,
  TextInput,
  Select,
  Textarea,
  Stack,
  Text,
  Paper,
  Grid,
  Badge,
  Alert
} from '@mantine/core';
import { DatePicker } from '@mantine/dates';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconAlertCircle } from '@tabler/icons-react';

interface AppointmentBookingProps {
  opened: boolean;
  onClose: () => void;
  providerId: string;
  providerName: string;
  utm?: Record<string, string>;
}

interface TimeSlot {
  time: string;
  available: boolean;
}

export function AppointmentBooking({
  opened,
  onClose,
  providerId,
  providerName,
  utm = {}
}: AppointmentBookingProps) {
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(false);

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);

  const [formData, setFormData] = useState({
    patientName: '',
    patientEmail: '',
    patientPhone: '',
    appointmentType: 'initial',
    modality: 'telehealth',
    notes: '',
  });

  useEffect(() => {
    if (selectedDate) {
      fetchAvailableSlots();
    }
  }, [selectedDate]);

  const fetchAvailableSlots = async () => {
    if (!selectedDate) return;

    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const response = await fetch(
        `/api/appointments/availability?providerId=${providerId}&date=${dateStr}`
      );
      const data = await response.json();
      setAvailableSlots(data.slots || []);
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to load available time slots',
        color: 'red',
      });
    }
  };

  const handleSubmit = async () => {
    // Validate date and time
    if (!selectedDate || !selectedTime) {
      notifications.show({
        title: 'Missing Information',
        message: 'Please select a date and time',
        color: 'yellow',
      });
      return;
    }

    // Validate required fields
    if (!formData.patientName.trim()) {
      notifications.show({
        title: 'Missing Information',
        message: 'Please enter your full name',
        color: 'yellow',
      });
      return;
    }

    if (!formData.patientEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.patientEmail)) {
      notifications.show({
        title: 'Invalid Email',
        message: 'Please enter a valid email address',
        color: 'yellow',
      });
      return;
    }

    if (!formData.patientPhone || formData.patientPhone.length < 10) {
      notifications.show({
        title: 'Invalid Phone',
        message: 'Please enter a valid phone number (at least 10 digits)',
        color: 'yellow',
      });
      return;
    }

    setLoading(true);

    try {
      const payload = {
        providerId,
        appointmentDate: selectedDate.toISOString().split('T')[0],
        startTime: selectedTime,
        ...formData,
        utm,
      };

      // Log payload for debugging (remove in production)
      console.log('📤 Sending appointment request:', payload);

      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('❌ Appointment booking failed:', result);
        
        // Show detailed error if available
        const errorMessage = result.details 
          ? result.details.map((d: any) => `${d.field}: ${d.message}`).join(', ')
          : result.error || 'Failed to book appointment';
        
        throw new Error(errorMessage);
      }

      console.log('✅ Appointment booked successfully:', result);

      notifications.show({
        title: 'Appointment Booked!',
        message: 'You will receive a confirmation email shortly.',
        color: 'green',
        icon: <IconCheck />,
      });

      onClose();
      setActive(0);
      resetForm();
    } catch (error) {
      notifications.show({
        title: 'Booking Failed',
        message: error instanceof Error ? error.message : 'Unable to book appointment. Please try again.',
        color: 'red',
        icon: <IconAlertCircle />,
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedDate(null);
    setSelectedTime(null);
    setFormData({
      patientName: '',
      patientEmail: '',
      patientPhone: '',
      appointmentType: 'initial',
      modality: 'telehealth',
      notes: '',
    });
  };

  const nextStep = () => setActive((current) => (current < 2 ? current + 1 : current));
  const prevStep = () => setActive((current) => (current > 0 ? current - 1 : current));

  const minDate = new Date();
  const maxDate = new Date();
  maxDate.setMonth(maxDate.getMonth() + 3);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={`Book Appointment with ${providerName}`}
      size="xl"
      closeOnClickOutside={false}
    >
      <Stepper active={active} onStepClick={setActive}>
        <Stepper.Step label="Date & Time" description="Choose your slot">
          <Stack gap="md" mt="xl">
            <DatePicker
              value={selectedDate}
              onChange={setSelectedDate}
              minDate={minDate}
              maxDate={maxDate}
              excludeDate={(date) => date.getDay() === 0 || date.getDay() === 6}
            />

            {selectedDate && availableSlots.length > 0 && (
              <Stack gap="xs">
                <Text fw={500}>Available Times</Text>
                <Grid>
                  {availableSlots.map((slot) => (
                    <Grid.Col key={slot.time} span={4}>
                      <Button
                        fullWidth
                        variant={selectedTime === slot.time ? 'filled' : 'outline'}
                        disabled={!slot.available}
                        onClick={() => setSelectedTime(slot.time)}
                      >
                        {slot.time}
                      </Button>
                    </Grid.Col>
                  ))}
                </Grid>
              </Stack>
            )}

            {selectedDate && availableSlots.length === 0 && (
              <Alert color="yellow" icon={<IconAlertCircle />}>
                No available slots for this date. Please select another date.
              </Alert>
            )}
          </Stack>
        </Stepper.Step>

        <Stepper.Step label="Your Information" description="Contact details">
          <Stack gap="md" mt="xl">
            <TextInput
              label="Full Name"
              placeholder="John Doe"
              required
              value={formData.patientName}
              onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
            />

            <TextInput
              label="Email"
              placeholder="john@example.com"
              type="email"
              required
              value={formData.patientEmail}
              onChange={(e) => setFormData({ ...formData, patientEmail: e.target.value })}
            />

            <TextInput
              label="Phone"
              placeholder="5551234567"
              type="tel"
              required
              value={formData.patientPhone}
              onChange={(e) => {
                // Remove non-numeric characters for validation
                const cleaned = e.target.value.replace(/\D/g, '');
                setFormData({ ...formData, patientPhone: cleaned });
              }}
              description="Enter 10 digits (numbers only)"
            />

            <Select
              label="Appointment Type"
              required
              value={formData.appointmentType}
              onChange={(value) => setFormData({ ...formData, appointmentType: value || 'initial' })}
              data={[
                { value: 'initial', label: 'Initial Consultation' },
                { value: 'follow_up', label: 'Follow-up Session' },
              ]}
            />

            <Select
              label="Preferred Modality"
              required
              value={formData.modality}
              onChange={(value) => setFormData({ ...formData, modality: value || 'telehealth' })}
              data={[
                { value: 'telehealth', label: 'Telehealth (Video)' },
                { value: 'in_person', label: 'In-Person' },
              ]}
            />

            <Textarea
              label="Additional Notes"
              placeholder="Any specific concerns or questions..."
              minRows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </Stack>
        </Stepper.Step>

        <Stepper.Step label="Confirm" description="Review & book">
          <Stack gap="md" mt="xl">
            <Paper p="md" withBorder>
              <Stack gap="sm">
                <Group justify="space-between">
                  <Text fw={500}>Provider</Text>
                  <Text>{providerName}</Text>
                </Group>

                <Group justify="space-between">
                  <Text fw={500}>Date</Text>
                  <Text>{selectedDate?.toLocaleDateString()}</Text>
                </Group>

                <Group justify="space-between">
                  <Text fw={500}>Time</Text>
                  <Text>{selectedTime}</Text>
                </Group>

                <Group justify="space-between">
                  <Text fw={500}>Type</Text>
                  <Badge>{formData.appointmentType === 'initial' ? 'Initial Consultation' : 'Follow-up'}</Badge>
                </Group>

                <Group justify="space-between">
                  <Text fw={500}>Modality</Text>
                  <Badge color="cyan">{formData.modality === 'telehealth' ? 'Telehealth' : 'In-Person'}</Badge>
                </Group>

                <Group justify="space-between">
                  <Text fw={500}>Patient</Text>
                  <Text>{formData.patientName}</Text>
                </Group>

                <Group justify="space-between">
                  <Text fw={500}>Email</Text>
                  <Text size="sm">{formData.patientEmail}</Text>
                </Group>

                <Group justify="space-between">
                  <Text fw={500}>Phone</Text>
                  <Text>{formData.patientPhone}</Text>
                </Group>

                {formData.notes && (
                  <>
                    <Text fw={500}>Notes</Text>
                    <Text size="sm" c="dimmed">{formData.notes}</Text>
                  </>
                )}
              </Stack>
            </Paper>

            <Alert color="blue">
              You will receive a confirmation email with appointment details and next steps.
            </Alert>
          </Stack>
        </Stepper.Step>

        <Stepper.Completed>
          <Alert color="green" icon={<IconCheck />} mt="xl">
            Appointment successfully booked!
          </Alert>
        </Stepper.Completed>
      </Stepper>

      <Group justify="space-between" mt="xl">
        <Button variant="default" onClick={prevStep} disabled={active === 0}>
          Back
        </Button>

        {active < 2 && (
          <Button
            onClick={nextStep}
            disabled={
              (active === 0 && (!selectedDate || !selectedTime)) ||
              (active === 1 && (!formData.patientName || !formData.patientEmail || !formData.patientPhone))
            }
          >
            Next
          </Button>
        )}

        {active === 2 && (
          <Button onClick={handleSubmit} loading={loading}>
            Confirm Booking
          </Button>
        )}
      </Group>
    </Modal>
  );
}
