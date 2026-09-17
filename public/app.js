const formatStatus = (status) => {
  const normalized = String(status || '').toLowerCase().replace(/\s+/g, '-');
  return `<span class="inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
    normalized.includes('on-time') ? 'bg-emerald-500/10 text-emerald-300' :
    normalized.includes('delayed') ? 'bg-rose-500/10 text-rose-300' :
    normalized.includes('boarding') ? 'bg-amber-500/10 text-amber-300' :
    normalized.includes('confirmed') ? 'bg-emerald-500/10 text-emerald-300' :
    normalized.includes('waiting') ? 'bg-amber-500/10 text-amber-300' :
    'bg-slate-500/10 text-slate-300'
  }">${status}</span>`;
};

const renderOverview = (data) => {
  const cards = [
    { label: 'Total Trains', value: data.totalTrains },
    { label: 'Stations', value: data.totalStations },
    { label: 'Bookings', value: data.activeBookings },
    { label: 'Occupancy', value: `${data.occupancy}%` },
  ];

  document.getElementById('overview').innerHTML = cards
    .map(
      (card) => `
        <article class="rounded-3xl border border-slate-800 bg-slate-900/80 p-4 shadow-glow">
          <p class="text-xs uppercase tracking-[0.2em] text-slate-400">${card.label}</p>
          <p class="mt-4 text-3xl font-bold text-white">${card.value}</p>
        </article>
      `
    )
    .join('');
};

const renderTrains = (trains) => {
  document.getElementById('trains').innerHTML = `
    <table class="min-w-full border-separate border-spacing-y-2 text-left text-sm text-slate-300">
      <thead>
        <tr class="text-slate-400">
          <th class="pb-2 font-medium">Train</th>
          <th class="pb-2 font-medium">Route</th>
          <th class="pb-2 font-medium">Departure</th>
          <th class="pb-2 font-medium">Status</th>
          <th class="pb-2 font-medium">Bookings</th>
        </tr>
      </thead>
      <tbody>
        ${trains
          .map(
            (train) => `
              <tr class="rounded-2xl bg-slate-950/60">
                <td class="rounded-l-2xl px-3 py-3"><strong class="text-white">${train.name}</strong><br><small class="text-slate-400">${train.id}</small></td>
                <td class="px-3 py-3">${train.route}</td>
                <td class="px-3 py-3">${train.departure} → ${train.arrival}</td>
                <td class="px-3 py-3">${formatStatus(train.status)}</td>
                <td class="rounded-r-2xl px-3 py-3">${train.booked}/${train.capacity}</td>
              </tr>
            `
          )
          .join('')}
      </tbody>
    </table>
  `;
};

const renderBookings = (bookings) => {
  document.getElementById('bookings').innerHTML = `
    <table class="min-w-full border-separate border-spacing-y-2 text-left text-sm text-slate-300">
      <thead>
        <tr class="text-slate-400">
          <th class="pb-2 font-medium">Passenger</th>
          <th class="pb-2 font-medium">Route</th>
          <th class="pb-2 font-medium">Seat</th>
          <th class="pb-2 font-medium">Amount</th>
          <th class="pb-2 font-medium">Status</th>
        </tr>
      </thead>
      <tbody>
        ${bookings
          .map(
            (booking) => `
              <tr class="rounded-2xl bg-slate-950/60">
                <td class="rounded-l-2xl px-3 py-3"><span class="text-white">${booking.passenger}</span><br><small class="text-slate-400">${booking.id}</small></td>
                <td class="px-3 py-3">${booking.from} → ${booking.to}</td>
                <td class="px-3 py-3">${booking.seat}</td>
                <td class="px-3 py-3">₹${booking.amount.toLocaleString('en-IN')}</td>
                <td class="rounded-r-2xl px-3 py-3">${formatStatus(booking.status)}</td>
              </tr>
            `
          )
          .join('')}
      </tbody>
    </table>
  `;
};

const renderStations = (stations) => {
  document.getElementById('stations').innerHTML = stations
    .map(
      (station) => `
        <article class="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
          <div class="text-xs uppercase tracking-[0.2em] text-sky-300">${station.code}</div>
          <h3 class="mt-3 text-lg font-semibold text-white">${station.name}</h3>
          <div class="mt-4 flex items-center justify-between text-sm text-slate-400"><span>Platform ${station.platform}</span><span>${station.arrivals} arrivals</span></div>
          <div class="mt-2 flex items-center justify-between text-sm text-slate-400"><span>${station.departures} departures</span><span>Live</span></div>
        </article>
      `
    )
    .join('');
};

