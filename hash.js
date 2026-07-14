const bcrypt = require('bcryptjs');
const h = bcrypt.hashSync('verifyme', 10);
const { execSync } = require('child_process');
// Write to stdout so we can capture it
console.log(h);
