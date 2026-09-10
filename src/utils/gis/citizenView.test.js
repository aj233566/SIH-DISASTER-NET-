import { test } from 'node:test';
import assert from 'node:assert/strict';
import { approxDistanceKm, selectCitizenFocus } from './citizenView.js';

// ---- approxDistanceKm --------------------------------------------------
test('approxDistanceKm is ~0 for identical points', () => {
  assert.ok(approxDistanceKm(27.25, 88.54, 27.25, 88.54) < 0.001);
});

test('approxDistanceKm grows with separation (monotonic)', () => {
  const near = approxDistanceKm(27.25, 88.54, 27.24, 88.53);
  const far = approxDistanceKm(27.25, 88.54, 27.10, 88.40);
  assert.ok(far > near);
});

// ---- selectCitizenFocus fixtures --------------------------------------
const incidents = [
  { id: 'A', severity: 'Critical', status: 'Active', affectedPopulation: 3800, location: { lat: 27.25, lng: 88.54 } },
  { id: 'B', severity: 'High', status: 'Active', affectedPopulation: 1640, location: { lat: 27.24, lng: 88.51 } },
  { id: 'C', severity: 'Operational', status: 'Resolved', affectedPopulation: 450, location: { lat: 27.20, lng: 88.52 } }
];
const riskZones = [{ id: 'Z1', name: 'Dikchu Buffer', riskScore: 68, riskLevel: 'High', center: [27.375, 88.532] }];
const shelters = [
  { id: 'S1', name: 'Rangpo Relief', status: 'Operational', location: { lat: 27.178, lng: 88.528 } },
  { id: 'S2', name: 'Singtam Camp', status: 'Operational', location: { lat: 27.234, lng: 88.502 } }
];
const hospitals = [
  { id: 'H1', name: 'STNM Gangtok', status: 'Operational', location: { lat: 27.325, lng: 88.608 } },
  { id: 'H2', name: 'Singtam CHC', status: 'Operational', location: { lat: 27.238, lng: 88.495 } }
];
const routes = [
  { id: 'R1', name: 'Western Ridge', status: 'Recommended' },
  { id: 'R2', name: 'NH-10 Direct', status: 'Blocked' }
];

test('danger point is the top CRITICAL active incident', () => {
  const f = selectCitizenFocus({ incidents, riskZones, shelters, hospitals, routes });
  assert.equal(f.dangerPoint.lat, 27.25);
  assert.equal(f.dangerPoint.lng, 88.54);
  assert.equal(f.dangerLevel, 'CRITICAL');
});

test('resolved incidents are never chosen as the danger point', () => {
  const onlyResolved = [{ id: 'C', severity: 'Critical', status: 'Resolved', location: { lat: 27.20, lng: 88.52 } }];
  const f = selectCitizenFocus({ incidents: onlyResolved, riskZones, shelters, hospitals, routes });
  // falls back to the highest-risk zone centre, not the resolved incident
  assert.notEqual(f.dangerPoint.lng, 88.52);
});

test('nearest shelter and hospital are measured from the danger point', () => {
  const f = selectCitizenFocus({ incidents, riskZones, shelters, hospitals, routes });
  assert.equal(f.nearestShelter.id, 'S2');
  assert.equal(f.nearestHospital.id, 'H2');
  assert.ok(f.nearestShelter.distanceKm > 0);
  assert.ok(f.nearestHospital.distanceKm > 0);
});

test('primary safe route prefers a Recommended (non-blocked) route', () => {
  const f = selectCitizenFocus({ incidents, riskZones, shelters, hospitals, routes });
  assert.equal(f.primaryRoute.id, 'R1');
});

test('falls back to highest-risk zone centre when there are no active incidents', () => {
  const f = selectCitizenFocus({ incidents: [], riskZones, shelters, hospitals, routes });
  assert.equal(f.dangerPoint.lat, 27.375);
  assert.equal(f.dangerPoint.lng, 88.532);
});

test('degrades safely with empty inputs (no throw, null selections)', () => {
  const f = selectCitizenFocus({});
  assert.equal(f.dangerPoint, null);
  assert.equal(f.nearestShelter, null);
  assert.equal(f.nearestHospital, null);
});