const renderRoutes = (routes) => {
  document.getElementById('routes').innerHTML = routes
    .map(
      (route) => `
        <article class="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
          <div class="text-xs uppercase tracking-[0.2em] text-sky-300">${route.id}</div>
          <h3 class="mt-3 text-lg font-semibold text-white">${route.from} → ${route.to}</h3>
          <div class="mt-4 space-y-2 text-sm text-slate-300">
            <div class="flex justify-between"><span>Distance</span><strong>${route.distance}</strong></div>
            <div class="flex justify-between"><span>Duration</span><strong>${route.duration}</strong></div>
            <div class="flex justify-between"><span>Trains</span><strong>${route.trains}</strong></div>
            <div class="flex justify-between"><span>Status</span><strong>${route.status}</strong></div>
          </div>
        </article>
      `
    )
    .join('');
};

const renderTrainAdmin = (trains) => {
  const tableRoot = document.getElementById('train-admin-list');

  if (!tableRoot) return;

  tableRoot.innerHTML = `
    <table class="min-w-full border-separate border-spacing-y-2 text-left text-sm text-slate-300">
      <thead>
        <tr class="text-slate-400">
          <th class="pb-2 font-medium">Train</th>
          <th class="pb-2 font-medium">Route</th>
          <th class="pb-2 font-medium">Schedule</th>
          <th class="pb-2 font-medium">Status</th>
          <th class="pb-2 font-medium">Actions</th>
        </tr>
      </thead>
      <tbody>
        ${trains
          .map(
            (train) => `
              <tr class="rounded-2xl bg-slate-950/60">
                <td class="rounded-l-2xl px-3 py-3"><strong class="text-white">${train.name}</strong><br><small class="text-slate-400">${train.id}</small></td>
                <td class="px-3 py-3">${train.route}</td>
                <td class="px-3 py-3">${train.departure} - ${train.arrival}</td>
                <td class="px-3 py-3">${formatStatus(train.status)}</td>
                <td class="rounded-r-2xl px-3 py-3">
                  <div class="flex gap-2">
                    <button class="rounded-lg bg-sky-500/10 px-2 py-1 text-xs font-semibold text-sky-300 edit" data-train-id="${train.id}">Edit</button>
                    <button class="rounded-lg bg-rose-500/10 px-2 py-1 text-xs font-semibold text-rose-300 delete" data-train-id="${train.id}">Delete</button>
                  </div>
                </td>
              </tr>
            `
          )
          .join('')}
      </tbody>
    </table>
  `;
};

const populateTrainForm = (train) => {
  const form = document.getElementById('train-form');
  const editId = document.getElementById('train-edit-id');
  const submitButton = form.querySelector('button[type="submit"]');

  if (!form || !editId || !submitButton) return;

  form.elements.name.value = train.name;
  form.elements.route.value = train.route;
  form.elements.departure.value = train.departure;
  form.elements.arrival.value = train.arrival;
  form.elements.status.value = train.status;
  form.elements.capacity.value = train.capacity;
  form.elements.booked.value = train.booked;
  editId.value = train.id;
  submitButton.textContent = 'Update Train';
};

const resetTrainForm = () => {
  const form = document.getElementById('train-form');
  const editId = document.getElementById('train-edit-id');
  const submitButton = form.querySelector('button[type="submit"]');

  if (!form || !editId || !submitButton) return;

  form.reset();
  editId.value = '';
  form.elements.booked.value = 0;
  submitButton.textContent = 'Save train';
};

const state = { user: null };

const applyAuthState = () => {
  const authStatus = document.getElementById('auth-status');
  const authShell = document.getElementById('auth-shell');
  const dashboardShell = document.getElementById('dashboard-shell');
  const adminSection = document.getElementById('train-management-section');
  const adminPanelButton = document.getElementById('admin-panel-btn');

  if (!authStatus || !authShell || !dashboardShell || !adminSection) return;

  if (state.user) {
    authStatus.innerHTML = `<span class="inline-flex items-center gap-2 rounded-full bg-sky-500/15 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-sky-300"><span class="h-2 w-2 rounded-full bg-emerald-400"></span>${state.user.name} · ${state.user.role}</span>`;
    authShell.classList.add('hidden');
    dashboardShell.classList.remove('hidden');
    adminSection.classList.toggle('hidden', state.user.role !== 'admin');
    adminPanelButton?.classList.toggle('hidden', state.user.role !== 'admin');

    if (state.user.role === 'admin') {
      window.location.href = '/admin/dashboard';
    }
    return;
  }

  authStatus.innerHTML = '<span class="text-sm text-slate-300">No user signed in</span>';
  authShell.classList.remove('hidden');
  dashboardShell.classList.add('hidden');
  adminSection.classList.add('hidden');
  adminPanelButton?.classList.add('hidden');
};

