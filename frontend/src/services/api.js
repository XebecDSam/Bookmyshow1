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
const FALLBACK_MOVIES = [
  {
    id: 'mov-1',
    title: 'Dune: Part Two',
    genres: ['Sci-Fi', 'Adventure', 'Action'],
    rating: 8.8,
    runtime: '2h 46m',
    releaseYear: 2024,
    director: 'Denis Villeneuve',
    cast: ['Timothée Chalamet', 'Zendaya', 'Rebecca Ferguson', 'Austin Butler'],
    synopsis: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the known universe, he endeavors to prevent a terrible future.',
    posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
    trailerUrl: 'https://www.youtube.com/watch?v=Way9Dexny3w',
    featured: true,
    languages: ['English', 'Spanish', 'French'],
    certification: 'PG-13'
  },
  {
    id: 'mov-2',
    title: 'Oppenheimer',
    genres: ['Biography', 'Drama', 'History'],
    rating: 8.9,
    runtime: '3h 00m',
    releaseYear: 2023,
    director: 'Christopher Nolan',
    cast: ['Cillian Murphy', 'Emily Blunt', 'Matt Damon', 'Robert Downey Jr.'],
    synopsis: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II, exploring the moral complexity and seismic shift in human history.',
    posterUrl: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=600&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=1200&q=80',
    trailerUrl: 'https://www.youtube.com/watch?v=uYPbbksJxIg',
    featured: true,
    languages: ['English', 'German'],
    certification: 'R'
  },
  {
    id: 'mov-3',
    title: 'Spider-Man: Across the Spider-Verse',
    genres: ['Animation', 'Action', 'Sci-Fi'],
    rating: 8.7,
    runtime: '2h 20m',
    releaseYear: 2023,
    director: 'Joaquim Dos Santos, Kemp Powers',
    cast: ['Shameik Moore', 'Hailee Steinfeld', 'Oscar Isaac', 'Daniel Kaluuya'],
    synopsis: 'Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence. When the heroes clash on how to handle a new threat, Miles must redefine what it means to be a hero.',
    posterUrl: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?auto=format&fit=crop&w=600&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1200&q=80',
    trailerUrl: 'https://www.youtube.com/watch?v=cqGjhVJWtEg',
    featured: true,
    languages: ['English'],
    certification: 'PG'
  },
  {
    id: 'mov-4',
    title: 'The Batman',
    genres: ['Action', 'Crime', 'Drama'],
    rating: 7.9,
    runtime: '2h 56m',
    releaseYear: 2022,
    director: 'Matt Reeves',
    cast: ['Robert Pattinson', 'Zoë Kravitz', 'Paul Dano', 'Colin Farrell'],
    synopsis: 'When a sadistic serial killer begins murdering key political figures in Gotham, Batman is forced to investigate the city\'s hidden corruption and question his family\'s involvement.',
    posterUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1514306191717-452ec28c7814?auto=format&fit=crop&w=1200&q=80',
    trailerUrl: 'https://www.youtube.com/watch?v=mqqft2x_Aa4',
    featured: false,
    languages: ['English'],
    certification: 'PG-13'
  },
  {
    id: 'mov-5',
    title: 'Interstellar',
    genres: ['Sci-Fi', 'Drama', 'Adventure'],
    rating: 8.7,
    runtime: '2h 49m',
    releaseYear: 2014,
    director: 'Christopher Nolan',
    cast: ['Matthew McConaughey', 'Anne Hathaway', 'Jessica Chastain', 'Michael Caine'],
    synopsis: 'When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft, along with a team of researchers, to find a new planet for humans.',
    posterUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1200&q=80',
    trailerUrl: 'https://www.youtube.com/watch?v=zSWdZVtXT7E',
    featured: false,
    languages: ['English'],
    certification: 'PG-13'
  },
  {
    id: 'mov-6',
    title: 'Inception',
    genres: ['Action', 'Sci-Fi', 'Thriller'],
    rating: 8.8,
    runtime: '2h 28m',
    releaseYear: 2010,
    director: 'Christopher Nolan',
    cast: ['Leonardo DiCaprio', 'Joseph Gordon-Levitt', 'Elliot Page', 'Tom Hardy'],
    synopsis: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O., but his tragic past may doom the mission.',
    posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
    backdropUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    trailerUrl: 'https://www.youtube.com/watch?v=YoHD9XEInc0',
    featured: false,
    languages: ['English', 'Japanese'],
    certification: 'PG-13'
  }
];

