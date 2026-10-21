const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_cinema_jwt_key_2026';

app.use(cors());
app.use(express.json());

// Simulated network latency middleware (optional toggle via header or query)
app.use((req, res, next) => {
  const delay = req.query.delay ? parseInt(req.query.delay, 10) : (req.headers['x-simulate-delay'] ? 600 : 0);
  if (delay > 0) {
    setTimeout(next, delay);
  } else {
    next();
  }
});

// ==========================================
// IN-MEMORY DATABASE
// ==========================================

const movies = [
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

const theatres = [
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

// Pre-seeded users
const users = [
  {
    id: 'usr-1',
    name: 'Alex Rivera',
    email: 'user@cinema.com',
    password: 'password123',
    role: 'VIP Member',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'
  },
  {
    id: 'usr-2',
    name: 'Sophia Martinez',
    email: 'sophia@cinema.com',
    password: 'password123',
    role: 'Standard Member',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80'
  }
];

// Pre-seeded bookings for Alex Rivera (usr-1)
let bookings = [
  {
    id: 'BK-1082',
    userId: 'usr-1',
    userEmail: 'user@cinema.com',
    userName: 'Alex Rivera',
    movieId: 'mov-1',
    movieTitle: 'Dune: Part Two',
    moviePoster: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80',
    theatreId: 'th-1',
    theatreName: 'PVR INOX IMAX - Grand Horizon',
    showDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
    showTime: '05:15 PM',
    seats: ['E5', 'E6'],
    ticketCount: 2,
    ticketPrice: 16.00,
    convenienceFee: 3.50,
    totalAmount: 35.50,
    bookingStatus: 'CONFIRMED',
    paymentMethod: 'Credit Card (**** 4242)',
    bookingDate: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'BK-0945',
    userId: 'usr-1',
    userEmail: 'user@cinema.com',
    userName: 'Alex Rivera',
    movieId: 'mov-2',
    movieTitle: 'Oppenheimer',
    moviePoster: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=600&q=80',
    theatreId: 'th-2',
    theatreName: 'Cinépolis VIP Lounge - Royale Galleria',
    showDate: new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0], // 3 days ago
    showTime: '06:30 PM',
    seats: ['B3', 'B4'],
    ticketCount: 2,
    ticketPrice: 19.50,
    convenienceFee: 4.00,
    totalAmount: 43.00,
    bookingStatus: 'CONFIRMED',
    paymentMethod: 'Apple Pay',
    bookingDate: new Date(Date.now() - 86400000 * 3).toISOString()
  }
];

// Seat pricing tier matrix
const SEAT_TIERS = {
  VIP: { rows: ['A', 'B'], priceOffset: 6.00, label: 'VIP Recliner' },
  PREMIUM: { rows: ['C', 'D', 'E'], priceOffset: 3.00, label: 'Premium Gold' },
  STANDARD: { rows: ['F', 'G', 'H'], priceOffset: 0.00, label: 'Standard Club' }
};

// ==========================================
// AUTH MIDDLEWARE (Experiment 4)
// ==========================================
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No authentication token provided.',
      errorCode: 'AUTH_TOKEN_MISSING'
    });
  }

  // Handle special simulated expired token test
  if (token === 'simulated_expired_token') {
    return res.status(401).json({
      success: false,
      message: 'Token has expired. Please log in again.',
      errorCode: 'TOKEN_EXPIRED'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token.',
      errorCode: 'TOKEN_INVALID',
      details: err.message
    });
  }
}

// ==========================================
// EXPERIMENT 4: AUTHENTICATION APIs
// ==========================================

// POST /api/auth/login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required.'
    });
  }

  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (!user || user.password !== password) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password credentials.'
    });
  }

  // Generate JWT token (expires in 24 hours)
  const token = jwt.sign(
    { id: user.id, email: user.email, name: user.name, role: user.role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  return res.json({
    success: true,
    message: 'Login successful.',
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar
    }
  });
});

