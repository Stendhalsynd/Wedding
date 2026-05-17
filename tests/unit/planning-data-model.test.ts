import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getPlanningOwnerKey,
  getPlanningMergeKey,
  normalizeCurrencyInput,
  planningCollections,
  planningSeed,
} from '../../src/services/planningData';

test('S4-2 defines the full HappyLife planning collection set', () => {
  assert.deepEqual(planningCollections, {
    budgetRows: 'planningBudgetRows',
    vendors: 'planningVendors',
    apartments: 'planningApartments',
    policies: 'planningPolicies',
    timeline: 'planningTimeline',
    metadata: 'planningMetadata',
  });
});

test('S4-2 carries HappyLife seed data into the Wedding data model', () => {
  assert.equal(planningSeed.budgetRows.length, 9);
  assert.equal(planningSeed.vendors.length, 5);
  assert.equal(planningSeed.apartments.length, 8);
  assert.equal(planningSeed.policies.length, 5);
  assert.equal(planningSeed.timeline.length, 6);
  assert.equal(planningSeed.budgetRows[0].actual, 20200000);
});

test('S4-2 resolves solo and connected planning owner keys', () => {
  assert.equal(getPlanningOwnerKey('user-1', null), 'user-1');
  assert.equal(getPlanningOwnerKey('user-1', 'couple-1'), 'couple-1');
});

test('S4-2 keeps seed records deduplicatable during couple migration', () => {
  assert.equal(getPlanningMergeKey({ id: 'user-a_venue', sourceSeedId: 'venue' }), 'venue');
  assert.equal(getPlanningMergeKey({ id: 'custom-record' }), 'custom-record');
});

test('S4-2 normalizes currency inputs before Firestore writes', () => {
  assert.equal(normalizeCurrencyInput('2,750,000원'), 2750000);
  assert.equal(normalizeCurrencyInput(''), 0);
  assert.equal(normalizeCurrencyInput(420000000), 420000000);
});
