import express, { Request, Response } from 'express';
import path from 'path';
import { createDatabase, listTrains, listBookings, createTrain, createBooking } from './database';

interface Train {
  id: string;
  name: string;
  route: string;
  departure: string;
  arrival: string;
  status: 'On Time' | 'Delayed' | 'Boarding';
  capacity: number;
  booked: number;
}

interface Booking {
  id: string;
  passenger: string;
  trainId: string;
  from: string;
  to: string;
  seat: string;
  status: 'Confirmed' | 'Waiting List' | 'Completed';
  amount: number;
}

interface Station {
  id: string;
  name: string;
  code: string;
  platform: string;
  arrivals: number;
  departures: number;
}

interface RouteInfo {
  id: string;
  from: string;
  to: string;
  distance: string;
  duration: string;
  trains: number;
  status: 'Available' | 'Moderate' | 'Busy';
}

interface StaffUser {
  id: string;
  username: string;
  password: string;
  role: 'admin' | 'staff';
  name: string;
}

const staffUsers: StaffUser[] = [
  { id: 'user-admin', username: 'admin', password: 'railway123', role: 'admin', name: 'Operations Admin' },
];

const initialTrains: Train[] = [
  {
    id: 'RAJ-101',
    name: 'Rajdhani Express',
    route: 'New Delhi → Mumbai',
    departure: '06:15',
    arrival: '18:40',
    status: 'On Time',
    capacity: 320,
    booked: 268,
  },
  {
    id: 'SHI-214',
    name: 'Shatabdi Intercity',
    route: 'Lucknow → Kanpur',
    departure: '08:00',
    arrival: '09:35',
    status: 'Boarding',
    capacity: 180,
    booked: 169,
  },
  {
    id: 'GRA-442',
    name: 'Grand Trunk Express',
    route: 'Howrah → Chennai',
    departure: '12:30',
    arrival: '07:10',
    status: 'Delayed',
    capacity: 240,
    booked: 184,
  },
  {
    id: 'HIM-321',
    name: 'Himalayan Mail',
    route: 'Jaipur → Bhopal',
    departure: '15:45',
    arrival: '23:25',
    status: 'On Time',
    capacity: 200,
    booked: 146,
  },
];

const initialBookings: Booking[] = [
  { id: 'BK-1001', passenger: 'Aarav Singh', trainId: 'RAJ-101', from: 'New Delhi', to: 'Mumbai', seat: 'A12', status: 'Confirmed', amount: 2890 },
  { id: 'BK-1002', passenger: 'Meera Nair', trainId: 'SHI-214', from: 'Lucknow', to: 'Kanpur', seat: 'C08', status: 'Confirmed', amount: 780 },
  { id: 'BK-1003', passenger: 'Rahul Verma', trainId: 'GRA-442', from: 'Howrah', to: 'Chennai', seat: 'D16', status: 'Waiting List', amount: 1650 },
  { id: 'BK-1004', passenger: 'Sana Khan', trainId: 'HIM-321', from: 'Jaipur', to: 'Bhopal', seat: 'B04', status: 'Completed', amount: 1325 },
  { id: 'BK-1005', passenger: 'Vikram Das', trainId: 'RAJ-101', from: 'New Delhi', to: 'Mumbai', seat: 'E22', status: 'Confirmed', amount: 3210 },
];

const stations: Station[] = [
  { id: 'ST-01', name: 'New Delhi', code: 'NDLS', platform: '12', arrivals: 18, departures: 22 },
  { id: 'ST-02', name: 'Lucknow Junction', code: 'LJN', platform: '4', arrivals: 14, departures: 17 },
  { id: 'ST-03', name: 'Howrah', code: 'HWH', platform: '9', arrivals: 20, departures: 19 },
  { id: 'ST-04', name: 'Jaipur City', code: 'JP', platform: '3', arrivals: 12, departures: 15 },
];

const initialRoutes: RouteInfo[] = [
  { id: 'RT-101', from: 'New Delhi', to: 'Mumbai', distance: '1,436 km', duration: '18h 30m', trains: 3, status: 'Busy' },
  { id: 'RT-214', from: 'Lucknow', to: 'Kanpur', distance: '86 km', duration: '1h 35m', trains: 2, status: 'Available' },
  { id: 'RT-442', from: 'Howrah', to: 'Chennai', distance: '1,670 km', duration: '27h 20m', trains: 2, status: 'Moderate' },
  { id: 'RT-321', from: 'Jaipur', to: 'Bhopal', distance: '620 km', duration: '9h 10m', trains: 1, status: 'Available' },
];

