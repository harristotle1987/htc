process.env.NODE_ENV = 'production';
process.env.VERCEL = '1';
import('./api/index.js').then(m => console.log('success!', typeof m.default)).catch(err => console.error(err));
