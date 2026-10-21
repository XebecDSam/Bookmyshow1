import axios from 'axios';

// Determine API base URL dynamically
const resolveBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return 'http://localhost:5000/api';
    }
  }
  return '/api';
};

export const API_BASE_URL = resolveBaseUrl();

// Configure Axios instance (Topics: REST API, Axios)
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

let onAuthErrorCallback = null;

export const setAuthErrorHandler = (callback) => {
  onAuthErrorCallback = callback;
};

// ============================================================
// EXPERIMENT 4c: ATTACH TOKEN VIA AXIOS REQUEST INTERCEPTOR
// ============================================================
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('cinepass_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(
        `%c🛡️ [Axios Request Interceptor] %c${config.method?.toUpperCase()} ${config.url}`,
        'background: #1e3a8a; color: #60a5fa; font-weight: bold; padding: 2px 6px; border-radius: 4px;',
        'color: #93c5fd; font-weight: bold;',
        {
          attachedToken: `Bearer ${token.substring(0, 16)}...`,
          headers: config.headers,
        }
      );
    } else {
      console.log(
        `%c🌐 [Axios Request Interceptor] %c${config.method?.toUpperCase()} ${config.url} (Unauthenticated / Public)`,
        'background: #0f172a; color: #94a3b8; font-weight: bold; padding: 2px 6px; border-radius: 4px;',
        'color: #cbd5e1;'
      );
    }
    return config;
  },
  (error) => {
    console.error('❌ [Axios Request Error Interceptor]:', error);
    return Promise.reject(error);
  }
);

// ============================================================
// EXPERIMENT 4f: HANDLE UNAUTHORIZED & EXPIRED TOKEN VIA RESPONSE INTERCEPTOR
// ============================================================
apiClient.interceptors.response.use(
  (response) => {
    console.log(
      `%c✅ [Axios Response Interceptor] %c${response.status} ${response.config.url}`,
      'background: #064e3b; color: #34d399; font-weight: bold; padding: 2px 6px; border-radius: 4px;',
      'color: #a7f3d0;',
      response.data
    );
    return response;
  },
  (error) => {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;

      console.warn(
        `%c⚠️ [Axios Response Error Interceptor] %cStatus: ${status} | URL: ${error.config?.url}`,
        'background: #7f1d1d; color: #f87171; font-weight: bold; padding: 2px 6px; border-radius: 4px;',
        'color: #fca5a5;',
        data
      );

      if (status === 401) {
        console.warn(
          '%c🚨 [Axios 401 Interceptor: Expired / Unauthorized Token] %cPurging token from localStorage and dispatching auth:expired',
          'background: #991b1b; color: #fff; font-weight: bold; padding: 3px 6px; border-radius: 4px;',
          'color: #f87171;',
          data?.message || 'Access Denied'
        );

        localStorage.removeItem('cinepass_token');
        localStorage.removeItem('cinepass_user');

        if (onAuthErrorCallback) {
          onAuthErrorCallback(data?.message || 'Session expired. Please sign in again.');
        }

        window.dispatchEvent(
          new CustomEvent('auth:expired', {
            detail: { message: data?.message || 'Authentication session expired.' },
          })
        );
      }
    } else {
      console.error('❌ [Axios Network Error]:', error.message);
    }
    return Promise.reject(error);
  }
);

