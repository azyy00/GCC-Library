const express = require('express');
const cors = require('cors');
const path = require('path');
const studentRoutes = require('./routes/studentRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const statsRoutes = require('./routes/statsRoutes');

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (!process.env.VERCEL) {
    app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
}

app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        platform: process.env.VERCEL ? 'vercel' : 'local'
    });
});

app.get('/', (req, res) => {
    res.json({
        message: 'GCC Library backend is running.',
        health: '/api/health'
    });
});

app.get('/favicon.ico', (req, res) => {
    res.status(204).end();
});

app.use('/api/students', studentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/stats', statsRoutes);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

if (require.main === module && !process.env.VERCEL) {
    const PORT = Number(process.env.PORT || 3001);
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;