const isServerlessRuntime = Boolean(
  process.env.VERCEL ||
  process.env.VERCEL_ENV ||
  process.env.VERCEL_URL ||
  process.env.NOW_REGION ||
  __dirname.startsWith('/var/task') ||
  process.cwd().startsWith('/var/task') ||
  process.platform !== 'win32',
);
const dataPath = isServerlessRuntime ? path.join('/tmp', 'railway-data') : path.join(__dirname, '../../data');
const stateFile = path.join(dataPath, 'state.json');

const db = createDatabase(path.join(__dirname, '../data/railway.db'));

const seedDatabase = () => {
  const currentTrains = listTrains(db);
  if (currentTrains.length === 0) {
    initialTrains.forEach((train) => createTrain(db, train));
  }

  const currentBookings = listBookings(db);
  if (currentBookings.length === 0) {
    initialBookings.forEach((booking) => createBooking(db, {
      ...booking,
      from: booking.from,
      to: booking.to,
    }));
  }
};

seedDatabase();

const trains: Train[] = listTrains(db);
const bookings: Booking[] = listBookings(db).map((booking) => ({
  ...booking,
  from: booking.from,
  to: booking.to,
}));
const routes: RouteInfo[] = initialRoutes;

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '../../frontend/public')));

app.get('/api/overview', (_req: Request, res: Response) => {
  const totalBookings = bookings.length;
  const confirmedBookings = bookings.filter((booking) => booking.status === 'Confirmed').length;
  const totalSeats = trains.reduce((sum, train) => sum + train.capacity, 0);
  const bookedSeats = trains.reduce((sum, train) => sum + train.booked, 0);
  const occupancy = Math.round((bookedSeats / totalSeats) * 100);

  res.json({
    totalTrains: trains.length,
    totalStations: stations.length,
    activeBookings: totalBookings,
    confirmedBookings,
    occupancy,
    revenue: bookings.reduce((sum, booking) => sum + booking.amount, 0),
  });
});

app.get('/api/trains', (_req: Request, res: Response) => {
  res.json(trains);
});

app.post('/api/trains', async (req: Request, res: Response) => {
  const { name, route, departure, arrival, status, capacity, booked } = req.body ?? {};

  if (!name || !route || !departure || !arrival || !status || !capacity) {
    return res.status(400).json({ message: 'Missing required train fields.' });
  }

  const validStatus = ['On Time', 'Delayed', 'Boarding'].includes(status) ? status : 'On Time';
  const newTrain: Train = {
    id: `TR-${Date.now()}`,
    name,
    route,
    departure,
    arrival,
    status: validStatus as Train['status'],
    capacity: Number(capacity),
    booked: Number(booked ?? 0),
  };

  trains.unshift(newTrain);
  createTrain(db, newTrain);
  return res.status(201).json(newTrain);
});

app.put('/api/trains/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, route, departure, arrival, status, capacity, booked } = req.body ?? {};

  const trainIndex = trains.findIndex((train) => train.id === id);
  if (trainIndex === -1) {
    return res.status(404).json({ message: 'Train not found.' });
  }

  const validStatus = ['On Time', 'Delayed', 'Boarding'].includes(status) ? status : trains[trainIndex].status;

  trains[trainIndex] = {
    ...trains[trainIndex],
    name: name ?? trains[trainIndex].name,
    route: route ?? trains[trainIndex].route,
    departure: departure ?? trains[trainIndex].departure,
    arrival: arrival ?? trains[trainIndex].arrival,
    status: validStatus as Train['status'],
    capacity: Number(capacity ?? trains[trainIndex].capacity),
    booked: Number(booked ?? trains[trainIndex].booked),
  };

  createTrain(db, trains[trainIndex]);
  return res.json(trains[trainIndex]);
});

app.delete('/api/trains/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const trainIndex = trains.findIndex((train) => train.id === id);

  if (trainIndex === -1) {
    return res.status(404).json({ message: 'Train not found.' });
  }

  const [deletedTrain] = trains.splice(trainIndex, 1);
  return res.json(deletedTrain);
});

app.get('/api/bookings', (_req: Request, res: Response) => {
  res.json(bookings);
});

