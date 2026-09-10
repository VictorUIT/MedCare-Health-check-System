import test from 'node:test';
import assert from 'node:assert/strict';

import { isValidAppointmentStatusTransition } from '../src/controllers/appointmentController';

test('CONFIRMED -> COMPLETED is valid', () => {
  assert.equal(isValidAppointmentStatusTransition('CONFIRMED', 'COMPLETED'), true);
});

test('PENDING -> CONFIRMED is valid', () => {
  assert.equal(isValidAppointmentStatusTransition('PENDING', 'CONFIRMED'), true);
});

test('COMPLETED -> CANCELLED is invalid', () => {
  assert.equal(isValidAppointmentStatusTransition('COMPLETED', 'CANCELLED'), false);
});
