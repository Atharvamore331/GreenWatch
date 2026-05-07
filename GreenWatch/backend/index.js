const express = require('express');
const cors = require('cors');
require('dotenv').config();

const sequelize = require('./config/database');
const User = require('./models/User');
const Complaint = require('./models/Complaint');
const Notification = require('./models/Notification');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Sync Sequelize models with MySQL Database
sequelize.sync({ alter: true }) // use { force: true } to drop and recreate tables if needed
  .then(() => console.log('Connected to MySQL and synchronized models.'))
  .catch(err => console.error('MySQL connection error:', err));

// --- Auth Routes ---
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const exists = await User.findOne({ where: { email } });
        if (exists) return res.status(400).json({ error: 'Email already exists' });

        const user = await User.create({ name, email, password, role: 'citizen' });
        res.status(201).json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password, role } = req.body;
        const user = await User.findOne({ where: { email, password, role } });
        if (!user) return res.status(401).json({ error: 'Invalid credentials or role' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Complaint Routes ---
app.get('/api/complaints', async (req, res) => {
    try {
        const complaints = await Complaint.findAll({
            order: [['createdAt', 'DESC']],
            include: [{ model: User, as: 'citizen', attributes: ['id', 'name', 'email'] }]
        });
        res.json(complaints);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/complaints', async (req, res) => {
    try {
        const complaint = await Complaint.create(req.body);
        res.status(201).json(complaint);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.patch('/api/complaints/:id/status', async (req, res) => {
    try {
        const { status, assignedTo } = req.body;
        const complaint = await Complaint.findByPk(req.params.id);
        if (!complaint) return res.status(404).json({ error: 'Not found' });

        const oldStatus = complaint.status;
        const oldAssigned = complaint.assignedTo;

        if (status) complaint.status = status;
        if (assignedTo !== undefined) complaint.assignedTo = assignedTo;
        
        await complaint.save();

        // Send notifications
        if (status && status !== oldStatus) {
            await Notification.create({
                userId: complaint.citizenId,
                message: `Your complaint "${complaint.title}" status changed to ${status}.`
            });
            
            // Award points if resolved
            if (status === 'resolved' && oldStatus !== 'resolved') {
                await User.increment('points', { by: 10, where: { id: complaint.citizenId } });
            }
        }

        if (assignedTo && assignedTo !== oldAssigned) {
            await Notification.create({
                userId: complaint.citizenId,
                message: `Your complaint "${complaint.title}" has been assigned to team: ${assignedTo}.`
            });
        }

        res.json(complaint);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Notification Routes ---
app.get('/api/notifications/:userId', async (req, res) => {
    try {
        const notifications = await Notification.findAll({
            where: { userId: req.params.userId },
            order: [['createdAt', 'DESC']]
        });
        res.json(notifications);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.patch('/api/notifications/:id/read', async (req, res) => {
    try {
        const notification = await Notification.findByPk(req.params.id);
        if (!notification) return res.status(404).json({ error: 'Not found' });
        notification.isRead = true;
        await notification.save();
        res.json(notification);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Seed Admin Route (for testing) ---
app.post('/api/seed/admin', async (req, res) => {
    try {
        let admin = await User.findOne({ where: { email: 'admin@greenwatch.com' } });
        if (!admin) {
            admin = await User.create({ name: 'Admin', email: 'admin@greenwatch.com', password: 'blesson432007', role: 'admin' });
        } else {
            // Update existing admin password to requested password
            admin.password = 'blesson432007';
            await admin.save();
        }
        res.json({ message: 'Admin seeded/updated', admin });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
});