// POST /api/auth/register
app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Name, email, and password are required.'
    });
  }

  const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(409).json({
      success: false,
      message: 'User with this email already exists.'
    });
  }

  const newUser = {
    id: `usr-${Date.now()}`,
    name,
    email,
    password,
    role: 'Standard Member',
    avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`
  };

  users.push(newUser);

  const token = jwt.sign(
    { id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  return res.status(201).json({
    success: true,
    message: 'User registered successfully.',
    token,
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      avatar: newUser.avatar
    }
  });
});

// GET /api/auth/me (Protected Profile Check)
app.get('/api/auth/me', authenticateToken, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  return res.json({
    success: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar
    }
  });
});

// ==========================================
// EXPERIMENT 1 & 3: MOVIE & THEATRE APIs (GET)
// ==========================================

// GET /api/movies (search, filter by genre)
app.get('/api/movies', (req, res) => {
  const { search, genre } = req.query;
  let filtered = [...movies];

  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(m =>
      m.title.toLowerCase().includes(q) ||
      m.director.toLowerCase().includes(q) ||
      m.cast.some(c => c.toLowerCase().includes(q))
    );
  }

  if (genre && genre !== 'All') {
    filtered = filtered.filter(m =>
      m.genres.some(g => g.toLowerCase() === genre.toLowerCase())
    );
  }

  const allGenres = ['All', ...new Set(movies.flatMap(m => m.genres))];

  return res.json({
    success: true,
    count: filtered.length,
    genres: allGenres,
    movies: filtered
  });
});

// GET /api/movies/:id (Dynamic single movie details)
app.get('/api/movies/:id', (req, res) => {
  const movie = movies.find(m => m.id === req.params.id);
  if (!movie) {
    return res.status(404).json({
      success: false,
      message: `Movie with id '${req.params.id}' not found.`
    });
  }

  // Attach available theatres for this movie
  return res.json({
    success: true,
    movie,
    theatres
  });
});

// GET /api/theatres
app.get('/api/theatres', (req, res) => {
  return res.json({
    success: true,
    count: theatres.length,
    theatres
  });
});

// GET /api/seats/occupied (shows occupied seats for a movie, theatre, showtime, date)
app.get('/api/seats/occupied', (req, res) => {
  const { movieId, theatreId, showTime, showDate } = req.query;

  // Find all booked seats for this specific slot
  const slotBookings = bookings.filter(b =>
    b.movieId === movieId &&
    b.theatreId === theatreId &&
    b.showTime === showTime &&
    b.showDate === showDate &&
    b.bookingStatus !== 'CANCELLED'
  );

  const occupiedSeats = slotBookings.flatMap(b => b.seats);

  return res.json({
    success: true,
    occupiedSeats
  });
});

// ==========================================
// EXPERIMENT 3: BOOKING CRUD OPERATIONS
// Protected with JWT (Experiment 4)
// ==========================================

// GET /api/bookings (Retrieve user booking history)
app.get('/api/bookings', authenticateToken, (req, res) => {
  // Return bookings for the authenticated user
  const userBookings = bookings
    .filter(b => b.userId === req.user.id || b.userEmail === req.user.email)
    .sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate));

  return res.json({
    success: true,
    count: userBookings.length,
    bookings: userBookings
  });
});

// GET /api/bookings/:id (Single booking details)
app.get('/api/bookings/:id', authenticateToken, (req, res) => {
  const booking = bookings.find(b => b.id === req.params.id);
  if (!booking) {
    return res.status(404).json({
      success: false,
      message: `Booking with ID ${req.params.id} not found.`
    });
  }

  // Check authorization
  if (booking.userId !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access forbidden: You do not have permission to view this booking.'
    });
  }

  return res.json({
    success: true,
    booking
  });
});

// POST /api/bookings (Create a new booking)
app.post('/api/bookings', authenticateToken, (req, res) => {
  const {
    movieId,
    theatreId,
    showDate,
    showTime,
    seats,
    paymentMethod
  } = req.body;

  if (!movieId || !theatreId || !showDate || !showTime || !Array.isArray(seats) || seats.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Invalid booking data. Movie, Theatre, Date, ShowTime, and at least one Seat are required.'
    });
  }

  const movie = movies.find(m => m.id === movieId);
  const theatre = theatres.find(t => t.id === theatreId);

  if (!movie || !theatre) {
    return res.status(404).json({
      success: false,
      message: 'Specified Movie or Theatre not found.'
    });
  }

  // Conflict check: ensure seats are not already occupied
  const existingSlotBookings = bookings.filter(b =>
    b.movieId === movieId &&
    b.theatreId === theatreId &&
    b.showTime === showTime &&
    b.showDate === showDate &&
    b.bookingStatus !== 'CANCELLED'
  );

  const alreadyOccupied = existingSlotBookings.flatMap(b => (b.seats || []).map(s => (typeof s === 'string' ? s : s.id)));
  const normalizedSeats = seats.map(s => (typeof s === 'string' ? s : (s.id || String(s))));
  const seatClash = normalizedSeats.filter(s => alreadyOccupied.includes(s));

  if (seatClash.length > 0) {
    return res.status(409).json({
      success: false,
      message: `Seats already booked: ${seatClash.join(', ')}. Please choose other seats.`,
      conflictSeats: seatClash
    });
  }

  // Calculate pricing based on seat row tiers
  let baseTicketPrice = theatre.basePrice;
  let subtotal = 0;

  normalizedSeats.forEach(seat => {
    const row = seat.charAt(0).toUpperCase();
    let seatPrice = baseTicketPrice;
    if (SEAT_TIERS.VIP.rows.includes(row)) seatPrice += SEAT_TIERS.VIP.priceOffset;
    else if (SEAT_TIERS.PREMIUM.rows.includes(row)) seatPrice += SEAT_TIERS.PREMIUM.priceOffset;
    else seatPrice += SEAT_TIERS.STANDARD.priceOffset;
    subtotal += seatPrice;
  });

  const convenienceFee = Number((subtotal * 0.1).toFixed(2));
  const totalAmount = Number((subtotal + convenienceFee).toFixed(2));

  const newBooking = {
    id: `BK-${Math.floor(1000 + Math.random() * 9000)}`,
    userId: req.user.id,
    userEmail: req.user.email,
    userName: req.user.name || 'Cinema Guest',
    movieId: movie.id,
    movieTitle: movie.title,
    moviePoster: movie.posterUrl,
    theatreId: theatre.id,
    theatreName: theatre.name,
    showDate,
    showTime,
    seats: normalizedSeats,
    ticketCount: normalizedSeats.length,
    ticketPrice: baseTicketPrice,
    subtotal: Number(subtotal.toFixed(2)),
    convenienceFee,
    totalAmount,
    bookingStatus: 'CONFIRMED',
    paymentMethod: paymentMethod || 'Online Checkout (Simulated)',
    bookingDate: new Date().toISOString()
  };

  bookings.unshift(newBooking);

  return res.status(201).json({
    success: true,
    message: 'Booking successfully confirmed!',
    booking: newBooking
  });
});

// PUT / PATCH /api/bookings/:id (Modify booking details - e.g., change seats or showtime)
app.patch('/api/bookings/:id', authenticateToken, handleModifyBooking);
app.put('/api/bookings/:id', authenticateToken, handleModifyBooking);

function handleModifyBooking(req, res) {
  const bookingIndex = bookings.findIndex(b => b.id === req.params.id);

  if (bookingIndex === -1) {
    return res.status(404).json({
      success: false,
      message: `Booking ${req.params.id} not found.`
    });
  }

  const existingBooking = bookings[bookingIndex];

  // Authorization check
  if (existingBooking.userId !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access forbidden: You cannot modify this booking.'
    });
  }

  if (existingBooking.bookingStatus === 'CANCELLED') {
    return res.status(400).json({
      success: false,
      message: 'Cannot modify a cancelled booking.'
    });
  }

  const { seats, showTime, showDate } = req.body;

  // If changing seats, check conflicts with other bookings
  if (seats && Array.isArray(seats) && seats.length > 0) {
    const targetDate = showDate || existingBooking.showDate;
    const targetTime = showTime || existingBooking.showTime;

    const slotBookings = bookings.filter(b =>
      b.id !== existingBooking.id &&
      b.movieId === existingBooking.movieId &&
      b.theatreId === existingBooking.theatreId &&
      b.showTime === targetTime &&
      b.showDate === targetDate &&
      b.bookingStatus !== 'CANCELLED'
    );

    const occupied = slotBookings.flatMap(b => (b.seats || []).map(s => (typeof s === 'string' ? s : s.id)));
    const normalizedSeats = seats.map(s => (typeof s === 'string' ? s : (s.id || String(s))));
    const clash = normalizedSeats.filter(s => occupied.includes(s));

    if (clash.length > 0) {
      return res.status(409).json({
        success: false,
        message: `Requested seats already taken: ${clash.join(', ')}`,
        conflictSeats: clash
      });
    }

    // Recalculate amounts
    let subtotal = 0;
    const baseTicketPrice = existingBooking.ticketPrice;
    normalizedSeats.forEach(seat => {
      const row = seat.charAt(0).toUpperCase();
      let seatPrice = baseTicketPrice;
      if (SEAT_TIERS.VIP.rows.includes(row)) seatPrice += SEAT_TIERS.VIP.priceOffset;
      else if (SEAT_TIERS.PREMIUM.rows.includes(row)) seatPrice += SEAT_TIERS.PREMIUM.priceOffset;
      else seatPrice += SEAT_TIERS.STANDARD.priceOffset;
      subtotal += seatPrice;
    });

    const convenienceFee = Number((subtotal * 0.1).toFixed(2));
    const totalAmount = Number((subtotal + convenienceFee).toFixed(2));

    existingBooking.seats = normalizedSeats;
    existingBooking.ticketCount = normalizedSeats.length;
    existingBooking.subtotal = Number(subtotal.toFixed(2));
    existingBooking.convenienceFee = convenienceFee;
    existingBooking.totalAmount = totalAmount;
  }

  if (showDate) existingBooking.showDate = showDate;
  if (showTime) existingBooking.showTime = showTime;
  if (req.body.notes !== undefined) existingBooking.notes = req.body.notes;
  if (req.body.snacks !== undefined) existingBooking.snacks = req.body.snacks;
  existingBooking.bookingStatus = 'MODIFIED';
  existingBooking.modifiedAt = new Date().toISOString();

  bookings[bookingIndex] = existingBooking;

  return res.json({
    success: true,
    message: `Booking ${existingBooking.id} updated successfully.`,
    booking: existingBooking
  });
}

// DELETE /api/bookings/:id (Cancel a booking)
app.delete('/api/bookings/:id', authenticateToken, (req, res) => {
  const bookingIndex = bookings.findIndex(b => b.id === req.params.id);

  if (bookingIndex === -1) {
    return res.status(404).json({
      success: false,
      message: `Booking ${req.params.id} not found.`
    });
  }

  const booking = bookings[bookingIndex];

  // Authorization check
  if (booking.userId !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access forbidden: You cannot cancel this booking.'
    });
  }

  // Mark as cancelled and release seats
  booking.bookingStatus = 'CANCELLED';
  booking.cancelledAt = new Date().toISOString();

  return res.json({
    success: true,
    message: `Booking ${booking.id} has been cancelled successfully. Refund initiated.`,
    bookingId: booking.id
  });
});

// Special endpoint for Experiment demonstration: simulate error states
app.get('/api/test/error-state', (req, res) => {
  const status = parseInt(req.query.status || '500', 10);
  if (status === 401) {
    return res.status(401).json({ success: false, message: 'Simulated 401: Unauthorized API call' });
  }
  if (status === 404) {
    return res.status(404).json({ success: false, message: 'Simulated 404: Resource not found' });
  }
  return res.status(500).json({ success: false, message: 'Simulated 500: Internal Server Error occurred' });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'BookMyShow PWA',
    timestamp: new Date().toISOString(),
    experimentsSupported: [
      'Experiment 1: REST API & Async Data',
      'Experiment 2: Redux Toolkit State Management & Middleware',
      'Experiment 3: Full CRUD Operations (GET, POST, PUT/PATCH, DELETE)',
      'Experiment 4: Secure Auth & JWT Tokens'
    ]
  });
});

// ==========================================
// SERVE STATIC FRONTEND (PWA & ASSETS)
// ==========================================
const path = require('path');
const publicDir = path.join(__dirname, 'public');
app.use(express.static(publicDir));

// Fallback to index.html for SPA client-side routing (compatible with Express 4 & 5)
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api')) {
    return res.sendFile(path.join(publicDir, 'index.html'));
  }
  next();
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🎬 BookMyShow PWA Application running on http://localhost:${PORT}`);
  });
}

module.exports = app;
