const mysql = require('mysql2/promise');

async function createDb() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'blesson432007'
    });
    
    await connection.query('CREATE DATABASE IF NOT EXISTS `greenwatch`;');
    console.log('Database greenwatch created or already exists.');
    
    await connection.end();
  } catch (err) {
    console.error('Error creating database:', err.message);
  }
}

createDb();
