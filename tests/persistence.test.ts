import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';

import { readJson, writeJson } from '../src/dataStore.ts';
import { createDatabase, createTrain, listTrains } from '../src/database.ts';

test('readJson creates fallback data and writeJson persists updates', async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'railway-state-'));
  const filePath = path.join(dir, 'state.json');

  const initial = await readJson(filePath, { items: [] });
  assert.deepEqual(initial, { items: [] });

  await writeJson(filePath, { items: [1, 2, 3] });
  const updated = await readJson(filePath, { items: [] });

  assert.deepEqual(updated, { items: [1, 2, 3] });
});

test('createTrain updates an existing train without a primary key error', async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'railway-database-'));
  const db = createDatabase(path.join(dir, 'railway.db'));
  const train = {
    id: 'TR-1',
    name: 'Morning Express',
    route: 'Delhi -> Jaipur',
    departure: '06:00',
    arrival: '10:00',
    status: 'On Time' as const,
    capacity: 500,
    booked: 100,
  };

  createTrain(db, train);
  createTrain(db, { ...train, name: 'Updated Express', status: 'Delayed' });

  assert.deepEqual(listTrains(db), [{ ...train, name: 'Updated Express', status: 'Delayed' }]);
  db.close();
});