app.post('/api/bookings', async (req: Request, res: Response) => {
  const { passenger, trainId, from, to, seat, amount } = req.body ?? {};

  if (!passenger || !trainId || !from || !to || !seat || !amount) {
    return res.status(400).json({ message: 'Missing required booking fields.' });
  }

  const newBooking: Booking = {
    id: `BK-${Date.now()}`,
    passenger,
    trainId,
    from,
    to,
    seat,
    status: 'Confirmed',
    amount: Number(amount),
  };

  bookings.unshift(newBooking);
  createBooking(db, newBooking);
  return res.status(201).json(newBooking);
});

app.post('/api/register', (req: Request, res: Response) => {
  const { name, username, password } = req.body ?? {};

  if (!name || !username || !password) {
    return res.status(400).json({ message: 'Name, username, and password are required.' });
  }

  const normalizedUsername = String(username).trim();
  if (normalizedUsername.length < 3) {
    return res.status(400).json({ message: 'Username must be at least 3 characters long.' });
  }

  const existingUser = staffUsers.find((entry) => entry.username.toLowerCase() === normalizedUsername.toLowerCase());
  if (existingUser) {
    return res.status(409).json({ message: 'This username is already taken.' });
  }

  const newUser: StaffUser = {
    id: `user-${Date.now()}`,
    name: String(name).trim(),
    username: normalizedUsername,
    password: String(password),
    role: 'staff',
  };

  staffUsers.push(newUser);
  const { password: _password, ...safeUser } = newUser;
  return res.status(201).json({ user: safeUser });
});

app.post('/api/login', (req: Request, res: Response) => {
  const { username, password } = req.body ?? {};

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }

  const normalizedUsername = String(username).trim();
  const user = staffUsers.find(
    (entry) => entry.username.toLowerCase() === normalizedUsername.toLowerCase() && entry.password === String(password),
  );

  if (!user) {
    return res.status(401).json({ message: 'Invalid username or password.' });
  }

  if (user.role === 'admin') {
    return res.status(403).json({ message: 'Use Admin access to sign in with an administrator account.' });
  }

  const { password: _password, ...safeUser } = user;
  return res.json({ user: safeUser });
});

app.post('/api/admin/login', (req: Request, res: Response) => {
  const { username, password } = req.body ?? {};

  if (!username || !password) {
    return res.status(400).json({ message: 'Admin username and password are required.' });
  }

  const normalizedUsername = String(username).trim();
  const user = staffUsers.find(
    (entry) => entry.role === 'admin'
      && entry.username.toLowerCase() === normalizedUsername.toLowerCase()
      && entry.password === String(password),
  );

  if (!user) {
    return res.status(401).json({ message: 'Admin access denied. Check your credentials.' });
  }

  const { password: _password, ...safeUser } = user;
  return res.json({ user: safeUser });
});

app.post('/api/staff/login', (req: Request, res: Response) => {
  const { username, password } = req.body ?? {};

  if (!username || !password) {
    return res.status(400).json({ message: 'Staff username and password are required.' });
  }

  const normalizedUsername = String(username).trim();
  const user = staffUsers.find(
    (entry) => entry.role === 'staff'
      && entry.username.toLowerCase() === normalizedUsername.toLowerCase()
      && entry.password === String(password),
  );

  if (!user) {
    return res.status(401).json({ message: 'Staff access denied. Check your credentials.' });
  }

  const { password: _password, ...safeUser } = user;
  return res.json({ user: safeUser });
});

app.get('/api/stations', (_req: Request, res: Response) => {
  res.json(stations);
});

app.get('/api/crew', (_req: Request, res: Response) => {
  res.json(staffUsers.map(({ id, username, role, name }) => ({
    id,
    username,
    role,
    name,
    status: role === 'admin' ? 'On duty' : 'Available',
  })));
});

app.get('/api/routes', (_req: Request, res: Response) => {
  const query = String((_req.query?.search as string) || '').trim().toLowerCase();

  const filteredRoutes = query
    ? routes.filter((route) => {
        const text = `${route.from} ${route.to} ${route.id}`.toLowerCase();
        return text.includes(query);
      })
    : routes;

  res.json(filteredRoutes);
});

app.get('/admin', (_req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../../frontend/public/admin-login.html'));
});

app.get('/admin/dashboard', (_req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../../frontend/public/admin.html'));
});

app.get('*', (_req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../../frontend/public/index.html'));
});

export default app;

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}