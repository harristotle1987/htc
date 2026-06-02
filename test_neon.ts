import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

const sql = neon(process.env.DATABASE_URL!);

async function test() {
  try {
    await sql`SELECT ${undefined}`;
  } catch (e) {
    console.error('Caught:', e);
  }
}
test().then(() => console.log('Done'));
