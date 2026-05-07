const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function dump() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost', user: 'root', password: 'Atharva@1339', database: 'greenwatch'
    });
    
    let sqlContent = "CREATE DATABASE IF NOT EXISTS `greenwatch`;\nUSE `greenwatch`;\n\n";
    
    const [tables] = await connection.query('SHOW TABLES');
    for (let row of tables) {
      const tableName = Object.values(row)[0];
      const [[createTable]] = await connection.query(`SHOW CREATE TABLE \`${tableName}\``);
      sqlContent += `${createTable['Create Table']};\n\n`;
      
      const [rows] = await connection.query(`SELECT * FROM \`${tableName}\``);
      if (rows.length > 0) {
        sqlContent += `INSERT INTO \`${tableName}\` VALUES \n`;
        const valueStrings = rows.map(r => {
          const vals = Object.values(r).map(v => {
            if (v === null) return 'NULL';
            if (typeof v === 'string') return `'${v.replace(/'/g, "''")}'`;
            if (v instanceof Date) return `'${v.toISOString().slice(0, 19).replace('T', ' ')}'`;
            return v;
          });
          return `(${vals.join(', ')})`;
        });
        sqlContent += valueStrings.join(',\n') + ';\n\n';
      }
    }
    
    fs.writeFileSync(path.join(__dirname, 'greenwatch.sql'), sqlContent);
    console.log('SQL dump complete');
    await connection.end();
  } catch (err) {
    console.error('Dump failed:', err);
  }
}
dump();
