const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const sequelize = require('./config/database');
const User = require('./models/User');
const Complaint = require('./models/Complaint');
const Notification = require('./models/Notification');

async function migrate() {
    console.log('Starting data migration from SQLite to MySQL...');

    // 1. Sync MySQL tables
    try {
        await sequelize.authenticate();
        console.log('Connection to MySQL has been established successfully.');
        
        // This drops existing tables and creates fresh ones in MySQL
        await sequelize.sync({ force: true }); 
        console.log('MySQL tables synchronized.');
    } catch (error) {
        console.error('Unable to connect to the MySQL database. Please check your credentials in config/database.js and make sure MySQL is running.');
        console.error('Error details:', error.message);
        return;
    }

    // 2. Connect to SQLite
    const dbPath = path.join(__dirname, 'database.sqlite');
    const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
        if (err) {
            console.error('Error opening SQLite database:', err.message);
        }
    });

    const runQuery = (query, params = []) => {
        return new Promise((resolve, reject) => {
            db.all(query, params, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    };

    try {
        // 3. Migrate Users
        const users = await runQuery('SELECT * FROM Users');
        if (users.length > 0) {
            await User.bulkCreate(users);
            console.log(`Migrated ${users.length} users to MySQL.`);
        }

        // 4. Migrate Complaints
        const complaints = await runQuery('SELECT * FROM Complaints');
        if (complaints.length > 0) {
            await Complaint.bulkCreate(complaints);
            console.log(`Migrated ${complaints.length} complaints to MySQL.`);
        }

        // 5. Migrate Notifications
        const notifications = await runQuery('SELECT * FROM Notifications');
        if (notifications.length > 0) {
            await Notification.bulkCreate(notifications);
            console.log(`Migrated ${notifications.length} notifications to MySQL.`);
        }

        console.log('Data migration completed successfully! You can now start your backend server using MySQL.');
    } catch (err) {
        console.error('Migration failed:', err.message);
    } finally {
        db.close();
        await sequelize.close();
    }
}

migrate();
