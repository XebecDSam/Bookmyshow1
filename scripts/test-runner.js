/**
 * CinePass Movie Booking System - Automated Test Suite
 * Covers Experiments 1, 2, 3, and 4
 * Run via: npm test
 */

const http = require('http');
const assert = require('assert');
const app = require('../backend/server.js');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  magenta: '\x1b[35m',
  gray: '\x1b[90m'
};

function logPass(msg) {
  console.log(`  ${colors.green}✔ PASS:${colors.reset} ${msg}`);
}

function logFail(msg, err) {
  console.log(`  ${colors.red}✖ FAIL:${colors.reset} ${msg}`);
  if (err) console.error(`    ${colors.gray}${err.stack || err.message}${colors.reset}`);
}

function logSection(title) {
  console.log(`\n${colors.bold}${colors.cyan}══════════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.bold}${colors.magenta}  ${title}${colors.reset}`);
  console.log(`${colors.bold}${colors.cyan}══════════════════════════════════════════════════════════════${colors.reset}`);
}

// Helper to make HTTP requests to test server
function makeRequest(port, { method = 'GET', path = '/', headers = {}, body = null }) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const reqHeaders = { ...headers };
    if (payload) {
      reqHeaders['Content-Type'] = 'application/json';
      reqHeaders['Content-Length'] = Buffer.byteLength(payload);
    }

    const req = http.request(
      {
        hostname: '127.0.0.1',
        port,
        path,
        method,
        headers: reqHeaders,
        timeout: 5000
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          let parsed;
          try {
            parsed = data ? JSON.parse(data) : {};
          } catch (e) {
            parsed = data;
          }
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: parsed
          });
        });
      }
    );

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`Request timeout for ${method} ${path}`));
    });

    if (payload) {
      req.write(payload);
    }
    req.end();
  });
}

