import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';

export interface TrainRow {
  id: string;
  name: string;
  route: string;
  departure: string;
  arrival: string;
  status: 'On Time' | 'Delayed' | 'Boarding';
  capacity: number;
  booked: number;
}

export interface BookingRow {
  id: string;
  passenger: string;
  trainId: string;
  from: string;
  to: string;
  seat: string;
  status: 'Confirmed' | 'Waiting List' | 'Completed';
  amount: number;
}

export const createDatabase = (dbPath: string): Database.Database => {
  const runtimeDbPath = dbPath.startsWith('/var/task')
    ? path.join('/tmp', 'railway-data', path.basename(dbPath))
    : dbPath;
  const directory = path.dirname(runtimeDbPath);

  fs.mkdirSync(directory, { recursive: true });

  const db = new Database(runtimeDbPath);

  db.exec(`
    CREATE TABLE IF NOT EXISTS trains (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      route TEXT NOT NULL,
      departure TEXT NOT NULL,
      arrival TEXT NOT NULL,
      status TEXT NOT NULL,
      capacity INTEGER NOT NULL,
      booked INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY,
      passenger TEXT NOT NULL,
      trainId TEXT NOT NULL,
      fromCity TEXT NOT NULL,
      toCity TEXT NOT NULL,
      seat TEXT NOT NULL,
      status TEXT NOT NULL,
      amount INTEGER NOT NULL
    );
  `);

  return db;
};

export const listTrains = (db: Database.Database): TrainRow[] =>
  db.prepare('SELECT * FROM trains ORDER BY id').all() as TrainRow[];

export const listBookings = (db: Database.Database): BookingRow[] =>
  db.prepare('SELECT * FROM bookings ORDER BY id').all().map((row: any) => ({
    id: row.id,
    passenger: row.passenger,
    trainId: row.trainId,
    from: row.fromCity,
    to: row.toCity,
    seat: row.seat,
    status: row.status,
    amount: row.amount,
  })) as BookingRow[];

export const createTrain = (db: Database.Database, train: TrainRow): TrainRow => {
  db.prepare(`
    INSERT INTO trains (id, name, route, departure, arrival, status, capacity, booked)
    VALUES (@id, @name, @route, @departure, @arrival, @status, @capacity, @booked)
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      route = excluded.route,
      departure = excluded.departure,
      arrival = excluded.arrival,
      status = excluded.status,
      capacity = excluded.capacity,
      booked = excluded.booked
  `).run(train);

  return train;
};

export const createBooking = (db: Database.Database, booking: BookingRow): BookingRow => {
  db.prepare(`
    INSERT INTO bookings (id, passenger, trainId, fromCity, toCity, seat, status, amount)
    VALUES (@id, @passenger, @trainId, @fromCity, @toCity, @seat, @status, @amount)
  `).run({
    ...booking,
    fromCity: booking.from,
    toCity: booking.to,
  });

  return booking;
};
