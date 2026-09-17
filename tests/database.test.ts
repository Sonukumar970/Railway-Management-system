import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { createDatabase, listTrains, createTrain, createBooking } from '../backend/src/database.ts';

test('database stores trains and bookings persistently', async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'railway-db-'));
  const dbPath = path.join(tempDir, 'railway.db');

  const db = createDatabase(dbPath);
  createTrain(db, {
    id: 'TR-900',
    name: 'Coastal Express',
    route: 'Mumbai → Goa',
    departure: '07:30',
    arrival: '11:15',
    status: 'On Time',
    capacity: 200,
    booked: 120,
  });

  createBooking(db, {
    id: 'BK-900',
    passenger: 'Nisha Rao',
    trainId: 'TR-900',
    from: 'Mumbai',
    to: 'Goa',
    seat: 'D10',
    status: 'Confirmed',
    amount: 1420,
  });

  const trains = listTrains(db);
  assert.equal(trains.length, 1);
  assert.equal(trains[0].name, 'Coastal Express');
});