const FALLBACK_THEATRES = [
  {
    id: 'th-1',
    name: 'PVR INOX IMAX - Grand Horizon',
    city: 'Metropolis Central',
    address: '42 Avenue of the Stars, Level 4',
    screenType: 'IMAX Laser 3D & Dolby Atmos',
    showtimes: ['10:00 AM', '01:30 PM', '05:15 PM', '09:00 PM'],
    basePrice: 16.00
  },
  {
    id: 'th-2',
    name: 'Cinépolis VIP Lounge - Royale Galleria',
    city: 'West End Mall',
    address: '88 Fashion Boulevard, 3rd Floor',
    screenType: 'VIP Plush Recliners & Gourmet Dining',
    showtimes: ['11:15 AM', '02:45 PM', '06:30 PM', '10:15 PM'],
    basePrice: 19.50
  },
  {
    id: 'th-3',
    name: 'Starlight Multiplex - Downtown Hub',
    city: 'Downtown Arts Quarter',
    address: '15 Symphony Way',
    screenType: '4K Digital Cinema 7.1',
    showtimes: ['09:30 AM', '12:45 PM', '04:00 PM', '07:30 PM', '10:45 PM'],
    basePrice: 12.50
  }
];

export const movieApi = {
  // Experiment 1a & 1c: Fetch movies with optional search & genre filter (Axios)
  async getMovies(search = '', genre = 'All') {
    console.log('%c🎬 [Async GET /movies (Axios)]%c Search:', 'color: #38bdf8; font-weight: bold;', 'color: inherit;', search || 'none', '| Genre:', genre);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (genre && genre !== 'All') params.append('genre', genre);

      const res = await apiClient.get(`/movies?${params.toString()}`);
      return { movies: res.data.movies, genres: res.data.genres };
    } catch (err) {
      console.warn('⚠️ [API Fallback] Backend not reachable, using local movie catalog.');
      let filtered = [...FALLBACK_MOVIES];
      if (genre && genre !== 'All') {
        filtered = filtered.filter((m) => m.genres.includes(genre));
      }
      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          (m) => m.title.toLowerCase().includes(q) || m.director.toLowerCase().includes(q)
        );
      }
      return {
        movies: filtered,
        genres: ['All', 'Sci-Fi', 'Adventure', 'Action', 'Biography', 'Drama', 'History', 'Animation', 'Crime', 'Thriller'],
      };
    }
  },

  // Experiment 1 Topics: Native Fetch alternative
  async getMoviesWithFetch(search = '', genre = 'All') {
    console.log('%c🎬 [Async GET /movies (Fetch API)]%c Search:', 'color: #22d3ee; font-weight: bold;', 'color: inherit;', search || 'none', '| Genre:', genre);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (genre && genre !== 'All') params.append('genre', genre);

      const data = await nativeFetchWithAuth(`/movies?${params.toString()}`);
      return { movies: data.movies, genres: data.genres };
    } catch (err) {
      console.warn('⚠️ [Fetch Fallback] Using local movie catalog.');
      return this.getMovies(search, genre);
    }
  },

  // Experiment 1d: Fetch individual movie details dynamically (GET)
  async getMovieDetails(id) {
    console.log('%c🔍 [Async GET /movies/:id (Details)]%c Movie ID:', 'color: #c084fc; font-weight: bold;', 'color: inherit;', id);
    try {
      const res = await apiClient.get(`/movies/${id}`);
      return { movie: res.data.movie, theatres: res.data.theatres };
    } catch (err) {
      const movie = FALLBACK_MOVIES.find((m) => m.id === id) || FALLBACK_MOVIES[0];
      return { movie, theatres: FALLBACK_THEATRES };
    }
  },

  // Experiment 1a: Fetch theatres (GET)
  async getTheatres() {
    try {
      const res = await apiClient.get('/theatres');
      return res.data.theatres;
    } catch (err) {
      return FALLBACK_THEATRES;
    }
  },

  // Fetch occupied seats for specific slot (GET)
  async getOccupiedSeats(params) {
    try {
      const query = new URLSearchParams(params).toString();
      const res = await apiClient.get(`/seats/occupied?${query}`);
      return res.data.occupiedSeats;
    } catch (err) {
      return ['C3', 'D4', 'B5'];
    }
  },

  // ============================================================
  // EXPERIMENT 3: BOOKING CRUD OPERATIONS
  // ============================================================

  // Experiment 3e: Display booking history using GET
  async getBookings() {
    console.log('%c📋 [CRUD: GET /bookings]%c Fetching booking history...', 'color: #a855f7; font-weight: bold;', 'color: inherit;');
    try {
      const res = await apiClient.get('/bookings');
      return res.data.bookings;
    } catch (err) {
      console.warn('⚠️ [API Fallback] Backend not reachable, reading bookings from local storage.');
      try {
        const local = localStorage.getItem('bookmyshow_demo_bookings');
        return local ? JSON.parse(local) : [];
      } catch (e) {
        return [];
      }
    }
  },

  // Experiment 3b: Create a booking using POST
  async createBooking(bookingData) {
    console.log(
      '%c🎟️ [CRUD: POST /bookings (Create Booking)]%c Payload:',
      'background: #047857; color: #fff; font-weight: bold; padding: 2px 6px; border-radius: 4px;',
      'color: #34d399;',
      bookingData
    );
    try {
      const res = await apiClient.post('/bookings', bookingData);
      return res.data.booking;
    } catch (err) {
      console.warn('⚠️ [API Fallback] Backend not reachable, storing booking locally in demo mode.');
      const demoBooking = {
        id: `bk-${Date.now()}`,
        ...bookingData,
        createdAt: new Date().toISOString(),
        status: 'CONFIRMED',
      };
      try {
        const local = localStorage.getItem('bookmyshow_demo_bookings');
        const bookings = local ? JSON.parse(local) : [];
        bookings.unshift(demoBooking);
        localStorage.setItem('bookmyshow_demo_bookings', JSON.stringify(bookings));
      } catch (e) {
        console.error('Failed to save to localStorage', e);
      }
      return demoBooking;
    }
  },

  // Alternative POST using native Fetch
  async createBookingWithFetch(bookingData) {
    console.log(
      '%c🎟️ [CRUD: POST /bookings (Fetch API)]%c Payload:',
      'background: #0e7490; color: #fff; font-weight: bold; padding: 2px 6px; border-radius: 4px;',
      'color: #22d3ee;',
      bookingData
    );
    try {
      const res = await nativeFetchWithAuth('/bookings', {
        method: 'POST',
        body: JSON.stringify(bookingData),
      });
      return res.booking;
    } catch (err) {
      console.warn('⚠️ [Fetch Fallback] Storing booking locally.');
      return this.createBooking(bookingData);
    }
  },

  // Experiment 3c: Modify booking details using PATCH
  async modifyBooking(bookingId, updates) {
    console.log(
      `%c✏️ [CRUD: PATCH /bookings/${bookingId} (Modify)]%c Updates:`,
      'background: #b45309; color: #fff; font-weight: bold; padding: 2px 6px; border-radius: 4px;',
      'color: #fbbf24;',
      updates
    );
    try {
      const res = await apiClient.patch(`/bookings/${bookingId}`, updates);
      return res.data.booking;
    } catch (err) {
      try {
        const local = localStorage.getItem('bookmyshow_demo_bookings');
        const bookings = local ? JSON.parse(local) : [];
        const idx = bookings.findIndex((b) => b.id === bookingId);
        if (idx !== -1) {
          bookings[idx] = { ...bookings[idx], ...updates };
          localStorage.setItem('bookmyshow_demo_bookings', JSON.stringify(bookings));
          return bookings[idx];
        }
      } catch (e) {
        console.error('Failed to update localStorage', e);
      }
      return { id: bookingId, ...updates };
    }
  },

  // Experiment 3c: Modify booking details using PUT
  async modifyBookingWithPut(bookingId, fullUpdates) {
    console.log(
      `%c✏️ [CRUD: PUT /bookings/${bookingId} (Full Replace)]%c Updates:`,
      'background: #b45309; color: #fff; font-weight: bold; padding: 2px 6px; border-radius: 4px;',
      'color: #fbbf24;',
      fullUpdates
    );
    try {
      const res = await apiClient.put(`/bookings/${bookingId}`, fullUpdates);
      return res.data.booking;
    } catch (err) {
      return this.modifyBooking(bookingId, fullUpdates);
    }
  },

  // Experiment 3d: Cancel a booking using DELETE
  async cancelBooking(bookingId) {
    console.log(
      `%c🗑️ [CRUD: DELETE /bookings/${bookingId} (Cancel)]%c`,
      'background: #be123c; color: #fff; font-weight: bold; padding: 2px 6px; border-radius: 4px;',
      'color: #fb7185;'
    );
    try {
      const res = await apiClient.delete(`/bookings/${bookingId}`);
      return res.data.message;
    } catch (err) {
      try {
        const local = localStorage.getItem('bookmyshow_demo_bookings');
        if (local) {
          const bookings = JSON.parse(local).filter((b) => b.id !== bookingId);
          localStorage.setItem('bookmyshow_demo_bookings', JSON.stringify(bookings));
        }
      } catch (e) {
        console.error('Failed to delete from localStorage', e);
      }
      return 'Booking cancelled successfully (Demo offline mode)';
    }
  },

  // ============================================================
  // EXPERIMENT 4: AUTHENTICATION APIs
  // ============================================================

  // Experiment 4a: User login
  async login(credentials) {
    console.log('%c🔐 [Auth API: POST /auth/login]%c Email:', 'color: #38bdf8; font-weight: bold;', 'color: inherit;', credentials.email);
    try {
      const res = await apiClient.post('/auth/login', credentials);
      return { token: res.data.token, user: res.data.user };
    } catch (err) {
      if (err.response) throw err;
      console.warn('⚠️ [Auth Fallback] Backend not reachable, issuing offline demo session.');
      const demoUser = {
        id: 'usr-demo-01',
        name: credentials.email.split('@')[0] || 'Demo Guest',
        email: credentials.email,
        phone: '+91 98765 43210',
        city: 'Mumbai',
      };
      const demoToken = 'demo-jwt-token-bookmyshow-' + Date.now();
      return { token: demoToken, user: demoUser };
    }
  },

  // User registration
  async register(userData) {
    console.log('%c📝 [Auth API: POST /auth/register]%c Email:', 'color: #38bdf8; font-weight: bold;', 'color: inherit;', userData.email);
    try {
      const res = await apiClient.post('/auth/register', userData);
      return { token: res.data.token, user: res.data.user };
    } catch (err) {
      if (err.response) throw err;
      console.warn('⚠️ [Auth Fallback] Backend not reachable, issuing offline demo session.');
      const demoUser = {
        id: `usr-${Date.now()}`,
        name: userData.name || 'Demo Guest',
        email: userData.email,
        phone: userData.phone || '+91 98765 43210',
        city: userData.city || 'Mumbai',
      };
      const demoToken = 'demo-jwt-token-bookmyshow-' + Date.now();
      return { token: demoToken, user: demoUser };
    }
  },

  // Profile verify (GET)
  async getProfile() {
    try {
      const res = await apiClient.get('/auth/me');
      return res.data.user;
    } catch (err) {
      return {
        id: 'usr-demo-01',
        name: 'Demo Guest',
        email: 'demo@bookmyshow.com',
        phone: '+91 98765 43210',
        city: 'Mumbai',
      };
    }
  },

  // Demo Error Trigger (Status 401, 404, 500)
  async testError(status) {
    console.log(`%c⚡ [Test Error Simulation status=${status}]%c`, 'color: #ef4444; font-weight: bold;', 'color: inherit;');
    return apiClient.get(`/test/error-state?status=${status}`);
  },
};
