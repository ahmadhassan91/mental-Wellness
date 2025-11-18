// Debug script to test appointment payload validation
// Run with: node debug-appointment.js

// Mock payload from AppointmentBooking.tsx
const testPayload = {
  providerId: 'test-provider-id',
  appointmentDate: '2024-01-15', // ISO date format
  startTime: '09:00', // HH:mm format
  patientName: 'John Doe',
  patientEmail: 'john@example.com',
  patientPhone: '1234567890',
  appointmentType: 'initial', // 'initial' or 'follow_up'
  modality: 'telehealth', // 'telehealth' or 'in_person'
  notes: '', // Empty string
  utm: {}, // Empty object
};

console.log('📦 Test Payload:');
console.log(JSON.stringify(testPayload, null, 2));

console.log('\n🔍 Field Validation:');

// Manual validation checks
const checks = {
  providerId: {
    value: testPayload.providerId,
    valid: typeof testPayload.providerId === 'string' && testPayload.providerId.length > 0,
    rule: 'string().min(1)'
  },
  appointmentDate: {
    value: testPayload.appointmentDate,
    valid: /^\d{4}-\d{2}-\d{2}$/.test(testPayload.appointmentDate),
    rule: 'string().regex(/^\\d{4}-\\d{2}-\\d{2}$/)'
  },
  startTime: {
    value: testPayload.startTime,
    valid: /^\d{2}:\d{2}$/.test(testPayload.startTime),
    rule: 'string().regex(/^\\d{2}:\\d{2}$/)'
  },
  patientName: {
    value: testPayload.patientName,
    valid: typeof testPayload.patientName === 'string' && testPayload.patientName.length > 0,
    rule: 'string().min(1)'
  },
  patientEmail: {
    value: testPayload.patientEmail,
    valid: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(testPayload.patientEmail),
    rule: 'string().email()'
  },
  patientPhone: {
    value: testPayload.patientPhone,
    valid: typeof testPayload.patientPhone === 'string' && testPayload.patientPhone.length >= 10,
    rule: 'string().min(10)'
  },
  appointmentType: {
    value: testPayload.appointmentType,
    valid: ['initial', 'follow_up'].includes(testPayload.appointmentType),
    rule: "enum(['initial', 'follow_up'])"
  },
  modality: {
    value: testPayload.modality,
    valid: ['telehealth', 'in_person'].includes(testPayload.modality),
    rule: "enum(['telehealth', 'in_person'])"
  },
  notes: {
    value: testPayload.notes,
    valid: typeof testPayload.notes === 'string' || testPayload.notes === undefined,
    rule: 'string().optional()'
  },
  utm: {
    value: testPayload.utm,
    valid: typeof testPayload.utm === 'object' || testPayload.utm === undefined,
    rule: 'record(string()).optional()'
  }
};

let allValid = true;
Object.entries(checks).forEach(([field, check]) => {
  const status = check.valid ? '✅' : '❌';
  console.log(`${status} ${field}: ${JSON.stringify(check.value)} (${check.rule})`);
  if (!check.valid) allValid = false;
});

console.log('\n' + (allValid ? '✅ All validations passed!' : '❌ Some validations failed!'));

// Common issues
console.log('\n🔧 Common Issues:');
console.log('1. startTime format must be "09:00" not "9:00" (zero-padded)');
console.log('2. appointmentDate must be "YYYY-MM-DD" format');
console.log('3. notes can be empty string "" or omitted entirely');
console.log('4. utm can be empty object {} or omitted entirely');
console.log('5. patientPhone must be at least 10 characters');