const setAuthFormMode = (mode) => {
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const resetForm = document.getElementById('reset-form');
  const adminLoginForm = document.getElementById('admin-login-form');
  const loginTab = document.getElementById('show-login');
  const registerTab = document.getElementById('show-register');
  const adminLoginButton = document.getElementById('show-admin-login');

  if (!loginForm || !registerForm || !resetForm || !adminLoginForm || !loginTab || !registerTab || !adminLoginButton) return;

  const isLogin = mode === 'login';
  const isRegister = mode === 'register';
  const isReset = mode === 'reset';
  const isAdminLogin = mode === 'admin-login';

  loginForm.classList.toggle('hidden', !isLogin);
  registerForm.classList.toggle('hidden', !isRegister);
  resetForm.classList.toggle('hidden', !isReset);
  adminLoginForm.classList.toggle('hidden', !isAdminLogin);
  adminLoginButton.classList.toggle('hidden', isAdminLogin);

  loginTab.classList.toggle('bg-sky-500', isLogin);
  loginTab.classList.toggle('text-white', isLogin);
  loginTab.classList.toggle('text-slate-300', !isLogin);
  registerTab.classList.toggle('bg-sky-500', isRegister);
  registerTab.classList.toggle('text-white', isRegister);
  registerTab.classList.toggle('text-slate-300', !isRegister);
};

const attachAuthHandlers = () => {
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const resetForm = document.getElementById('reset-form');
  const logoutBtn = document.getElementById('logout-btn');
  const loginTab = document.getElementById('show-login');
  const registerTab = document.getElementById('show-register');
  const forgotPasswordBtn = document.getElementById('forgot-password-btn');
  const backToLoginBtn = document.getElementById('back-to-login-btn');
  const adminPanelButton = document.getElementById('admin-panel-btn');
  const adminLoginForm = document.getElementById('admin-login-form');
  const adminLoginButton = document.getElementById('show-admin-login');
  const backFromAdminButton = document.getElementById('back-from-admin-btn');

  if (loginTab) loginTab.addEventListener('click', () => setAuthFormMode('login'));
  if (registerTab) registerTab.addEventListener('click', () => setAuthFormMode('register'));
  if (forgotPasswordBtn) forgotPasswordBtn.addEventListener('click', () => setAuthFormMode('reset'));
  if (backToLoginBtn) backToLoginBtn.addEventListener('click', () => setAuthFormMode('login'));
  if (adminLoginButton) adminLoginButton.addEventListener('click', () => setAuthFormMode('admin-login'));
  if (backFromAdminButton) backFromAdminButton.addEventListener('click', () => setAuthFormMode('login'));
  if (adminPanelButton) adminPanelButton.addEventListener('click', () => { window.location.href = '/admin/dashboard'; });

  if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const formData = new FormData(loginForm);
      const payload = { username: formData.get('username'), password: formData.get('password') };

      const response = await fetch('/api/staff/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const result = await response.json().catch(() => ({ message: 'Invalid username or password.' }));
        alert(result.message || 'Invalid username or password.');
        return;
      }

      const result = await response.json();
      state.user = result.user;
      localStorage.setItem('railway-user', JSON.stringify(result.user));
      loginForm.reset();
      applyAuthState();
    });
  }

  if (registerForm) {
    registerForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const formData = new FormData(registerForm);
      const payload = {
        name: formData.get('name'),
        username: formData.get('username'),
        password: formData.get('password'),
      };

      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const result = await response.json().catch(() => ({ message: 'Unable to create account.' }));
        alert(result.message || 'Unable to create account.');
        return;
      }

      await response.json();
      state.user = null;
      localStorage.removeItem('railway-user');
      registerForm.reset();
      setAuthFormMode('login');
      alert('Account created successfully. Please login to continue.');
    });
  }

  if (adminLoginForm) {
    adminLoginForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const formData = new FormData(adminLoginForm);
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: formData.get('username'), password: formData.get('password') }),
      });

      const result = await response.json().catch(() => ({ message: 'Admin login failed.' }));
      if (!response.ok) {
        alert(result.message || 'Admin access denied.');
        return;
      }

      localStorage.setItem('railway-user', JSON.stringify(result.user));
      window.location.href = '/admin/dashboard';
    });
  }

  if (resetForm) {
    resetForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const formData = new FormData(resetForm);
      const identifier = formData.get('resetIdentifier');
      alert(`Reset request sent for ${identifier || 'your account'}. Please check your registered email or contact support.`);
      resetForm.reset();
      setAuthFormMode('login');
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      state.user = null;
      localStorage.removeItem('railway-user');
      applyAuthState();
    });
  }
};

