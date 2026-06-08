const bcrypt = require('bcryptjs');
bcrypt.compare('test', 'plain-text-password-not-hash').then(res => console.log('res:', res)).catch(err => console.log('err:', err));