// ============================================================
// NATIVE FETCH API IMPLEMENTATION (Topics: Fetch API, Tokens, Async)
// ============================================================
export const nativeFetchWithAuth = async (endpoint, options = {}) => {
  const token = localStorage.getItem('cinepass_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let fullUrl = endpoint;
  if (!endpoint.startsWith('http')) {
    const clean = endpoint.replace(/^\/api\/?/, '').replace(/^\//, '');
    fullUrl = `${API_BASE_URL}/${clean}`;
  }

  console.log(
    `%c📡 [Fetch API Request] %c${options.method || 'GET'} ${fullUrl}`,
    'background: #083344; color: #38bdf8; font-weight: bold; padding: 2px 6px; border-radius: 4px;',
    'color: #7dd3fc;',
    { headers, body: options.body ? JSON.parse(options.body) : undefined }
  );

  const response = await fetch(fullUrl, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    const errData = await response.json().catch(() => ({}));
    console.warn(
      '%c🚨 [Fetch API 401 Unauthorized] %cToken expired or missing:',
      'background: #991b1b; color: #fff; font-weight: bold; padding: 3px 6px; border-radius: 4px;',
      'color: #f87171;',
      errData
    );
    localStorage.removeItem('cinepass_token');
    localStorage.removeItem('cinepass_user');
    window.dispatchEvent(
      new CustomEvent('auth:expired', {
        detail: { message: errData.message || 'Unauthorized / Token expired via Fetch API.' },
      })
    );
    throw new Error(errData.message || 'Unauthorized');
  }

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    console.error(`❌ [Fetch API Error ${response.status}]:`, errData);
    throw new Error(errData.message || `HTTP Error ${response.status}`);
  }

  const result = await response.json();
  console.log(
    `%c✨ [Fetch API Success ${response.status}] %c${fullUrl}`,
    'background: #064e3b; color: #34d399; font-weight: bold; padding: 2px 6px; border-radius: 4px;',
    'color: #a7f3d0;',
    result
  );
  return result;
};

// ============================================================
// REST API CLIENT METHODS (ASYNC / AWAIT - AXIOS & FETCH CRUD)
// ============================================================
export const movieApi = {
  // Experiment 1a & 1c: Fetch movies with optional search & genre filter (Axios)
  async getMovies(search = '', genre = 'All') {
    console.log('%c🎬 [Async GET /movies (Axios)]%c Search:', 'color: #38bdf8; font-weight: bold;', 'color: inherit;', search || 'none', '| Genre:', genre);
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (genre && genre !== 'All') params.append('genre', genre);

    const res = await apiClient.get(`/movies?${params.toString()}`);
    return { movies: res.data.movies, genres: res.data.genres };
  },

  // Experiment 1 Topics: Native Fetch alternative
  async getMoviesWithFetch(search = '', genre = 'All') {
    console.log('%c🎬 [Async GET /movies (Fetch API)]%c Search:', 'color: #22d3ee; font-weight: bold;', 'color: inherit;', search || 'none', '| Genre:', genre);
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (genre && genre !== 'All') params.append('genre', genre);

    const data = await nativeFetchWithAuth(`/movies?${params.toString()}`);
    return { movies: data.movies, genres: data.genres };
  },

  // Experiment 1d: Fetch individual movie details dynamically (GET)
  async getMovieDetails(id) {
    console.log('%c🔍 [Async GET /movies/:id (Details)]%c Movie ID:', 'color: #c084fc; font-weight: bold;', 'color: inherit;', id);
    const res = await apiClient.get(`/movies/${id}`);
    return { movie: res.data.movie, theatres: res.data.theatres };
  },

  // Experiment 1a: Fetch theatres (GET)
  async getTheatres() {
    const res = await apiClient.get('/theatres');
    return res.data.theatres;
  },

  // Fetch occupied seats for specific slot (GET)
  async getOccupiedSeats(params) {
    const query = new URLSearchParams(params).toString();
    const res = await apiClient.get(`/seats/occupied?${query}`);
    return res.data.occupiedSeats;
  },

  // ============================================================
  // EXPERIMENT 3: BOOKING CRUD OPERATIONS
  // ============================================================

  // Experiment 3e: Display booking history using GET
  async getBookings() {
    console.log('%c📋 [CRUD: GET /bookings]%c Fetching booking history...', 'color: #a855f7; font-weight: bold;', 'color: inherit;');
    const res = await apiClient.get('/bookings');
    return res.data.bookings;
  },

  // Experiment 3b: Create a booking using POST
  async createBooking(bookingData) {
    console.log(
      '%c🎟️ [CRUD: POST /bookings (Create Booking)]%c Payload:',
      'background: #047857; color: #fff; font-weight: bold; padding: 2px 6px; border-radius: 4px;',
      'color: #34d399;',
      bookingData
    );
    const res = await apiClient.post('/bookings', bookingData);
    return res.data.booking;
  },

  // Alternative POST using native Fetch
  async createBookingWithFetch(bookingData) {
    console.log(
      '%c🎟️ [CRUD: POST /bookings (Fetch API)]%c Payload:',
      'background: #0e7490; color: #fff; font-weight: bold; padding: 2px 6px; border-radius: 4px;',
      'color: #22d3ee;',
      bookingData
    );
    const res = await nativeFetchWithAuth('/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
    return res.booking;
  },

  // Experiment 3c: Modify booking details using PATCH
  async modifyBooking(bookingId, updates) {
    console.log(
      `%c✏️ [CRUD: PATCH /bookings/${bookingId} (Modify)]%c Updates:`,
      'background: #b45309; color: #fff; font-weight: bold; padding: 2px 6px; border-radius: 4px;',
      'color: #fbbf24;',
      updates
    );
    const res = await apiClient.patch(`/bookings/${bookingId}`, updates);
    return res.data.booking;
  },

  // Experiment 3c: Modify booking details using PUT
  async modifyBookingWithPut(bookingId, fullUpdates) {
    console.log(
      `%c✏️ [CRUD: PUT /bookings/${bookingId} (Full Replace)]%c Updates:`,
      'background: #b45309; color: #fff; font-weight: bold; padding: 2px 6px; border-radius: 4px;',
      'color: #fbbf24;',
      fullUpdates
    );
    const res = await apiClient.put(`/bookings/${bookingId}`, fullUpdates);
    return res.data.booking;
  },

  // Experiment 3d: Cancel a booking using DELETE
  async cancelBooking(bookingId) {
    console.log(
      `%c🗑️ [CRUD: DELETE /bookings/${bookingId} (Cancel)]%c`,
      'background: #be123c; color: #fff; font-weight: bold; padding: 2px 6px; border-radius: 4px;',
      'color: #fb7185;'
    );
    const res = await apiClient.delete(`/bookings/${bookingId}`);
    return res.data.message;
  },

  // ============================================================
  // EXPERIMENT 4: AUTHENTICATION APIs
  // ============================================================

  // Experiment 4a: User login
  async login(credentials) {
    console.log('%c🔐 [Auth API: POST /auth/login]%c Email:', 'color: #38bdf8; font-weight: bold;', 'color: inherit;', credentials.email);
    const res = await apiClient.post('/auth/login', credentials);
    return { token: res.data.token, user: res.data.user };
  },

  // User registration
  async register(userData) {
    console.log('%c📝 [Auth API: POST /auth/register]%c Email:', 'color: #38bdf8; font-weight: bold;', 'color: inherit;', userData.email);
    const res = await apiClient.post('/auth/register', userData);
    return { token: res.data.token, user: res.data.user };
  },

  // Profile verify (GET)
  async getProfile() {
    const res = await apiClient.get('/auth/me');
    return res.data.user;
  },

  // Demo Error Trigger (Status 401, 404, 500)
  async testError(status) {
    console.log(`%c⚡ [Test Error Simulation status=${status}]%c`, 'color: #ef4444; font-weight: bold;', 'color: inherit;');
    return apiClient.get(`/test/error-state?status=${status}`);
  },
};