const attachBookingHandler = () => {
  const form = document.getElementById('booking-form');

  if (!form) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const booking = {
      passenger: formData.get('passenger'),
      trainId: formData.get('trainId'),
      from: formData.get('from'),
      to: formData.get('to'),
      seat: formData.get('seat'),
      amount: Number(formData.get('amount')),
    };

    const response = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(booking),
    });

    if (!response.ok) {
      alert('Booking failed. Please complete all required fields.');
      return;
    }

    form.reset();
    await loadDashboard();
  });
};

const loadRoutes = async (query = '') => {
  const response = await fetch(`/api/routes?search=${encodeURIComponent(query)}`);
  const routes = await response.json();
  renderRoutes(routes);
};

const attachRouteSearch = () => {
  const input = document.getElementById('route-search');

  if (!input) return;

  input.addEventListener('input', (event) => {
    loadRoutes(event.target.value);
  });
};

const attachTrainManagement = () => {
  const form = document.getElementById('train-form');

  if (!form) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const trainId = document.getElementById('train-edit-id').value;
    const payload = {
      name: formData.get('name'),
      route: formData.get('route'),
      departure: formData.get('departure'),
      arrival: formData.get('arrival'),
      status: formData.get('status'),
      capacity: Number(formData.get('capacity')),
      booked: Number(formData.get('booked') || 0),
    };

    const response = await fetch(trainId ? `/api/trains/${trainId}` : '/api/trains', {
      method: trainId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      alert('Unable to save train details.');
      return;
    }

    resetTrainForm();
    await loadDashboard();
  });

  document.getElementById('cancel-train-edit')?.addEventListener('click', resetTrainForm);

  document.getElementById('train-admin-list')?.addEventListener('click', async (event) => {
    const button = event.target.closest('.edit');
    const deleteButton = event.target.closest('.delete');

    if (button) {
      const trainId = button.dataset.trainId;
      const response = await fetch('/api/trains');
      const trains = await response.json();
      const train = trains.find((item) => item.id === trainId);
      if (train) populateTrainForm(train);
      return;
    }

    if (deleteButton) {
      const trainId = deleteButton.dataset.trainId;
      const response = await fetch(`/api/trains/${trainId}`, { method: 'DELETE' });
      if (response.ok) {
        await loadDashboard();
      }
    }
  });
};

const loadDashboard = async () => {
  try {
    const savedUser = localStorage.getItem('railway-user');
    if (savedUser) {
      state.user = JSON.parse(savedUser);
    }

    const [overviewRes, trainsRes, bookingsRes, stationsRes] = await Promise.all([
      fetch('/api/overview'),
      fetch('/api/trains'),
      fetch('/api/bookings'),
      fetch('/api/stations'),
    ]);

    const overview = await overviewRes.json();
    const trains = await trainsRes.json();
    const bookings = await bookingsRes.json();
    const stations = await stationsRes.json();

    renderOverview(overview);
    renderTrains(trains);
    renderBookings(bookings);
    renderStations(stations);
    renderTrainAdmin(trains);
    await loadRoutes();
    attachBookingHandler();
    attachRouteSearch();
    attachTrainManagement();
    applyAuthState();
  } catch (error) {
    document.getElementById('overview').innerHTML = '<p class="text-slate-300">Unable to load dashboard data.</p>';
    console.error('Dashboard failed to load:', error);
  }
};

attachAuthHandlers();
setAuthFormMode('login');
loadDashboard();
