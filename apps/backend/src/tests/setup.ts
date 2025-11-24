import { beforeAll, afterAll, afterEach } from 'vitest';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.development' });

beforeAll(async () => {
  // Setup test database connection or mock services if needed
});

afterEach(async () => {
  // Clean up after each test
});

afterAll(async () => {
  // Cleanup test database or close connections
});
