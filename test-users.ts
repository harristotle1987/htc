import { sql } from './src/lib/neon.js';
(async () => {
  try {
    const users = await sql`SELECT * FROM users`;
    console.log('USERS:', users);
  } catch (err) {
    console.error('ERR:', err);
  }
})();
