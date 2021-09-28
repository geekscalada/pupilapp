// name = pool.js
// npm install pg

const Pool = require('pg').Pool

const DB = new Pool({
  user: 'yourUser',
  host: 'localhost',
  database: 'pupilaPruebas01',
  password: 'yourPass',
  port: 5432,
})

module.exports = {DB}