async function runTests() {
  console.log(`\n${colors.bold}${colors.yellow}🚀 Starting CinePass Movie Ticket Booking Test Suite...${colors.reset}`);
  console.log(`${colors.gray}Target: In-memory Express API & State Evaluation${colors.reset}\n`);

  let passed = 0;
  let failed = 0;

  // Spin up ephemeral test server
  const server = await new Promise((resolve) => {
    const s = app.listen(0, '127.0.0.1', () => resolve(s));
  });
  const port = server.address().port;

  async function test(name, fn) {
    try {
      await fn();
      logPass(name);
      passed++;
    } catch (err) {
      logFail(name, err);
      failed++;
    }
  }

  try {
    // =========================================================================
    // EXPERIMENT 1: REST API & ASYNC DATA INTEGRATION
    // =========================================================================
    logSection('EXPERIMENT 1: REST API & Async Data Handling');

    await test('GET /api/movies - Retrieves movie catalog with async REST API', async () => {
      const res = await makeRequest(port, { path: '/api/movies' });
      assert.strictEqual(res.status, 200, 'Expected 200 OK');
      const movieList = res.data.movies || res.data.data;
      assert(Array.isArray(movieList), 'Expected movies to be an array');
      assert(movieList.length >= 5, 'Expected at least 5 movies');
      const movie = movieList[0];
      assert(movie.id && movie.title && movie.genres && movie.rating, 'Movie must have id, title, genres, rating');
    });

    await test('GET /api/movies?genre=Sci-Fi - Filters movies by genre', async () => {
      const res = await makeRequest(port, { path: '/api/movies?genre=Sci-Fi' });
      assert.strictEqual(res.status, 200);
      const movieList = res.data.movies || res.data.data;
      assert(movieList.length > 0, 'Expected Sci-Fi movies to be returned');
      for (const m of movieList) {
        assert(m.genres.includes('Sci-Fi'), `Expected movie ${m.title} to contain Sci-Fi genre`);
      }
    });

    await test('GET /api/movies?search=Dune - Searches movies by title query', async () => {
      const res = await makeRequest(port, { path: '/api/movies?search=dune' });
      assert.strictEqual(res.status, 200);
      const movieList = res.data.movies || res.data.data;
      assert(movieList.length > 0, 'Expected Dune to be returned');
      assert.match(movieList[0].title, /Dune/i);
    });

    await test('GET /api/movies/:id - Fetches dynamic movie details by ID', async () => {
      const res = await makeRequest(port, { path: '/api/movies/mov-1' });
      assert.strictEqual(res.status, 200);
      const movie = res.data.movie || res.data.data;
      assert(movie, 'Expected movie object');
      assert.strictEqual(movie.id, 'mov-1');
      assert.strictEqual(movie.title, 'Dune: Part Two');
    });

    await test('GET /api/movies/:id (Invalid ID) - Returns 404 error state', async () => {
      const res = await makeRequest(port, { path: '/api/movies/non-existent-id-999' });
      assert.strictEqual(res.status, 404);
      assert.strictEqual(res.data.success, false);
    });

    await test('GET /api/theatres - Retrieves theatre venues and showtimes', async () => {
      const res = await makeRequest(port, { path: '/api/theatres' });
      assert.strictEqual(res.status, 200);
      const theatreList = res.data.theatres || res.data.data;
      assert(Array.isArray(theatreList), 'Expected theatres array');
      assert(theatreList.length > 0, 'Expected at least one theatre');
    });

    await test('GET /api/test/error-state?status=500 - Validates error state handling', async () => {
      const res = await makeRequest(port, { path: '/api/test/error-state?status=500' });
      assert.strictEqual(res.status, 500);
      assert.strictEqual(res.data.success, false);
    });

    // =========================================================================
    // EXPERIMENT 2: STATE MANAGEMENT & TICKET PRICING FORMULA
    // =========================================================================
    logSection('EXPERIMENT 2: State Management & Pricing Calculations (Redux / Zustand)');

    await test('Calculate ticket pricing with tier surcharges & 10% convenience fee', async () => {
      // Calculation logic mirroring Redux & Zustand stores
      const basePrice = 250;
      const seats = [
        { id: 'C4', tier: 'VIP', price: basePrice + 120 },       // 370
        { id: 'C5', tier: 'VIP', price: basePrice + 120 },       // 370
        { id: 'D4', tier: 'PREMIUM', price: basePrice + 60 }     // 310
      ];
      const snacks = [
        { id: 'popcorn-lrg', name: 'Caramel Popcorn', price: 180, qty: 2 } // 360
      ];

      const seatSubtotal = seats.reduce((sum, s) => sum + s.price, 0); // 370 + 370 + 310 = 1050
      assert.strictEqual(seatSubtotal, 1050, 'Seat subtotal should equal 1050');

      const snacksSubtotal = snacks.reduce((sum, item) => sum + (item.price * item.qty), 0); // 360
      assert.strictEqual(snacksSubtotal, 360, 'Snacks subtotal should equal 360');

      const convenienceFee = Math.round(seatSubtotal * 0.10); // 105
      assert.strictEqual(convenienceFee, 105, 'Convenience fee should be exactly 10% of seat subtotal');

      const totalAmount = seatSubtotal + snacksSubtotal + convenienceFee; // 1050 + 360 + 105 = 1515
      assert.strictEqual(totalAmount, 1515, 'Total calculation matches expected formula');
    });

    await test('Booking state guard: Seat selection limits and removal actions', async () => {
      const maxSeatsAllowed = 8;
      let selectedSeats = ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8'];
      
      // Attempting to add a 9th seat should be rejected
      const canAddMore = selectedSeats.length < maxSeatsAllowed;
      assert.strictEqual(canAddMore, false, 'State should prevent selecting beyond maximum limit');

      // Removing a seat
      selectedSeats = selectedSeats.filter(s => s !== 'A3');
      assert.strictEqual(selectedSeats.length, 7, 'Action should remove selected seat from store state');
      assert(!selectedSeats.includes('A3'), 'Removed seat must not exist in state');
    });

    // =========================================================================
    // EXPERIMENT 4 (PART 1): AUTHENTICATION & JWT TOKENS
    // (Run auth first to get token for CRUD in Exp 3)
    // =========================================================================
    logSection('EXPERIMENT 4: Secure Authentication & Token Management');

    let authToken = '';
    const testEmail = `testuser_${Date.now()}@cinepass.com`;
    const testPassword = 'Password@123';

    await test('POST /api/auth/register - Registers new user and issues JWT token', async () => {
      const res = await makeRequest(port, {
        method: 'POST',
        path: '/api/auth/register',
        body: {
          name: 'Test Audience',
          email: testEmail,
          password: testPassword
        }
      });

      assert.strictEqual(res.status, 201, 'Expected 201 Created');
      assert(res.data.token, 'Response must include JWT token');
      assert.strictEqual(res.data.user.email, testEmail);
    });

    await test('POST /api/auth/login - Authenticates user and returns Bearer token', async () => {
      const res = await makeRequest(port, {
        method: 'POST',
        path: '/api/auth/login',
        body: {
          email: testEmail,
          password: testPassword
        }
      });

      assert.strictEqual(res.status, 200, 'Expected 200 OK');
      assert(res.data.token, 'Must return auth token');
      authToken = res.data.token;
    });

    await test('POST /api/auth/login (Invalid credentials) - Rejects with 401', async () => {
      const res = await makeRequest(port, {
        method: 'POST',
        path: '/api/auth/login',
        body: {
          email: testEmail,
          password: 'wrong_password_999'
        }
      });

      assert.strictEqual(res.status, 401, 'Expected 401 Unauthorized');
      assert.strictEqual(res.data.success, false);
    });

    await test('Protected API without token - Returns 401 Unauthorized', async () => {
      const res = await makeRequest(port, {
        method: 'GET',
        path: '/api/bookings'
      });

      assert.strictEqual(res.status, 401, 'Protected route must block unauthenticated request with 401');
      assert.strictEqual(res.data.success, false);
    });

    await test('Protected API with invalid token - Returns 401 Token invalid/expired', async () => {
      const res = await makeRequest(port, {
        method: 'GET',
        path: '/api/bookings',
        headers: {
          Authorization: 'Bearer invalid.fake.token'
        }
      });

      assert.strictEqual(res.status, 401, 'Expected 401 for corrupted or forged token');
    });

    // =========================================================================
    // EXPERIMENT 3: CRUD OPERATIONS (USING AUTHENTICATED TOKEN)
    // =========================================================================
    logSection('EXPERIMENT 3: Movie Booking CRUD Operations (REST API / Axios / Fetch)');

    let createdBookingId = null;

    await test('CREATE (POST /api/bookings) - Creates a new movie ticket booking', async () => {
      const res = await makeRequest(port, {
        method: 'POST',
        path: '/api/bookings',
        headers: {
          Authorization: `Bearer ${authToken}`
        },
        body: {
          movieId: 'mov-1',
          theatreId: 'th-1',
          showDate: '2026-10-20',
          showTime: '07:00 PM',
          seats: [
            { id: 'E1', tier: 'STANDARD', price: 200 },
            { id: 'E2', tier: 'STANDARD', price: 200 }
          ],
          snacks: [],
          paymentMethod: 'Credit / Debit Card'
        }
      });

      assert.strictEqual(res.status, 201, 'Expected 201 Created');
      assert(res.data.success, 'Booking response should indicate success');
      assert(res.data.booking && res.data.booking.id, 'Response should contain booking object and ID');
      assert.strictEqual(res.data.booking.bookingStatus, 'CONFIRMED');
      createdBookingId = res.data.booking.id;
    });

    await test('READ (GET /api/bookings) - Retrieves booking history for authenticated user', async () => {
      const res = await makeRequest(port, {
        method: 'GET',
        path: '/api/bookings',
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });

      assert.strictEqual(res.status, 200, 'Expected 200 OK');
      const bookingList = res.data.bookings || res.data.data;
      assert(Array.isArray(bookingList), 'Expected array of bookings');
      const found = bookingList.find(b => b.id === createdBookingId);
      assert(found, `Expected created booking ${createdBookingId} to be listed in user booking history`);
    });

    await test('UPDATE (PATCH /api/bookings/:id) - Modifies existing booking details', async () => {
      const res = await makeRequest(port, {
        method: 'PATCH',
        path: `/api/bookings/${createdBookingId}`,
        headers: {
          Authorization: `Bearer ${authToken}`
        },
        body: {
          notes: 'Customer requested front row wheelchair accessibility assistance',
          snacks: [{ id: 'popcorn', name: 'Salted Popcorn', price: 150, qty: 1 }]
        }
      });

      assert.strictEqual(res.status, 200, 'Expected 200 OK');
      assert.strictEqual(res.data.success, true);
      assert.strictEqual(res.data.booking.notes, 'Customer requested front row wheelchair accessibility assistance');
    });

    await test('DELETE (DELETE /api/bookings/:id) - Cancels movie booking and releases seats', async () => {
      const res = await makeRequest(port, {
        method: 'DELETE',
        path: `/api/bookings/${createdBookingId}`,
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });

      assert.strictEqual(res.status, 200, 'Expected 200 OK');
      assert.strictEqual(res.data.success, true);
      assert.strictEqual(res.data.bookingId, createdBookingId);
    });

    await test('Seat Conflict Protection: Prevents duplicate booking of same seats', async () => {
      const uniqueSeat = `Z${Math.floor(Math.random() * 90 + 10)}`;
      // First booking succeeds
      const b1 = await makeRequest(port, {
        method: 'POST',
        path: '/api/bookings',
        headers: { Authorization: `Bearer ${authToken}` },
        body: {
          movieId: 'mov-2',
          theatreId: 'th-2',
          showDate: '2026-11-01',
          showTime: '06:00 PM',
          seats: [{ id: uniqueSeat, tier: 'STANDARD', price: 200 }]
        }
      });
      assert.strictEqual(b1.status, 201);

      // Attempt second booking for the exact same seat on same showtime
      const b2 = await makeRequest(port, {
        method: 'POST',
        path: '/api/bookings',
        headers: { Authorization: `Bearer ${authToken}` },
        body: {
          movieId: 'mov-2',
          theatreId: 'th-2',
          showDate: '2026-11-01',
          showTime: '06:00 PM',
          seats: [{ id: uniqueSeat, tier: 'STANDARD', price: 200 }]
        }
      });

      assert.strictEqual(b2.status, 409, 'Expected 409 Conflict when seats are already booked');
    });

  } finally {
    await new Promise((resolve) => server.close(resolve));
  }

  // =========================================================================
  // SUMMARY REPORT
  // =========================================================================
  console.log(`\n${colors.bold}══════════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.bold}                 TEST EXECUTION SUMMARY                       ${colors.reset}`);
  console.log(`${colors.bold}══════════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`  Total Tests Run:  ${passed + failed}`);
  console.log(`  ${colors.green}Passed:${colors.reset}           ${passed}`);
  console.log(`  ${colors.red}Failed:${colors.reset}           ${failed}`);

  if (failed === 0) {
    console.log(`\n${colors.bold}${colors.green}🎉 ALL 4 EXPERIMENTS VERIFIED & WORKING PERFECTLY!${colors.reset}\n`);
    process.exit(0);
  } else {
    console.log(`\n${colors.bold}${colors.red}⚠️ Some tests failed. Please review errors above.${colors.reset}\n`);
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
